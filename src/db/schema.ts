import {
  mysqlTable,
  varchar,
  int,
  decimal,
  text,
  json,
  timestamp,
  uniqueIndex,
  index
} from 'drizzle-orm/mysql-core';

// 1. Quadras (Admin da Quadra)
export const courts = mysqlTable('courts', {
  id: varchar('id', { length: 64 }).primaryKey(),
  name: varchar('name', { length: 160 }).notNull(),
  modality: varchar('modality', { length: 64 }).notNull(),
  address: varchar('address', { length: 255 }).notNull(),
  neighborhood: varchar('neighborhood', { length: 120 }).notNull(),
  city: varchar('city', { length: 120 }).notNull(),
  hourlyRate: int('hourly_rate').notNull(),
  imageUrl: varchar('image_url', { length: 500 }).notNull(),
  rating: decimal('rating', { precision: 3, scale: 2 }).notNull().default('5.00'),
  reviewCount: int('review_count').notNull().default(1),
  availableTimeSlots: json('available_time_slots').$type<string[]>().notNull(),
  amenities: json('amenities').$type<string[]>().notNull(),
  ownerId: varchar('owner_id', { length: 64 }).notNull(),
  ownerName: varchar('owner_name', { length: 120 }).notNull(),
  phoneContact: varchar('phone_contact', { length: 40 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// 2. Bloqueios manuais de horário pelo Admin da Quadra
export const courtBlockedSlots = mysqlTable(
  'court_blocked_slots',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    courtId: varchar('court_id', { length: 64 })
      .notNull()
      .references(() => courts.id, { onDelete: 'cascade' }),
    blockDate: varchar('block_date', { length: 16 }).notNull(),
    timeSlot: varchar('time_slot', { length: 32 }).notNull(),
    reason: varchar('reason', { length: 255 }),
    createdAt: timestamp('created_at').defaultNow().notNull()
  },
  table => [
    uniqueIndex('uniq_court_block_slot').on(table.courtId, table.blockDate, table.timeSlot)
  ]
);

// 3. Times (Admin do Time)
export const teams = mysqlTable('teams', {
  id: varchar('id', { length: 64 }).primaryKey(),
  name: varchar('name', { length: 140 }).notNull(),
  captainName: varchar('captain_name', { length: 120 }).notNull(),
  captainPhone: varchar('captain_phone', { length: 40 }).notNull(),
  crestUrl: varchar('crest_url', { length: 500 }).notNull(),
  modality: varchar('modality', { length: 64 }).notNull(),
  skillLevel: varchar('skill_level', { length: 64 }).notNull(),
  homeCourtId: varchar('home_court_id', { length: 64 }).references(() => courts.id, {
    onDelete: 'set null'
  }),
  homeCourtName: varchar('home_court_name', { length: 160 }),
  city: varchar('city', { length: 120 }).notNull(),
  matchesPlayed: int('matches_played').notNull().default(0),
  wins: int('wins').notNull().default(0),
  draws: int('draws').notNull().default(0),
  losses: int('losses').notNull().default(0),
  fairPlayScore: decimal('fair_play_score', { precision: 3, scale: 2 }).notNull().default('5.00'),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

// 4. Usuários / Jogadores do Time
export const teamMembers = mysqlTable(
  'team_members',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    teamId: varchar('team_id', { length: 64 })
      .notNull()
      .references(() => teams.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 120 }).notNull(),
    position: varchar('position', { length: 80 }).notNull(),
    jerseyNumber: int('jersey_number'),
    phone: varchar('phone', { length: 40 }).notNull(),
    role: varchar('role', { length: 20 }).notNull().default('JOGADOR'), // 'ADMIN' | 'JOGADOR'
    createdAt: timestamp('created_at').defaultNow().notNull()
  },
  table => [index('idx_team_members_team').on(table.teamId)]
);

// 5. Desafios / Jogos Marcados (1 hora de duração)
export const challenges = mysqlTable(
  'challenges',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    title: varchar('title', { length: 180 }).notNull(),
    modality: varchar('modality', { length: 64 }).notNull(),
    matchDate: varchar('match_date', { length: 16 }).notNull(),
    formattedDate: varchar('formatted_date', { length: 64 }).notNull(),
    timeSlot: varchar('time_slot', { length: 32 }).notNull(),
    durationMinutes: int('duration_minutes').notNull().default(60),
    courtId: varchar('court_id', { length: 64 })
      .notNull()
      .references(() => courts.id, { onDelete: 'cascade' }),
    courtName: varchar('court_name', { length: 160 }).notNull(),
    courtAddress: varchar('court_address', { length: 255 }).notNull(),
    neighborhood: varchar('neighborhood', { length: 120 }).notNull(),
    totalPrice: int('total_price').notNull(),
    pricePerTeam: int('price_per_team').notNull(),
    hostRole: varchar('host_role', { length: 24 }).notNull().default('MANDANTE'),
    skillLevel: varchar('skill_level', { length: 64 }).notNull(),
    status: varchar('status', { length: 24 }).notNull().default('ABERTO'),
    proposingTeamId: varchar('proposing_team_id', { length: 64 })
      .notNull()
      .references(() => teams.id, { onDelete: 'cascade' }),
    acceptingTeamId: varchar('accepting_team_id', { length: 64 }).references(() => teams.id, {
      onDelete: 'set null'
    }),
    description: text('description').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull()
  },
  table => [
    index('idx_challenges_court_date').on(table.courtId, table.matchDate, table.timeSlot)
  ]
);

// 6. Reservas de Horário na Quadra (Agenda da Quadra)
export const bookings = mysqlTable(
  'bookings',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    courtId: varchar('court_id', { length: 64 })
      .notNull()
      .references(() => courts.id, { onDelete: 'cascade' }),
    courtName: varchar('court_name', { length: 160 }).notNull(),
    modality: varchar('modality', { length: 64 }).notNull(),
    bookingDate: varchar('booking_date', { length: 16 }).notNull(),
    formattedDate: varchar('formatted_date', { length: 64 }).notNull(),
    timeSlot: varchar('time_slot', { length: 32 }).notNull(),
    price: int('price').notNull(),
    status: varchar('status', { length: 24 }).notNull().default('PENDENTE'),
    team1Id: varchar('team1_id', { length: 64 }).references(() => teams.id, {
      onDelete: 'set null'
    }),
    team1Name: varchar('team1_name', { length: 140 }).notNull(),
    team2Id: varchar('team2_id', { length: 64 }).references(() => teams.id, {
      onDelete: 'set null'
    }),
    team2Name: varchar('team2_name', { length: 140 }),
    requesterName: varchar('requester_name', { length: 120 }).notNull(),
    requesterPhone: varchar('requester_phone', { length: 40 }).notNull(),
    paidAmount: int('paid_amount').notNull().default(0),
    createdAt: timestamp('created_at').defaultNow().notNull()
  },
  table => [
    index('idx_bookings_court_slot').on(table.courtId, table.bookingDate, table.timeSlot)
  ]
);

// 7. Contas de Usuários (Autenticação via MySQL para Admin do Time e Admin da Quadra)
export const users = mysqlTable(
  'users',
  {
    id: varchar('id', { length: 64 }).primaryKey(),
    name: varchar('name', { length: 120 }).notNull(),
    email: varchar('email', { length: 180 }).notNull(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    role: varchar('role', { length: 20 }).notNull(), // 'CAPITAO' | 'GESTOR'
    phone: varchar('phone', { length: 40 }).notNull(),
    avatarUrl: varchar('avatar_url', { length: 500 }).notNull(),
    arenaName: varchar('arena_name', { length: 160 }),
    teamId: varchar('team_id', { length: 64 }).references(() => teams.id, {
      onDelete: 'set null'
    }),
    createdAt: timestamp('created_at').defaultNow().notNull()
  },
  table => [uniqueIndex('uniq_users_email').on(table.email)]
);

