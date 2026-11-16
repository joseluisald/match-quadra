import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import confetti from 'canvas-confetti';
import {
  Calendar,
  Clock,
  MapPin,
  Shield,
  Star,
  Phone,
  DollarSign,
  CheckCircle2,
  Share2,
  Users
} from 'lucide-react';

export const ChallengeDetailModal: React.FC = () => {
  const { selectedChallenge, setSelectedChallenge, acceptChallenge, showToast } = useApp();
  const [isAccepting, setIsAccepting] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);

  if (!selectedChallenge) return null;

  const handleAccept = async () => {
    setIsAccepting(true);
    const ok = await acceptChallenge(selectedChallenge.id);
    setIsAccepting(false);
    if (ok) {
      setHasAccepted(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const isAlreadyAccepted = selectedChallenge.status === 'ACEITO' || hasAccepted;

  return (
    <Dialog
      isOpen={!!selectedChallenge}
      onClose={() => {
        setSelectedChallenge(null);
        setHasAccepted(false);
      }}
      title="Detalhes do Desafio & Agendamento"
      description={`Código #${selectedChallenge.id.slice(-6).toUpperCase()} · Publicado no Mural de Desafios`}
      maxWidth="2xl"
    >
      <div className="space-y-5">
        {/* Banner with Match Status */}
        <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden">
              <img
                src={selectedChallenge.proposingTeam.crestUrl}
                alt={selectedChallenge.proposingTeam.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <span className="text-xs text-zinc-400">Time Desafiante (Mandante)</span>
              <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                {selectedChallenge.proposingTeam.name}
                <span className="text-xs font-normal text-amber-400 flex items-center gap-0.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {selectedChallenge.proposingTeam.stats.fairPlayScore.toFixed(1)}
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Capitão: {selectedChallenge.proposingTeam.captainName}
              </p>
            </div>
          </div>

          <div>
            {isAlreadyAccepted ? (
              <Badge variant="emerald" className="gap-1 px-3 py-1 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Partida Confirmada
              </Badge>
            ) : (
              <Badge variant="amber" className="gap-1 px-3 py-1 text-xs">
                Aguardando Adversário
              </Badge>
            )}
          </div>
        </div>

        {/* Match Key Specifications Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 bg-zinc-950/70 border border-zinc-800/80 rounded-xl space-y-1">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Data da Partida</span>
            </div>
            <p className="text-sm font-semibold text-zinc-100">
              {selectedChallenge.formattedDate}
            </p>
          </div>

          <div className="p-3.5 bg-zinc-950/70 border border-zinc-800/80 rounded-xl space-y-1">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Horário e Duração</span>
            </div>
            <p className="text-sm font-semibold text-zinc-100">
              {selectedChallenge.timeSlot} ({selectedChallenge.durationMinutes} min)
            </p>
          </div>

          <div className="p-3.5 bg-zinc-950/70 border border-zinc-800/80 rounded-xl space-y-1 sm:col-span-2">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Localização da Quadra</span>
            </div>
            <p className="text-sm font-semibold text-zinc-100">
              {selectedChallenge.courtName}
            </p>
            <p className="text-xs text-zinc-400">
              {selectedChallenge.courtAddress}, {selectedChallenge.neighborhood}
            </p>
          </div>
        </div>

        {/* Rateio / Financial Breakdown Card */}
        <div className="p-4 bg-gradient-to-br from-zinc-900 to-zinc-950 border border-emerald-500/30 rounded-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Valor da Quadra e Divisão
            </span>
            <span className="text-[11px] font-medium text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
              Pagamento 100% Direto na Quadra
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-zinc-400">Tarifa da Partida (1 hora de jogo)</p>
              <p className="text-lg font-bold text-zinc-300 tabular-nums">
                R$ {selectedChallenge.totalPrice.toFixed(2)}
              </p>
              <span className="text-[11px] text-zinc-500 block">
                Valor da hora: R$ {selectedChallenge.totalPrice.toFixed(2)}/h
              </span>
            </div>
            <div className="text-right">
              <p className="text-xs text-emerald-400 font-medium">Cota por time (50%)</p>
              <p className="text-2xl font-black text-emerald-400 tabular-nums">
                R$ {selectedChallenge.pricePerTeam.toFixed(2)}
              </p>
              <span className="text-[11px] text-zinc-400 block">
                Pago no balcão da arena
              </span>
            </div>
          </div>

          <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-[11px] text-zinc-400 flex items-start gap-2">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Aviso Importante:</strong> O app não processa pagamentos. O valor é apenas informado para referência. Cada time paga sua metade diretamente na recepção da quadra antes do jogo.
            </span>
          </div>
        </div>

        {/* Description & Rules */}
        <div className="p-3.5 bg-zinc-950/50 border border-zinc-800/80 rounded-xl">
          <p className="text-xs font-semibold text-zinc-400 mb-1">Recado do Capitão Proponente:</p>
          <p className="text-xs text-zinc-300 leading-relaxed italic">
            "{selectedChallenge.description}"
          </p>
        </div>

        {/* Proposing Team Stats */}
        <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-around text-center text-xs">
          <div>
            <p className="text-zinc-500">Nível</p>
            <p className="font-semibold text-zinc-200">{selectedChallenge.skillLevel}</p>
          </div>
          <div className="h-6 w-[1px] bg-zinc-800" />
          <div>
            <p className="text-zinc-500">Jogos</p>
            <p className="font-semibold text-zinc-200 tabular-nums">
              {selectedChallenge.proposingTeam.stats.matchesPlayed}
            </p>
          </div>
          <div className="h-6 w-[1px] bg-zinc-800" />
          <div>
            <p className="text-zinc-500">Vitórias</p>
            <p className="font-semibold text-emerald-400 tabular-nums">
              {selectedChallenge.proposingTeam.stats.wins}
            </p>
          </div>
          <div className="h-6 w-[1px] bg-zinc-800" />
          <div>
            <p className="text-zinc-500">Fair Play</p>
            <p className="font-semibold text-amber-400 tabular-nums">
              {selectedChallenge.proposingTeam.stats.fairPlayScore.toFixed(1)} / 5.0
            </p>
          </div>
        </div>

        {/* Action Button Footer */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-zinc-800">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Phone className="w-3.5 h-3.5 text-zinc-500" />
            <span>WhatsApp do Capitão: {selectedChallenge.proposingTeam.captainPhone}</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedChallenge(null)}
            >
              Fechar
            </Button>

            {!isAlreadyAccepted ? (
              <Button
                variant="primary"
                size="md"
                onClick={handleAccept}
                disabled={isAccepting}
                className="w-full sm:w-auto"
              >
                {isAccepting ? 'Confirmando...' : 'Aceitar Desafio e Rachar Quadra'}
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard?.writeText(`MatchQuadra - Jogo #${selectedChallenge.id}`);
                    showToast('Resumo Copiado', 'Os detalhes da partida foram copiados para compartilhar com seu time.', 'info');
                  }}
                >
                  <Share2 className="w-3.5 h-3.5 mr-1" />
                  Compartilhar
                </Button>
                <Button
                  variant="emerald"
                  size="sm"
                  disabled
                  className="cursor-default"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  Desafio Já Aceito
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
};
