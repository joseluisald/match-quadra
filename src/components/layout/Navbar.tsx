import React from 'react';
import { useApp } from '../../context/AppContext';
import { Trophy, PlusCircle, Sun, Moon, CalendarPlus, LogIn, LogOut } from 'lucide-react';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    currentUser,
    isAuthenticated,
    userRole,
    theme,
    toggleTheme,
    setIsCreateCourtOpen,
    openScheduleMatchModal,
    logout
  } = useApp();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <button
          onClick={() => setCurrentView('index')}
          className="flex items-center gap-2.5 text-left group whitespace-nowrap shrink-0 cursor-pointer"
        >
          <span className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-zinc-950 shrink-0">
            <Trophy className="w-4 h-4 text-zinc-950" />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-500 transition-colors">
            MatchQuadra
          </span>
        </button>

        {/* Zone 2: Clean Single-Line Nav Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          <button
            onClick={() => setCurrentView('index')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer ${
              currentView === 'index' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''
            }`}
          >
            Início
          </button>
          <button
            onClick={() => setCurrentView('desafios')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer ${
              currentView === 'desafios' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''
            }`}
          >
            Times & Desafios
          </button>
          <button
            onClick={() => setCurrentView('quadras')}
            className={`whitespace-nowrap shrink-0 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer ${
              currentView === 'quadras' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''
            }`}
          >
            Quadras
          </button>
          {isAuthenticated && (
            <>
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`whitespace-nowrap shrink-0 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer ${
                  currentView === 'dashboard'
                    ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                    : ''
                }`}
              >
                Painel Admin
              </button>
              <button
                onClick={() => setCurrentView('meus-jogos')}
                className={`whitespace-nowrap shrink-0 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer ${
                  currentView === 'meus-jogos'
                    ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                    : ''
                }`}
              >
                Agenda
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: Real Auth & Primary Role Action */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {isAuthenticated && currentUser ? (
            <>
              {userRole === 'CAPITAO' ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => openScheduleMatchModal()}
                  className="gap-1.5"
                >
                  <CalendarPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">Marcar Jogo</span>
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsCreateCourtOpen(true)}
                  className="gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Nova Quadra</span>
                </Button>
              )}

              <button
                onClick={toggleTheme}
                className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                title="Alternar tema"
                aria-label="Alternar tema"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setCurrentView('perfil')}
                className="cursor-pointer flex items-center gap-2 pl-2 border-l border-zinc-200 dark:border-zinc-800"
                title={`Perfil: ${currentUser.name}`}
              >
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover border border-zinc-300 dark:border-zinc-700 bg-zinc-800"
                  referrerPolicy="no-referrer"
                />
                <div className="hidden lg:block text-left leading-tight">
                  <span className="block text-xs font-semibold text-zinc-900 dark:text-zinc-100 max-w-[110px] truncate">
                    {currentUser.name}
                  </span>
                  <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    {userRole === 'GESTOR' ? 'Admin da Quadra' : 'Admin do Time'}
                  </span>
                </div>
              </button>

              <button
                onClick={logout}
                className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-rose-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                title="Sair da conta"
                aria-label="Sair da conta"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={toggleTheme}
                className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                title="Alternar tema"
                aria-label="Alternar tema"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setCurrentView('login')}
                className="gap-1.5"
              >
                <LogIn className="w-4 h-4" />
                <span>Entrar / Cadastrar</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
