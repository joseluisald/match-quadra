import { eq, and, desc } from 'drizzle-orm';
import { getDb } from './index.ts';
import * as schema from './schema.ts';
import { hashPassword, verifyPassword } from './auth.ts';
import type {
  Court,
  Team,
  TeamMember,
  Challenge,
  Booking,
  UserProfile,
  UserRole,
  SportModality,
  SkillLevel,
  BookingStatus,
  ChallengeStatus
} from '../types/index.ts';

function formatBrDate(isoDate: string): string {
  const dateObj = new Date(isoDate + 'T12:00:00');
  const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  if (isNaN(dateObj.getTime())) return isoDate;
  return `${dayNames[dateObj.getDay()]}, ${dateObj.getDate()}/${monthNames[dateObj.getMonth()]}`;
}

export interface BootstrapPayload {
  courts: Court[];
  teams: Team[];
  challenges: Challenge[];
  bookings: Booking[];
  storageMode: 'mysql';
}

function mapTeamRows(
  dbTeams: (typeof schema.teams.$inferSelect)[],
  dbMembers: (typeof schema.teamMembers.$inferSelect)[]
): Team[] {
  return dbTeams.map(t => ({
    id: t.id,
    name: t.name,
    captainName: t.captainName,
    captainPhone: t.captainPhone,
    crestUrl: t.crestUrl,
    modality: t.modality as SportModality,
    skillLevel: t.skillLevel as SkillLevel,
    homeCourtId: t.homeCourtId || undefined,
    homeCourtName: t.homeCourtName || undefined,
    city: t.city,
    members: dbMembers
      .filter(m => m.teamId === t.id)
      .map(m => ({
        id: m.id,
        name: m.name,
        position: m.position,
        jerseyNumber: m.jerseyNumber ?? undefined,
        phone: m.phone,
        role: (m.role === 'ADMIN' ? 'ADMIN' : 'JOGADOR') as 'ADMIN' | 'JOGADOR'
      })),
    stats: {
      matchesPlayed: t.matchesPlayed,
      wins: t.wins,
      draws: t.draws,
      losses: t.losses,
      fairPlayScore: Number(t.fairPlayScore)
    }
  }));
}

export async function getBootstrapData(): Promise<BootstrapPayload> {
  const db = getDb();
  const [dbCourts, dbBlocks, dbTeams, dbMembers, dbChallenges, dbBookings] = await Promise.all([
    db.select().from(schema.courts).orderBy(desc(schema.courts.createdAt)),
    db.select().from(schema.courtBlockedSlots),
    db.select().from(schema.teams).orderBy(desc(schema.teams.createdAt)),
    db.select().from(schema.teamMembers),
    db.select().from(schema.challenges).orderBy(desc(schema.challenges.createdAt)),
    db.select().from(schema.bookings).orderBy(desc(schema.bookings.createdAt))
  ]);

  const courts: Court[] = dbCourts.map(c => ({
    id: c.id,
    name: c.name,
    modality: c.modality as SportModality,
    address: c.address,
    neighborhood: c.neighborhood,
    city: c.city,
    hourlyRate: c.hourlyRate,
    imageUrl: c.imageUrl,
    rating: Number(c.rating),
    reviewCount: c.reviewCount,
    availableTimeSlots: c.availableTimeSlots,
    blockedSlots: dbBlocks
      .filter(b => b.courtId === c.id)
      .map(b => ({ date: b.blockDate, timeSlot: b.timeSlot, reason: b.reason || undefined })),
    amenities: c.amenities,
    ownerId: c.ownerId,
    ownerName: c.ownerName,
    phoneContact: c.phoneContact
  }));

  const teams = mapTeamRows(dbTeams, dbMembers);
  const teamMap = new Map(teams.map(t => [t.id, t]));

  const challenges: Challenge[] = dbChallenges
    .filter(ch => teamMap.has(ch.proposingTeamId))
    .map(ch => ({
      id: ch.id,
      title: ch.title,
      modality: ch.modality as SportModality,
      date: ch.matchDate,
      formattedDate: ch.formattedDate,
      timeSlot: ch.timeSlot,
      durationMinutes: ch.durationMinutes,
      courtId: ch.courtId,
      courtName: ch.courtName,
      courtAddress: ch.courtAddress,
      neighborhood: ch.neighborhood,
      totalPrice: ch.totalPrice,
      pricePerTeam: ch.pricePerTeam,
      hostRole: ch.hostRole === 'A_COMBINAR' ? 'A_COMBINAR' : 'MANDANTE',
      skillLevel: ch.skillLevel as SkillLevel,
      status: ch.status as ChallengeStatus,
      proposingTeam: teamMap.get(ch.proposingTeamId)!,
      acceptingTeam: ch.acceptingTeamId ? teamMap.get(ch.acceptingTeamId) : undefined,
      description: ch.description,
      createdAt: ch.createdAt.toISOString()
    }));

  const bookings: Booking[] = dbBookings.map(b => ({
    id: b.id,
    courtId: b.courtId,
    courtName: b.courtName,
    modality: b.modality as SportModality,
    date: b.bookingDate,
    formattedDate: b.formattedDate,
    timeSlot: b.timeSlot,
    price: b.price,
    status: b.status as BookingStatus,
    team1Id: b.team1Id || undefined,
    team1Name: b.team1Name,
    team2Id: b.team2Id || undefined,
    team2Name: b.team2Name || undefined,
    requesterName: b.requesterName,
    requesterPhone: b.requesterPhone,
    paidAmount: b.paidAmount
  }));

  return { courts, teams, challenges, bookings, storageMode: 'mysql' };
}

