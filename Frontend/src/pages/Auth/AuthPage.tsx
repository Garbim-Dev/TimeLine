import React, { useState } from 'react';
import { 
  LogIn, 
  UserPlus, 
  KeyRound, 
  BookOpen, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  GraduationCap,
  ShieldCheck
} from 'lucide-react';
import { api } from '../../services/api';

interface AuthPageProps {
  onLoginSuccess: (userData: any) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Campos do formulário
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'aluno' | 'coordenador'>('aluno');
  const [accessKey, setAccessKey] = useState('');
  const [classCode, setClassCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const response = await api.post('/auth/login', { email, password });
        onLoginSuccess(response.data.user);
      } else if (mode === 'register') {
        await api.post('/auth/register', { 
          name, 
          email, 
          password, 
          role,
          accessKey: role === 'coordenador' ? accessKey : undefined,
          classCode: role === 'aluno' ? classCode : undefined 
        });
        setAlert({ 
          type: 'success', 
          text: `Cadastro de ${role} criado com êxito! Faça login para continuar.` 
        });
        setMode('login');
      } else if (mode === 'forgot') {
        await api.post('/auth/forgot-password', { email });
        setAlert({ 
          type: 'success', 
          text: 'Instruções para redefinir sua senha foram enviadas ao seu e-mail.' 
        });
      }
    } catch (err: any) {
      setAlert({
        type: 'error',
        text: err.response?.data?.message || 'Falha ao processar solicitação. Tente novamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        
        {/* Topo Institucional Fundido com a Logo */}
        <div className="relative bg-[#031329] p-8 text-white text-center flex flex-col items-center overflow-hidden border-b border-blue-900/40">
        {/* Luzes de fundo atmosféricas (Glow 3D combinando com a logo) */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-600/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Imagem da Logo com bordas fundidas */}
        <div className="relative z-10 flex justify-center mb-3">
            <img 
            src="/logo.png" 
            alt="Timeline SENAI" 
            className="h-28 sm:h-32 w-auto object-contain [mask-image:radial-gradient(ellipse_at_center,black_70%,transparent_100%)] drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]"
            onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
            }}
            />
        </div>

        <p className="relative z-10 text-xs text-blue-200/80 font-semibold tracking-wider uppercase">
            Centro de Educação Profissional • CEP Parauapebas
        </p>
        </div>
        <div className="p-6 sm:p-8">
          {alert && (
            <div className={`p-3.5 rounded-xl mb-5 text-xs font-semibold flex items-center gap-2 ${
              alert.type === 'success' 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {alert.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{alert.text}</span>
            </div>
          )}

          {/* Abas Entrar / Criar Conta */}
          {mode !== 'forgot' && (
            <div className="flex border-b border-slate-100 mb-6 pb-2 gap-4">
              <button
                type="button"
                onClick={() => { setMode('login'); setAlert(null); }}
                className={`pb-2 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                  mode === 'login' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <LogIn className="w-4 h-4" /> Entrar
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setAlert(null); }}
                className={`pb-2 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                  mode === 'register' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <UserPlus className="w-4 h-4" /> Criar Conta
              </button>
            </div>
          )}

          {/* Cabeçalho de Esqueci a Senha */}
          {mode === 'forgot' && (
            <div className="mb-6 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h2 className="text-base font-bold text-slate-800">Recuperação de Acesso</h2>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {/* Campos de Registro */}
            {mode === 'register' && (
              <>
                {/* Seletor do Tipo de Conta */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Selecione o Tipo de Cadastro
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('aluno')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        role === 'aluno'
                          ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <GraduationCap className="w-4 h-4" /> Sou Aluno
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('coordenador')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        role === 'coordenador'
                          ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4" /> Coordenador
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome completo"
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                {role === 'aluno' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Código da Turma (Opcional)
                    </label>
                    <input
                      type="text"
                      value={classCode}
                      onChange={(e) => setClassCode(e.target.value)}
                      placeholder="Ex: APB/149/02"
                      className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                )}

                {role === 'coordenador' && (
                  <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3">
                    <label className="block text-xs font-bold text-amber-900 mb-1">
                      Código de Autorização da Coordenação
                    </label>
                    <input
                      type="password"
                      required
                      value={accessKey}
                      onChange={(e) => setAccessKey(e.target.value)}
                      placeholder="Informe a chave da gerência CEP"
                      className="w-full text-xs p-2.5 bg-white border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-slate-800"
                    />
                    <span className="text-[10px] text-amber-700 mt-1 block">
                      Padrão de desenvolvimento: <strong>SENAI-CEP-2026</strong>
                    </span>
                  </div>
                )}
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@senaipa.org.br"
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700">Senha</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => { setMode('forgot'); setAlert(null); }}
                      className="text-[11px] text-blue-600 hover:underline font-semibold"
                    >
                      Esqueci a senha
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                'Processando...'
              ) : mode === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" /> Acessar Sistema
                </>
              ) : mode === 'register' ? (
                <>
                  <UserPlus className="w-4 h-4" /> Finalizar Cadastro de {role === 'coordenador' ? 'Coordenador' : 'Aluno'}
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" /> Enviar Link de Recuperação
                </>
              )}
            </button>
          </form>

          <p className="text-[11px] text-center text-slate-400 mt-6">
            Instrutores são cadastrados e vinculados diretamente pela Coordenação de Cursos.
          </p>
        </div>
      </div>
    </div>
  );
};