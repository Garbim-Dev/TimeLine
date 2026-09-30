import React from 'react';
import { Clock, FileText, CheckCircle2 } from 'lucide-react';
import { ScheduleCardProps } from '../../types/schedule';

export const TimelineCard: React.FC<ScheduleCardProps> = ({
  id,
  classCode,
  courseName,
  disciplineName,
  companyName,
  startDate,
  endDate,
  sharepointUrl,
  environmentName,
  shift,
  status,
  createdAtFormatted,
  onCardClick,
}) => {
  return (
    <div 
      onClick={() => onCardClick && onCardClick(id)}
      className="w-full max-w-sm bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] p-4 flex flex-col gap-3 transition-all hover:shadow-md cursor-pointer select-none"
    >
      {/* 1. Header do Card: Tag "Nova tarefa" */}
      <div className="flex items-center gap-1.5 text-emerald-600 font-semibold text-sm">
        <CheckCircle2 className="w-4 h-4 fill-emerald-600 text-white" />
        <span>Nova tarefa</span>
      </div>

      {/* 2. Código da Turma */}
      <h3 className="text-gray-900 font-extrabold text-base tracking-tight">
        {classCode}
      </h3>

      {/* 3. Badges e Informações Principais */}
      <div className="flex flex-col items-start gap-2">
        {/* Nome do Curso */}
        <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-1 rounded-md">
          {courseName}
        </span>

        {/* Disciplina */}
        <span className="inline-block bg-gray-100 text-gray-800 text-sm font-normal px-2.5 py-1 rounded-md">
          {disciplineName}
        </span>

        {/* Empresa Parceira (se houver) */}
        {companyName && (
          <span className="inline-block bg-purple-100 text-purple-800 text-sm font-medium px-2.5 py-1 rounded-md">
            {companyName}
          </span>
        )}
      </div>

      {/* 4. Período da Disciplina (Datas com relógio vermelho suave) */}
      <div className="flex flex-col gap-1 text-red-500 font-medium text-sm pt-1">
        <div className="flex items-center gap-1.5">
          <span>{startDate}</span>
          <Clock className="w-3.5 h-3.5 stroke-[2.2]" />
        </div>
        <div className="flex items-center gap-1.5">
          <span>{endDate}</span>
          <Clock className="w-3.5 h-3.5 stroke-[2.2]" />
        </div>
      </div>

      {/* 5. Link SharePoint */}
      {sharepointUrl && (
        <a 
          href={sharepointUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-2.5 py-1.5 rounded-md max-w-full truncate transition-colors"
        >
          <FileText className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{sharepointUrl}</span>
        </a>
      )}

      {/* 6. Ambiente e Turno */}
      <div className="flex flex-col items-start gap-1.5 pt-0.5">
        <span className="inline-block bg-amber-100/70 text-amber-900 text-xs font-semibold px-2 py-0.5 rounded">
          {environmentName}
        </span>
        <span className="inline-block bg-amber-100/70 text-amber-900 text-xs font-semibold px-2 py-0.5 rounded">
          {shift}
        </span>
      </div>

      {/* 7. Status */}
      <div className="pt-0.5">
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full ${
          status === 'Em andamento'
            ? 'bg-blue-100 text-blue-900'
            : status === 'Concluída'
            ? 'bg-emerald-100 text-emerald-900'
            : 'bg-gray-200 text-gray-800'
        }`}>
          <span className={`w-2 h-2 rounded-full ${
            status === 'Em andamento' ? 'bg-blue-600' : 'bg-emerald-600'
          }`} />
          {status}
        </span>
      </div>

      {/* 8. Timestamp de Criação */}
      <div className="text-gray-700 text-xs font-medium pt-1">
        {createdAtFormatted}
      </div>
    </div>
  );
};