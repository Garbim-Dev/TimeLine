import React from 'react';
import { Tv, Maximize, Play, MonitorCheck } from 'lucide-react';

interface PresentationCardProps {
  onEnterFullscreen: () => void;
}

export const PresentationCard: React.FC<PresentationCardProps> = ({ onEnterFullscreen }) => {
  return (
    <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-blue-800/40 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
      {/* Glow de fundo */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center gap-4 relative z-10">
        <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0 shadow-inner">
          <Tv className="w-7 h-7" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full">
              Modo TV & Projetor
            </span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Tempo Real
            </span>
          </div>
          <h3 className="text-lg font-black tracking-tight text-white mt-1">
            Painel Operacional em Tela Cheia
          </h3>
          <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
            Projete o mapa de ambientes, turmas, docentes e status de salas diretamente no televisor da coordenação ou retroprojetor sem barras de navegação.
          </p>
        </div>
      </div>

      <button
        onClick={onEnterFullscreen}
        className="relative z-10 w-full md:w-auto px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2.5 group cursor-pointer"
      >
        <Maximize className="w-4 h-4 transition-transform group-hover:scale-110" />
        <span>Iniciar Projeção (Full Screen)</span>
      </button>
    </div>
  );
};