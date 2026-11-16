import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Swords,
  CalendarDays,
  Building2,
  Users,
  PlusSquare,
  LogOut,
  Settings,
  CalendarPlus,
  Home
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    currentUser,
    userRole,
    activeTeam,
    courts,
    challenges,
    bookings,
    setIsCreateChallengeOpen,
    setIsCreateCourtOpen,
    openScheduleMatchModal,
    logout
  } = useApp();

  if (!currentUser) return null;

  const openChallengesCount = challenges.filter(c => c.status === 'ABERTO').length;
  const confirmedBookingsCount = bookings.filter(b => b.status === 'CONFIRMADA').length;
  const pendingBookingsCount = bookings.filter(b => b.status === 'PENDENTE').length;

  return (
    <aside className="w-full lg:w-72 bg-zinc-100/70 dark:bg-zinc-900/80 lg:min-h-[calc(100vh-4rem)] border-b lg:border-b-0 lg:border-r border-zinc-200 dark:border-zinc-800 p-4 sm:p-5 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        {userRole === 'GESTOR' ? (
          /* ADMIN DA QUADRA HEADER */
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                Admin da Quadra
              </span>
              <span className="text-zinc-500 tabular-nums">{courts.length} quadras</span>
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                {currentUser.arenaName || 'Meu Complexo Esportivo'}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                {currentUser.name} · {currentUser.email}
              </p>
            </div>
            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">
              <span>{confirmedBookingsCount} jogos marcados</span>
              <span>{pendingBookingsCount} pendentes</span>
            </div>
          </div>
        ) : (
          /* ADMIN DO TIME HEADER */
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                Admin do Time
              </span>
              <span className="text-zinc-500 tabular-nums">
                {activeTeam ? `${activeTeam.members.length} usuários` : 'Sem time'}
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                {activeTeam ? activeTeam.name : currentUser.name}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                {activeTeam
                  ? `${activeTeam.captainName} · ${activeTeam.modality}`
                  : currentUser.email}
              </p>
            </div>
            {activeTeam ? (
              <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                <span>{activeTeam.skillLevel}</span>
                <span className="tabular-nums">
                  Fair Play {activeTeam.stats.fairPlayScore.toFixed(1)}
                </span>
              </div>
            ) : (
              <button
                onClick={() => setCurrentView('perfil')}
                className="w-full mt-1 py-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline text-left cursor-pointer"
              >
                Cadastrar meu time agora →
              </button>
            )}
          </div>
        )}

        {userRole === 'GESTOR' ? (
          /* MENU DO ADMIN DA QUADRA */
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="px-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                Administração da Quadra
              </p>

              <button
                onClick={() => setCurrentView('dashboard')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  currentView === 'dashboard'
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className="w-4 h-4 text-emerald-500" />
                  <span>Visão Geral & Agenda</span>
                </div>
              </button>

              <button
                onClick={() => setCurrentView('quadras')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  currentView === 'quadras'
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-emerald-500" />
                  <span>Quadras, Preços & Horários</span>
                </div>
                <span className="text-xs font-mono text-zinc-500 tabular-nums">{courts.length}</span>
              </button>

              <button
                onClick={() => setCurrentView('meus-jogos')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  currentView === 'meus-jogos'
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CalendarDays className="w-4 h-4 text-emerald-500" />
                  <span>Jogos Marcados</span>
                </div>
                {pendingBookingsCount > 0 && (
                  <span className="text-xs font-semibold text-amber-500 tabular-nums">
                    {pendingBookingsCount} pend.
                  </span>
                )}
              </button>

              <button
                onClick={() => setCurrentView('perfil')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  currentView === 'perfil'
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="w-4 h-4 text-emerald-500" />
                  <span>Perfil do Gestor</span>
                </div>
              </button>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setIsCreateCourtOpen(true)}
                className="w-full text-xs font-bold flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-500 text-zinc-950 rounded-lg hover:bg-emerald-400 transition-colors cursor-pointer"
              >
                <PlusSquare className="w-4 h-4" />
                <span>Cadastrar Nova Quadra</span>
              </button>
            </div>
          </div>
        ) : (
          /* MENU DO ADMIN DO TIME */
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="px-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1.5">
                Administração do Time
              </p>

              <button
                onClick={() => setCurrentView('dashboard')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  currentView === 'dashboard'
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className="w-4 h-4 text-emerald-500" />
                  <span>Painel do Time</span>
                </div>
              </button>

              <button
                onClick={() => setCurrentView('desafios')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  currentView === 'desafios'
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Swords className="w-4 h-4 text-emerald-500" />
                  <span>Times & Desafios</span>
                </div>
                {openChallengesCount > 0 && (
                  <span className="text-xs font-mono text-emerald-500 tabular-nums">
                    {openChallengesCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setCurrentView('quadras')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  currentView === 'quadras'
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-emerald-500" />
                  <span>Quadras Disponíveis</span>
                </div>
                <span className="text-xs font-mono text-zinc-500 tabular-nums">{courts.length}</span>
              </button>

              <button
                onClick={() => setCurrentView('meus-jogos')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  currentView === 'meus-jogos'
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CalendarDays className="w-4 h-4 text-emerald-500" />
                  <span>Jogos Marcados</span>
                </div>
              </button>

              <button
                onClick={() => setCurrentView('perfil')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  currentView === 'perfil'
                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-emerald-500" />
                  <span>Meu Time & Jogadores</span>
                </div>
                <span className="text-xs font-mono text-zinc-500 tabular-nums">
                  {activeTeam ? activeTeam.members.length : 0}
                </span>
              </button>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => openScheduleMatchModal()}
                className="w-full text-xs font-bold flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-500 text-zinc-950 rounded-lg hover:bg-emerald-400 transition-colors cursor-pointer"
              >
                <CalendarPlus className="w-4 h-4" />
                <span>Marcar Jogo na Quadra</span>
              </button>

              <button
                onClick={() => setIsCreateChallengeOpen(true)}
                className="w-full text-xs font-semibold flex items-center justify-center gap-2 py-2 px-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-200 rounded-lg hover:border-emerald-500/50 transition-colors cursor-pointer"
              >
                <PlusSquare className="w-4 h-4 text-emerald-500" />
                <span>Publicar Desafio (1h)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Logout & LP link */}
      <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 mt-6 space-y-2">
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:border-rose-500/40 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sair da Conta</span>
        </button>

        <button
          onClick={() => setCurrentView('index')}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors cursor-pointer"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Voltar para Página Inicial</span>
        </button>
      </div>
    </aside>
  );
};
