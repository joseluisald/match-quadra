import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  MapPin,
  ArrowRight,
  Swords,
  ChevronDown,
  ChevronUp,
  Star,
  Users,
  Building2,
  CalendarCheck,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export const LandingView: React.FC = () => {
  const {
    setCurrentView,
    isAuthenticated,
    challenges,
    courts,
    teams,
    setSelectedChallenge,
    openScheduleMatchModal
  } = useApp();

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const openChallenges = challenges.filter(c => c.status === 'ABERTO');

  const faqItems = [
    {
      q: 'Como funciona o sistema com dois administradores?',
      a: 'O Admin do Time cadastra a equipe, adiciona os jogadores do elenco, consulta outros times e quadras disponíveis e marca o confronto. O Admin da Quadra cadastra cada campo com endereço, valor da hora e grade de horários de 1 hora.'
    },
    {
      q: 'O horário fica reservado na quadra quando dois times marcam o jogo?',
      a: 'Sim. Assim que um time marca uma partida contra outro em uma quadra e horário específicos, aquele bloco de 1 hora é marcado automaticamente na agenda da quadra e fica indisponível para outras equipes.'
    },
    {
      q: 'Como funciona a duração e o pagamento da quadra?',
      a: 'Todas as partidas têm duração padrão de 1 hora. Nenhum pagamento é processado pelo aplicativo: exibimos apenas o valor da hora definido pela quadra e os dois times acertam sua metade diretamente na recepção no dia do jogo.'
    },
    {
      q: 'Posso cadastrar todos os jogadores do meu time?',
      a: 'Sim. Dentro do painel de Admin do Time você cadastra os usuários do elenco com nome, posição, camisa e WhatsApp, além de poder definir outros capitães auxiliares como administradores.'
    }
  ];

  return (
    <div className="space-y-20 py-8 pb-20 text-zinc-900 dark:text-zinc-100">
      {/* 1. HERO SPLIT */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
        <div className="lg:col-span-7 flex flex-col justify-between py-2 space-y-8">
          <div className="space-y-5">
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 tracking-wide">
              Futebol Society · Futsal · Beach Tennis · Partidas de 1 hora
            </p>

            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight leading-[1.08] text-zinc-900 dark:text-zinc-100 text-balance max-w-2xl">
              Marque jogos entre times e trave o horário direto na quadra.
            </h1>

            <p className="text-base text-zinc-600 dark:text-zinc-300 max-w-xl leading-relaxed">
              Dois painéis dedicados para organizar o futebol semanal sem grupos confusos: o{' '}
              <strong className="text-zinc-900 dark:text-zinc-100">Admin do Time</strong> cadastra
              a equipe e seus jogadores, escolhe um adversário e reserva a quadra; o{' '}
              <strong className="text-zinc-900 dark:text-zinc-100">Admin da Quadra</strong>{' '}
              gerencia endereço, valor da hora e recebe os horários marcados automaticamente.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={() => setCurrentView(isAuthenticated ? 'dashboard' : 'login')}
                className="gap-2 font-bold"
              >
                <Swords className="w-4 h-4" />
                <span>{isAuthenticated ? 'Ir para Meu Painel' : 'Entrar ou Criar Conta'}</span>
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => setCurrentView('quadras')}
                className="gap-2"
              >
                <Building2 className="w-4 h-4" />
                <span>Ver Quadras no Banco</span>
              </Button>
            </div>
          </div>

          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Sem taxas ou pagamentos pelo app · Acerto feito diretamente na recepção da quadra
          </p>
        </div>

        {/* Hero Visual Anchor */}
        <div className="lg:col-span-5 relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-900 min-h-[320px] lg:min-h-[420px]">
          <img
            src="/src/assets/images/hero_society_night_1794854800612.jpg"
            alt="Partida noturna de futebol society sob refletores LED"
            className="w-full h-full lg:h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6 space-y-1.5 text-white">
            {courts[0] ? (
              <>
                <p className="text-xs text-emerald-400 font-semibold">
                  Quadra cadastrada disponível
                </p>
                <p className="text-base font-bold">
                  {courts[0].name} · {courts[0].availableTimeSlots[0] || 'Blocos de 1h'}
                </p>
                <p className="text-xs text-zinc-300 tabular-nums">
                  {courts[0].neighborhood}, {courts[0].city} · R$ {courts[0].hourlyRate}/hora (R${' '}
                  {Math.round(courts[0].hourlyRate / 2)} por time no local)
                </p>
              </>
            ) : (
              <>
                <p className="text-xs text-emerald-400 font-semibold">
                  Banco de dados MySQL conectado
                </p>
                <p className="text-base font-bold">
                  Cadastre sua quadra ou seu time para começar
                </p>
                <p className="text-xs text-zinc-300">
                  Blocos de 1 hora por partida · Acerto direto na recepção da quadra
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* FULL-WIDTH 4-COLUMN PROOF STRIP BELOW HERO */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 border-y border-zinc-200 dark:border-zinc-800 py-6">
        <div className="space-y-1">
          <p className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tabular-nums">
            {teams.length} Times
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Equipes com elenco e capitães ativos
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {courts.length} Quadras
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Com endereço, valor/h e grade aberta
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tabular-nums">
            60 min
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Duração padrão por horário agendado
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tabular-nums">
            R$ 0
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Cobrança no app — pague direto na quadra
          </p>
        </div>
      </section>

      {/* 2. DOIS PAINÉIS DE ADMINISTRAÇÃO */}
      <section className="space-y-8">
        <div className="max-w-2xl space-y-2">
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            Estrutura em dois painéis
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 text-balance">
            Um painel para quem organiza o time. Outro para quem administra a quadra.
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Admin 1: Admin do Time */}
          <div className="bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  01. Admin do Time
                </span>
                <span>Capitão & Gestão de Elenco</span>
              </div>

              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Cadastre seu time, jogadores e marque jogos
              </h3>

              <ul className="space-y-2.5 text-sm text-zinc-600 dark:text-zinc-300">
                <li className="flex items-start gap-2.5">
                  <Users className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    Cadastre seu time com modalidade e nível, e adicione todos os usuários e
                    jogadores do elenco.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Swords className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    Liste times disponíveis e compare quadras com endereço, valor por hora e
                    horários livres de 1h.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CalendarCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    Ao confirmar um confronto, o horário é marcado na quadra escolhida na mesma hora.
                  </span>
                </li>
              </ul>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setCurrentView(isAuthenticated ? 'perfil' : 'login')}
              >
                Cadastrar Time e Jogadores
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openScheduleMatchModal()}
              >
                Marcar Jogo Agora
              </Button>
            </div>
          </div>

          {/* Admin 2: Admin da Quadra */}
          <div className="bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  02. Admin da Quadra
                </span>
                <span>Proprietário & Grade de Horários</span>
              </div>

              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Cadastre quadras, valor da hora, endereço e agenda
              </h3>

              <ul className="space-y-2.5 text-sm text-zinc-600 dark:text-zinc-300">
                <li className="flex items-start gap-2.5">
                  <Building2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    Cadastre cada quadra com nome, modalidade, endereço completo e valor exato da
                    hora de locação.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    Configure os blocos de 1 hora disponíveis na semana e bloqueie horários quando
                    houver manutenção.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>
                    Receba automaticamente os jogos marcados entre dois times e cobre o valor da hora
                    direto na recepção.
                  </span>
                </li>
              </ul>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setCurrentView(isAuthenticated ? 'quadras' : 'login')}
              >
                Gerenciar Quadras e Horários
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentView(isAuthenticated ? 'dashboard' : 'login')}
              >
                Ver Agenda da Quadra
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TIMES E DESAFIOS DISPONÍVEIS */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Confrontos abertos
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Times esperando adversário para jogar 1 hora
            </h2>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentView('desafios')}
            className="text-emerald-600 dark:text-emerald-400 font-semibold text-xs gap-1 w-fit"
          >
            <span>Listar todos os times e desafios</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {openChallenges.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 text-center space-y-2">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Nenhum desafio aberto no banco no momento
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Crie sua conta de Admin do Time para cadastrar seu elenco e publicar o primeiro desafio de 1h.
            </p>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {openChallenges.slice(0, 3).map(ch => (
            <div
              key={ch.id}
              onClick={() => setSelectedChallenge(ch)}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-4 cursor-pointer hover:border-emerald-500/60 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {ch.modality}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{ch.formattedDate}</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">{ch.timeSlot}</span>
                </div>

                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                  {ch.title}
                </h3>

                <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">
                    {ch.courtName} · {ch.neighborhood}
                  </span>
                </p>

                <div className="flex items-center justify-between pt-2 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={ch.proposingTeam.crestUrl}
                      alt={ch.proposingTeam.name}
                      className="w-6 h-6 rounded object-cover border border-zinc-200 dark:border-zinc-800 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                      {ch.proposingTeam.name}
                    </span>
                  </div>
                  <span className="text-amber-500 font-medium flex items-center gap-0.5 tabular-nums shrink-0">
                    <Star className="w-3 h-3 fill-amber-500" />
                    {ch.proposingTeam.stats.fairPlayScore.toFixed(1)}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 block">
                    Cota por time (pago na quadra)
                  </span>
                  <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    R$ {ch.pricePerTeam},00
                  </span>
                </div>
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 underline underline-offset-4">
                  Aceitar jogo
                </span>
              </div>
            </div>
          ))}
        </div>
        )}
      </section>

      {/* 4. QUADRAS COM ENDEREÇO, VALOR E HORÁRIOS */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Agenda integrada
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Quadras disponíveis para marcação
            </h2>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentView('quadras')}
          >
            Ver grade completa de horários
          </Button>
        </div>

        {courts.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 text-center space-y-2">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Nenhuma quadra cadastrada ainda
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Cadastre uma conta de Admin da Quadra para adicionar arenas, endereço, valor/hora e grade de horários.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {courts.slice(0, 3).map(court => (
              <div
                key={court.id}
                onClick={() => setCurrentView('quadras')}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden cursor-pointer hover:border-emerald-500/50 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 w-full bg-zinc-900">
                    <img
                      src={court.imageUrl}
                      alt={court.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                      <span className="font-semibold">{court.modality}</span>
                      <span className="font-bold tabular-nums">R$ {court.hourlyRate}/hora</span>
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                      {court.name}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">
                        {court.address}, {court.neighborhood}
                      </span>
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 tabular-nums pt-1">
                      {court.availableTimeSlots.length} horários de 1h configurados
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. PERGUNTAS FREQUENTES */}
      <section className="max-w-3xl mx-auto space-y-6">
        <div className="space-y-1 text-center">
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            Dúvidas comuns
          </p>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Perguntas Frequentes
          </h2>
        </div>

        <div className="divide-y divide-zinc-200 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900/60">
          {faqItems.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx}>
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  <span>{item.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-zinc-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. QUIET FOOTER */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="font-bold text-zinc-900 dark:text-zinc-100">
          MatchQuadra · Agendamento Esportivo entre Times e Quadras
        </span>
        <div className="flex flex-wrap items-center gap-5">
          <button
            onClick={() => setCurrentView('login')}
            className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          >
            Cadastro de Time / Quadra
          </button>
          <button
            onClick={() => setCurrentView('desafios')}
            className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          >
            Times & Desafios
          </button>
          <button
            onClick={() => setCurrentView('quadras')}
            className="hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors cursor-pointer"
          >
            Quadras Disponíveis
          </button>
        </div>
      </footer>
    </div>
  );
};
