import React, { useState, useEffect } from 'react';
import { useApp, formatBrDate } from '../../context/AppContext';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { SportModality, SkillLevel } from '../../types';
import { MapPin, Check, Lock } from 'lucide-react';

export const CreateChallengeModal: React.FC = () => {
  const {
    isCreateChallengeOpen,
    setIsCreateChallengeOpen,
    courts,
    createChallenge,
    getCourtSlotStatus
  } = useApp();

  const [title, setTitle] = useState('');
  const [modality, setModality] = useState<SportModality>('Futebol Society');
  const [courtId, setCourtId] = useState(courts[0]?.id || '');
  const [date, setDate] = useState('2026-11-18');
  const [timeSlot, setTimeSlot] = useState('19:00 - 20:00');
  const [hostRole, setHostRole] = useState<'MANDANTE' | 'A_COMBINAR'>('MANDANTE');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('Intermediário');
  const [description, setDescription] = useState('');

  const selectedCourt = courts.find(c => c.id === courtId) || courts[0];
  const calculatedTotal = selectedCourt?.hourlyRate || 240;
  const pricePerTeam = Math.round(calculatedTotal / 2);

  useEffect(() => {
    if (!courtId && courts[0]?.id) {
      setCourtId(courts[0].id);
    }
  }, [courts, courtId]);

  useEffect(() => {
    if (selectedCourt && !selectedCourt.availableTimeSlots.includes(timeSlot)) {
      const firstFree = selectedCourt.availableTimeSlots.find(
        s => getCourtSlotStatus(selectedCourt.id, date, s).status === 'LIVRE'
      );
      if (firstFree) setTimeSlot(firstFree);
    }
  }, [courtId, date, selectedCourt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedCourt) return;

    const formattedDate = formatBrDate(date);

    const created = await createChallenge({
      title,
      modality,
      date,
      formattedDate,
      timeSlot,
      durationMinutes: 60,
      courtId: selectedCourt.id,
      totalPrice: calculatedTotal,
      hostRole,
      skillLevel,
      description:
        description ||
        'Desafio amistoso saudável de 1 hora. Respeito mútuo e fair play em primeiro lugar!'
    });

    if (created) {
      setTitle('');
      setDescription('');
      setIsCreateChallengeOpen(false);
    }
  };

  return (
    <Dialog
      isOpen={isCreateChallengeOpen}
      onClose={() => setIsCreateChallengeOpen(false)}
      title="Publicar Desafio Aberto no Mural"
      description="Lance um desafio de 1 hora na quadra selecionada para qualquer time disponível aceitar."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
            Título do Desafio *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Ex: Amistoso Society Noturno 7x7"
            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3.5 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Modalidade
            </label>
            <select
              value={modality}
              onChange={e => setModality(e.target.value as SportModality)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
            >
              <option value="Futebol Society">Futebol Society (7x7)</option>
              <option value="Futsal">Futsal (5x5)</option>
              <option value="Beach Tennis">Beach Tennis (Duplas)</option>
              <option value="Basquete">Basquete</option>
              <option value="Vôlei">Vôlei de Quadra</option>
              <option value="Padel">Padel</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Nível Técnico Exigido
            </label>
            <select
              value={skillLevel}
              onChange={e => setSkillLevel(e.target.value as SkillLevel)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
            >
              <option value="Iniciante / Amador">Iniciante / Amador</option>
              <option value="Intermediário">Intermediário</option>
              <option value="Avançado">Avançado</option>
              <option value="Competitivo">Competitivo</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
            Quadra Selecionada
          </label>
          <select
            value={courtId}
            onChange={e => setCourtId(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
          >
            {courts.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} - {c.neighborhood} (R$ {c.hourlyRate}/h)
              </option>
            ))}
          </select>
          {selectedCourt && (
            <p className="text-[11px] text-zinc-400 mt-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-400" />
              <span>
                {selectedCourt.address}, {selectedCourt.neighborhood} - {selectedCourt.city}
              </span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Data Desejada
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Horário (1 hora de jogo)
            </label>
            <select
              value={timeSlot}
              onChange={e => setTimeSlot(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500"
            >
              {(selectedCourt?.availableTimeSlots || []).map(slot => {
                const st = getCourtSlotStatus(selectedCourt.id, date, slot);
                const disabled = hostRole === 'MANDANTE' && st.status !== 'LIVRE';
                return (
                  <option key={slot} value={slot} disabled={disabled}>
                    {slot} {disabled ? `(${st.status})` : '— Livre'}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
            Mando de Campo
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setHostRole('MANDANTE')}
              className={`p-3 rounded-lg border text-left transition-colors ${
                hostRole === 'MANDANTE'
                  ? 'bg-emerald-950/40 border-emerald-500 text-zinc-100'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">Mandante Fixo</span>
                {hostRole === 'MANDANTE' && <Check className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                Reserva o horário nesta quadra automaticamente.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setHostRole('A_COMBINAR')}
              className={`p-3 rounded-lg border text-left transition-colors ${
                hostRole === 'A_COMBINAR'
                  ? 'bg-emerald-950/40 border-emerald-500 text-zinc-100'
                  : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">A Combinar</span>
                {hostRole === 'A_COMBINAR' && <Check className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                Aceitamos ajustar a quadra com o adversário.
              </p>
            </button>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs text-zinc-400">Valor da Quadra (1h):</span>
              <span className="text-xs font-bold text-zinc-200 ml-1.5 tabular-nums">
                R$ {selectedCourt?.hourlyRate || 240}/h
              </span>
            </div>
            <span className="text-xs text-emerald-400 font-semibold tabular-nums">
              R$ {pricePerTeam},00 por time (50%)
            </span>
          </div>
          <p className="text-[11px] text-zinc-500">
            Nenhum pagamento é feito pelo app. O acerto acontece direto na recepção da quadra.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
            Observações da Partida
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Ex: Coletes inclusos, levamos bola oficial."
            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsCreateChallengeOpen(false)}
          >
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            Publicar Desafio no Mural
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
