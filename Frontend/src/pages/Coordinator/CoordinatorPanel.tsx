import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  GraduationCap, 
  CalendarPlus, 
  CheckCircle2, 
  AlertTriangle,
  BookOpen,
  BookMarked,
  MapPin,
  Pencil,
  Trash2,
  X,
  LayoutDashboard
} from 'lucide-react';
import { DistributionDashboard } from './DistributionDashboard';
import { OperationalDetailsCard } from './OperationalDetailsCard';
import { api } from '../../services/api';

export type TabMode = 'dashboard' | 'schedule' | 'courses' | 'disciplines' | 'classes' | 'instructors' | 'companies' | 'environments';

interface CoordinatorPanelProps {
  activeTab?: TabMode;
  setActiveTab?: (tab: TabMode) => void;
}

export const CoordinatorPanel: React.FC<CoordinatorPanelProps> = ({ 
  activeTab: externalTab, 
  setActiveTab: externalSetTab 
}) => {
  const [internalTab, setInternalTab] = useState<TabMode>('dashboard');
  const activeTab = externalTab || internalTab;
  const setActiveTab = externalSetTab || setInternalTab;

  const [feedback, setFeedback] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Estados de Listagem
  const [courses, setCourses] = useState<any[]>([]);
  const [disciplines, setDisciplines] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [instructors, setInstructors] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [environments, setEnvironments] = useState<any[]>([]);

  // Estado de Edição
  const [editingId, setEditingId] = useState<number | null>(null);

  // Formulários
  const [scheduleForm, setScheduleForm] = useState({
    classGroupId: '',
    disciplineId: '',
    instructorId: '',
    environmentId: '',
    shift: 'TARDE',
    startDate: '',
    endDate: '',
    sharepointUrl: '',
    createdByUserId: 1,
  });

  const [courseForm, setCourseForm] = useState({ title: '', courseCode: '', workloadHours: 160, description: '' });
  const [disciplineForm, setDisciplineForm] = useState({ courseId: '', name: '', code: '', workloadHours: 40 });
  const [classForm, setClassForm] = useState({
    classCode: '',
    courseId: '',
    companyIds: [] as number[],
    startDate: '',
    endDate: '',
  });
  const [instructorForm, setInstructorForm] = useState({ name: '', registrationCode: '', email: '', phone: '', areaExpertise: '' });
  const [companyForm, setCompanyForm] = useState({ name: '', cnpj: '', contactPerson: '', contactPhone: '' });
  const [envForm, setEnvForm] = useState({ name: '', capacity: 30, locationDetails: '' });

  const loadData = async () => {
    try {
      const [cRes, dRes, clRes, iRes, compRes, envRes] = await Promise.all([
        api.get('/manage/courses'),
        api.get('/manage/disciplines'),
        api.get('/manage/classes'),
        api.get('/manage/instructors'),
        api.get('/manage/companies'),
        api.get('/manage/environments'),
      ]);
      setCourses(cRes.data);
      setDisciplines(dRes.data);
      setClasses(clRes.data);
      setInstructors(iRes.data);
      setCompanies(compRes.data);
      setEnvironments(envRes.data);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForms = () => {
    setEditingId(null);
    setCourseForm({ title: '', courseCode: '', workloadHours: 160, description: '' });
    setDisciplineForm({ courseId: '', name: '', code: '', workloadHours: 40 });
    setClassForm({ classCode: '', courseId: '', companyIds: [], startDate: '', endDate: '' });
    setInstructorForm({ name: '', registrationCode: '', email: '', phone: '', areaExpertise: '' });
    setCompanyForm({ name: '', cnpj: '', contactPerson: '', contactPhone: '' });
    setEnvForm({ name: '', capacity: 30, locationDetails: '' });
  };

  const extractErrorMessage = (err: any, fallbackMessage: string): string => {
    const backendErrors = err.response?.data?.errors;
    if (Array.isArray(backendErrors) && backendErrors.length > 0) {
      return backendErrors[0].message || fallbackMessage;
    }
    return err.response?.data?.message || err.response?.data?.error || fallbackMessage;
  };

  const handleDelete = async (endpoint: string, id: number, entityLabel: string) => {
    if (!window.confirm(`Deseja realmente excluir este(a) ${entityLabel}?`)) return;
    try {
      await api.delete(`/manage/${endpoint}/${id}`);
      setFeedback({ msg: `${entityLabel} excluído(a) com sucesso!`, type: 'success' });
      loadData();
    } catch (err: any) {
      setFeedback({ 
        msg: extractErrorMessage(err, `Falha ao excluir ${entityLabel}.`), 
        type: 'error' 
      });
    }
  };

  // Submit Cronograma
  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (new Date(scheduleForm.endDate) < new Date(scheduleForm.startDate)) {
      setFeedback({ 
        msg: 'A data de término deve ser igual ou posterior à data de início.', 
        type: 'error' 
      });
      return;
    }

    try {
      await api.post('/schedules', {
        ...scheduleForm,
        classGroupId: Number(scheduleForm.classGroupId),
        disciplineId: Number(scheduleForm.disciplineId),
        instructorId: Number(scheduleForm.instructorId),
        environmentId: Number(scheduleForm.environmentId),
      });

      setFeedback({ 
        msg: 'Disciplina alocada no cronograma com sucesso!', 
        type: 'success' 
      });

      setScheduleForm({
        classGroupId: '',
        disciplineId: '',
        instructorId: '',
        environmentId: '',
        shift: 'TARDE',
        startDate: '',
        endDate: '',
        sharepointUrl: '',
        createdByUserId: 1,
      });
    } catch (err: any) {
      setFeedback({ 
        msg: extractErrorMessage(err, 'Erro ao agendar disciplina no cronograma.'), 
        type: 'error' 
      });
    }
  };

  // Submit Cursos
  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    try {
      if (editingId) {
        await api.put(`/manage/courses/${editingId}`, courseForm);
        setFeedback({ msg: 'Curso atualizado com sucesso!', type: 'success' });
      } else {
        await api.post('/manage/courses', courseForm);
        setFeedback({ msg: 'Curso cadastrado com sucesso!', type: 'success' });
      }
      resetForms();
      loadData();
    } catch (err: any) {
      setFeedback({ msg: extractErrorMessage(err, 'Erro ao salvar curso.'), type: 'error' });
    }
  };

  // Submit Disciplinas
  const handleDisciplineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    try {
      if (editingId) {
        await api.put(`/manage/disciplines/${editingId}`, disciplineForm);
        setFeedback({ msg: 'Disciplina atualizada com sucesso!', type: 'success' });
      } else {
        await api.post('/manage/disciplines', disciplineForm);
        setFeedback({ msg: 'Disciplina cadastrada e vinculada ao curso com sucesso!', type: 'success' });
      }
      resetForms();
      loadData();
    } catch (err: any) {
      setFeedback({ msg: extractErrorMessage(err, 'Erro ao salvar disciplina.'), type: 'error' });
    }
  };

  // Submit Turmas (Suporte a Múltiplas Empresas)
  const handleClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (new Date(classForm.endDate) < new Date(classForm.startDate)) {
      setFeedback({ 
        msg: 'A data de término do curso deve ser igual ou posterior à data de início.', 
        type: 'error' 
      });
      return;
    }

    try {
      if (editingId) {
        await api.put(`/manage/classes/${editingId}`, classForm);
        setFeedback({ msg: 'Turma atualizada com sucesso!', type: 'success' });
      } else {
        await api.post('/manage/classes', classForm);
        setFeedback({ msg: 'Turma cadastrada com sucesso!', type: 'success' });
      }
      resetForms();
      loadData();
    } catch (err: any) {
      setFeedback({ msg: extractErrorMessage(err, 'Erro ao salvar turma.'), type: 'error' });
    }
  };

  // Submit Instrutores
  const handleInstructorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    try {
      if (editingId) {
        await api.put(`/manage/instructors/${editingId}`, instructorForm);
        setFeedback({ msg: 'Dados do instrutor atualizados com sucesso!', type: 'success' });
      } else {
        await api.post('/manage/instructors', instructorForm);
        setFeedback({ msg: 'Instrutor cadastrado com sucesso!', type: 'success' });
      }
      resetForms();
      loadData();
    } catch (err: any) {
      setFeedback({ msg: extractErrorMessage(err, 'Erro ao salvar instrutor.'), type: 'error' });
    }
  };

  // Submit Empresas
  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    try {
      if (editingId) {
        await api.put(`/manage/companies/${editingId}`, companyForm);
        setFeedback({ msg: 'Empresa parceira atualizada com sucesso!', type: 'success' });
      } else {
        await api.post('/manage/companies', companyForm);
        setFeedback({ msg: 'Empresa parceira cadastrada com sucesso!', type: 'success' });
      }
      resetForms();
      loadData();
    } catch (err: any) {
      setFeedback({ msg: extractErrorMessage(err, 'Erro ao salvar empresa.'), type: 'error' });
    }
  };

  // Submit Ambientes
  const handleEnvSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    try {
      if (editingId) {
        await api.put(`/manage/environments/${editingId}`, envForm);
        setFeedback({ msg: 'Ambiente atualizado com sucesso!', type: 'success' });
      } else {
        await api.post('/manage/environments', envForm);
        setFeedback({ msg: 'Ambiente cadastrado com sucesso!', type: 'success' });
      }
      resetForms();
      loadData();
    } catch (err: any) {
      setFeedback({ msg: extractErrorMessage(err, 'Erro ao salvar ambiente.'), type: 'error' });
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
      {/* Título dinâmico baseado na aba selecionada pelo menu lateral */}
      <div className="border-b border-slate-100 pb-5 mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">
            {activeTab === 'dashboard' && '1. Painel da Coordenação (Distribuição)'}
            {activeTab === 'schedule' && '2. Cronograma de Aulas e Alocações'}
            {activeTab === 'companies' && '3. Gestão de Empresas Parceiras'}
            {activeTab === 'instructors' && '4. Cadastro de Instrutores'}
            {activeTab === 'courses' && '5. Gestão de Cursos'}
            {activeTab === 'disciplines' && '6. Matriz de Disciplinas (UCs)'}
            {activeTab === 'environments' && '7. Cadastro de Ambientes e Salas'}
            {activeTab === 'classes' && '8. Gestão de Turmas'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            SENAI CEP Parauapebas • Módulo Operacional
          </p>
        </div>
      </div>

      {feedback && (
        <div className={`p-3.5 rounded-2xl mb-6 text-xs font-semibold flex items-center justify-between gap-2 ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
            : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.msg}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setFeedback(null)} 
            className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. PAINEL DA COORDENAÇÃO (DASHBOARD + DETALHES OPERACIONAIS) */}
      {activeTab === 'dashboard' && (
        <div className="flex flex-col gap-6">
          <DistributionDashboard />
          <OperationalDetailsCard />
        </div>
      )}

      {/* 2. CRONOGRAMA */}
      {activeTab === 'schedule' && (
        <form onSubmit={handleScheduleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Turma Ativa</label>
            <select
              required
              value={scheduleForm.classGroupId}
              onChange={(e) => setScheduleForm({ ...scheduleForm, classGroupId: e.target.value })}
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="">Selecione uma turma...</option>
              {classes.map((c) => {
                const companyInfo = c.companiesSummary 
                  ? `(${c.companiesSummary})` 
                  : (c.companies && c.companies.length > 0 
                      ? `(${c.companies.map((item: any) => item.company?.name || item.name).join(' / ')})` 
                      : '');
                return (
                  <option key={c.id} value={c.id}>
                    {c.classCode} - {c.course?.title} {companyInfo}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Disciplina (UC)</label>
            <select
              required
              value={scheduleForm.disciplineId}
              onChange={(e) => setScheduleForm({ ...scheduleForm, disciplineId: e.target.value })}
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="">Selecione a disciplina...</option>
              {disciplines.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.course?.title})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Instrutor</label>
            <select
              required
              value={scheduleForm.instructorId}
              onChange={(e) => setScheduleForm({ ...scheduleForm, instructorId: e.target.value })}
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="">Selecione o instrutor...</option>
              {instructors.map((i) => (
                <option key={i.id} value={i.id}>{i.name} ({i.registrationCode || 'Sem Chapa'})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Ambiente / Sala</label>
            <select
              required
              value={scheduleForm.environmentId}
              onChange={(e) => setScheduleForm({ ...scheduleForm, environmentId: e.target.value })}
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="">Selecione o ambiente...</option>
              {environments.map((env) => (
                <option key={env.id} value={env.id}>{env.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Turno</label>
            <select
              value={scheduleForm.shift}
              onChange={(e) => setScheduleForm({ ...scheduleForm, shift: e.target.value })}
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="MANHA">Manhã</option>
              <option value="TARDE">Tarde</option>
              <option value="NOITE">Noite</option>
              <option value="INTEGRAL">Integral</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Link SharePoint / Diário</label>
            <input
              type="url"
              placeholder="https://senaipa.sharepoint.com/..."
              value={scheduleForm.sharepointUrl}
              onChange={(e) => setScheduleForm({ ...scheduleForm, sharepointUrl: e.target.value })}
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Início da Disciplina</label>
            <input
              type="date"
              required
              value={scheduleForm.startDate}
              onChange={(e) => {
                const newStart = e.target.value;
                setScheduleForm((prev) => ({
                  ...prev,
                  startDate: newStart,
                  endDate: prev.endDate && prev.endDate < newStart ? '' : prev.endDate,
                }));
              }}
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Término da Disciplina</label>
            <input
              type="date"
              required
              min={scheduleForm.startDate}
              disabled={!scheduleForm.startDate}
              value={scheduleForm.endDate}
              onChange={(e) => setScheduleForm({ ...scheduleForm, endDate: e.target.value })}
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl disabled:bg-slate-100 disabled:cursor-not-allowed"
            />
          </div>

          <div className="md:col-span-2 pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <CalendarPlus className="w-4 h-4" /> Confirmar Alocação no Cronograma
            </button>
          </div>
        </form>
      )}

      {/* 3. EMPRESAS PARCEIRAS */}
      {activeTab === 'companies' && (
        <div className="flex flex-col gap-6">
          <form onSubmit={handleCompanySubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="md:col-span-2 flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-800 uppercase">
                {editingId ? 'Editar Empresa Parceira' : 'Cadastrar Nova Empresa Parceira'}
              </h3>
              {editingId && (
                <button type="button" onClick={resetForms} className="text-xs text-slate-500 flex items-center gap-1 cursor-pointer">
                  <X className="w-3.5 h-3.5" /> Cancelar
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nome da Empresa</label>
              <input
                type="text"
                required
                placeholder="Ex: Vale - Carajás"
                value={companyForm.name}
                onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">CNPJ (Opcional)</label>
              <input
                type="text"
                value={companyForm.cnpj}
                onChange={(e) => setCompanyForm({ ...companyForm, cnpj: e.target.value })}
                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl"
              />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl cursor-pointer">
                {editingId ? 'Salvar Alterações' : 'Salvar Empresa'}
              </button>
            </div>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold">
                <tr>
                  <th className="p-3">Nome</th>
                  <th className="p-3">CNPJ</th>
                  <th className="p-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {companies.map((comp) => (
                  <tr key={comp.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{comp.name}</td>
                    <td className="p-3 text-slate-600">{comp.cnpj || '-'}</td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingId(comp.id);
                          setCompanyForm({ 
                            name: comp.name, 
                            cnpj: comp.cnpj || '', 
                            contactPerson: comp.contactPerson || '', 
                            contactPhone: comp.contactPhone || '' 
                          });
                        }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                        title="Editar"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete('companies', comp.id, 'Empresa')}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. INSTRUTORES */}
      {activeTab === 'instructors' && (
        <div className="flex flex-col gap-6">
          <form onSubmit={handleInstructorSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="md:col-span-2 flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-800 uppercase">
                {editingId ? 'Editar Instrutor' : 'Cadastrar Novo Instrutor'}
              </h3>
              {editingId && (
                <button type="button" onClick={resetForms} className="text-xs text-slate-500 flex items-center gap-1 cursor-pointer">
                  <X className="w-3.5 h-3.5" /> Cancelar
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nome Completo</label>
              <input
                type="text"
                required
                value={instructorForm.name}
                onChange={(e) => setInstructorForm({ ...instructorForm, name: e.target.value })}
                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Matrícula / Chapa</label>
              <input
                type="text"
                required
                value={instructorForm.registrationCode}
                onChange={(e) => setInstructorForm({ ...instructorForm, registrationCode: e.target.value })}
                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">E-mail</label>
              <input
                type="email"
                required
                value={instructorForm.email}
                onChange={(e) => setInstructorForm({ ...instructorForm, email: e.target.value })}
                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Área / Especialidade</label>
              <input
                type="text"
                value={instructorForm.areaExpertise}
                onChange={(e) => setInstructorForm({ ...instructorForm, areaExpertise: e.target.value })}
                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl"
              />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl cursor-pointer">
                {editingId ? 'Salvar Alterações' : 'Salvar Instrutor'}
              </button>
            </div>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold">
                <tr>
                  <th className="p-3">Matrícula</th>
                  <th className="p-3">Nome</th>
                  <th className="p-3">E-mail</th>
                  <th className="p-3">Especialidade</th>
                  <th className="p-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {instructors.map((i) => (
                  <tr key={i.id} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-600">{i.registrationCode}</td>
                    <td className="p-3 font-bold text-slate-900">{i.name}</td>
                    <td className="p-3 text-slate-600">{i.email}</td>
                    <td className="p-3 text-slate-600">{i.areaExpertise || '-'}</td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingId(i.id);
                          setInstructorForm({
                            name: i.name,
                            registrationCode: i.registrationCode || '',
                            email: i.email || '',
                            phone: i.phone || '',
                            areaExpertise: i.areaExpertise || '',
                          });
                        }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                        title="Editar"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete('instructors', i.id, 'Instrutor')}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. CURSOS */}
      {activeTab === 'courses' && (
        <div className="flex flex-col gap-6">
          <form onSubmit={handleCourseSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="md:col-span-2 flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-800 uppercase">
                {editingId ? 'Editar Curso' : 'Cadastrar Novo Curso'}
              </h3>
              {editingId && (
                <button type="button" onClick={resetForms} className="text-xs text-slate-500 flex items-center gap-1 cursor-pointer">
                  <X className="w-3.5 h-3.5" /> Cancelar
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Título do Curso</label>
              <input
                type="text"
                required
                placeholder="Ex: Operador de Mina"
                value={courseForm.title}
                onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Código do Curso</label>
              <input
                type="text"
                placeholder="Ex: MIN-OP-01"
                value={courseForm.courseCode}
                onChange={(e) => setCourseForm({ ...courseForm, courseCode: e.target.value })}
                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Carga Horária Total (Horas)</label>
              <input
                type="number"
                value={courseForm.workloadHours}
                onChange={(e) => setCourseForm({ ...courseForm, workloadHours: Number(e.target.value) })}
                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl"
              />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl cursor-pointer">
                {editingId ? 'Salvar Alterações' : 'Cadastrar Curso'}
              </button>
            </div>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold">
                <tr>
                  <th className="p-3">Código</th>
                  <th className="p-3">Título</th>
                  <th className="p-3">Carga Horária</th>
                  <th className="p-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {courses.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-600">{c.courseCode || '-'}</td>
                    <td className="p-3 font-bold text-slate-900">{c.title}</td>
                    <td className="p-3 text-slate-600">{c.workloadHours}h</td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingId(c.id);
                          setCourseForm({ title: c.title, courseCode: c.courseCode || '', workloadHours: c.workloadHours || 0, description: c.description || '' });
                        }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                        title="Editar"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete('courses', c.id, 'Curso')}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. DISCIPLINAS */}
      {activeTab === 'disciplines' && (
        <div className="flex flex-col gap-6">
          <form onSubmit={handleDisciplineSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="md:col-span-2 flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-800 uppercase">
                {editingId ? 'Editar Disciplina' : 'Cadastrar Nova Disciplina'}
              </h3>
              {editingId && (
                <button type="button" onClick={resetForms} className="text-xs text-slate-500 flex items-center gap-1 cursor-pointer">
                  <X className="w-3.5 h-3.5" /> Cancelar
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Curso Vinculado</label>
              <select
                required
                value={disciplineForm.courseId}
                onChange={(e) => setDisciplineForm({ ...disciplineForm, courseId: e.target.value })}
                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl"
              >
                <option value="">Selecione o curso...</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nome da Disciplina / Unidade Curricular</label>
              <input
                type="text"
                required
                placeholder="Ex: Topografia Aplicada à Mineração"
                value={disciplineForm.name}
                onChange={(e) => setDisciplineForm({ ...disciplineForm, name: e.target.value })}
                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Código da UC (Opcional)</label>
              <input
                type="text"
                placeholder="Ex: MIN-TOP-01"
                value={disciplineForm.code}
                onChange={(e) => setDisciplineForm({ ...disciplineForm, code: e.target.value })}
                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Carga Horária (Horas)</label>
              <input
                type="number"
                required
                value={disciplineForm.workloadHours}
                onChange={(e) => setDisciplineForm({ ...disciplineForm, workloadHours: Number(e.target.value) })}
                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl"
              />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl cursor-pointer">
                {editingId ? 'Salvar Alterações' : 'Cadastrar Disciplina'}
              </button>
            </div>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold">
                <tr>
                  <th className="p-3">Código</th>
                  <th className="p-3">Disciplina</th>
                  <th className="p-3">Curso</th>
                  <th className="p-3">Carga Horária</th>
                  <th className="p-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {disciplines.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-600">{d.code || '-'}</td>
                    <td className="p-3 font-bold text-slate-900">{d.name}</td>
                    <td className="p-3 text-blue-700 font-medium">{d.course?.title}</td>
                    <td className="p-3 text-slate-600">{d.workloadHours}h</td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingId(d.id);
                          setDisciplineForm({
                            courseId: String(d.courseId),
                            name: d.name,
                            code: d.code || '',
                            workloadHours: d.workloadHours || 40,
                          });
                        }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                        title="Editar"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete('disciplines', d.id, 'Disciplina')}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. AMBIENTES */}
      {activeTab === 'environments' && (
        <div className="flex flex-col gap-6">
          <form onSubmit={handleEnvSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="md:col-span-2 flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-800 uppercase">
                {editingId ? 'Editar Ambiente' : 'Cadastrar Novo Ambiente'}
              </h3>
              {editingId && (
                <button type="button" onClick={resetForms} className="text-xs text-slate-500 flex items-center gap-1 cursor-pointer">
                  <X className="w-3.5 h-3.5" /> Cancelar
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Nome do Ambiente / Sala</label>
              <input
                type="text"
                required
                placeholder="Ex: FAMAP, Sala 04, Laboratório de Informática"
                value={envForm.name}
                onChange={(e) => setEnvForm({ ...envForm, name: e.target.value })}
                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Capacidade de Alunos</label>
              <input
                type="number"
                value={envForm.capacity}
                onChange={(e) => setEnvForm({ ...envForm, capacity: Number(e.target.value) })}
                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Localização / Detalhes</label>
              <input
                type="text"
                placeholder="Ex: Pátio Prático de Equipamentos Móveis"
                value={envForm.locationDetails}
                onChange={(e) => setEnvForm({ ...envForm, locationDetails: e.target.value })}
                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl"
              />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button type="submit" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl cursor-pointer">
                {editingId ? 'Salvar Alterações' : 'Salvar Ambiente'}
              </button>
            </div>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold">
                <tr>
                  <th className="p-3">Nome</th>
                  <th className="p-3">Capacidade</th>
                  <th className="p-3">Localização</th>
                  <th className="p-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {environments.map((env) => (
                  <tr key={env.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{env.name}</td>
                    <td className="p-3 text-slate-600">{env.capacity} alunos</td>
                    <td className="p-3 text-slate-600">{env.locationDetails || '-'}</td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => {
                          setEditingId(env.id);
                          setEnvForm({ name: env.name, capacity: env.capacity || 30, locationDetails: env.locationDetails || '' });
                        }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                        title="Editar"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete('environments', env.id, 'Ambiente')}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                        title="Excluir"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. TURMAS (COM SUPORTE A TURMAS MISTAS) */}
      {activeTab === 'classes' && (
        <div className="flex flex-col gap-6">
          <form onSubmit={handleClassSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="md:col-span-2 flex justify-between items-center border-b border-slate-200/80 pb-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                {editingId ? 'Editar Turma' : 'Cadastrar Nova Turma'}
              </h3>
              {editingId && (
                <button type="button" onClick={resetForms} className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1 cursor-pointer">
                  <X className="w-3.5 h-3.5" /> Cancelar Edição
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Código da Turma</label>
              <input
                type="text"
                required
                placeholder="Ex: APB/149/02"
                value={classForm.classCode}
                onChange={(e) => setClassForm({ ...classForm, classCode: e.target.value })}
                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Curso Vinculado</label>
              <select
                required
                value={classForm.courseId}
                onChange={(e) => setClassForm({ ...classForm, courseId: e.target.value })}
                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl"
              >
                <option value="">Selecione o curso...</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            {/* SELETOR INTERATIVO DE MÚLTIPLAS EMPRESAS (TURMA MISTA) */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Empresas Parceiras (Selecione uma ou mais empresas para Turmas Mistas / Aprendizes)</span>
                {classForm.companyIds.length > 1 && (
                  <span className="bg-purple-100 text-purple-800 border border-purple-200 px-2 py-0.5 rounded-full text-[10px] font-extrabold">
                    Turma Mista ({classForm.companyIds.length} empresas)
                  </span>
                )}
              </label>

              <div className="flex flex-wrap gap-2 p-3 bg-white border border-slate-200 rounded-xl max-h-36 overflow-y-auto">
                {companies.map((comp) => {
                  const isSelected = classForm.companyIds.includes(comp.id);
                  return (
                    <button
                      key={comp.id}
                      type="button"
                      onClick={() => {
                        setClassForm((prev) => ({
                          ...prev,
                          companyIds: isSelected
                            ? prev.companyIds.filter((id) => id !== comp.id)
                            : [...prev.companyIds, comp.id]
                        }));
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>{comp.name}</span>
                      {isSelected && <span className="text-blue-200 font-extrabold text-[11px]">✓</span>}
                    </button>
                  );
                })}
                {companies.length === 0 && (
                  <span className="text-xs text-slate-400">Nenhuma empresa parceira cadastrada no sistema.</span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Dica: Se nenhuma empresa for marcada, a turma será tratada como <strong>Demanda Regular</strong>.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Data Início do Curso</label>
              <input
                type="date"
                required
                value={classForm.startDate}
                onChange={(e) => {
                  const newStart = e.target.value;
                  setClassForm((prev) => ({
                    ...prev,
                    startDate: newStart,
                    endDate: prev.endDate && prev.endDate < newStart ? '' : prev.endDate,
                  }));
                }}
                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Data Término do Curso</label>
              <input
                type="date"
                required
                min={classForm.startDate}
                disabled={!classForm.startDate}
                value={classForm.endDate}
                onChange={(e) => setClassForm({ ...classForm, endDate: e.target.value })}
                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
            </div>

            <div className="md:col-span-2 flex justify-end pt-2">
              <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer">
                {editingId ? 'Salvar Alterações da Turma' : 'Cadastrar Turma'}
              </button>
            </div>
          </form>

          {/* Listagem de Turmas com Identificação Visual de Turma Mista */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold">
                <tr>
                  <th className="p-3">Turma</th>
                  <th className="p-3">Curso</th>
                  <th className="p-3">Empresas Parceiras</th>
                  <th className="p-3">Período Geral</th>
                  <th className="p-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classes.map((c) => {
                  // Mapeia empresas associadas
                  const partnerList = c.partnerCompanies || (c.companies?.map((cc: any) => cc.company || cc) || []);
                  const isMixed = partnerList.length > 1;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="p-3 font-extrabold text-blue-700">{c.classCode}</td>
                      <td className="p-3 font-semibold text-slate-900">{c.course?.title}</td>
                      <td className="p-3 text-slate-600">
                        {isMixed ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] bg-purple-100 text-purple-800 font-extrabold px-2 py-0.5 rounded-md w-fit">
                              Turma Mista ({partnerList.length})
                            </span>
                            <span className="text-xs font-semibold text-slate-800">
                              {partnerList.map((comp: any) => comp.name).join(' / ')}
                            </span>
                          </div>
                        ) : partnerList.length === 1 ? (
                          <span className="font-semibold text-slate-800">{partnerList[0].name}</span>
                        ) : (
                          <span className="text-slate-400 italic">Demanda Regular</span>
                        )}
                      </td>
                      <td className="p-3 text-slate-600">
                        {new Date(c.startDate).toLocaleDateString('pt-BR')} até {new Date(c.endDate).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingId(c.id);
                            setClassForm({
                              classCode: c.classCode,
                              courseId: String(c.courseId),
                              companyIds: partnerList.map((comp: any) => comp.id),
                              startDate: c.startDate ? c.startDate.split('T')[0] : '',
                              endDate: c.endDate ? c.endDate.split('T')[0] : '',
                            });
                          }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                          title="Editar"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete('classes', c.id, 'Turma')}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};