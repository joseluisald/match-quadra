import React, { useState } from 'react';
import { useApp, formatBrDate } from '../context/AppContext';
import {
  MapPin,
  PlusCircle,
  Star,
  Check,
  Search,
  Calendar,
  Lock,
  Edit3
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export const QuadrasView: React.FC = () => {
  const {
    courts,
    userRole,
    setIsCreateCourtOpen,
    setEditingCourt,
    getCourtSlotStatus,
    toggleCourtSlotBlock,
    openScheduleMatchModal
  } = useApp();

  const [selectedModality, setSelectedModality] = useState<string>('TODAS');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('2026-11-18');

  const filteredCourts = courts.filter(court => {
    if (selectedModality !== 'TODAS' && court.modality !== selectedModality) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        court.name.toLowerCase().includes(q) ||
        court.neighborhood.toLowerCase().includes(q) ||
        court.address.toLowerCase().includes(q) ||
        court.city.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {userRole === 'GESTOR'
              ? 'Admin da Quadra · Cadastro, Valores & Agenda'
              : 'Quadras Disponíveis & Horários'}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {userRole === 'GESTOR'
              ? 'Cadastre ou edite suas quadras, defina endereço, valor da hora e acompanhe os horários marcados.'
              : 'Escolha uma quadra e clique em um horário livre de 1h para marcar seu jogo na hora.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {userRole === 'GESTOR' ? (
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsCreateCourtOpen(true)}
              className="gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Cadastrar Nova Quadra</span>
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={() => openScheduleMatchModal({ date: selectedDate })}
              className="gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Marcar Jogo em uma Quadra</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filter, Search & Date Picker */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar por quadra, endereço ou bairro..."
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
              Agenda de:
            </span>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
            />
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hidden sm:inline whitespace-nowrap">
              {formatBrDate(selectedDate)}
            </span>
          </div>
        </div>

        {/* Modality Segmented Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['TODAS', 'Futebol Society', 'Futsal', 'Beach Tennis'].map(mod => (
            <button
              key={mod}
              onClick={() => setSelectedModality(mod)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                selectedModality === mod
                  ? 'bg-emerald-500 text-zinc-950 font-bold'
                  : 'bg-zinc-100 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 border border-zinc-200 dark:border-zinc-800'
              }`}
            >
              {mod === 'TODAS' ? 'Todos Esportes' : mod}
            </button>
          ))}
        </div>
      </div>

      {/* Courts Grid */}
      {filteredCourts.length === 0 ? (
        <div className="text-center py-14 px-4 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-3">
          <MapPin className="w-6 h-6 mx-auto text-zinc-400" />
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-200">
            Nenhuma quadra cadastrada ainda
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
            {userRole === 'GESTOR'
              ? 'Cadastre sua primeira quadra no MySQL com endereço, valor da hora e horários disponíveis.'
              : 'Nenhuma quadra encontrada no banco de dados com esses filtros.'}
          </p>
          {userRole === 'GESTOR' && (
            <Button variant="primary" size="sm" onClick={() => setIsCreateCourtOpen(true)}>
              Cadastrar Primeira Quadra
            </Button>
          )}
        </div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCourts.map(court => {
          const halfPrice = Math.round(court.hourlyRate / 2);

          return (
            <div
              key={court.id}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 w-full bg-zinc-950 overflow-hidden">
                  <img
                    src={court.imageUrl}
                    alt={court.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded-md text-xs font-bold text-white flex items-center gap-1 tabular-nums">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{court.rating.toFixed(1)}</span>
                  </div>

                  <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white">
                    <div>
                      <span className="text-xs font-semibold text-emerald-400 block">
                        {court.modality}
                      </span>
                      <h3 className="text-base font-bold leading-snug">{court.name}</h3>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-black text-emerald-400 tabular-nums block">
                        R$ {court.hourlyRate}/h
                      </span>
                      <span className="text-[11px] text-zinc-300 tabular-nums">
                        R$ {halfPrice}/time no local
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {/* Full Address */}
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>
                        {court.address}, {court.neighborhood} — {court.city}
                      </span>
                    </p>

                    {userRole === 'GESTOR' && (
                      <button
                        type="button"
                        onClick={() => setEditingCourt(court)}
                        className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>
                    )}
                  </div>

                  {/* Interactive 1-hour Time Slots for Selected Date */}
                  <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800/80">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                        Horários em {formatBrDate(selectedDate)} (1h)
                      </span>
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {userRole === 'GESTOR'
                          ? 'Clique em um horário livre para bloquear'
                          : 'Clique em um horário livre para marcar jogo'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {court.availableTimeSlots.map(slot => {
                        const slotState = getCourtSlotStatus(court.id, selectedDate, slot);
                        const isFree = slotState.status === 'LIVRE';
                        const isBooked = slotState.status === 'RESERVADO';

                        return (
                          <button
                            key={slot}
                            type="button"
                            disabled={isBooked || (userRole === 'CAPITAO' && !isFree)}
                            onClick={() => {
                              if (userRole === 'GESTOR') {
                                toggleCourtSlotBlock(court.id, selectedDate, slot);
                              } else if (isFree) {
                                openScheduleMatchModal({
                                  courtId: court.id,
                                  date: selectedDate,
                                  timeSlot: slot
                                });
                              }
                            }}
                            className={`p-2 rounded-lg border text-left transition-colors ${
                              isBooked
                                ? 'bg-zinc-100 dark:bg-zinc-950 border-emerald-500/40 text-zinc-700 dark:text-zinc-300 cursor-default'
                                : slotState.status === 'BLOQUEADO'
                                ? 'bg-zinc-100 dark:bg-zinc-950 border-zinc-300 dark:border-zinc-800 text-zinc-500 cursor-pointer'
                                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 cursor-pointer'
                            }`}
                          >
                            <div className="flex items-center justify-between text-xs font-mono tabular-nums">
                              <span className="font-semibold">{slot}</span>
                              {!isFree && <Lock className="w-3 h-3 shrink-0" />}
                            </div>
                            <span className="text-[10px] block truncate mt-0.5">
                              {isFree
                                ? 'Livre'
                                : slotState.status === 'BLOQUEADO'
                                ? 'Bloqueado'
                                : slotState.booking?.team2Name
                                ? `${slotState.booking.team1Name} x ${slotState.booking.team2Name}`
                                : `Pré-reserva (${slotState.booking?.team1Name})`}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-zinc-500 dark:text-zinc-400 pt-2 border-t border-zinc-200 dark:border-zinc-800/80">
                    {court.amenities.map((amenity, idx) => (
                      <span key={idx} className="flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{amenity}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer Action */}
              <div className="px-5 pb-5 pt-0">
                {userRole === 'GESTOR' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => setEditingCourt(court)}
                  >
                    Editar Dados, Valor/h e Horários da Quadra
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full text-xs gap-1.5"
                    onClick={() =>
                      openScheduleMatchModal({
                        courtId: court.id,
                        date: selectedDate
                      })
                    }
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Marcar Jogo Nesta Quadra</span>
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
};
