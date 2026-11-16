import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Trophy,
  Shield,
  Star,
  Save,
  UserPlus,
  Trash2,
  PlusCircle,
  Users,
  ShieldCheck,
  Building2,
  MapPin
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SkillLevel, SportModality } from '../types';

export const PerfilView: React.FC = () => {
  const {
    currentUser,
    userRole,
    teams,
    activeTeam,
    selectActiveTeam,
    registerTeam,
    updateTeam,
    addTeamMember,
    removeTeamMember,
    toggleMemberRole,
    courts,
    setEditingCourt,
    setIsCreateCourtOpen,
    showToast
  } = useApp();

  // Edit active team form
  const [teamName, setTeamName] = useState(activeTeam?.name || '');
  const [captainName, setCaptainName] = useState(activeTeam?.captainName || '');
  const [phone, setPhone] = useState(activeTeam?.captainPhone || '');
  const [modality, setModality] = useState<SportModality>(
    activeTeam?.modality || 'Futebol Society'
  );
  const [skillLevel, setSkillLevel] = useState<SkillLevel>(
    activeTeam?.skillLevel || 'Intermediário'
  );
  const [homeCourtId, setHomeCourtId] = useState(
    activeTeam?.homeCourtId || courts[0]?.id || ''
  );
  const [city, setCity] = useState(activeTeam?.city || 'São Paulo - SP');

  // Sync form when switching teams
  useEffect(() => {
    if (!activeTeam) return;
    setTeamName(activeTeam.name);
    setCaptainName(activeTeam.captainName);
    setPhone(activeTeam.captainPhone);
    setModality(activeTeam.modality);
    setSkillLevel(activeTeam.skillLevel);
    setHomeCourtId(activeTeam.homeCourtId || courts[0]?.id || '');
    setCity(activeTeam.city);
  }, [activeTeam, courts]);

  // New team modal-less toggleable form
  const [showNewTeamForm, setShowNewTeamForm] = useState(!activeTeam);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamCaptain, setNewTeamCaptain] = useState(currentUser?.name || '');
  const [newTeamPhone, setNewTeamPhone] = useState(currentUser?.phone || '');
  const [newTeamModality, setNewTeamModality] = useState<SportModality>('Futebol Society');
  const [newTeamSkill, setNewTeamSkill] = useState<SkillLevel>('Intermediário');
  const [newTeamCity, setNewTeamCity] = useState('São Paulo - SP');

  useEffect(() => {
    if (!activeTeam) {
      setShowNewTeamForm(true);
    }
  }, [activeTeam]);

  // Add new player/user to activeTeam
  const [memberName, setMemberName] = useState('');
  const [memberPosition, setMemberPosition] = useState('Atacante');
  const [memberJersey, setMemberJersey] = useState<string>('9');
  const [memberPhone, setMemberPhone] = useState('(11) 9');
  const [memberRole, setMemberRole] = useState<'ADMIN' | 'JOGADOR'>('JOGADOR');

  if (!currentUser) return null;

  const handleSaveTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTeam) return;
    const hc = courts.find(c => c.id === homeCourtId);
    await updateTeam(activeTeam.id, {
      name: teamName,
      captainName,
      captainPhone: phone,
      modality,
      skillLevel,
      homeCourtId: hc?.id,
      homeCourtName: hc?.name,
      city
    });
  };

  const handleRegisterNewTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim() || !newTeamCaptain.trim()) return;
    const created = await registerTeam({
      name: newTeamName,
      captainName: newTeamCaptain,
      captainPhone: newTeamPhone,
      modality: newTeamModality,
      skillLevel: newTeamSkill,
      city: newTeamCity,
      homeCourtId: courts[0]?.id
    });
    if (created) {
      setNewTeamName('');
      setNewTeamCaptain('');
      setShowNewTeamForm(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTeam || !memberName.trim()) return;
    const ok = await addTeamMember(activeTeam.id, {
      name: memberName.trim(),
      position: memberPosition,
      jerseyNumber: memberJersey ? Number(memberJersey) : undefined,
      phone: memberPhone,
      role: memberRole
    });
    if (ok) {
      setMemberName('');
      setMemberJersey('');
      setMemberPhone('(11) 9');
    }
  };

  if (userRole === 'GESTOR') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Admin da Quadra · Perfil do Complexo
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Gerencie seus dados de contato e as quadras cadastradas na plataforma.
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={() => setIsCreateCourtOpen(true)} className="gap-1.5">
            <PlusCircle className="w-4 h-4" />
            <span>Cadastrar Nova Quadra</span>
          </Button>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 flex flex-col sm:flex-row items-center gap-6">
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.name}
            className="w-20 h-20 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700"
            referrerPolicy="no-referrer"
          />
          <div className="flex-1 text-center sm:text-left space-y-1">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{currentUser.name}</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Admin da Quadra · {currentUser.email} · {currentUser.phone}
            </p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold pt-1">
              {courts.length} quadras ativas no sistema
            </p>
          </div>
        </div>

        <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-900 dark:text-zinc-100">
              Suas Quadras Cadastradas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {courts.length > 0 ? (
              courts.map(court => (
                <div
                  key={court.id}
                  className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {court.modality}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                        R$ {court.hourlyRate}/h
                      </span>
                    </div>
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{court.name}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        {court.address}, {court.neighborhood} - {court.city}
                      </span>
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingCourt(court)}
                  >
                    Editar Valor & Horários
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center py-6">
                Nenhuma quadra cadastrada no MySQL ainda.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header + Team Switcher & Create New Team */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Admin do Time · Equipe & Jogadores
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Cadastre seu time, gerencie os usuários do elenco e mantenha os dados prontos para marcar jogos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {teams.length > 0 && (
            <select
              value={activeTeam?.id || ''}
              onChange={e => selectActiveTeam(e.target.value)}
              aria-label="Selecionar time ativo"
              className="bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
            >
              {!activeTeam && <option value="">Selecione um time...</option>}
              {teams.map(t => (
                <option key={t.id} value={t.id}>
                  Time Ativo: {t.name}
                </option>
              ))}
            </select>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowNewTeamForm(!showNewTeamForm)}
            className="gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{showNewTeamForm ? 'Fechar Cadastro' : 'Cadastrar Novo Time'}</span>
          </Button>
        </div>
      </div>

      {/* Inline Register New Team Box */}
      {showNewTeamForm && (
        <div className="bg-white dark:bg-zinc-900 border border-emerald-500/40 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              Cadastrar Novo Time na Plataforma
            </h2>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              Novo Admin do Time
            </span>
          </div>

          <form onSubmit={handleRegisterNewTeam} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Nome do Time *
                </label>
                <input
                  type="text"
                  required
                  value={newTeamName}
                  onChange={e => setNewTeamName(e.target.value)}
                  placeholder="Ex: União Vila Olímpia FC"
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Nome do Capitão / Admin *
                </label>
                <input
                  type="text"
                  required
                  value={newTeamCaptain}
                  onChange={e => setNewTeamCaptain(e.target.value)}
                  placeholder="Ex: Marcos Paulo"
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  WhatsApp do Capitão
                </label>
                <input
                  type="text"
                  value={newTeamPhone}
                  onChange={e => setNewTeamPhone(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Modalidade
                </label>
                <select
                  value={newTeamModality}
                  onChange={e => setNewTeamModality(e.target.value as SportModality)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="Futebol Society">Futebol Society</option>
                  <option value="Futsal">Futsal</option>
                  <option value="Beach Tennis">Beach Tennis</option>
                  <option value="Basquete">Basquete</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Nível
                </label>
                <select
                  value={newTeamSkill}
                  onChange={e => setNewTeamSkill(e.target.value as SkillLevel)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="Iniciante / Amador">Iniciante / Amador</option>
                  <option value="Intermediário">Intermediário</option>
                  <option value="Avançado">Avançado</option>
                  <option value="Competitivo">Competitivo</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Cidade
                </label>
                <input
                  type="text"
                  value={newTeamCity}
                  onChange={e => setNewTeamCity(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setShowNewTeamForm(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Criar Time e Assumir Admin
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Active Team Summary Banner & Roster & Edit Form */}
      {activeTeam && (
      <>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 flex flex-col sm:flex-row items-center gap-5">
        <img
          src={activeTeam.crestUrl}
          alt={activeTeam.name}
          className="w-20 h-20 rounded-xl object-cover border-2 border-emerald-500"
          referrerPolicy="no-referrer"
        />
        <div className="flex-1 text-center sm:text-left space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{activeTeam.name}</h2>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {activeTeam.modality} · {activeTeam.skillLevel}
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Admin: <strong className="text-zinc-800 dark:text-zinc-200">{activeTeam.captainName}</strong> · {activeTeam.city}
          </p>
          <div className="flex items-center justify-center sm:justify-start gap-3 text-xs text-zinc-500 dark:text-zinc-400 pt-1 tabular-nums">
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              Fair Play {activeTeam.stats.fairPlayScore.toFixed(1)}
            </span>
            <span aria-hidden="true">·</span>
            <span>{activeTeam.members.length} usuários no elenco</span>
            <span aria-hidden="true">·</span>
            <span>{activeTeam.stats.matchesPlayed} jogos disputados</span>
          </div>
        </div>
      </div>

      {/* CADASTRO DE USUÁRIOS / JOGADORES DO TIME */}
      <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-500" />
                <span>Usuários e Jogadores do Time ({activeTeam.members.length})</span>
              </CardTitle>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Cadastre os atletas do seu elenco e defina quem pode administrar reservas pelo time.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Add Player Form */}
          <form
            onSubmit={handleAddMember}
            className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
          >
            <div className="sm:col-span-3">
              <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Nome do Jogador *
              </label>
              <input
                type="text"
                required
                value={memberName}
                onChange={e => setMemberName(e.target.value)}
                placeholder="Ex: João Victor"
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Posição
              </label>
              <select
                value={memberPosition}
                onChange={e => setMemberPosition(e.target.value)}
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg px-2.5 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="Goleiro">Goleiro</option>
                <option value="Zagueiro / Fixo">Zagueiro / Fixo</option>
                <option value="Volante">Volante</option>
                <option value="Ala / Meia">Ala / Meia</option>
                <option value="Atacante / Pivô">Atacante / Pivô</option>
                <option value="Dupla Beach Tennis">Dupla Beach Tennis</option>
              </select>
            </div>

            <div className="sm:col-span-1">
              <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Camisa
              </label>
              <input
                type="number"
                min="1"
                max="99"
                value={memberJersey}
                onChange={e => setMemberJersey(e.target.value)}
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg px-2.5 py-2 text-xs text-zinc-900 dark:text-zinc-100 tabular-nums focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                WhatsApp
              </label>
              <input
                type="text"
                value={memberPhone}
                onChange={e => setMemberPhone(e.target.value)}
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg px-2.5 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Permissão
              </label>
              <select
                value={memberRole}
                onChange={e => setMemberRole(e.target.value as 'ADMIN' | 'JOGADOR')}
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg px-2.5 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="JOGADOR">Jogador</option>
                <option value="ADMIN">Admin do Time</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <Button type="submit" variant="primary" size="sm" className="w-full gap-1">
                <UserPlus className="w-3.5 h-3.5" />
                <span>Adicionar</span>
              </Button>
            </div>
          </form>

          {/* Roster List */}
          <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400">
                  <th className="py-2.5 px-3 font-semibold">Jogador</th>
                  <th className="py-2.5 px-3 font-semibold">Posição</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Camisa</th>
                  <th className="py-2.5 px-3 font-semibold">WhatsApp</th>
                  <th className="py-2.5 px-3 font-semibold">Papel</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/80">
                {activeTeam.members.map(member => (
                  <tr key={member.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-950/60">
                    <td className="py-2.5 px-3 font-semibold text-zinc-900 dark:text-zinc-100">
                      {member.name}
                    </td>
                    <td className="py-2.5 px-3 text-zinc-600 dark:text-zinc-300">
                      {member.position}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono text-zinc-700 dark:text-zinc-300 tabular-nums">
                      {member.jerseyNumber ? `#${member.jerseyNumber}` : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-zinc-500 dark:text-zinc-400 tabular-nums">
                      {member.phone}
                    </td>
                    <td className="py-2.5 px-3">
                      <button
                        type="button"
                        onClick={() => toggleMemberRole(activeTeam.id, member.id)}
                        className={`text-[11px] font-semibold cursor-pointer underline underline-offset-2 ${
                          member.role === 'ADMIN'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-zinc-500 dark:text-zinc-400'
                        }`}
                        title="Clique para alternar entre Admin e Jogador"
                      >
                        {member.role === 'ADMIN' ? 'Admin do Time' : 'Jogador'}
                      </button>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => removeTeamMember(activeTeam.id, member.id)}
                        className="text-rose-500 hover:text-rose-400 p-1 rounded cursor-pointer"
                        title="Remover jogador do elenco"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Team Data Form */}
      <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-900 dark:text-zinc-100">Dados do Time</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveTeam} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Nome Oficial do Time
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={e => setTeamName(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Capitão / Responsável
                </label>
                <input
                  type="text"
                  value={captainName}
                  onChange={e => setCaptainName(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  WhatsApp do Capitão
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Modalidade & Nível
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={modality}
                    onChange={e => setModality(e.target.value as SportModality)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg px-2.5 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Futebol Society">Futebol Society</option>
                    <option value="Futsal">Futsal</option>
                    <option value="Beach Tennis">Beach Tennis</option>
                    <option value="Basquete">Basquete</option>
                  </select>
                  <select
                    value={skillLevel}
                    onChange={e => setSkillLevel(e.target.value as SkillLevel)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg px-2.5 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Iniciante / Amador">Amador</option>
                    <option value="Intermediário">Intermediário</option>
                    <option value="Avançado">Avançado</option>
                    <option value="Competitivo">Competitivo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Quadra Preferida
                </label>
                <select
                  value={homeCourtId}
                  onChange={e => setHomeCourtId(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                >
                  {courts.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.neighborhood})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Cidade e Estado
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <Button type="submit" variant="primary" className="gap-2">
                <Save className="w-4 h-4" />
                <span>Salvar Dados do Time</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      </>
      )}
    </div>
  );
};
