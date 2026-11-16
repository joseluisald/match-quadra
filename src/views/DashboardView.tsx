import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Calendar,
  MapPin,
  CheckCircle2,
  XCircle,
  PlusCircle,
  ArrowRight,
  Users,
  CalendarPlus,
  Building2
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export const DashboardView: React.FC = () => {
  const {
    userRole,
    activeTeam,
    teams,
    courts,
    challenges,
    bookings,
    confirmBooking,
    rejectBooking,
    setIsCreateCourtOpen,
    setEditingCourt,
    setCurrentView,
    setSelectedChallenge,
    openScheduleMatchModal
  } = useApp();

  const upcomingMatch = activeTeam
    ? challenges.find(
        c =>
          c.status === 'ACEITO' &&
          (c.proposingTeam.id === activeTeam.id || c.acceptingTeam?.id === activeTeam.id)
      )
    : undefined;
  const availableOpponents = activeTeam
    ? teams.filter(t => t.id !== activeTeam.id)
    : teams;
  const pendingBookings = bookings.filter(b => b.status === 'PENDENTE');
  const confirmedBookings = bookings.filter(b => b.status === 'CONFIRMADA');

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {userRole === 'CAPITAO'
              ? activeTeam
                ? `Admin do Time · ${activeTeam.name}`
                : 'Admin do Time · Painel'
              : 'Admin da Quadra · Painel Operacional'}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            {userRole === 'CAPITAO'
              ? activeTeam
                ? `${activeTeam.members.length} usuários no elenco · ${activeTeam.modality} · ${activeTeam.skillLevel}`
                : 'Cadastre ou selecione seu time para começar a marcar jogos'
              : `${courts.length} quadras cadastradas · ${confirmedBookings.length} horários marcados`}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {userRole === 'CAPITAO' ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentView('perfil')}
                className="gap-1.5"
              >
                <Users className="w-4 h-4" />
                <span>Elenco ({activeTeam ? activeTeam.members.length : 0})</span>
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => openScheduleMatchModal()}
                className="gap-1.5"
              >
                <CalendarPlus className="w-4 h-4" />
                <span>Marcar Jogo</span>
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateCourtOpen(true)}
              className="gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Cadastrar Quadra</span>
            </Button>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* ADMIN DO TIME */}
      {/* ============================================================ */}
      {userRole === 'CAPITAO' && (
        <div className="space-y-6">
          {/* Next Confirmed Match */}
          {upcomingMatch ? (
            <div className="bg-white dark:bg-zinc-900 border border-emerald-500/40 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    Próximo Jogo Marcado (1h)
                  </span>
                  <span aria-hidden="true" className="text-zinc-400">·</span>
                  <span className="text-zinc-500 dark:text-zinc-400">{upcomingMatch.modality}</span>
                </div>

                <p className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {upcomingMatch.proposingTeam.name} vs {upcomingMatch.acceptingTeam?.name}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-600 dark:text-zinc-400">
                  <span className="flex items-center gap-1.5 text-zinc-900 dark:text-zinc-200 tabular-nums">
                    <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                    {upcomingMatch.formattedDate} · {upcomingMatch.timeSlot}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                    {upcomingMatch.courtName} ({upcomingMatch.neighborhood})
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums">
                    R$ {upcomingMatch.pricePerTeam},00 / time (pago na quadra)
                  </span>
                </div>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setSelectedChallenge(upcomingMatch)}
                className="shrink-0"
              >
                Ver Detalhes
              </Button>
            </div>
          ) : (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {activeTeam
                    ? `Nenhum jogo marcado para o ${activeTeam.name}`
                    : 'Você ainda não cadastrou um time'}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {activeTeam
                    ? 'Escolha um time disponível e uma quadra com horário livre para marcar sua partida.'
                    : 'Cadastre seu time e elenco para poder marcar jogos contra outros times.'}
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => (activeTeam ? openScheduleMatchModal() : setCurrentView('perfil'))}
              >
                {activeTeam ? 'Marcar Jogo Agora' : 'Cadastrar Meu Time'}
              </Button>
            </div>
          )}

          {/* Available Opponents & Available Courts Quick Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Times Disponíveis */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Times Disponíveis para Confronto
                </h2>
                <button
                  onClick={() => setCurrentView('desafios')}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium flex items-center gap-1 cursor-pointer"
                >
                  Ver todos ({availableOpponents.length}) <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl divide-y divide-zinc-200 dark:divide-zinc-800">
                {availableOpponents.length > 0 ? (
                  availableOpponents.slice(0, 3).map(team => (
                    <div
                      key={team.id}
                      className="p-3.5 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={team.crestUrl}
                          alt={team.name}
                          className="w-9 h-9 rounded-lg object-cover border border-zinc-200 dark:border-zinc-800 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                            {team.name}
                          </p>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                            {team.modality} · {team.skillLevel}
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          openScheduleMatchModal({
                            opponentTeamId: team.id,
                            courtId: team.homeCourtId
                          })
                        }
                        className="shrink-0 text-xs"
                      >
                        Marcar Jogo
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="p-5 text-xs text-zinc-500 dark:text-zinc-400 text-center">
                    Nenhum outro time cadastrado no banco ainda.
                  </div>
                )}
              </div>
            </div>

            {/* Quadras Disponíveis */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Quadras com Horários Livres
                </h2>
                <button
                  onClick={() => setCurrentView('quadras')}
                  className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium flex items-center gap-1 cursor-pointer"
                >
                  Ver grade ({courts.length}) <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl divide-y divide-zinc-200 dark:divide-zinc-800">
                {courts.length > 0 ? (
                  courts.slice(0, 3).map(court => (
                    <div
                      key={court.id}
                      className="p-3.5 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                          {court.name}
                        </p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                          {court.address}, {court.neighborhood}
                        </p>
                        <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">
                          R$ {court.hourlyRate}/h · {court.availableTimeSlots.length} horários de 1h
                        </p>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openScheduleMatchModal({ courtId: court.id })}
                        className="shrink-0 text-xs"
                      >
                        Reservar 1h
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="p-5 text-xs text-zinc-500 dark:text-zinc-400 text-center">
                    Nenhuma quadra cadastrada no banco ainda.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ADMIN DA QUADRA */}
      {/* ============================================================ */}
      {userRole === 'GESTOR' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 block">
                Quadras Cadastradas
              </span>
              <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                {courts.length}
              </span>
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 block">
                Jogos Marcados na Agenda
              </span>
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {confirmedBookings.length}
              </span>
            </div>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 block">
                Aguardando Adversário / Aprovação
              </span>
              <span className="text-2xl font-bold text-amber-500 tabular-nums">
                {pendingBookings.length}
              </span>
            </div>
          </div>

          {/* Registered Courts Quick Summary */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Minhas Quadras (Valor, Endereço & Horários)
              </h2>
              <button
                onClick={() => setCurrentView('quadras')}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium flex items-center gap-1 cursor-pointer"
              >
                Ver grade por data <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl divide-y divide-zinc-200 dark:divide-zinc-800">
              {courts.length > 0 ? (
                courts.map(court => (
                  <div
                    key={court.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">
                          {court.name}
                        </span>
                        <span className="text-zinc-400">·</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums">
                          R$ {court.hourlyRate}/h
                        </span>
                      </div>
                      <p className="text-zinc-500 dark:text-zinc-400">
                        {court.address}, {court.neighborhood} — {court.availableTimeSlots.length}{' '}
                        horários de 1h configurados
                      </p>
                    </div>

                    <Button variant="outline" size="sm" onClick={() => setEditingCourt(court)}>
                      Editar Quadra / Horários
                    </Button>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
                  Nenhuma quadra cadastrada ainda. Clique em "Cadastrar Quadra" acima para começar.
                </div>
              )}
            </div>
          </div>

          {/* Bookings Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Horários Marcados nas Quadras
              </h2>
              <span className="text-xs text-zinc-500 tabular-nums">
                {bookings.length} registros
              </span>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden divide-y divide-zinc-200 dark:divide-zinc-800/80">
              {bookings.length > 0 ? (
                bookings.map(booking => (
                  <div
                    key={booking.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">
                          {booking.courtName}
                        </span>
                        <span className="text-zinc-400">·</span>
                        <span className="text-zinc-500 dark:text-zinc-400">{booking.modality}</span>
                      </div>
                      <p className="text-zinc-700 dark:text-zinc-300">
                        <strong>{booking.team1Name}</strong>{' '}
                        {booking.team2Name ? `vs ${booking.team2Name}` : '(Aguardando adversário)'}
                      </p>
                      <p className="text-zinc-500 dark:text-zinc-400 tabular-nums">
                        {booking.formattedDate} · {booking.timeSlot} · R$ {booking.price},00 (receber
                        no local)
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {booking.status === 'PENDENTE' ? (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => confirmBooking(booking.id)}
                            className="h-8 text-xs px-3"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                            Confirmar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => rejectBooking(booking.id)}
                            className="h-8 text-xs px-2.5 text-rose-500 hover:text-rose-400"
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" />
                            Liberar
                          </Button>
                        </div>
                      ) : booking.status === 'CONFIRMADA' ? (
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          Horário Marcado
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-500">{booking.status}</span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
                  Nenhum horário marcado nas quadras ainda.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
