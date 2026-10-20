import React, { useEffect, useState } from 'react';
import { LogOut, Calendar, Clock, MapPin, Users, BookOpen } from 'lucide-react';
import { api } from '../../services/api';

interface TeacherPortalProps {
  user: any;
  onLogout: () => void;
}

export const TeacherPortal: React.FC<TeacherPortalProps> = ({ user, onLogout }) => {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        if (user?.instructorId) {
          const res = await api.get(`/schedules/instructor/${user.instructorId}`);
          setSchedules(res.data);
        }
      } catch (err) {
        console.error('Erro ao buscar cronograma do instrutor:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, [user]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Topo do Portal */}
      <header className="bg-[#031329] border-b border-blue-900/50 px-6 py-4 flex items-center justify-between text-white shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-600 text-white">
              Docente
            </span>
            <h1 className="text-base font-bold text-slate-100">{user?.name}</h1>
          </div>
          <p className="text-xs text-blue-200/80">Cronograma de Aulas e Ambientes Pedagógicos</p>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-300 hover:text-white hover:bg-rose-600/20 rounded-lg transition-colors border border-rose-500/30"
        >
          <LogOut className="w-3.5 h-3.5" /> Sair
        </button>
      </header>

      {/* Conteúdo */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-800">Minha Agenda de Aulas</h2>
          <p className="text-xs text-slate-500">Acompanhe suas alocações por turma, unidade curricular e ambiente.</p>
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-500 text-sm">Carregando cronograma...</div>
        ) : schedules.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500">
            Nenhuma disciplina alocada para o seu perfil no momento.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                      Turma: {schedule.classGroup?.classCode}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {schedule.shift}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
                    {schedule.discipline?.name}
                  </h3>

                  <p className="text-xs text-slate-500 mb-4">
                    Curso: {schedule.classGroup?.course?.title}
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-3 flex flex-col gap-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Ambiente: <strong>{schedule.environment?.name}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Período: {formatDate(schedule.startDate)} até {formatDate(schedule.endDate)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};