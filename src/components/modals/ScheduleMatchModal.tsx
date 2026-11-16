import React, { useState, useEffect } from 'react';
import { useApp, formatBrDate } from '../../context/AppContext';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Calendar, Clock, MapPin, Shield, CheckCircle2, Lock, Users } from 'lucide-react';

export const ScheduleMatchModal: React.FC = () => {
  const {
    isScheduleMatchOpen,
    setIsScheduleMatchOpen,
    schedulePreselection,
    teams,
    activeTeam,
    courts,
    getCourtSlotStatus,
    scheduleDirectMatch
  } = useApp();

  const availableOpponents = activeTeam
    ? teams.filter(t => t.id !== activeTeam.id)
    : teams;

  const [opponentTeamId, setOpponentTeamId] = useState<string>(availableOpponents[0]?.id || '');
  const [courtId, setCourtId] = useState<string>(courts[0]?.id || '');
  const [date, setDate] = useState<string>('2026-11-18');
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (isScheduleMatchOpen) {
      const targetOpponent =
        schedulePreselection.opponentTeamId || availableOpponents[0]?.id || '';
      const targetCourtId = schedulePreselection.courtId || courts[0]?.id || '';
      const targetDate = schedulePreselection.date || '2026-11-18';
      const targetCourt = courts.find(c => c.id === targetCourtId) || courts[0];

      setOpponentTeamId(targetOpponent);
      setCourtId(targetCourtId);
      setDate(targetDate);

      if (schedulePreselection.timeSlot) {
        setSelectedSlot(schedulePreselection.timeSlot);
      } else if (targetCourt) {
        const firstFree = targetCourt.availableTimeSlots.find(
          slot => getCourtSlotStatus(targetCourt.id, targetDate, slot).status === 'LIVRE'
        );
        setSelectedSlot(firstFree || '');
      }
      setNotes('');
    }
  }, [isScheduleMatchOpen, schedulePreselection]);

  const selectedCourt = courts.find(c => c.id === courtId) || courts[0];
  const selectedOpponent = availableOpponents.find(t => t.id === opponentTeamId);
  const pricePerTeam = selectedCourt ? Math.round(selectedCourt.hourlyRate / 2) : 0;

  // Update default free slot whenever court or date changes
  const handleCourtOrDateChange = (nextCourtId: string, nextDate: string) => {
    setCourtId(nextCourtId);
    setDate(nextDate);
    const c = courts.find(item => item.id === nextCourtId);
    if (c) {
      const stillFree =
        selectedSlot &&
        c.availableTimeSlots.includes(selectedSlot) &&
        getCourtSlotStatus(nextCourtId, nextDate, selectedSlot).status === 'LIVRE';
      if (!stillFree) {
        const firstFree = c.availableTimeSlots.find(
          s => getCourtSlotStatus(nextCourtId, nextDate, s).status === 'LIVRE'
        );
        setSelectedSlot(firstFree || '');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!opponentTeamId || !courtId || !selectedSlot) return;
    const ok = await scheduleDirectMatch({
      opponentTeamId,
      courtId,
      date,
      timeSlot: selectedSlot,
      description: notes
    });
    if (ok) {
      setIsScheduleMatchOpen(false);
    }
  };

  if (!activeTeam) {
    return (
      <Dialog
        isOpen={isScheduleMatchOpen}
        onClose={() => setIsScheduleMatchOpen(false)}
        title="Cadastre seu Time Primeiro"
        description="Para marcar um jogo na quadra, você precisa ter um time ativo."
      >
        <div className="flex justify-end pt-2">
          <Button variant="primary" onClick={() => setIsScheduleMatchOpen(false)}>
            Entendi
          </Button>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog
      isOpen={isScheduleMatchOpen}
      onClose={() => setIsScheduleMatchOpen(false)}
      title="Marcar Jogo entre Times na Quadra"
      description="Escolha o time adversário, a quadra e um horário livre de 1h. O horário será travado na agenda da quadra na hora."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Teams Matchup Banner */}
        <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <img
              src={activeTeam.crestUrl}
              alt={activeTeam.name}
              className="w-9 h-9 rounded-lg object-cover border border-zinc-800"
            />
            <div>
              <span className="text-[11px] text-zinc-400 block">Seu Time</span>
              <span className="text-sm font-bold text-zinc-100">{activeTeam.name}</span>
            </div>
          </div>

          <span className="text-xs font-extrabold text-emerald-400 px-2">VS</span>

          <div className="flex-1 sm:max-w-xs">
            <label className="block text-[11px] text-zinc-400 mb-1">
              Time Adversário Disponível
            </label>
            <select
              value={opponentTeamId}
              onChange={e => setOpponentTeamId(e.target.value)}
              required
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-100 focus:outline-none focus:border-emerald-500"
            >
              {availableOpponents.length === 0 ? (
                <option value="">Nenhum outro time cadastrado no MySQL ainda</option>
              ) : (
                availableOpponents.map(team => (
                  <option key={team.id} value={team.id}>
                    {team.name} · {team.modality} ({team.skillLevel})
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        {/* Select Court & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Quadra Disponível
            </label>
            <select
              value={courtId}
              onChange={e => handleCourtOrDateChange(e.target.value, date)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
            >
              {courts.length === 0 ? (
                <option value="">Nenhuma quadra cadastrada no MySQL</option>
              ) : (
                courts.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} — R$ {c.hourlyRate}/h
                  </option>
                ))
              )}
            </select>
            {selectedCourt && (
              <p className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate">
                  {selectedCourt.address}, {selectedCourt.neighborhood}
                </span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Data da Partida
            </label>
            <input
              type="date"
              value={date}
              onChange={e => handleCourtOrDateChange(courtId, e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
            />
            <p className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>{formatBrDate(date)}</span>
            </p>
          </div>
        </div>

        {/* Live 1-hour Time Slots Grid for Selected Court + Date */}
        <div className="space-y-2 p-3.5 bg-zinc-950 border border-zinc-800 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Selecione um Horário Livre na Quadra (1 hora)</span>
            </span>
            <span className="text-[11px] text-zinc-400">
              Ocupados ficam bloqueados automaticamente
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
            {selectedCourt?.availableTimeSlots.map(slot => {
              const slotState = getCourtSlotStatus(selectedCourt.id, date, slot);
              const isFree = slotState.status === 'LIVRE';
              const isSelected = selectedSlot === slot && isFree;

              return (
                <button
                  key={slot}
                  type="button"
                  disabled={!isFree}
                  onClick={() => setSelectedSlot(slot)}
                  className={`p-2.5 rounded-lg border text-left transition-colors ${
                    !isFree
                      ? 'bg-zinc-900/50 border-zinc-800/60 text-zinc-500 cursor-not-allowed'
                      : isSelected
                      ? 'bg-emerald-500 text-zinc-950 border-emerald-400 font-bold cursor-pointer'
                      : 'bg-zinc-900 border-zinc-700/80 text-zinc-200 hover:border-emerald-500/60 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono tabular-nums">{slot}</span>
                    {!isFree ? (
                      <Lock className="w-3 h-3 text-rose-400 shrink-0" />
                    ) : isSelected ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-zinc-950 shrink-0" />
                    ) : null}
                  </div>
                  <span
                    className={`text-[10px] block mt-0.5 truncate ${
                      !isFree
                        ? 'text-rose-400'
                        : isSelected
                        ? 'text-zinc-900 font-semibold'
                        : 'text-emerald-400'
                    }`}
                  >
                    {slotState.status === 'LIVRE'
                      ? 'Disponível'
                      : slotState.status === 'BLOQUEADO'
                      ? 'Bloqueado'
                      : `Marcado (${slotState.booking?.team1Name})`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Summary Price & Court Payment Notice */}
        {selectedCourt && (
          <div className="p-3.5 bg-zinc-950 border border-emerald-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs text-zinc-400 block">
                Tarifa da quadra: <strong className="text-zinc-200 tabular-nums">R$ {selectedCourt.hourlyRate}/h</strong>
              </span>
              <span className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                Pagamento realizado direto na recepção da quadra · Horário marcado na hora
              </span>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[11px] text-emerald-400 block">Cada time paga no local</span>
              <span className="text-lg font-black text-emerald-400 tabular-nums">
                R$ {pricePerTeam},00
              </span>
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
            Recado para o {selectedOpponent?.name || 'adversário'} e para a quadra (opcional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Ex: Levamos coletes reserva e bola oficial."
            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
          <Button type="button" variant="outline" onClick={() => setIsScheduleMatchOpen(false)}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={!selectedSlot || !opponentTeamId}>
            Confirmar e Marcar Horário na Quadra
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
