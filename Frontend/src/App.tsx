import React, { useState } from 'react';
import { AuthPage } from './pages/Auth/AuthPage';
import { TimelineCard } from './components/cards/TimelineCard';
import { CoordinatorPanel, TabMode } from './pages/Coordinator/CoordinatorPanel';
import { StudentPortal } from './pages/Student/StudentPortal';
import { 
  LogOut, 
  UserCheck, 
  ShieldCheck, 
  GraduationCap, 
  Menu, 
  X, 
  LayoutDashboard,
  CalendarPlus,
  Building2,
  Users,
  BookOpen,
  BookMarked,
  MapPin,
  Clock
} from 'lucide-react';

interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: 'coordenador' | 'instrutor' | 'aluno';
  instructorId?: number;
}

export function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Estado da aba ativa para a Coordenação (controlado na Sidebar)
  const [coordinatorTab, setCoordinatorTab] = useState<TabMode>('dashboard');

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <AuthPage onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  // Itens do Menu Lateral para o Coordenador
  const menuItems = [
    { id: 'dashboard' as TabMode, label: '1. Painel da Coordenação', icon: LayoutDashboard },
    { id: 'schedule' as TabMode, label: '2. Cronograma', icon: CalendarPlus },
    { id: 'companies' as TabMode, label: '3. Empresas Parceiras', icon: Building2 },
    { id: 'instructors' as TabMode, label: '4. Instrutores', icon: Users },
    { id: 'courses' as TabMode, label: '5. Cursos', icon: BookOpen },
    { id: 'disciplines' as TabMode, label: '6. Disciplinas', icon: BookMarked },
    { id: 'environments' as TabMode, label: '7. Ambientes', icon: MapPin },
    { id: 'classes' as TabMode, label: '8. Turmas', icon: GraduationCap },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* 1. SIDEBAR LATERAL ESQUERDA */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-white flex flex-col justify-between transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col">
          {/* Topo com Logo e Ícone da Instituição */}
          <div className="p-5 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <img 
                src="/logo.png" 
                alt="SENAI Logo" 
                className="h-10 w-auto object-contain"
                onError={(e) => {
                  // Fallback visual caso a imagem não esteja no diretório correto
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div>
                <h1 className="font-black text-base tracking-tight text-white flex items-center gap-1.5">
                  Timeline
                </h1>
                <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
                  CEP Parauapebas
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Card do Usuário Logado */}
          <div className="px-5 py-4 border-b border-slate-800/80 bg-slate-950/40">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold shrink-0">
                {currentUser.role === 'coordenador' && <ShieldCheck className="w-5 h-5" />}
                {currentUser.role === 'instrutor' && <UserCheck className="w-5 h-5" />}
                {currentUser.role === 'aluno' && <GraduationCap className="w-5 h-5" />}
              </div>
              <div className="overflow-hidden">
                <h3 className="text-xs font-bold text-slate-200 truncate">{currentUser.name}</h3>
                <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider block">
                  Perfil: {currentUser.role}
                </span>
              </div>
            </div>
          </div>

          {/* Menus de Navegação */}
          <nav className="p-3 flex flex-col gap-1 overflow-y-auto max-h-[calc(100vh-230px)]">
            {currentUser.role === 'coordenador' ? (
              <>
                <div className="px-3 py-2 text-[10px] uppercase tracking-wider font-extrabold text-slate-500">
                  Módulos de Gestão
                </div>
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = coordinatorTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCoordinatorTab(item.id);
                        setIsSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                          : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-200'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </>
            ) : (
              <div className="p-2 text-xs text-slate-400">
                Acesso direcionado à sua área de atuação.
              </div>
            )}
          </nav>
        </div>

        {/* Rodapé da Sidebar: Botão Sair */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/20">
          <button
            onClick={handleLogout}
            className="w-full py-2.5 px-3 rounded-xl bg-rose-950/30 text-rose-300 hover:bg-rose-900/50 border border-rose-800/40 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sair do Sistema
          </button>
        </div>
      </aside>

      {/* Overlay mobile */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
        />
      )}

      {/* 2. ÁREA PRINCIPAL (TELA CHEIA RESPONSIVA) */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Barra Superior */}
        <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 md:hidden transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <img 
                src="/icon.png" 
                alt="Icon" 
                className="w-6 h-6 object-contain hidden sm:block" 
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
              <h2 className="text-base sm:text-lg font-black text-slate-800 tracking-tight">
                SENAI CEP Parauapebas
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
            <div className="hidden sm:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/80">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
        </header>

        {/* Conteúdo Fluido */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto w-full">
          {currentUser.role === 'coordenador' && (
            <CoordinatorPanel activeTab={coordinatorTab} setActiveTab={setCoordinatorTab} />
          )}

          {currentUser.role === 'aluno' && <StudentPortal />}

          {currentUser.role === 'instrutor' && (
            <div className="flex flex-col gap-6 max-w-7xl mx-auto">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-sm bg-blue-50 px-3 py-2 rounded-xl border border-blue-100">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <span>{currentUser.name}</span>
                  <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">Docente</span>
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  Grade de aulas e cronograma operacional
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <TimelineCard
                  id={1}
                  classCode="APB/149/02"
                  courseName="Operador de Mina"
                  disciplineName="Topografia Aplicada à Mineração"
                  companyName="Vale - Carajás"
                  startDate="04/09/2026"
                  endDate="17/09/2026"
                  sharepointUrl="https://senaipa.sharepoint.com/sites/apb14902"
                  environmentName="FAMAP"
                  shift="Tarde"
                  status="Em andamento"
                  createdAtFormatted="15/09/2026 8:39"
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;