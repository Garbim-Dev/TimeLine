import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  CheckCircle2, 
  Building2, 
  User, 
  MapPin, 
  Download,
  BookOpen,
  Clock
} from 'lucide-react';

export interface ScheduleItem {
  id: number;
  taskCode?: string;
  classCode: string;
  course: string;
  shift: string;
  companies: string[];
  discipline: string;
  startDate: string;
  endDate: string;
  status: 'Não iniciado' | 'Em andamento' | 'Concluído' | 'Cancelado' | string;
  instructor: string;
  location: string;
  isCompanyPhase?: boolean;
}

interface MasterScheduleTableViewProps {
  schedules: ScheduleItem[];
  loading?: boolean;
}

export const MasterScheduleTableView: React.FC<MasterScheduleTableViewProps> = ({ 
  schedules, 
  loading 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterShift, setFilterShift] = useState<string>('TODOS');
  const [filterStatus, setFilterStatus] = useState<string>('TODOS');

  // Filtros combinados
  const filteredData = useMemo(() => {
    return schedules.filter((item) => {
      const matchSearch = 
        item.classCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.discipline.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.companies.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchShift = filterShift === 'TODOS' || item.shift.toUpperCase() === filterShift.toUpperCase();
      const matchStatus = filterStatus === 'TODOS' || item.status.toLowerCase() === filterStatus.toLowerCase();

      return matchSearch && matchShift && matchStatus;
    });
  }, [schedules, searchTerm, filterShift, filterStatus]);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'em andamento':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'concluído':
      case 'concluida':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'não iniciado':
      case 'planejada':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getLocationBadge = (location: string) => {
    if (location.toUpperCase().includes('EMPRESA')) {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    if (location.toUpperCase().includes('FAMAP')) {
      return 'bg-amber-50 text-amber-800 border-amber-200';
    }
    return 'bg-slate-100 text-slate-800 border-slate-300';
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
      {/* Barra de Filtros e Pesquisa Superior */}
      <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por turma, matéria, empresa ou docente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Filtro Turno */}
          <select
            value={filterShift}
            onChange={(e) => setFilterShift(e.target.value)}
            className="text-xs p-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-700"
          >
            <option value="TODOS">Todos os Turnos</option>
            <option value="MANHA">Manhã</option>
            <option value="TARDE">Tarde</option>
            <option value="NOITE">Noite</option>
          </select>

          {/* Filtro Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs p-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-700"
          >
            <option value="TODOS">Todos os Status</option>
            <option value="Não iniciado">Não iniciado</option>
            <option value="Em andamento">Em andamento</option>
            <option value="Concluído">Concluído</option>
          </select>

          <span className="text-xs font-bold text-slate-500 ml-2">
            Total: <strong className="text-blue-600">{filteredData.length}</strong> registros
          </span>
        </div>
      </div>

      {/* Tabela com Scroll Horizontal Suave */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
          <thead className="bg-[#f8fafc] text-slate-600 font-extrabold border-b border-slate-200 uppercase text-[11px] tracking-wider">
            <tr>
              <th className="py-3 px-3">Tarefa</th>
              <th className="py-3 px-3">Turma</th>
              <th className="py-3 px-3">Curso</th>
              <th className="py-3 px-3 text-center">Turno</th>
              <th className="py-3 px-3">Empresas Parceiras</th>
              <th className="py-3 px-3">Unidade Curricular (Disciplina)</th>
              <th className="py-3 px-3">Início</th>
              <th className="py-3 px-3">Término</th>
              <th className="py-3 px-3 text-center">Status</th>
              <th className="py-3 px-3">Instrutor</th>
              <th className="py-3 px-3 text-center">Local</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredData.length > 0 ? (
              filteredData.map((row) => {
                const isCompanyPhase = row.discipline.toLowerCase().includes('empresa') || row.location.toLowerCase().includes('empresa');
                return (
                  <tr 
                    key={row.id} 
                    className={`hover:bg-blue-50/40 transition-colors ${
                      isCompanyPhase ? 'bg-slate-50/50' : ''
                    }`}
                  >
                    {/* Código Tarefa com Ícone Verde */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5 font-bold text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 fill-emerald-100" />
                        <span>{row.taskCode || `TSK.${row.id.toString().padStart(3, '0')}`}</span>
                      </div>
                    </td>

                    {/* Turma */}
                    <td className="py-2.5 px-3 font-extrabold text-blue-700">
                      {row.classCode}
                    </td>

                    {/* Curso */}
                    <td className="py-2.5 px-3">
                      <span className="bg-slate-100 border border-slate-200 text-slate-800 font-semibold px-2 py-0.5 rounded-md">
                        {row.course}
                      </span>
                    </td>

                    {/* Turno */}
                    <td className="py-2.5 px-3 text-center">
                      <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-md border border-blue-100 text-[10px]">
                        {row.shift}
                      </span>
                    </td>

                    {/* Empresas Parceiras */}
                    <td className="py-2.5 px-3 max-w-xs truncate">
                      {row.companies.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {row.companies.map((comp, idx) => (
                            <span 
                              key={idx} 
                              className="bg-purple-50 text-purple-800 border border-purple-200/80 font-semibold px-2 py-0.5 rounded text-[10px]"
                            >
                              {comp}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Demanda Regular</span>
                      )}
                    </td>

                    {/* Disciplina */}
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      <span className={isCompanyPhase ? 'text-rose-700 font-bold' : ''}>
                        {row.discipline}
                      </span>
                    </td>

                    {/* Data Início */}
                    <td className="py-2.5 px-3 text-slate-600">
                      <div className="flex items-center gap-1 font-mono text-[11px]">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{row.startDate}</span>
                      </div>
                    </td>

                    {/* Data Término */}
                    <td className="py-2.5 px-3 text-slate-600">
                      <div className="flex items-center gap-1 font-mono text-[11px]">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{row.endDate}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${getStatusBadge(row.status)}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {row.status}
                      </span>
                    </td>

                    {/* Instrutor */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className={`font-semibold ${isCompanyPhase ? 'text-slate-500 italic' : 'text-slate-800'}`}>
                          {row.instructor}
                        </span>
                      </div>
                    </td>

                    {/* Local */}
                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded-md border font-extrabold text-[10px] uppercase ${getLocationBadge(row.location)}`}>
                        {row.location}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={11} className="text-center py-10 text-slate-400 italic">
                  Nenhum agendamento encontrado para os filtros selecionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};