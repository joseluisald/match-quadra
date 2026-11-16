import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Challenge } from '../types';
import {
  Search,
  Calendar,
  Clock,
  MapPin,
  PlusCircle,
  Star,
  Users,
  CheckCircle2,
  SlidersHorizontal,
  CalendarPlus
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export const DesafiosView: React.FC = () => {
  const {
    challenges,
    teams,
    activeTeam,
    setSelectedChallenge,
    setIsCreateChallengeOpen,
    openScheduleMatchModal
  } = useApp();

  // Switch between "Times Disponíveis" (list teams to book direct match) and "Mural de Desafios"
  const [activeTab, setActiveTab] = useState<'TIMES' | 'MURAL'>('TIMES');

  // Shared filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModality, setSelectedModality] = useState<string>('TODAS');
  const [selectedLevel, setSelectedLevel] = useState<string>('TODOS');
  const [onlyOpen, setOnlyOpen] = useState(true);

  const availableTeams = useMemo(() => {
    return teams.filter(t => {
      if (activeTeam && t.id === activeTeam.id) return false;
      if (selectedModality !== 'TODAS' && t.modality !== selectedModality) return false;
      if (selectedLevel !== 'TODOS' && t.skillLevel !== selectedLevel) return false;
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const match =
          t.name.toLowerCase().includes(q) ||
          t.captainName.toLowerCase().includes(q) ||
          t.city.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [teams, activeTeam?.id, selectedModality, selectedLevel, searchTerm]);

  const filteredChallenges = useMemo(() => {
    return challenges.filter(c => {
      if (onlyOpen && c.status !== 'ABERTO') return false;
      if (selectedModality !== 'TODAS' && c.modality !== selectedModality) return false;
      if (selectedLevel !== 'TODOS' && c.skillLevel !== selectedLevel) return false;
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesQuery =
          c.title.toLowerCase().includes(query) ||
          c.courtName.toLowerCase().includes(query) ||
          c.neighborhood.toLowerCase().includes(query) ||
          c.proposingTeam.name.toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }
      return true;
    });
  }, [challenges, searchTerm, selectedModality, selectedLevel, onlyOpen]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Times Disponíveis & Mural de Desafios
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Escolha um time disponível para marcar um jogo de 1h na quadra ou aceite um desafio aberto.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            variant="primary"
            size="sm"
            onClick={() => openScheduleMatchModal()}
            className="gap-1.5"
          >
            <CalendarPlus className="w-4 h-4" />
            <span>Marcar Jogo na Quadra</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreateChallengeOpen(true)}
            className="gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Publicar Desafio</span>
          </Button>
        </div>
      </div>

      {/* Segmented View Tabs */}
      <div className="inline-flex p-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
        <button
          onClick={() => setActiveTab('TIMES')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'TIMES'
              ? 'bg-emerald-500 text-zinc-950 font-bold'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          Times Disponíveis ({availableTeams.length})
        </button>
        <button
          onClick={() => setActiveTab('MURAL')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'MURAL'
              ? 'bg-emerald-500 text-zinc-950 font-bold'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          Mural de Desafios ({filteredChallenges.length})
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome do time, capitão, bairro ou quadra..."
            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={selectedModality}
            onChange={e => setSelectedModality(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="TODAS">Todas Modalidades</option>
            <option value="Futebol Society">Futebol Society</option>
            <option value="Futsal">Futsal</option>
            <option value="Beach Tennis">Beach Tennis</option>
            <option value="Basquete">Basquete</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={selectedLevel}
            onChange={e => setSelectedLevel(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="TODOS">Todos os Níveis</option>
            <option value="Iniciante / Amador">Iniciante / Amador</option>
            <option value="Intermediário">Intermediário</option>
            <option value="Avançado">Avançado</option>
            <option value="Competitivo">Competitivo</option>
          </select>
        </div>

        {activeTab === 'MURAL' && (
          <div className="sm:col-span-12 pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-zinc-600 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={onlyOpen}
                onChange={e => setOnlyOpen(e.target.checked)}
                className="rounded border-zinc-400 text-emerald-500 focus:ring-emerald-500"
              />
              <span>Exibir apenas desafios abertos</span>
            </label>
          </div>
        )}
      </div>

      {/* TAB 1: TIMES DISPONÍVEIS */}
      {activeTab === 'TIMES' && (
        availableTeams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {availableTeams.map(team => (
            <div
              key={team.id}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 flex flex-col justify-between space-y-4 hover:border-emerald-500/50 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {team.modality}
                  </span>
                  <span className="flex items-center gap-1 text-amber-500 font-semibold tabular-nums">
                    <Star className="w-3.5 h-3.5 fill-amber-500" />
                    {team.stats.fairPlayScore.toFixed(1)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <img
                    src={team.crestUrl}
                    alt={team.name}
                    className="w-12 h-12 rounded-xl object-cover border border-zinc-200 dark:border-zinc-800 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {team.name}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                      Capitão: {team.captainName}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300 pt-1">
                  <p>
                    Nível: <strong>{team.skillLevel}</strong>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="tabular-nums">{team.members.length} jogadores cadastrados</span>
                  </p>
                  <p className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{team.homeCourtName || team.city}</span>
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() =>
                    openScheduleMatchModal({
                      opponentTeamId: team.id,
                      courtId: team.homeCourtId
                    })
                  }
                  className="w-full gap-1.5"
                >
                  <CalendarPlus className="w-3.5 h-3.5" />
                  <span>Marcar Jogo (1h)</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
        ) : (
          <div className="text-center py-14 px-4 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-2">
            <Users className="w-6 h-6 mx-auto text-zinc-400" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-200">
              Nenhum time adversário cadastrado ainda
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              Assim que outros times se cadastrarem no MySQL, eles aparecerão aqui para marcação de jogos.
            </p>
          </div>
        )
      )}

      {/* TAB 2: MURAL DE DESAFIOS */}
      {activeTab === 'MURAL' && (
        <>
          {filteredChallenges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredChallenges.map(challenge => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  onSelect={() => setSelectedChallenge(challenge)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-14 px-4 bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-3">
              <SlidersHorizontal className="w-6 h-6 mx-auto text-zinc-400" />
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-200">
                Nenhum desafio encontrado
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                Ajuste os filtros ou marque um jogo direto com qualquer time na aba Times Disponíveis.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

interface ChallengeCardProps {
  challenge: Challenge;
  onSelect: () => void;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, onSelect }) => {
  const isAccepted = challenge.status === 'ACEITO';

  return (
    <div
      onClick={onSelect}
      className={`bg-white dark:bg-zinc-900 border rounded-xl p-5 flex flex-col justify-between cursor-pointer transition-colors ${
        isAccepted
          ? 'border-zinc-200 dark:border-zinc-800 opacity-75'
          : 'border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/60'
      }`}
    >
      <div className="space-y-3.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            {challenge.modality} · {challenge.skillLevel}
          </span>
          {isAccepted ? (
            <span className="text-zinc-500 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Marcado
            </span>
          ) : (
            <span className="text-amber-500 font-semibold">Aberto</span>
          )}
        </div>

        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">
            {challenge.title}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
            {challenge.description}
          </p>
        </div>

        <div className="flex items-center gap-2.5 pt-1">
          <img
            src={challenge.proposingTeam.crestUrl}
            alt={challenge.proposingTeam.name}
            className="w-8 h-8 rounded-lg object-cover border border-zinc-200 dark:border-zinc-800 shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
              {challenge.proposingTeam.name}
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
              Capitão: {challenge.proposingTeam.captainName}
            </p>
          </div>
        </div>

        <div className="space-y-1 text-xs text-zinc-600 dark:text-zinc-300">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>{challenge.formattedDate}</span>
          </div>
          <div className="flex items-center gap-2 tabular-nums">
            <Clock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>{challenge.timeSlot} (60 min)</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span className="truncate">
              {challenge.courtName} · {challenge.neighborhood}
            </span>
          </div>
        </div>
      </div>

      <div className="pt-4 mt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <div>
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block">
            R$ {challenge.totalPrice}/h · Pago na quadra
          </span>
          <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
            R$ {challenge.pricePerTeam},00 / time
          </span>
        </div>

        <Button variant={isAccepted ? 'outline' : 'primary'} size="sm" className="text-xs">
          {isAccepted ? 'Ver Súmula' : 'Aceitar'}
        </Button>
      </div>
    </div>
  );
};
