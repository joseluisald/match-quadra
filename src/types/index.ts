export type UserRole = 'CAPITAO' | 'GESTOR';

export type SportModality = 'Futebol Society' | 'Futsal' | 'Beach Tennis' | 'Basquete' | 'Vôlei' | 'Padel';

export type SkillLevel = 'Iniciante / Amador' | 'Intermediário' | 'Avançado' | 'Competitivo';

export type ChallengeStatus = 'ABERTO' | 'ACEITO' | 'CONCLUIDO' | 'CANCELADO';

export type BookingStatus = 'PENDENTE' | 'CONFIRMADA' | 'RECUSADA' | 'CONCLUIDA';

export interface TeamMember {
  id: string;
  name: string;
  position: string;
  jerseyNumber?: number;
  phone: string;
  role: 'ADMIN' | 'JOGADOR';
}

export interface BlockedSlot {
  date: string;
  timeSlot: string;
  reason?: string;
}

export interface Court {
  id: string;
  name: string;
  modality: SportModality;
  address: string;
  neighborhood: string;
  city: string;
  hourlyRate: number; // in BRL (valor da hora)
  imageUrl: string;
  rating: number;
  reviewCount: number;
  availableTimeSlots: string[]; // 1h blocks e.g. ["18:00 - 19:00", "19:00 - 20:00"]
  blockedSlots?: BlockedSlot[];
  amenities: string[];
  ownerId: string;
  ownerName: string;
  phoneContact: string;
}

export interface Team {
  id: string;
  name: string;
  captainName: string;
  captainPhone: string;
  crestUrl: string;
  modality: SportModality;
  skillLevel: SkillLevel;
  homeCourtId?: string;
  homeCourtName?: string;
  city: string;
  members: TeamMember[];
  stats: {
    matchesPlayed: number;
    wins: number;
    draws: number;
    losses: number;
    fairPlayScore: number; // 0.0 to 5.0
  };
}

export interface Challenge {
  id: string;
  title: string;
  modality: SportModality;
  date: string; // ISO date e.g. "2026-11-18"
  formattedDate: string;
  timeSlot: string; // 1h slot e.g. "20:00 - 21:00"
  durationMinutes: number; // 60
  courtId: string;
  courtName: string;
  courtAddress: string;
  neighborhood: string;
  totalPrice: number; // R$ total da quadra (1 hora)
  pricePerTeam: number; // R$ total / 2
  hostRole: 'MANDANTE' | 'A_COMBINAR';
  skillLevel: SkillLevel;
  status: ChallengeStatus;
  proposingTeam: Team;
  acceptingTeam?: Team;
  description: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  courtId: string;
  courtName: string;
  modality: SportModality;
  date: string;
  formattedDate: string;
  timeSlot: string;
  price: number;
  status: BookingStatus;
  team1Id?: string;
  team1Name: string;
  team2Id?: string;
  team2Name?: string;
  requesterName: string;
  requesterPhone: string;
  paidAmount: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  avatarUrl: string;
  arenaName?: string;
  teamId?: string;
  team?: Team;
  managedCourtsCount?: number;
}
