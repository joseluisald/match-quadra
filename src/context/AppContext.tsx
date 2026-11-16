import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  UserRole,
  Court,
  Challenge,
  Booking,
  UserProfile,
  SportModality,
  SkillLevel,
  Team,
  TeamMember
} from '../types';

export type AppView = 'index' | 'login' | 'dashboard' | 'desafios' | 'quadras' | 'meus-jogos' | 'perfil';

export interface SlotStatusResult {
  status: 'LIVRE' | 'RESERVADO' | 'BLOQUEADO';
  booking?: Booking;
  reason?: string;
}

interface ScheduleMatchPayload {
  opponentTeamId: string;
  courtId: string;
  date: string;
  timeSlot: string;
  description?: string;
}

interface RegisterTeamPayload {
  name: string;
  captainName: string;
  captainPhone: string;
  modality: SportModality;
  skillLevel: SkillLevel;
  city: string;
  homeCourtId?: string;
}

export interface RegisterAccountPayload {
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

interface AppContextType {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  dbError: string | null;
  userRole: UserRole;
  theme: 'dark' | 'light';
  toggleTheme: () => void;

  // Database Authentication
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  registerAccount: (payload: RegisterAccountPayload) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshData: () => Promise<void>;

  // Teams & Team Members (Admin do Time)
  teams: Team[];
  activeTeam: Team | null;
  registerTeam: (data: RegisterTeamPayload) => Promise<Team | null>;
  updateTeam: (teamId: string, updates: Partial<Team>) => Promise<boolean>;
  selectActiveTeam: (teamId: string) => void;
  addTeamMember: (teamId: string, member: Omit<TeamMember, 'id'>) => Promise<boolean>;
  removeTeamMember: (teamId: string, memberId: string) => Promise<boolean>;
  toggleMemberRole: (teamId: string, memberId: string) => Promise<boolean>;

  // Courts (Admin da Quadra)
  courts: Court[];
  addCourt: (court: Omit<Court, 'id' | 'rating' | 'reviewCount'>) => Promise<boolean>;
  updateCourt: (courtId: string, updates: Partial<Court>) => Promise<boolean>;
  editingCourt: Court | null;
  setEditingCourt: (court: Court | null) => void;
  toggleCourtSlotBlock: (courtId: string, date: string, timeSlot: string) => Promise<void>;
  getCourtSlotStatus: (courtId: string, date: string, timeSlot: string) => SlotStatusResult;

  // Challenges & Direct Match Scheduling
  challenges: Challenge[];
  createChallenge: (challenge: {
    title: string;
    modality: SportModality;
    date: string;
    formattedDate: string;
    timeSlot: string;
    durationMinutes: number;
    courtId: string;
    totalPrice: number;
    hostRole: 'MANDANTE' | 'A_COMBINAR';
    skillLevel: SkillLevel;
    description: string;
  }) => Promise<Challenge | null>;
  acceptChallenge: (challengeId: string) => Promise<boolean>;
  scheduleDirectMatch: (payload: ScheduleMatchPayload) => Promise<boolean>;

  // Bookings
  bookings: Booking[];
  confirmBooking: (bookingId: string) => Promise<void>;
  rejectBooking: (bookingId: string) => Promise<void>;

  // Modal states
  selectedChallenge: Challenge | null;
  setSelectedChallenge: (challenge: Challenge | null) => void;
  isCreateChallengeOpen: boolean;
  setIsCreateChallengeOpen: (open: boolean) => void;
  isCreateCourtOpen: boolean;
  setIsCreateCourtOpen: (open: boolean) => void;
  isScheduleMatchOpen: boolean;
  setIsScheduleMatchOpen: (open: boolean) => void;
  schedulePreselection: {
    opponentTeamId?: string;
    courtId?: string;
    date?: string;
    timeSlot?: string;
  };
  openScheduleMatchModal: (preselect?: {
    opponentTeamId?: string;
    courtId?: string;
    date?: string;
    timeSlot?: string;
  }) => void;

