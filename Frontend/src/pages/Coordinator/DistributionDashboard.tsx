import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  KeyRound, 
  Wrench, 
  CheckCircle, 
  Building, 
  Briefcase, 
  Palmtree, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  Filter,
  Minimize,
} from 'lucide-react';
import { api } from '../../services/api';
import { PresentationCard } from '../../components/cards/PresentationCard';

interface ShiftSlot {
  id: number;
  classCode: string;
  course: string;
  discipline: string;
  instructor: string;
  company: string | null;
  status: string;
}

interface EnvGridItem {
  id: number;
  name: string;
  location: string | null;
  shifts: {
    manha: ShiftSlot | null;
    tarde: ShiftSlot | null;
    noite: ShiftSlot | null;
  };
}

export const DistributionDashboard: React.FC = () => {
  // Data inicial baseada na foto (18 de Setembro de 2026) ou atual
  const [selectedDate, setSelectedDate] = useState('2026-09-18');
  const [environments, setEnvironments] = useState<EnvGridItem[]>([]);
  const [availableInstructors, setAvailableInstructors] = useState<string[]>([]);
  const [companyPhaseClasses, setCompanyPhaseClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('pt-BR'));

  const fetchDashboardData = async (date: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/manage/dashboard/daily-distribution?date=${date}`);
      setEnvironments(res.data.environments);
      setAvailableInstructors(res.data.availableInstructors);
      setCompanyPhaseClasses(res.data.companyPhaseClasses);
    } catch (err) {
      console.error('Falha ao obter matriz de distribuição:', err);
    } finally {
      setLoading(false);
    }
  };

  // Atualiza o relógio a cada segundo no modo tela cheia
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('pt-BR'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Ouvinte para detectar quando o usuário aperta ESC para sair da tela cheia
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  useEffect(() => {
    fetchDashboardData(selectedDate);
  }, [selectedDate]);

  const changeDate = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  return (
    <div className={`flex flex-col gap-6 w-full ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-950 p-6 overflow-y-auto' : ''}`}>
      {/* Card para acionar Tela Cheia (oculto quando já estiver projetando) */}
      {!isFullscreen && (
        <PresentationCard onEnterFullscreen={handleToggleFullscreen} />
      )}

      {/* 1. Header do Painel Operacional */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-3.5 rounded-2xl shadow-inner text-white font-black text-xl flex items-center justify-center">
            SENAI
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-50 uppercase flex items-center gap-2">
              Distribuição Operacional de Ambientes
            </h1>
            <p className="text-xs text-slate-400">SENAI CEP Parauapebas • Mapa Visual Diário</p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-3">
          {/* Relógio Digital */}
          <div className="bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-700 text-amber-400 font-mono font-bold text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>{currentTime}</span>
          </div>

          {/* Seletor de Data Interativo */}
          <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700">
            <button
              onClick={() => changeDate(-1)}
              className="p-2 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
              title="Dia anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 px-3 text-sm font-bold text-amber-400">
              <Calendar className="w-4 h-4" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent border-none text-amber-400 font-extrabold focus:outline-none cursor-pointer text-sm"
              />
            </div>

            <button
              onClick={() => changeDate(1)}
              className="p-2 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
              title="Próximo dia"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Botão de Sair do Modo TV (visível quando em tela cheia) */}
          {isFullscreen && (
            <button
              onClick={handleToggleFullscreen}
              className="p-2.5 bg-rose-600/20 text-rose-300 border border-rose-500/40 rounded-2xl hover:bg-rose-600/40 transition-colors flex items-center gap-1.5 text-xs font-bold"
              title="Sair da Tela Cheia"
            >
              <Minimize className="w-4 h-4" />
              <span className="hidden sm:inline">Sair do Modo TV</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Grid Central de Ambientes + Painel Lateral */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Grade de Salas / Laboratórios (responsiva até 2XL) */}
        <div className="xl:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
          {environments.map((env) => (
            <div 
              key={env.id} 
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md"
            >
              {/* Topo da Sala com Tag de Chave */}
              <div className="bg-slate-100/90 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                <span className="font-black text-slate-900 text-sm tracking-wide">{env.name}</span>
                <div className="flex items-center gap-1 bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md text-[10px] font-bold shadow-xs">
                  <KeyRound className="w-3 h-3 text-amber-700" />
                  <span>Chave</span>
                </div>
              </div>

              {/* Turnos da Sala */}
              <div className="p-3 flex flex-col gap-2 divide-y divide-slate-100">
                {/* Manhã */}
                <div className="pt-1 first:pt-0">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Manhã</span>
                  {env.shifts.manha ? (
                    <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-2.5 flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-amber-950 text-xs">{env.shifts.manha.instructor}</span>
                        <span className="text-[10px] font-bold bg-white/80 px-1.5 py-0.5 rounded text-slate-700">{env.shifts.manha.classCode}</span>
                      </div>
                      <span className="text-[11px] text-slate-700 font-medium truncate">{env.shifts.manha.discipline}</span>
                      {env.shifts.manha.company && (
                        <span className="text-[10px] text-purple-700 font-bold">{env.shifts.manha.company}</span>
                      )}
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-2 text-center text-[11px] text-slate-400 font-medium">
                      Livre
                    </div>
                  )}
                </div>

                {/* Tarde */}
                <div className="pt-2">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Tarde</span>
                  {env.shifts.tarde ? (
                    <div className="bg-blue-50 border border-blue-200/60 rounded-xl p-2.5 flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-blue-950 text-xs">{env.shifts.tarde.instructor}</span>
                        <span className="text-[10px] font-bold bg-white/80 px-1.5 py-0.5 rounded text-slate-700">{env.shifts.tarde.classCode}</span>
                      </div>
                      <span className="text-[11px] text-slate-700 font-medium truncate">{env.shifts.tarde.discipline}</span>
                      {env.shifts.tarde.company && (
                        <span className="text-[10px] text-purple-700 font-bold">{env.shifts.tarde.company}</span>
                      )}
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-2 text-center text-[11px] text-slate-400 font-medium">
                      Livre
                    </div>
                  )}
                </div>

                {/* Noite */}
                <div className="pt-2">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Noite</span>
                  {env.shifts.noite ? (
                    <div className="bg-emerald-50 border border-emerald-200/60 rounded-xl p-2.5 flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-emerald-950 text-xs">{env.shifts.noite.instructor}</span>
                        <span className="text-[10px] font-bold bg-white/80 px-1.5 py-0.5 rounded text-slate-700">{env.shifts.noite.classCode}</span>
                      </div>
                      <span className="text-[11px] text-slate-700 font-medium truncate">{env.shifts.noite.discipline}</span>
                      {env.shifts.noite.company && (
                        <span className="text-[10px] text-purple-700 font-bold">{env.shifts.noite.company}</span>
                      )}
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-2 text-center text-[11px] text-slate-400 font-medium">
                      Livre
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 3. Coluna Lateral de Status e Painéis de Apoio */}
        <div className="flex flex-col gap-4">
          
          {/* Docentes em Planejamento / Livres */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-2.5 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-600" />
              Docentes em Planejamento / Livres
            </h3>
            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
              {availableInstructors.length > 0 ? (
                availableInstructors.map((name, idx) => (
                  <span 
                    key={idx} 
                    className="bg-amber-100 text-amber-900 border border-amber-200/70 font-bold text-xs px-2.5 py-1 rounded-lg shadow-xs"
                  >
                    {name}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">Todos os instrutores alocados.</span>
              )}
            </div>
          </div>

          {/* Fase Empresa */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-2.5 flex items-center gap-2">
              <Building className="w-4 h-4 text-purple-600" />
              Fase Empresa (In-Company)
            </h3>
            <div className="flex flex-col gap-2">
              {companyPhaseClasses.length > 0 ? (
                companyPhaseClasses.map((item, idx) => (
                  <div key={idx} className="bg-purple-50 border border-purple-200/60 rounded-xl p-2.5 text-xs">
                    <span className="font-extrabold text-purple-900 block">{item.turma} • {item.empresa}</span>
                    <span className="text-slate-600 text-[11px]">{item.curso}</span>
                  </div>
                ))
              ) : (
                <span className="text-xs text-slate-400">Nenhuma turma em fase externa registrada.</span>
              )}
            </div>
          </div>

          {/* Férias e Afastamentos */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-2 flex items-center gap-2">
              <Palmtree className="w-4 h-4 text-emerald-600" />
              Férias e Afastamentos
            </h3>
            <div className="bg-emerald-50 border border-emerald-200/60 rounded-xl p-3 text-xs flex items-center justify-between">
              <span className="font-bold text-emerald-900">Sena</span>
              <span className="text-[10px] bg-emerald-200/70 text-emerald-900 px-2 py-0.5 rounded-full font-bold">Férias</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};