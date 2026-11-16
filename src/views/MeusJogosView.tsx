import React from 'react';
import { useApp } from '../context/AppContext';
import { Calendar, MapPin, Trophy, DollarSign, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const MeusJogosView: React.FC = () => {
  const {
    challenges,
    bookings,
    userRole,
    activeTeam,
    setSelectedChallenge,
    confirmBooking,
    rejectBooking,
    openScheduleMatchModal
  } = useApp();

  const myMatches = challenges.filter(
    c =>
      c.status === 'ACEITO' &&
      (userRole === 'GESTOR' ||
        (activeTeam &&
          (c.proposingTeam.id === activeTeam.id || c.acceptingTeam?.id === activeTeam.id)))
  );

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {userRole === 'CAPITAO'
              ? activeTeam
                ? `Agenda de Jogos · ${activeTeam.name}`
                : 'Agenda de Jogos'
              : 'Agenda Completa das Quadras'}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {userRole === 'CAPITAO'
              ? 'Partidas de 1 hora já marcadas com adversário e quadra reservada.'
              : 'Todos os horários marcados pelos times nas suas quadras.'}
          </p>
        </div>

        {userRole === 'CAPITAO' && (
          <Button variant="primary" size="sm" onClick={() => openScheduleMatchModal()}>
            Marcar Novo Jogo (1h)
          </Button>
        )}
      </div>

      {/* Gestor Full Bookings List */}
      {userRole === 'GESTOR' ? (
        bookings.length > 0 ? (
        <div className="space-y-3">
          {bookings.map(booking => (
            <div
              key={booking.id}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className={`font-semibold ${
                      booking.status === 'CONFIRMADA'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : booking.status === 'PENDENTE'
                        ? 'text-amber-500'
                        : 'text-zinc-500'
                    }`}
                  >
                    {booking.status === 'CONFIRMADA'
                      ? 'Horário Travado'
                      : booking.status === 'PENDENTE'
                      ? 'Pré-reserva'
                      : booking.status}
                  </span>
                  <span className="text-zinc-400">·</span>
                  <span className="text-zinc-500 dark:text-zinc-400 tabular-nums">
                    {booking.formattedDate} · {booking.timeSlot}
                  </span>
                </div>

                <p className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {booking.team1Name}{' '}
                  {booking.team2Name ? `vs ${booking.team2Name}` : '(Aguardando adversário)'}
                </p>

                <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {booking.courtName}
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums">
                    R$ {booking.price},00 no balcão
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {booking.status === 'PENDENTE' && (
                  <>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => confirmBooking(booking.id)}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Confirmar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => rejectBooking(booking.id)}
                      className="text-rose-500"
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" />
                      Liberar Horário
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
        ) : (
          <div className="text-center py-12 px-4 bg-white dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-2">
            <Calendar className="w-6 h-6 mx-auto text-zinc-400" />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Nenhum jogo marcado nas quadras ainda.
            </p>
          </div>
        )
      ) : (
        /* Capitão Confirmed Matches */
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-500" />
            <span>Jogos Marcados ({myMatches.length})</span>
          </h2>

          {myMatches.length > 0 ? (
            <div className="space-y-3">
              {myMatches.map(match => (
                <div
                  key={match.id}
                  className="bg-white dark:bg-zinc-900 border border-emerald-500/30 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 tabular-nums">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        Horário Marcado na Quadra
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{match.modality}</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {match.formattedDate} ({match.timeSlot})
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={match.proposingTeam.crestUrl}
                          alt={match.proposingTeam.name}
                          className="w-7 h-7 rounded-md object-cover border border-zinc-200 dark:border-zinc-800"
                          referrerPolicy="no-referrer"
                        />
                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          {match.proposingTeam.name}
                        </span>
                      </div>

                      <span className="text-xs font-extrabold text-emerald-500">VS</span>

                      <div className="flex items-center gap-2">
                        <img
                          src={match.acceptingTeam?.crestUrl || activeTeam?.crestUrl || ''}
                          alt={match.acceptingTeam?.name || 'Adversário'}
                          className="w-7 h-7 rounded-md object-cover border border-zinc-200 dark:border-zinc-800"
                          referrerPolicy="no-referrer"
                        />
                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          {match.acceptingTeam?.name || activeTeam?.name || 'Adversário'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        {match.courtName} ({match.courtAddress}, {match.neighborhood})
                      </span>
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums">
                        <DollarSign className="w-3.5 h-3.5" />
                        R$ {match.pricePerTeam},00 por time (pagar direto na quadra)
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setSelectedChallenge(match)}
                    className="shrink-0"
                  >
                    Ver Detalhes
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 px-4 bg-white dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-3">
              <Trophy className="w-6 h-6 mx-auto text-zinc-400" />
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {activeTeam
                  ? `Nenhuma partida marcada para o ${activeTeam.name} ainda.`
                  : 'Nenhuma partida marcada ainda.'}
              </p>
              <Button variant="primary" size="sm" onClick={() => openScheduleMatchModal()}>
                Marcar Primeiro Jogo
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