  // Toast / feedback message
  toastMessage: { title: string; message: string; type: 'success' | 'info' | 'warning' } | null;
  showToast: (title: string, message: string, type?: 'success' | 'info' | 'warning') => void;
  clearToast: () => void;
}

export const formatBrDate = (isoDate: string): string => {
  const dateObj = new Date(isoDate + 'T12:00:00');
  const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  if (isNaN(dateObj.getTime())) return isoDate;
  return `${dayNames[dateObj.getDay()]}, ${dateObj.getDate()}/${monthNames[dateObj.getMonth()]}`;
};

async function apiJson<T = unknown>(
  url: string,
  options?: RequestInit
): Promise<{ ok: boolean; status: number; data?: T; error?: string }> {
  try {
    const res = await fetch(url, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        error: payload?.error || `Erro na requisição (${res.status}).`
      };
    }
    return { ok: true, status: res.status, data: payload as T };
  } catch {
    return {
      ok: false,
      status: 0,
      error: 'Não foi possível conectar ao servidor e ao banco MySQL.'
    };
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<AppView>('index');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dbError, setDbError] = useState<string | null>(null);

  const [teams, setTeams] = useState<Team[]>([]);
  const [activeTeamId, setActiveTeamId] = useState<string>('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const [courts, setCourts] = useState<Court[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [isCreateChallengeOpen, setIsCreateChallengeOpen] = useState(false);
  const [isCreateCourtOpen, setIsCreateCourtOpen] = useState(false);
  const [editingCourt, setEditingCourt] = useState<Court | null>(null);
  const [isScheduleMatchOpen, setIsScheduleMatchOpen] = useState(false);
  const [schedulePreselection, setSchedulePreselection] = useState<{
    opponentTeamId?: string;
    courtId?: string;
    date?: string;
    timeSlot?: string;
  }>({});

  const [toastMessage, setToastMessage] = useState<{
    title: string;
    message: string;
    type: 'success' | 'info' | 'warning';
  } | null>(null);

  const userRole: UserRole = currentUser?.role || 'CAPITAO';
  const activeTeam: Team | null =
    teams.find(t => t.id === activeTeamId) ||
    (currentUser?.teamId ? teams.find(t => t.id === currentUser.teamId) || null : null);

  const showToast = useCallback(
    (title: string, message: string, type: 'success' | 'info' | 'warning' = 'success') => {
      setToastMessage({ title, message, type });
      setTimeout(() => {
        setToastMessage(null);
      }, 4500);
    },
    []
  );

  const clearToast = () => setToastMessage(null);

  const refreshData = useCallback(async () => {
    const [bootRes, meRes] = await Promise.all([
      apiJson<{
        courts: Court[];
        teams: Team[];
        challenges: Challenge[];
        bookings: Booking[];
      }>('/api/bootstrap'),
      apiJson<{ user: UserProfile | null }>('/api/auth/me')
    ]);

    if (bootRes.ok && bootRes.data) {
      setDbError(null);
      setCourts(bootRes.data.courts || []);
      setTeams(bootRes.data.teams || []);
      setChallenges(bootRes.data.challenges || []);
      setBookings(bootRes.data.bookings || []);
    } else if (bootRes.error) {
      setDbError(bootRes.error);
    }

    if (meRes.ok && meRes.data) {
      const user = meRes.data.user;
      setCurrentUser(user);
      if (user?.teamId) {
        setActiveTeamId(user.teamId);
      } else if (user?.team?.id) {
        setActiveTeamId(user.team.id);
      }
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      setIsLoading(true);
      await refreshData();
      if (active) setIsLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [refreshData]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // ==========================================
  // DATABASE AUTHENTICATION (MySQL)
  // ==========================================
  const login = async (
    email: string,
    password: string
  ): Promise<{ ok: boolean; error?: string }> => {
    const res = await apiJson<{ user: UserProfile }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (!res.ok || !res.data?.user) {
      return { ok: false, error: res.error || 'Falha ao entrar.' };
    }

    const user = res.data.user;
    setCurrentUser(user);
    if (user.teamId) {
      setActiveTeamId(user.teamId);
    }
    await refreshData();
    setCurrentView(user.role === 'GESTOR' ? 'dashboard' : user.teamId ? 'dashboard' : 'perfil');
    showToast('Login realizado!', `Bem-vindo(a), ${user.name}.`);
    return { ok: true };
  };

  const registerAccount = async (
    payload: RegisterAccountPayload
  ): Promise<{ ok: boolean; error?: string }> => {
    const res = await apiJson<{ user: UserProfile; createdTeam?: Team }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (!res.ok || !res.data?.user) {
      return { ok: false, error: res.error || 'Erro ao cadastrar conta.' };
    }

    const { user, createdTeam } = res.data;
    setCurrentUser(user);
    if (createdTeam) {
      setTeams(prev => [createdTeam, ...prev]);
      setActiveTeamId(createdTeam.id);
    } else if (user.teamId) {
      setActiveTeamId(user.teamId);
    }

    await refreshData();
    setCurrentView(user.role === 'GESTOR' ? 'quadras' : 'perfil');
    showToast(
      'Conta criada no MySQL!',
      user.role === 'CAPITAO'
        ? 'Agora você já pode gerenciar seu elenco e marcar jogos.'
        : 'Agora cadastre suas quadras, valores e horários.'
    );
    return { ok: true };
  };

  const logout = async () => {
    await apiJson('/api/auth/logout', { method: 'POST' });
    setCurrentUser(null);
    setActiveTeamId('');
    setCurrentView('index');
    showToast('Sessão encerrada', 'Você saiu da sua conta.', 'info');
  };

  const requireAuth = (): boolean => {
    if (!currentUser) {
      showToast('Login necessário', 'Entre com sua conta do banco ou cadastre-se primeiro.', 'warning');
      setCurrentView('login');
      return false;
    }
    return true;
  };

  // ==========================================
  // TEAM MANAGEMENT (MySQL)
  // ==========================================
  const registerTeam = async (data: RegisterTeamPayload): Promise<Team | null> => {
    if (!requireAuth()) return null;

    const homeCourt = courts.find(c => c.id === data.homeCourtId);
    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name: data.name,
      captainName: data.captainName,
      captainPhone: data.captainPhone,
      crestUrl: '/src/assets/images/team_crest_valentes_1792971630147.jpg',
      modality: data.modality,
      skillLevel: data.skillLevel,
      homeCourtId: homeCourt?.id,
      homeCourtName: homeCourt?.name,
      city: data.city || 'São Paulo - SP',
      members: [
        {
          id: `member-${Date.now()}`,
          name: data.captainName,
          position: 'Capitão / Admin',
          jerseyNumber: 10,
          phone: data.captainPhone,
          role: 'ADMIN'
        }
      ],
      stats: {
        matchesPlayed: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        fairPlayScore: 5.0
      }
    };

    const res = await apiJson<Team>('/api/teams', {
      method: 'POST',
      body: JSON.stringify(newTeam)
    });

    if (!res.ok) {
      showToast('Erro ao salvar time', res.error || 'Verifique a conexão com o MySQL.', 'warning');
      return null;
    }

    setTeams(prev => [newTeam, ...prev]);
    setActiveTeamId(newTeam.id);
    setCurrentUser(prev =>
      prev ? { ...prev, teamId: newTeam.id, team: newTeam } : prev
    );
    showToast('Time Cadastrado!', `"${newTeam.name}" salvo no MySQL. Adicione os jogadores do elenco.`);
    return newTeam;
  };

  const selectActiveTeam = (teamId: string) => {
    const found = teams.find(t => t.id === teamId);
    if (!found) return;
    setActiveTeamId(found.id);
  };

  const updateTeam = async (teamId: string, updates: Partial<Team>): Promise<boolean> => {
    if (!requireAuth()) return false;
    const res = await apiJson(`/api/teams/${teamId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
    if (!res.ok) {
      showToast('Erro ao atualizar time', res.error || 'Falha ao salvar no MySQL.', 'warning');
      return false;
    }
    setTeams(prev =>
      prev.map(t => (t.id === teamId ? { ...t, ...updates } : t))
    );
    showToast('Dados do Time Salvos', 'As informações da equipe foram gravadas no MySQL.');
    return true;
  };

  const addTeamMember = async (
    teamId: string,
    member: Omit<TeamMember, 'id'>
  ): Promise<boolean> => {
    if (!requireAuth()) return false;
    const newMember: TeamMember = {
      ...member,
      id: `member-${Date.now()}`
    };
    const res = await apiJson<TeamMember>(`/api/teams/${teamId}/members`, {
      method: 'POST',
      body: JSON.stringify(newMember)
    });
    if (!res.ok) {
      showToast('Erro ao adicionar jogador', res.error || 'Falha ao salvar no MySQL.', 'warning');
      return false;
    }
    setTeams(prev =>
      prev.map(t => (t.id === teamId ? { ...t, members: [...t.members, newMember] } : t))
    );
    showToast('Usuário Adicionado ao Time', `${newMember.name} salvo no elenco.`);
    return true;
  };

  const removeTeamMember = async (teamId: string, memberId: string): Promise<boolean> => {
    if (!requireAuth()) return false;
    const res = await apiJson(`/api/teams/${teamId}/members/${memberId}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      showToast('Erro ao remover jogador', res.error || 'Falha ao remover no MySQL.', 'warning');
      return false;
    }
    setTeams(prev =>
      prev.map(t =>
        t.id === teamId ? { ...t, members: t.members.filter(m => m.id !== memberId) } : t
      )
    );
    showToast('Membro Removido', 'O jogador foi removido da lista do time.', 'info');
    return true;
  };

  const toggleMemberRole = async (teamId: string, memberId: string): Promise<boolean> => {
    if (!requireAuth()) return false;
    const targetTeam = teams.find(t => t.id === teamId);
    const targetMember = targetTeam?.members.find(m => m.id === memberId);
    if (!targetMember) return false;

    const nextRole: 'ADMIN' | 'JOGADOR' = targetMember.role === 'ADMIN' ? 'JOGADOR' : 'ADMIN';
    const res = await apiJson(`/api/teams/${teamId}/members/${memberId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role: nextRole })
    });
    if (!res.ok) {
      showToast('Erro ao alterar papel', res.error || 'Falha ao atualizar no MySQL.', 'warning');
      return false;
    }
    setTeams(prev =>
      prev.map(t =>
        t.id === teamId
          ? {
              ...t,
              members: t.members.map(m => (m.id === memberId ? { ...m, role: nextRole } : m))
            }
          : t
      )
    );
    return true;
  };

  // ==========================================
  // COURTS MANAGEMENT (MySQL)
  // ==========================================
  const getCourtSlotStatus = (courtId: string, date: string, timeSlot: string): SlotStatusResult => {
    const court = courts.find(c => c.id === courtId);
    const blocked = court?.blockedSlots?.find(b => b.date === date && b.timeSlot === timeSlot);
    if (blocked) {
      return { status: 'BLOQUEADO', reason: blocked.reason || 'Manutenção / Bloqueado pela quadra' };
    }

    const activeBooking = bookings.find(
      b =>
        b.courtId === courtId &&
        b.date === date &&
        b.timeSlot === timeSlot &&
        b.status !== 'RECUSADA'
    );
    if (activeBooking) {
      return { status: 'RESERVADO', booking: activeBooking };
    }

    return { status: 'LIVRE' };
  };

  const addCourt = async (
    courtData: Omit<Court, 'id' | 'rating' | 'reviewCount'>
  ): Promise<boolean> => {
    if (!requireAuth()) return false;

    const newCourt: Court = {
      ...courtData,
      id: `court-${Date.now()}`,
      ownerId: currentUser?.id || courtData.ownerId,
      ownerName: currentUser?.name || courtData.ownerName,
      rating: 5.0,
      reviewCount: 1,
      blockedSlots: []
    };

    const res = await apiJson<Court>('/api/courts', {
      method: 'POST',
      body: JSON.stringify(newCourt)
    });

    if (!res.ok) {
      showToast('Erro ao cadastrar quadra', res.error || 'Falha ao salvar no MySQL.', 'warning');
      return false;
    }

    setCourts(prev => [newCourt, ...prev]);
    showToast(
      'Quadra Cadastrada!',
      `"${newCourt.name}" salva no MySQL com ${newCourt.availableTimeSlots.length} horários de 1h.`
    );
    return true;
  };

  const updateCourt = async (courtId: string, updates: Partial<Court>): Promise<boolean> => {
    if (!requireAuth()) return false;

    const res = await apiJson(`/api/courts/${courtId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
    if (!res.ok) {
      showToast('Erro ao atualizar quadra', res.error || 'Falha ao atualizar no MySQL.', 'warning');
      return false;
    }

    setCourts(prev => prev.map(c => (c.id === courtId ? { ...c, ...updates } : c)));
    showToast('Quadra Atualizada!', 'Valor da hora, endereço e horários salvos no MySQL.');
    return true;
  };

  const toggleCourtSlotBlock = async (courtId: string, date: string, timeSlot: string) => {
    if (!requireAuth()) return;
    const slotStatus = getCourtSlotStatus(courtId, date, timeSlot);
    if (slotStatus.status === 'RESERVADO') {
      showToast(
        'Horário com Jogo Marcado',
        'Cancele ou recuse a partida antes de bloquear este horário.',
        'warning'
      );
      return;
    }

    const res = await apiJson<{ blocked: boolean }>(`/api/courts/${courtId}/block-slot`, {
      method: 'POST',
      body: JSON.stringify({ date, timeSlot })
    });
    if (!res.ok) {
      showToast('Erro ao atualizar horário', res.error || 'Falha no MySQL.', 'warning');
      return;
    }

    setCourts(prev =>
      prev.map(c => {
        if (c.id !== courtId) return c;
        const currentBlocked = c.blockedSlots || [];
        const exists = currentBlocked.some(b => b.date === date && b.timeSlot === timeSlot);
        const nextBlocked = exists
          ? currentBlocked.filter(b => !(b.date === date && b.timeSlot === timeSlot))
          : [...currentBlocked, { date, timeSlot, reason: 'Bloqueio manual do Admin da Quadra' }];
        return { ...c, blockedSlots: nextBlocked };
      })
    );

    showToast(
      slotStatus.status === 'BLOQUEADO' ? 'Horário Liberado' : 'Horário Bloqueado',
      `${timeSlot} em ${formatBrDate(date)} atualizado no banco.`,
      'info'
    );
  };

  // ==========================================
  // CHALLENGES & DIRECT MATCH SCHEDULING (MySQL)
  // ==========================================
  const createChallenge = async (data: {
    title: string;
    modality: SportModality;
    date: string;
    formattedDate: string;
    timeSlot: string;
    durationMinutes: number;
    courtId: string;
    totalPrice: number;
    hostRole: 'MANDANTE' | 'A_COMBINAR';
    skillLevel: SkillLevel;
    description: string;
  }): Promise<Challenge | null> => {
    if (!requireAuth()) return null;
    if (!activeTeam) {
      showToast('Cadastre seu time', 'Crie ou selecione um time antes de publicar um desafio.', 'warning');
      setCurrentView('perfil');
      return null;
    }

    const targetCourt = courts.find(c => c.id === data.courtId);
    if (!targetCourt) {
      showToast('Nenhuma quadra disponível', 'Cadastre uma quadra primeiro.', 'warning');
      return null;
    }

    if (data.hostRole === 'MANDANTE') {
      const slotState = getCourtSlotStatus(targetCourt.id, data.date, data.timeSlot);
      if (slotState.status !== 'LIVRE') {
        showToast(
          'Horário Indisponível na Quadra',
          `O horário ${data.timeSlot} em ${data.formattedDate} já está ${slotState.status.toLowerCase()} nesta quadra.`,
          'warning'
        );
        return null;
      }
    }

    const pricePerTeam = Math.round(data.totalPrice / 2);

    const newChallenge: Challenge = {
      id: `challenge-${Date.now()}`,
      title: data.title,
      modality: data.modality,
      date: data.date,
      formattedDate: data.formattedDate,
      timeSlot: data.timeSlot,
      durationMinutes: 60,
      courtId: targetCourt.id,
      courtName: targetCourt.name,
      courtAddress: targetCourt.address,
      neighborhood: targetCourt.neighborhood,
      totalPrice: data.totalPrice,
      pricePerTeam,
      hostRole: data.hostRole,
      skillLevel: data.skillLevel,
      status: 'ABERTO',
      proposingTeam: activeTeam,
      description: data.description,
      createdAt: new Date().toISOString()
    };

    let newBooking: Booking | undefined;
    if (data.hostRole === 'MANDANTE') {
      newBooking = {
        id: `booking-${Date.now()}`,
        courtId: targetCourt.id,
        courtName: targetCourt.name,
        modality: data.modality,
        date: data.date,
        formattedDate: data.formattedDate,
        timeSlot: data.timeSlot,
        price: data.totalPrice,
        status: 'PENDENTE',
        team1Id: activeTeam.id,
        team1Name: activeTeam.name,
        requesterName: activeTeam.captainName,
        requesterPhone: activeTeam.captainPhone,
        paidAmount: 0
      };
    }

    const res = await apiJson('/api/challenges', {
      method: 'POST',
      body: JSON.stringify({ challenge: newChallenge, booking: newBooking })
    });

    if (!res.ok) {
      showToast('Erro ao publicar desafio', res.error || 'Falha no MySQL.', 'warning');
      return null;
    }

    if (newBooking) {
      setBookings(prev => [newBooking!, ...prev]);
    }
    setChallenges(prev => [newChallenge, ...prev]);

    showToast('Desafio Publicado!', 'Desafio salvo no MySQL e pré-horário reservado na quadra.');
    return newChallenge;
  };

  const acceptChallenge = async (challengeId: string): Promise<boolean> => {
    if (!requireAuth()) return false;
    if (!activeTeam) {
      showToast('Cadastre seu time', 'Você precisa ter um time ativo para aceitar desafios.', 'warning');
      setCurrentView('perfil');
      return false;
    }

    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return false;

    if (challenge.proposingTeam.id === activeTeam.id) {
      showToast('Mesmo Time', 'Selecione outro time no seu perfil para aceitar seu próprio desafio.', 'warning');
      return false;
    }

    const slotState = getCourtSlotStatus(challenge.courtId, challenge.date, challenge.timeSlot);
    if (
      slotState.status === 'BLOQUEADO' ||
      (slotState.status === 'RESERVADO' && slotState.booking?.status === 'CONFIRMADA')
    ) {
      showToast('Horário Ocupado', 'Este horário já foi preenchido na quadra.', 'warning');
      return false;
    }

    const fallbackBooking: Booking = {
      id: `booking-${Date.now()}`,
      courtId: challenge.courtId,
      courtName: challenge.courtName,
      modality: challenge.modality,
      date: challenge.date,
      formattedDate: challenge.formattedDate,
      timeSlot: challenge.timeSlot,
      price: challenge.totalPrice,
      status: 'CONFIRMADA',
      team1Id: challenge.proposingTeam.id,
      team1Name: challenge.proposingTeam.name,
      team2Id: activeTeam.id,
      team2Name: activeTeam.name,
      requesterName: activeTeam.captainName,
      requesterPhone: activeTeam.captainPhone,
      paidAmount: 0
    };

    const res = await apiJson(`/api/challenges/${challengeId}/accept`, {
      method: 'POST',
      body: JSON.stringify({ acceptingTeam: activeTeam, fallbackBooking })
    });

    if (!res.ok) {
      showToast('Erro ao aceitar desafio', res.error || 'Falha no MySQL.', 'warning');
      return false;
    }

    setChallenges(prev =>
      prev.map(ch =>
        ch.id === challengeId
          ? { ...ch, status: 'ACEITO' as const, acceptingTeam: activeTeam }
          : ch
      )
    );

    setBookings(prev => {
      const existing = prev.find(
        b =>
          b.courtId === challenge.courtId &&
          b.date === challenge.date &&
          b.timeSlot === challenge.timeSlot &&
          b.status !== 'RECUSADA'
      );
      if (existing) {
        return prev.map(b =>
          b.id === existing.id
            ? {
                ...b,
                team2Id: activeTeam.id,
                team2Name: activeTeam.name,
                status: 'CONFIRMADA' as const
              }
            : b
        );
      }
      return [fallbackBooking, ...prev];
    });

    showToast(
      'Jogo Marcado na Quadra!',
      `${activeTeam.name} vs ${challenge.proposingTeam.name} travou ${challenge.timeSlot} em ${challenge.courtName}.`
    );
    return true;
  };

  const scheduleDirectMatch = async ({
    opponentTeamId,
    courtId,
    date,
    timeSlot,
    description
  }: ScheduleMatchPayload): Promise<boolean> => {
    if (!requireAuth()) return false;
    if (!activeTeam) {
      showToast('Cadastre seu time', 'Crie seu time antes de marcar jogos.', 'warning');
      setCurrentView('perfil');
      return false;
    }

    const opponent = teams.find(t => t.id === opponentTeamId);
    const court = courts.find(c => c.id === courtId);

    if (!opponent || !court) return false;
    if (opponent.id === activeTeam.id) {
      showToast('Adversário Inválido', 'Escolha um time adversário diferente do seu.', 'warning');
      return false;
    }

    const slotState = getCourtSlotStatus(court.id, date, timeSlot);
    if (slotState.status !== 'LIVRE') {
      showToast(
        'Horário Indisponível',
        `O horário ${timeSlot} em ${formatBrDate(date)} já está marcado ou bloqueado nessa quadra.`,
        'warning'
      );
      return false;
    }

    const formatted = formatBrDate(date);
    const totalPrice = court.hourlyRate;
    const pricePerTeam = Math.round(totalPrice / 2);

    const newChallenge: Challenge = {
      id: `challenge-${Date.now()}`,
      title: `${activeTeam.name} vs ${opponent.name} (1h)`,
      modality: court.modality,
      date,
      formattedDate: formatted,
      timeSlot,
      durationMinutes: 60,
      courtId: court.id,
      courtName: court.name,
      courtAddress: court.address,
      neighborhood: court.neighborhood,
      totalPrice,
      pricePerTeam,
      hostRole: 'MANDANTE',
      skillLevel: activeTeam.skillLevel,
      status: 'ACEITO',
      proposingTeam: activeTeam,
      acceptingTeam: opponent,
      description:
        description?.trim() ||
        `Confronto direto de 1h marcado entre ${activeTeam.name} e ${opponent.name}. Pagamento de R$ ${pricePerTeam}/time direto na quadra.`,
      createdAt: new Date().toISOString()
    };

    const newBooking: Booking = {
      id: `booking-${Date.now()}`,
      courtId: court.id,
      courtName: court.name,
      modality: court.modality,
      date,
      formattedDate: formatted,
      timeSlot,
      price: totalPrice,
      status: 'CONFIRMADA',
      team1Id: activeTeam.id,
      team1Name: activeTeam.name,
      team2Id: opponent.id,
      team2Name: opponent.name,
      requesterName: activeTeam.captainName,
      requesterPhone: activeTeam.captainPhone,
      paidAmount: 0
    };

    const res = await apiJson('/api/challenges', {
      method: 'POST',
      body: JSON.stringify({ challenge: newChallenge, booking: newBooking })
    });

    if (!res.ok) {
      showToast('Erro ao marcar jogo', res.error || 'Falha no MySQL.', 'warning');
      return false;
    }

    setChallenges(prev => [newChallenge, ...prev]);
    setBookings(prev => [newBooking, ...prev]);

    showToast(
      'Horário Marcado na Quadra!',
      `${activeTeam.name} x ${opponent.name} agendado para ${formatted} (${timeSlot}) em ${court.name}.`
    );
    return true;
  };

  const openScheduleMatchModal = (preselect?: {
    opponentTeamId?: string;
    courtId?: string;
    date?: string;
    timeSlot?: string;
  }) => {
    if (!requireAuth()) return;
    setSchedulePreselection(preselect || {});
    setIsScheduleMatchOpen(true);
  };

  // ==========================================
  // BOOKINGS MANAGEMENT (MySQL)
  // ==========================================
  const confirmBooking = async (bookingId: string) => {
    if (!requireAuth()) return;
    const res = await apiJson(`/api/bookings/${bookingId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'CONFIRMADA' })
    });
    if (!res.ok) {
      showToast('Erro ao confirmar', res.error || 'Falha no MySQL.', 'warning');
      return;
    }
    setBookings(prev =>
      prev.map(b => (b.id === bookingId ? { ...b, status: 'CONFIRMADA' as const } : b))
    );
    showToast('Horário Confirmado!', 'A reserva na agenda da quadra foi confirmada.');
  };

  const rejectBooking = async (bookingId: string) => {
    if (!requireAuth()) return;
    const res = await apiJson(`/api/bookings/${bookingId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'RECUSADA' })
    });
    if (!res.ok) {
      showToast('Erro ao liberar', res.error || 'Falha no MySQL.', 'warning');
      return;
    }
    setBookings(prev =>
      prev.map(b => (b.id === bookingId ? { ...b, status: 'RECUSADA' as const } : b))
    );
    showToast(
      'Horário Liberado',
      'A reserva foi cancelada e o horário voltou a ficar disponível.',
      'warning'
    );
  };

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        currentUser,
        isAuthenticated: !!currentUser,
        isLoading,
        dbError,
        userRole,
        theme,
        toggleTheme,
        login,
        registerAccount,
        logout,
        refreshData,
        teams,
        activeTeam,
        registerTeam,
        updateTeam,
        selectActiveTeam,
        addTeamMember,
        removeTeamMember,
        toggleMemberRole,
        courts,
        addCourt,
        updateCourt,
        editingCourt,
        setEditingCourt,
        toggleCourtSlotBlock,
        getCourtSlotStatus,
        challenges,
        createChallenge,
        acceptChallenge,
        scheduleDirectMatch,
        bookings,
        confirmBooking,
        rejectBooking,
        selectedChallenge,
        setSelectedChallenge,
        isCreateChallengeOpen,
        setIsCreateChallengeOpen,
        isCreateCourtOpen,
        setIsCreateCourtOpen,
        isScheduleMatchOpen,
        setIsScheduleMatchOpen,
        schedulePreselection,
        openScheduleMatchModal,
        toastMessage,
        showToast,
        clearToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
