import React, { useState } from 'react';
import { Search, MapPin, User, Calendar, BookOpen, Clock } from 'lucide-react';
import { api } from '../../services/api';

export const StudentPortal: React.FC = () => {
  const [classCode, setClassCode] = useState('APB/149/02');
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClassSchedule = async () => {
    if (!classCode.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/manage/student-schedule/${encodeURIComponent(classCode.trim())}`);
      setStudentData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Turma não encontrada.');
      setStudentData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-4">
      {/* Busca por Código da Turma */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3">
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          Consulta de Turma e Disciplinas do Aluno
        </h2>
        
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Digite o código da sua turma (ex: APB/149/02)"
            value={classCode}
            onChange={(e) => setClassCode(e.target.value)}
            className="flex-1 text-sm bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <button
            onClick={fetchClassSchedule}
            disabled={loading}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-2"
          >
            <Search className="w-4 h-4" /> {loading ? 'Buscando...' : 'Consultar'}
          </button>
        </div>
        {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}
      </div>

      {/* Resultados do Cronograma da Turma */}
      {studentData && (
        <div className="flex flex-col gap-3">
          {/* Header da Turma */}
          <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-5 rounded-2xl shadow-sm">
            <span className="text-xs uppercase tracking-wider font-semibold text-blue-200">SENAI Parauapebas</span>
            <h1 className="text-xl font-black mt-1">{studentData.curso}</h1>
            <div className="flex flex-wrap gap-4 mt-3 text-xs text-blue-100">
              <div>Turma: <span className="font-bold text-white">{studentData.turma}</span></div>
              <div>Parceiro: <span className="font-bold text-white">{studentData.empresa}</span></div>
            </div>
          </div>

          {/* Lista de Disciplinas Ordenadas */}
          <h3 className="text-sm font-bold text-slate-700 px-1">Grade Modular de Disciplinas</h3>
          <div className="grid grid-cols-1 gap-3">
            {studentData.cronograma.map((item: any) => (
              <div 
                key={item.id}
                className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col gap-2 hover:border-blue-200 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm">{item.disciplina}</h4>
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                    item.status === 'Em andamento' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {item.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Instrutor: <strong className="text-slate-800">{item.instrutor}</strong></span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-500" />
                    <span>Local: <strong className="text-slate-800">{item.ambiente}</strong></span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-red-500" />
                    <span>Período: {new Date(item.inicio).toLocaleDateString('pt-BR')} até {new Date(item.termino).toLocaleDateString('pt-BR')}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Turno: <strong className="text-slate-800">{item.turno}</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};