export async function getUserProfileById(userId: string): Promise<UserProfile | null> {
  const db = getDb();
  const [userRow] = await db.select().from(schema.users).where(eq(schema.users.id, userId));
  if (!userRow) return null;

  let linkedTeam: Team | undefined;
  if (userRow.teamId) {
    const [teamRow] = await db
      .select()
      .from(schema.teams)
      .where(eq(schema.teams.id, userRow.teamId));
    if (teamRow) {
      const members = await db
        .select()
        .from(schema.teamMembers)
        .where(eq(schema.teamMembers.teamId, teamRow.id));
      linkedTeam = mapTeamRows([teamRow], members)[0];
    }
  }

  let managedCourtsCount = 0;
  if (userRow.role === 'GESTOR') {
    const ownerCourts = await db
      .select({ id: schema.courts.id })
      .from(schema.courts)
      .where(eq(schema.courts.ownerId, userRow.id));
    managedCourtsCount = ownerCourts.length;
  }

  return {
    id: userRow.id,
    name: userRow.name,
    email: userRow.email,
    role: userRow.role as UserRole,
    phone: userRow.phone,
    avatarUrl: userRow.avatarUrl,
    arenaName: userRow.arenaName || undefined,
    teamId: userRow.teamId || undefined,
    team: linkedTeam,
    managedCourtsCount
  };
}

export interface RegisterAccountInput {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
  teamName?: string;
  modality?: SportModality;
  skillLevel?: SkillLevel;
  city?: string;
  homeCourtId?: string;
  arenaName?: string;
}

