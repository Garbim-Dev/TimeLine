import React from 'react';
import { TimelineCard } from '../../components/cards/TimelineCard';
import { BookOpen, Search, ChevronDown } from 'lucide-react';

export const InstructorSpace: React.FC = () => {
  // Mock idêntico ao print para teste imediato
  const mockSchedule = {
    id: 1,
    classCode: 'APB/149/02',
    courseName: 'Operador de Mina',
    disciplineName: 'Topografia Aplicada à Mineração',
    companyName: 'Vale - Carajás',
    startDate: '04/09/2026',
    endDate: '17/09/2026',
    sharepointUrl: 'https://senaipa.sharepoi...',
    environmentName: 'FAMAP',
    shift: 'Tarde' as const,
    status: 'Em andamento' as const,
    createdAtFormatted: '15/09/2026 8:39',
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 flex flex-col items-center">
      {/* Barra de Topo */}
      <header className="w-full max-w-sm flex items-center justify-between py-3 mb-3">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-lg cursor-pointer">
          <BookOpen className="w-5 h-5 text-slate-700" />
          <span>Espaço do Instrutor</span>
          <ChevronDown className="w-4 h-4 text-slate-500" />
        </div>
        <button className="p-2 text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-200/60 transition-colors">
          <Search className="w-5 h-5" />
        </button>
      </header>

      {/* Filtro / Badge de Instrutor Selecionado */}
      <div className="w-full max-w-sm mb-4 flex items-center gap-2">
        <div className="flex items-center gap-2 bg-blue-100 text-blue-900 font-semibold text-xs px-3 py-1.5 rounded-md">
          <span>Sidnei Garbim</span>
          <span className="bg-white/80 text-blue-900 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
            9
          </span>
        </div>
      </div>

      {/* Grid de Cards */}
      <main className="w-full max-w-sm flex flex-col gap-4">
        <TimelineCard 
          {...mockSchedule} 
          onCardClick={(id) => console.log(`Card ${id} clicado`)} 
        />
      </main>
    </div>
  );
};

export default InstructorSpace;