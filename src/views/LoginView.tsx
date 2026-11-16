import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole, SportModality, SkillLevel } from '../types';
import { Trophy, Shield, Lock, Mail, User, Phone, AlertCircle, Database } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const LoginView: React.FC = () => {
  const { login, registerAccount, courts, dbError } = useApp();
  const [selectedRole, setSelectedRole] = useState<UserRole>('CAPITAO');
  const [isRegister, setIsRegister] = useState(false);

  // Auth form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Team / Arena registration states
  const [teamName, setTeamName] = useState('');
  const [arenaName, setArenaName] = useState('');
  const [modality, setModality] = useState<SportModality>('Futebol Society');
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('Intermediário');
  const [city, setCity] = useState('São Paulo - SP');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      if (isRegister) {
        if (!name.trim() || !email.trim() || password.length < 6) {
          setErrorMsg('Informe nome completo, e-mail e senha de no mínimo 6 caracteres.');
          return;
        }
        if (selectedRole === 'CAPITAO' && !teamName.trim()) {
          setErrorMsg('Informe o nome do seu time para criar a conta de Admin do Time.');
          return;
        }
        if (selectedRole === 'GESTOR' && !arenaName.trim()) {
          setErrorMsg('Informe o nome da sua arena/complexo.');
          return;
        }

        const res = await registerAccount({
          name: name.trim(),
          email: email.trim(),
          password,
          phone: phone.trim(),
          role: selectedRole,
          teamName: selectedRole === 'CAPITAO' ? teamName.trim() : undefined,
          arenaName: selectedRole === 'GESTOR' ? arenaName.trim() : undefined,
          modality,
          skillLevel,
          city,
          homeCourtId: courts[0]?.id
        });

        if (!res.ok) {
          setErrorMsg(res.error || 'Não foi possível criar a conta.');
        }
      } else {
        const res = await login(email.trim(), password);
        if (!res.ok) {
          setErrorMsg(res.error || 'E-mail ou senha incorretos.');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto py-10 px-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="text-center space-y-2">
          <div className="w-11 h-11 mx-auto rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
            {selectedRole === 'CAPITAO' ? (
              <Trophy className="w-5 h-5" />
            ) : (
              <Shield className="w-5 h-5" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {isRegister ? 'Criar Conta no MatchQuadra' : 'Entrar no MatchQuadra'}
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {isRegister
              ? 'Cadastre seu acesso no banco MySQL como Admin do Time ou Admin da Quadra.'
              : 'Acesse com o e-mail e senha cadastrados no banco de dados MySQL.'}
          </p>
        </div>

        {/* Switch between Login and Register */}
        <div className="grid grid-cols-2 p-1 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setErrorMsg(null);
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              !isRegister
                ? 'bg-emerald-500 text-zinc-950'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Já tenho conta (Login)
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setErrorMsg(null);
            }}
            className={`py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              isRegister
                ? 'bg-emerald-500 text-zinc-950'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            Criar Nova Conta
          </button>
        </div>

        {dbError && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-600 dark:text-amber-300 flex items-start gap-2.5">
            <Database className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{dbError}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-600 dark:text-rose-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Role Selector (shown in Register mode) */}
        {isRegister && (
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Perfil de Administrador *
            </label>
            <div className="grid grid-cols-2 p-1 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl">
              <button
                type="button"
                onClick={() => setSelectedRole('CAPITAO')}
                className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  selectedRole === 'CAPITAO'
                    ? 'bg-emerald-500 text-zinc-950'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Admin do Time</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('GESTOR')}
                className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                  selectedRole === 'GESTOR'
                    ? 'bg-emerald-500 text-zinc-950'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin da Quadra</span>
              </button>
            </div>
          </div>
        )}

        {/* Registration / Login Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isRegister && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Nome do Responsável *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Seu nome completo"
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    WhatsApp *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="(11) 99000-0000"
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {selectedRole === 'CAPITAO' ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                      Nome do Time *
                    </label>
                    <input
                      type="text"
                      required
                      value={teamName}
                      onChange={e => setTeamName(e.target.value)}
                      placeholder="Ex: Atlética Vila Nova FC"
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        Modalidade
                      </label>
                      <select
                        value={modality}
                        onChange={e => setModality(e.target.value as SportModality)}
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg px-2.5 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="Futebol Society">Futebol Society</option>
                        <option value="Futsal">Futsal</option>
                        <option value="Beach Tennis">Beach Tennis</option>
                        <option value="Basquete">Basquete</option>
                        <option value="Vôlei">Vôlei</option>
                        <option value="Padel">Padel</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        Nível
                      </label>
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
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                        Cidade
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={e => setCity(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg px-2.5 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Nome do Complexo / Arena *
                  </label>
                  <input
                    type="text"
                    required
                    value={arenaName}
                    onChange={e => setArenaName(e.target.value)}
                    placeholder="Ex: Arena Central Esportes"
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              E-mail *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com.br"
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Senha * {isRegister && <span className="text-zinc-500">(mín. 6 caracteres)</span>}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                minLength={isRegister ? 6 : 1}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="w-full py-2.5 mt-2"
          >
            {isSubmitting
              ? 'Conectando ao MySQL...'
              : isRegister
              ? selectedRole === 'CAPITAO'
                ? 'Cadastrar Time e Criar Conta'
                : 'Cadastrar Admin da Quadra'
              : 'Entrar com Minha Conta'}
          </Button>
        </form>
      </div>
    </div>
  );
};