export async function registerUserRecord(input: RegisterAccountInput): Promise<{
  user: UserProfile;
  createdTeam?: Team;
}> {
  const db = getDb();
  const normalizedEmail = input.email.trim().toLowerCase();

  const existing = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.email, normalizedEmail));

  if (existing.length > 0) {
    const err = new Error('Já existe uma conta cadastrada com este e-mail.');
    (err as Error & { statusCode?: number }).statusCode = 409;
    throw err;
  }

  const userId = `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const passwordHash = hashPassword(input.password);
  const defaultAvatar =
    input.role === 'CAPITAO'
      ? '/src/assets/images/team_crest_valentes_1792971630147.jpg'
      : '/src/assets/images/avatar_gestor_roberto_1794854801976.jpg';

  let createdTeam: Team | undefined;
  let teamId: string | null = null;

  if (input.role === 'CAPITAO' && input.teamName?.trim()) {
    let homeCourtName: string | undefined;
    if (input.homeCourtId) {
      const [court] = await db
        .select({ name: schema.courts.name })
        .from(schema.courts)
        .where(eq(schema.courts.id, input.homeCourtId));
      homeCourtName = court?.name;
    }

    const newTeamId = `team-${Date.now()}`;
    const captainMember: TeamMember = {
      id: `member-${Date.now()}`,
      name: input.name.trim(),
      position: 'Capitão / Admin',
      jerseyNumber: 10,
      phone: input.phone.trim(),
      role: 'ADMIN'
    };

    createdTeam = {
      id: newTeamId,
      name: input.teamName.trim(),
      captainName: input.name.trim(),
      captainPhone: input.phone.trim(),
      crestUrl: '/src/assets/images/team_crest_valentes_1792971630147.jpg',
      modality: input.modality || 'Futebol Society',
      skillLevel: input.skillLevel || 'Intermediário',
      homeCourtId: input.homeCourtId || undefined,
      homeCourtName,
      city: input.city?.trim() || 'São Paulo - SP',
      members: [captainMember],
      stats: {
        matchesPlayed: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        fairPlayScore: 5.0
      }
    };

    await db.insert(schema.teams).values({
      id: createdTeam.id,
      name: createdTeam.name,
      captainName: createdTeam.captainName,
      captainPhone: createdTeam.captainPhone,
      crestUrl: createdTeam.crestUrl,
      modality: createdTeam.modality,
      skillLevel: createdTeam.skillLevel,
      homeCourtId: createdTeam.homeCourtId || null,
      homeCourtName: createdTeam.homeCourtName || null,
      city: createdTeam.city,
      matchesPlayed: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      fairPlayScore: '5.00'
    });

    await db.insert(schema.teamMembers).values({
      id: captainMember.id,
      teamId: createdTeam.id,
      name: captainMember.name,
      position: captainMember.position,
      jerseyNumber: captainMember.jerseyNumber ?? null,
      phone: captainMember.phone,
      role: captainMember.role
    });

    teamId = createdTeam.id;
  }

  await db.insert(schema.users).values({
    id: userId,
    name: input.name.trim(),
    email: normalizedEmail,
    passwordHash,
    role: input.role,
    phone: input.phone.trim(),
    avatarUrl: defaultAvatar,
    arenaName: input.role === 'GESTOR' ? input.arenaName?.trim() || null : null,
    teamId
  });

  const user = await getUserProfileById(userId);
  if (!user) {
    throw new Error('Erro ao recuperar conta recém-criada.');
  }

  return { user, createdTeam };
}

export async function loginUserRecord(
  email: string,
  password: string
): Promise<UserProfile | null> {
  const db = getDb();
  const normalizedEmail = email.trim().toLowerCase();
  const [userRow] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, normalizedEmail));

  if (!userRow) return null;
  if (!verifyPassword(password, userRow.passwordHash)) return null;

  return getUserProfileById(userRow.id);
}

export async function linkUserToTeamRecord(userId: string, teamId: string) {
  const db = getDb();
  await db.update(schema.users).set({ teamId }).where(eq(schema.users.id, userId));
}

export async function createCourtRecord(court: Court): Promise<Court> {
  const db = getDb();
  await db.insert(schema.courts).values({
    id: court.id,
    name: court.name,
    modality: court.modality,
    address: court.address,
    neighborhood: court.neighborhood,
    city: court.city,
    hourlyRate: court.hourlyRate,
    imageUrl: court.imageUrl,
    rating: court.rating.toFixed(2),
    reviewCount: court.reviewCount,
    availableTimeSlots: court.availableTimeSlots,
    amenities: court.amenities,
    ownerId: court.ownerId,
    ownerName: court.ownerName,
    phoneContact: court.phoneContact
  });
  return court;
}

export async function updateCourtRecord(courtId: string, updates: Partial<Court>) {
  const db = getDb();
  await db
    .update(schema.courts)
    .set({
      ...(updates.name !== undefined && { name: updates.name }),
      ...(updates.modality !== undefined && { modality: updates.modality }),
      ...(updates.address !== undefined && { address: updates.address }),
      ...(updates.neighborhood !== undefined && { neighborhood: updates.neighborhood }),
      ...(updates.city !== undefined && { city: updates.city }),
      ...(updates.hourlyRate !== undefined && { hourlyRate: updates.hourlyRate }),
      ...(updates.imageUrl !== undefined && { imageUrl: updates.imageUrl }),
      ...(updates.availableTimeSlots !== undefined && {
        availableTimeSlots: updates.availableTimeSlots
      }),
      ...(updates.amenities !== undefined && { amenities: updates.amenities }),
      ...(updates.phoneContact !== undefined && { phoneContact: updates.phoneContact })
    })
    .where(eq(schema.courts.id, courtId));
  return { ok: true };
}

export async function toggleBlockedSlotRecord(courtId: string, date: string, timeSlot: string) {
  const db = getDb();
  const existing = await db
    .select()
    .from(schema.courtBlockedSlots)
    .where(
      and(
        eq(schema.courtBlockedSlots.courtId, courtId),
        eq(schema.courtBlockedSlots.blockDate, date),
        eq(schema.courtBlockedSlots.timeSlot, timeSlot)
      )
    );

  if (existing.length > 0) {
    await db
      .delete(schema.courtBlockedSlots)
      .where(eq(schema.courtBlockedSlots.id, existing[0].id));
    return { blocked: false };
  }

  await db.insert(schema.courtBlockedSlots).values({
    id: `block-${Date.now()}`,
    courtId,
    blockDate: date,
    timeSlot,
    reason: 'Bloqueio manual do Admin da Quadra'
  });
  return { blocked: true };
}

export async function createTeamRecord(team: Team, ownerUserId?: string): Promise<Team> {
  const db = getDb();
  await db.insert(schema.teams).values({
    id: team.id,
    name: team.name,
    captainName: team.captainName,
    captainPhone: team.captainPhone,
    crestUrl: team.crestUrl,
    modality: team.modality,
    skillLevel: team.skillLevel,
    homeCourtId: team.homeCourtId || null,
    homeCourtName: team.homeCourtName || null,
    city: team.city,
    matchesPlayed: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    fairPlayScore: '5.00'
  });

  for (const m of team.members) {
    await db.insert(schema.teamMembers).values({
      id: m.id,
      teamId: team.id,
      name: m.name,
      position: m.position,
      jerseyNumber: m.jerseyNumber ?? null,
      phone: m.phone,
      role: m.role
    });
  }

  if (ownerUserId) {
    await linkUserToTeamRecord(ownerUserId, team.id);
  }

  return team;
}

export async function updateTeamRecord(teamId: string, updates: Partial<Team>) {
  const db = getDb();
  await db
    .update(schema.teams)
    .set({
      ...(updates.name !== undefined && { name: updates.name }),
      ...(updates.captainName !== undefined && { captainName: updates.captainName }),
      ...(updates.captainPhone !== undefined && { captainPhone: updates.captainPhone }),
      ...(updates.modality !== undefined && { modality: updates.modality }),
      ...(updates.skillLevel !== undefined && { skillLevel: updates.skillLevel }),
      ...(updates.homeCourtId !== undefined && { homeCourtId: updates.homeCourtId || null }),
      ...(updates.homeCourtName !== undefined && {
        homeCourtName: updates.homeCourtName || null
      }),
      ...(updates.city !== undefined && { city: updates.city })
    })
    .where(eq(schema.teams.id, teamId));
  return { ok: true };
}

export async function addTeamMemberRecord(teamId: string, member: TeamMember) {
  const db = getDb();
  await db.insert(schema.teamMembers).values({
    id: member.id,
    teamId,
    name: member.name,
    position: member.position,
    jerseyNumber: member.jerseyNumber ?? null,
    phone: member.phone,
    role: member.role
  });
  return member;
}

export async function removeTeamMemberRecord(teamId: string, memberId: string) {
  const db = getDb();
  await db
    .delete(schema.teamMembers)
    .where(and(eq(schema.teamMembers.id, memberId), eq(schema.teamMembers.teamId, teamId)));
  return { ok: true };
}

export async function updateTeamMemberRoleRecord(
  teamId: string,
  memberId: string,
  role: 'ADMIN' | 'JOGADOR'
) {
  const db = getDb();
  await db
    .update(schema.teamMembers)
    .set({ role })
    .where(and(eq(schema.teamMembers.id, memberId), eq(schema.teamMembers.teamId, teamId)));
  return { ok: true };
}

export async function createChallengeAndBookingRecord(
  challenge: Challenge,
  booking?: Booking
) {
  const db = getDb();
  await db.insert(schema.challenges).values({
    id: challenge.id,
    title: challenge.title,
    modality: challenge.modality,
    matchDate: challenge.date,
    formattedDate: challenge.formattedDate,
    timeSlot: challenge.timeSlot,
    durationMinutes: challenge.durationMinutes,
    courtId: challenge.courtId,
    courtName: challenge.courtName,
    courtAddress: challenge.courtAddress,
    neighborhood: challenge.neighborhood,
    totalPrice: challenge.totalPrice,
    pricePerTeam: challenge.pricePerTeam,
    hostRole: challenge.hostRole,
    skillLevel: challenge.skillLevel,
    status: challenge.status,
    proposingTeamId: challenge.proposingTeam.id,
    acceptingTeamId: challenge.acceptingTeam?.id || null,
    description: challenge.description
  });

  if (booking) {
    await db.insert(schema.bookings).values({
      id: booking.id,
      courtId: booking.courtId,
      courtName: booking.courtName,
      modality: booking.modality,
      bookingDate: booking.date,
      formattedDate: booking.formattedDate,
      timeSlot: booking.timeSlot,
      price: booking.price,
      status: booking.status,
      team1Id: booking.team1Id || null,
      team1Name: booking.team1Name,
      team2Id: booking.team2Id || null,
      team2Name: booking.team2Name || null,
      requesterName: booking.requesterName,
      requesterPhone: booking.requesterPhone,
      paidAmount: booking.paidAmount
    });
  }

  return { challenge, booking };
}

export async function acceptChallengeRecord(
  challengeId: string,
  acceptingTeam: Team,
  fallbackBooking: Booking
) {
  const db = getDb();
  await db
    .update(schema.challenges)
    .set({ status: 'ACEITO', acceptingTeamId: acceptingTeam.id })
    .where(eq(schema.challenges.id, challengeId));

  const existing = await db
    .select()
    .from(schema.bookings)
    .where(
      and(
        eq(schema.bookings.courtId, fallbackBooking.courtId),
        eq(schema.bookings.bookingDate, fallbackBooking.date),
        eq(schema.bookings.timeSlot, fallbackBooking.timeSlot)
      )
    );

  const active = existing.find(b => b.status !== 'RECUSADA');
  if (active) {
    await db
      .update(schema.bookings)
      .set({
        team2Id: acceptingTeam.id,
        team2Name: acceptingTeam.name,
        status: 'CONFIRMADA'
      })
      .where(eq(schema.bookings.id, active.id));
  } else {
    await db.insert(schema.bookings).values({
      id: fallbackBooking.id,
      courtId: fallbackBooking.courtId,
      courtName: fallbackBooking.courtName,
      modality: fallbackBooking.modality,
      bookingDate: fallbackBooking.date,
      formattedDate: fallbackBooking.formattedDate,
      timeSlot: fallbackBooking.timeSlot,
      price: fallbackBooking.price,
      status: 'CONFIRMADA',
      team1Id: fallbackBooking.team1Id || null,
      team1Name: fallbackBooking.team1Name,
      team2Id: acceptingTeam.id,
      team2Name: acceptingTeam.name,
      requesterName: fallbackBooking.requesterName,
      requesterPhone: fallbackBooking.requesterPhone,
      paidAmount: 0
    });
  }

  return { ok: true };
}

export async function updateBookingStatusRecord(bookingId: string, status: BookingStatus) {
  const db = getDb();
  await db.update(schema.bookings).set({ status }).where(eq(schema.bookings.id, bookingId));
  return { ok: true };
}

export { formatBrDate };
