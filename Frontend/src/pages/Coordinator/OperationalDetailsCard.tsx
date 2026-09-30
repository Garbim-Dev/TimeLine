import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Search, 
  Calendar, 
  User, 
  FileSpreadsheet,
  Filter
} from 'lucide-react';
import { api } from '../../services/api';

interface OperationalRow {
  id: number;
  taskCode?: string;
  classCode: string;
  course: string;
  shift: string;
  companies: string[];
  discipline: string;
  startDate: string;
  endDate: string;
  status: string;
  instructor: string;
  location: string;
}

export const OperationalDetailsCard: React.FC = () => {
  const [data, setData] = useState<OperationalRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterShift, setFilterShift] = useState('TODOS');

  const loadOperationalData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/manage/schedules-table');
      setData(res.data);
    } catch (err) {
      console.error('Erro ao carregar detalhes operacionais:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOperationalData();
  }, []);

  const filteredData = data.filter((item) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      item.classCode.toLowerCase().includes(term) ||
      item.course.toLowerCase().includes(term) ||
      item.discipline.toLowerCase().includes(term) ||
      item.instructor.toLowerCase().includes(term) ||
      item.companies.some((c) => c.toLowerCase().includes(term));

    const matchesShift = filterShift === 'TODOS' || item.shift.toUpperCase() === filterShift.toUpperCase();
    return matchesSearch && matchesShift;
  });

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('andamento')) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    if (s.includes('conclu')) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
    return 'bg-amber-100 text-amber-800 border-amber-200';
  };

  const getLocationBadge = (loc: string) => {
    const l = loc.toUpperCase();
    if (l.includes('EMPRESA')) return 'bg-rose-50 text-rose-700 border-rose-200';
    if (l.includes('FAMAP')) return 'bg-amber-50 text-amber-800 border-amber-200';
    return 'bg-slate-100 text-slate-800 border-slate-300';
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col gap-4 mt-6">
      {/* Topo do Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-800 tracking-tight">
              Detalhes Operacionais
            </h3>
            <p className="text-xs text-slate-400">
              Visão tabular consolidada de turmas, docentes, matérias e ambientes
            </p>
          </div>
        </div>

        {/* Filtro e Busca Rápida */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar turma, matéria, instrutor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-56 sm:w-64"
            />
          </div>

          <select
            value={filterShift}
            onChange={(e) => setFilterShift(e.target.value)}
            className="text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
          >
            <option value="TODOS">Todos os Turnos</option>
            <option value="MANHA">Manhã</option>
            <option value="TARDE">Tarde</option>
            <option value="NOITE">Noite</option>
          </select>

          <span className="text-[11px] font-bold text-slate-500 ml-1">
            Total: <strong className="text-blue-600">{filteredData.length}</strong>
          </span>
        </div>
      </div>

      {/* Tabela de Dados */}
      <div className="overflow-x-auto w-full rounded-2xl border border-slate-100">
        <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-600 font-extrabold border-b border-slate-200 uppercase text-[10px] tracking-wider">
            <tr>
              <th className="py-2.5 px-3">Nome da tarefa</th>
              <th className="py-2.5 px-3">Turma</th>
              <th className="py-2.5 px-3">Curso</th>
              <th className="py-2.5 px-3 text-center">Turno</th>
              <th className="py-2.5 px-3">Empresas</th>
              <th className="py-2.5 px-3">Unidade Curricular</th>
              <th className="py-2.5 px-3">Início</th>
              <th className="py-2.5 px-3">Término</th>
              <th className="py-2.5 px-3 text-center">Status</th>
              <th className="py-2.5 px-3">Instrutor</th>
              <th className="py-2.5 px-3 text-center">Local</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredData.length > 0 ? (
              filteredData.map((row) => {
                const isCompany = row.discipline.toLowerCase().includes('empresa') || row.location.toLowerCase().includes('empresa');
                return (
                  <tr key={row.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5 font-bold text-slate-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 fill-emerald-100" />
                        <span>{row.taskCode || `APB.${row.id.toString().padStart(3, '0')}`}</span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 font-extrabold text-blue-700">
                      {row.classCode}
                    </td>

                    <td className="py-2.5 px-3">
                      <span className="bg-slate-100 text-slate-800 font-semibold px-2 py-0.5 rounded-md border border-slate-200 text-[11px]">
                        {row.course}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-md border border-blue-100 text-[10px]">
                        {row.shift}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 max-w-xs truncate">
                      {row.companies.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {row.companies.map((comp, idx) => (
                            <span 
                              key={idx} 
                              className="bg-purple-50 text-purple-800 border border-purple-200/80 font-semibold px-1.5 py-0.5 rounded text-[10px]"
                            >
                              {comp}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Demanda Regular</span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      <span className={isCompany ? 'text-rose-700 font-bold' : ''}>
                        {row.discipline}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                      {row.startDate}
                    </td>

                    <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                      {row.endDate}
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold ${getStatusBadge(row.status)}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {row.status}
                      </span>
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                        <User className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className={isCompany ? 'text-slate-500 italic' : ''}>
                          {row.instructor}
                        </span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-md border font-black text-[10px] uppercase ${getLocationBadge(row.location)}`}>
                        {row.location}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={11} className="text-center py-8 text-slate-400 italic">
                  {loading ? 'Carregando registros...' : 'Nenhum agendamento encontrado.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};