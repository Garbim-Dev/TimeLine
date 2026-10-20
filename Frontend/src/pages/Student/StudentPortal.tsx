import React, { useState, useEffect } from 'react';
import { Search, MapPin, User, Calendar, BookOpen, Clock, Building2, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

interface StudentPortalProps {
  currentUser?: {
    id: number;
    name: string;
    classGroupId?: number | null;
  };
}

export const StudentPortal: React.FC<StudentPortalProps> = ({ currentUser }) => {
  const [classCode, setClassCode] = useState('APB.040.356');
  const [classGroup, setClassGroup] = useState<any>(null);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Busca o cronograma pelo código digitado
  const fetchClassSchedule = async (codeToSearch?: string) => {
    const code = (codeToSearch || classCode).trim();
    if (!code) return;

    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/schedules/student/class/${encodeURIComponent(code)}`);
      setClassGroup(res.data.classGroup);
      setSchedules(res.data.schedules || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Nenhum cronograma localizado para esta turma.');
      setClassGroup(null);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  // Se o aluno já estiver associado a um classGroupId, carrega direto por ID
  useEffect(() => {
    if (currentUser?.classGroupId) {
      setLoading(true);
      api.get(`/schedules/student/group/${currentUser.classGroupId}`)
        .then((res) => {
          setClassGroup(res.data.classGroup);
          setSchedules(res.data.schedules || []);
          if (res.data.classGroup?.classCode) {
            setClassCode(res.data.classGroup.classCode);
          }
        })
        .catch(() => {
          // Fallback para busca padrão se falhar
          fetchClassSchedule();
        })
        .finally(() => setLoading(false));
    } else {
      fetchClassSchedule();
    }
  }, [currentUser]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-5">
      {/* Caixa de Pesquisa de Turma */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Consulta de Turma e Cronograma do Aluno
          </h2>
          {currentUser && (
            <span className="text-xs text-slate-500 font-medium">
              Aluno: <strong className="text-slate-700">{currentUser.name}</strong>
            </span>
          )}
        </div>
        
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Digite o código da turma (ex: APB.040.356)"
            value={classCode}
            onChange={(e) => setClassCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchClassSchedule()}
            className="flex-1 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <button
            onClick={() => fetchClassSchedule()}
            disabled={loading}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors flex items-center gap-2 shrink-0 shadow-sm"
          >
            <Search className="w-4 h-4" /> {loading ? 'Buscando...' : 'Consultar'}
          </button>
        </div>
        {error && (
          <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium mt-1">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Resultados da Turma */}
      {classGroup && (
        <div className="flex flex-col gap-4">
          {/* Card de Informações Gerais da Turma */}
          <div className="relative overflow-hidden bg-[#031329] text-white p-6 rounded-3xl shadow-md border border-blue-900/40">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col gap-2">
              <span className="text-[11px] uppercase tracking-wider font-bold text-blue-300">
                SENAI CEP Parauapebas • Plano de Curso
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {classGroup.course?.title || 'Curso Técnico'}
              </h1>
              
              <div className="flex flex-wrap items-center gap-y-2 gap-x-6 mt-2 text-xs text-slate-300 border-t border-slate-800/80 pt-3">
                <div>
                  Código da Turma: <strong className="text-white bg-blue-600/30 px-2 py-0.5 rounded border border-blue-500/30">{classGroup.classCode}</strong>
                </div>
                {classGroup.course?.workloadHours && (
                  <div>
                    Carga Horária: <strong className="text-white">{classGroup.course.workloadHours}h</strong>
                  </div>
                )}
                {classGroup.companies && classGroup.companies.length > 0 && (
                  <div className="flex items-center gap-1.5 text-amber-300">
                    <Building2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Parceiro: <strong>{classGroup.companies.map((c: any) => c.company.name).join(', ')}</strong></span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Lista de Unidades Curriculares e Alocações */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-3 px-1">
              Unidades Curriculares e Grade de Aulas
            </h3>

            {schedules.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-xs">
                Nenhuma disciplina agendada para esta turma no momento.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {schedules.map((item) => (
                  <div 
                    key={item.id}
                    className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-sm transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100">
                          {item.discipline?.code || 'UC'}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          item.status === 'CONCLUIDA'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'EM_ANDAMENTO'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {item.status}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-sm mb-3">
                        {item.discipline?.name}
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="truncate">
                          Docente: <strong className="text-slate-800">{item.instructor?.name || 'A Definir'}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="truncate">
                          Sala: <strong className="text-slate-800">{item.environment?.name || 'A Definir'}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{formatDate(item.startDate)} - {formatDate(item.endDate)}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Turno: <strong className="text-slate-800">{item.shift}</strong></span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};