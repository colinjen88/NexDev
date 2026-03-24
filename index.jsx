import React, { useState, useEffect } from 'react';
import { 
  Search, BookOpen, ListChecks, LayoutPanelLeft, 
  CheckCircle2, ArrowUp, PlayCircle, Map, LayoutDashboard,
  Zap, ArrowLeft, Menu, X, ChevronRight, BookDashed,
  ListOrdered, TextSelect, CheckCircle
} from 'lucide-react';

// --- Mock Data ---
const MOCK_CHAPTERS = [
  { id: 1, title: 'MVP 規劃與產品定位', status: 'completed' },
  { id: 2, title: 'UX/UI 核心設計原則', status: 'completed' },
  { id: 3, title: '技術架構選型：為規模化打底', status: 'in-progress' },
  { id: 4, title: 'AI 協作與高效開發實務', status: 'pending' },
  { id: 5, title: '自動化測試與 CI/CD', status: 'pending' },
];

const MOCK_CHECKLIST = [
  { id: 'c1', text: '確認前後端分離架構或 SSR 需求', done: true },
  { id: 'c2', text: '選擇合適的資料庫 (SQL vs NoSQL)', done: true },
  { id: 'c3', text: '建立 Git Flow 與分支策略', done: false },
  { id: 'c4', text: '設定基礎的環境變數 (Env)', done: false },
  { id: 'c5', text: '規劃 API 規格與錯誤處理機制', done: false },
];

const MOCK_SUMMARY = [
  { title: '1. 前後端分離 vs SSR', content: 'SEO 需求高選 SSR (Next.js)。重度互動 SaaS 選 CSR。不要過度工程化。' },
  { title: '2. 資料庫的抉擇', content: '結構嚴謹選關聯型 (PostgreSQL)。快速迭代初期選 NoSQL (MongoDB)。' },
  { title: '3. 開發流程基礎建設', content: '隔離 Dev/Staging/Prod 環境變數。確立團隊 Git Flow。' },
];

export default function App() {
  const [currentRoute, setCurrentRoute] = useState('home'); 
  const [chapterMode, setChapterMode] = useState('read'); // Changed default to 'read' for better flow
  const [checklist, setChecklist] = useState(MOCK_CHECKLIST);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileChecklistOpen, setIsMobileChecklistOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Desktop sidebar toggle

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleCheck = (id) => {
    setChecklist(checklist.map(item => 
      item.id === id ? { ...item, done: !item.done } : item
    ));
  };

  const progress = Math.round((checklist.filter(c => c.done).length / checklist.length) * 100);

  // --- Shared Components ---

  const TopNav = () => (
    <header className="sticky top-0 z-50 bg-[#F7F5F0]/90 backdrop-blur-md border-b border-[#E6E2D6] px-4 md:px-6 py-3 flex justify-between items-center transition-all">
      <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setCurrentRoute('home')}>
        <div className="w-8 h-8 bg-[#2C363F] text-[#F7F5F0] rounded flex items-center justify-center font-serif font-bold group-hover:bg-[#186F65] transition-colors shadow-sm">W</div>
        <span className="font-serif font-bold text-[#2C363F] text-lg tracking-wider hidden sm:block group-hover:text-[#186F65] transition-colors">WebDev Guide</span>
      </div>
      
      <div className="flex-1 max-w-md mx-4 md:mx-8 hidden sm:block">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C9398] group-focus-within:text-[#186F65] transition-colors" />
          <input 
            type="text" 
            placeholder="搜尋知識點 (Cmd+K)" 
            className="w-full bg-white/50 border border-[#E6E2D6] rounded-md py-1.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#186F65]/50 focus:bg-white transition-all shadow-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button onClick={() => setCurrentRoute('home')} className={`p-2 rounded-md transition-colors ${currentRoute === 'home' ? 'bg-[#E6E2D6] text-[#2C363F]' : 'text-[#8C9398] hover:bg-[#E6E2D6]/50 hover:text-[#2C363F]'}`} aria-label="Home">
          <LayoutDashboard className="w-5 h-5" />
        </button>
        <div className="w-8 h-8 rounded-full bg-[#186F65] text-white flex items-center justify-center text-sm font-medium cursor-pointer shadow-sm hover:ring-2 hover:ring-[#186F65] hover:ring-offset-2 hover:ring-offset-[#F7F5F0] transition-all">
          ME
        </div>
      </div>
    </header>
  );

  const ArticleContent = () => (
    <div className="prose prose-slate prose-lg prose-headings:font-serif prose-a:text-[#186F65] max-w-none text-[#3A4550] leading-loose selection:bg-[#186F65]/20 selection:text-[#186F65]">
      <p className="text-xl mb-8 text-[#2C363F] font-medium leading-relaxed">
        在進入實際程式碼撰寫之前，架構的選擇將決定專案未來的開發效率與維護成本。這不是選擇「最酷」的技術，而是選擇「最適合當下團隊與商業目標」的技術。
      </p>
      
      <h2 id="section-1" className="text-2xl mt-12 mb-6 text-[#2C363F] font-serif border-b-2 border-[#E6E2D6] pb-3 flex items-center gap-3">
        <span className="text-[#186F65] text-xl">01</span> 前後端分離 vs SSR
      </h2>
      <p className="mb-6">如果是重度依賴 SEO 的內容型網站，SSR (Server-Side Rendering) 如 Next.js 是首選。如果是需要高度互動的 SaaS 儀表板，純 CSR (Client-Side Rendering) 搭配 API 可能更為輕量，能大幅減少伺服器負擔並提升客戶端流暢度。</p>
      
      {/* Editorial Callout */}
      <div className="bg-[#FDF8F5] border-l-4 border-[#C24914] p-6 my-10 rounded-r-xl shadow-sm">
        <h4 className="text-[#C24914] font-bold mb-3 flex items-center gap-2 text-lg">
          <span className="text-xl">💡</span> 架構師的實戰提醒
        </h4>
        <p className="text-base text-[#5A646E] m-0 leading-relaxed">
          新手最常犯的錯誤是「過度工程化 (Over-engineering)」。如果你的 MVP 只是個驗證概念的展示頁，使用簡單的靜態生成器 (SSG) 甚至無程式碼工具 (Webflow, Framer) 都能幫你省下數週的時間。記住，提早釋出比完美架構更重要。
        </p>
      </div>

      <h2 id="section-2" className="text-2xl mt-12 mb-6 text-[#2C363F] font-serif border-b-2 border-[#E6E2D6] pb-3 flex items-center gap-3">
        <span className="text-[#186F65] text-xl">02</span> 資料庫的抉擇
      </h2>
      <p className="mb-6">關聯型資料庫 (PostgreSQL, MySQL) 適合結構嚴謹、具備複雜關聯的資料（如金流、訂單系統）。而 NoSQL (MongoDB, Firebase) 則在快速迭代初期，資料結構經常變動時能提供極大的彈性。現代開發中，混合使用也是常見的策略。</p>

      <h2 id="section-3" className="text-2xl mt-12 mb-6 text-[#2C363F] font-serif border-b-2 border-[#E6E2D6] pb-3 flex items-center gap-3">
        <span className="text-[#186F65] text-xl">03</span> 開發流程基礎建設
      </h2>
      <p className="mb-6">環境變數的隔離 (Dev, Staging, Prod) 是資安的第一道防線，絕對不要將密鑰 commit 進程式碼庫。此外，確立團隊的 Git Flow，搭配 GitHub Actions 等自動化工具，能避免未來的合併災難與人工部署錯誤。</p>
      <div className="h-32"></div>
    </div>
  );

  const ChecklistBoard = ({ compact = false }) => (
    <div className="flex flex-col h-full">
      {!compact && (
        <div className="mb-8">
          <h3 className="text-2xl font-serif text-[#2C363F] flex items-center gap-3 mb-2">
            <ListChecks className="text-[#186F65] w-6 h-6" /> 實作檢查清單
          </h3>
          <p className="text-[#5A646E] text-sm">將知識轉化為行動，確保專案每個環節都符合最佳實踐。</p>
        </div>
      )}

      {/* Progress Meta */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-[#5A646E]">完成進度</span>
        <span className="text-sm font-bold text-[#186F65] bg-[#186F65]/10 px-3 py-1 rounded-full">
          {progress}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-[#E6E2D6] rounded-full h-2 mb-6 overflow-hidden shadow-inner">
        <div 
          className="bg-[#186F65] h-2 rounded-full transition-all duration-700 ease-out" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {/* Checklist Items */}
      <div className="space-y-3 flex-1 overflow-y-auto pb-24 md:pb-4 pr-2 custom-scrollbar">
        {checklist.map((item) => (
          <label 
            key={item.id} 
            className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-300 group
              ${item.done 
                ? 'bg-[#F7F5F0]/60 border-transparent opacity-60 hover:opacity-100 grayscale hover:grayscale-0' 
                : 'bg-white border-[#E6E2D6] hover:border-[#186F65]/50 shadow-sm hover:shadow-md hover:-translate-y-0.5'}`}
          >
            <div className="relative flex-shrink-0 mt-0.5">
              <input 
                type="checkbox" 
                className="peer sr-only"
                checked={item.done}
                onChange={() => toggleCheck(item.id)}
              />
              <div className={`w-5 h-5 rounded border-2 transition-all duration-300 flex items-center justify-center
                ${item.done 
                  ? 'bg-[#186F65] border-[#186F65] scale-100' 
                  : 'border-[#D5D0C5] bg-white group-hover:border-[#186F65] peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-[#186F65]'}`}>
                {item.done && <CheckCircle2 className="w-4 h-4 text-white animate-in zoom-in duration-200" />}
              </div>
            </div>
            <span className={`text-sm leading-relaxed transition-all duration-300 ${item.done ? 'text-[#8C9398] line-through' : 'text-[#2C363F] font-medium'}`}>
              {item.text}
            </span>
          </label>
        ))}

        {progress === 100 && (
          <div className="mt-8 p-6 bg-gradient-to-br from-[#186F65]/10 to-[#186F65]/5 border border-[#186F65]/20 rounded-xl text-center animate-in slide-in-from-bottom-4 duration-700 fade-in">
            <div className="w-16 h-16 mx-auto bg-[#186F65] text-white rounded-full flex items-center justify-center mb-4 shadow-lg shadow-[#186F65]/20 animate-bounce">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h4 className="text-[#186F65] font-serif font-bold mb-2 text-xl">本章節實作已完成</h4>
            <p className="text-sm text-[#5A646E] mb-6">太棒了！你的技術架構已經準備就緒，基礎非常穩固。</p>
            <button className="text-sm text-white bg-[#2C363F] px-6 py-2.5 rounded-lg font-medium hover:bg-[#1a2026] transition-all shadow-md hover:shadow-lg w-full">
              繼續前往下一章節
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // --- Views ---

  const HomeView = () => (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-in fade-in duration-500">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Left Column: Hero & Modes (Span 8) */}
        <div className="lg:col-span-8 flex flex-col gap-8 lg:gap-12">
          
          {/* Hero Section */}
          <section>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#2C363F] mb-4 leading-tight">歡迎回到知識工作台</h1>
            <p className="text-[#5A646E] text-lg lg:text-xl">今日目標：鞏固技術底層架構，為未來的規模化開發打好地基。</p>
          </section>
          
          {/* Continue Reading Card - Highlighted */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-[#C24914]" />
              <h2 className="text-lg font-serif font-bold text-[#2C363F]">接續學習</h2>
            </div>
            <div 
              className="relative overflow-hidden bg-white border border-[#E6E2D6] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between shadow-sm hover:shadow-xl hover:border-[#186F65]/40 transition-all duration-500 cursor-pointer group"
              onClick={() => {
                setCurrentRoute('chapter');
                setChapterMode('read'); // Enter read mode logically first
              }}
            >
              {/* Decorative background element */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#186F65]/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/3 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

              <div className="flex items-center gap-6 mb-6 sm:mb-0 relative z-10">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center flex-shrink-0 bg-[#F7F5F0] rounded-full shadow-inner">
                  <svg className="w-full h-full transform -rotate-90 p-1" viewBox="0 0 36 36">
                    <path className="text-[#E6E2D6]" strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path className="text-[#186F65] transition-all duration-1000 ease-out" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${progress}, 100`} stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <span className="absolute text-sm sm:text-base font-bold text-[#186F65]">{progress}%</span>
                </div>
                <div>
                  <div className="text-xs sm:text-sm text-[#186F65] font-bold mb-1.5 tracking-widest uppercase">Chapter 3</div>
                  <h3 className="text-xl sm:text-2xl font-serif text-[#2C363F] group-hover:text-[#186F65] transition-colors mb-2">技術架構選型：為規模化打底</h3>
                  <div className="flex items-center gap-3 text-sm text-[#5A646E]">
                    <span className="flex items-center gap-1"><BookDashed className="w-4 h-4"/> 閱讀中</span>
                    <span className="w-1 h-1 rounded-full bg-[#D5D0C5]"></span>
                    <span>已完成 {checklist.filter(c => c.done).length}/{checklist.length} 項實作</span>
                  </div>
                </div>
              </div>
              
              <button className="relative z-10 flex items-center justify-center gap-2 bg-[#2C363F] text-white px-6 py-3 rounded-xl font-medium group-hover:bg-[#186F65] transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-[#186F65] w-full sm:w-auto shadow-md">
                進入工作台 <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </section>

          {/* Modes Introduction */}
          <section>
             <div className="flex items-center gap-2 mb-4">
              <TextSelect className="w-5 h-5 text-[#C24914]" />
              <h2 className="text-lg font-serif font-bold text-[#2C363F]">學習模式探索</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              {[
                { icon: BookOpen, title: '完整指南', desc: '深度閱讀，掌握底層邏輯與系統思考。', color: 'text-[#186F65]', bg: 'bg-[#186F65]/10' },
                { icon: Zap, title: '速讀大綱', desc: '3 分鐘抓取重點，適合碎片時間複習。', color: 'text-[#C24914]', bg: 'bg-[#C24914]/10' },
                { icon: LayoutPanelLeft, title: '對照實作', desc: '左看教學右打勾，最高效的實作體驗。', color: 'text-[#2C363F]', bg: 'bg-[#2C363F]/10' }
              ].map((mode, i) => (
                <div key={i} className="bg-white border border-[#E6E2D6] rounded-xl p-6 hover:border-[#186F65]/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-start cursor-default">
                  <div className={`p-3 rounded-xl mb-4 ${mode.bg} ${mode.color}`}>
                    <mode.icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-serif font-bold text-[#2C363F] mb-2">{mode.title}</h4>
                  <p className="text-[#5A646E] text-sm leading-relaxed">{mode.desc}</p>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Right Column: Vertical Roadmap (Span 4) */}
        <div className="lg:col-span-4 lg:border-l lg:border-[#E6E2D6] lg:pl-10">
          <div className="sticky top-24">
            <h2 className="text-xl font-serif text-[#2C363F] mb-8 flex items-center gap-2">
              <Map className="w-5 h-5 text-[#8C9398]" /> 學習路線地圖
            </h2>
            
            <div className="relative border-l-2 border-[#E6E2D6] ml-4 space-y-8 pb-4">
              {MOCK_CHAPTERS.map((node, i) => (
                <div key={node.id} className="relative pl-8 group">
                  {/* Timeline Node */}
                  <div className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full flex items-center justify-center border-4 border-[#F7F5F0] transition-colors duration-300
                    ${node.status === 'completed' ? 'bg-[#186F65] text-white' : 
                      node.status === 'in-progress' ? 'bg-white border-[#186F65] text-[#186F65] shadow-[0_0_0_4px_rgba(24,111,101,0.1)]' : 
                      'bg-[#E6E2D6] text-[#8C9398]'}`}>
                    {node.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-xs font-bold">{node.id}</span>}
                  </div>
                  
                  {/* Content */}
                  <div>
                    <h4 className={`text-base mb-1 transition-colors ${node.status === 'completed' ? 'text-[#2C363F] font-medium' : node.status === 'in-progress' ? 'text-[#186F65] font-bold text-lg' : 'text-[#8C9398]'}`}>
                      {node.title}
                    </h4>
                    {node.status === 'in-progress' && (
                      <p className="text-sm text-[#5A646E]">目前進度 {progress}%，繼續努力！</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );

  const ChapterWorkspace = () => {
    const modes = [
      { id: 'read', icon: BookOpen, label: '閱讀指南', hiddenMobile: false },
      { id: 'summary', icon: Zap, label: '重點速讀', hiddenMobile: false },
      { id: 'checklist', icon: ListChecks, label: '實作清單', hiddenMobile: false },
      { id: 'compare', icon: LayoutPanelLeft, label: '雙欄對照', hiddenMobile: true }, 
    ];

    useEffect(() => {
      const checkMobile = () => {
        if (window.innerWidth < 1024 && chapterMode === 'compare') {
          setChapterMode('read');
        }
      };
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }, [chapterMode]);

    return (
      <div className="flex h-[calc(100vh-61px)] sm:h-[calc(100vh-65px)] bg-[#F7F5F0] overflow-hidden">
        
        {/* Left Sidebar (Book TOC) - Desktop Only */}
        <aside className={`hidden md:flex flex-col w-72 bg-white border-r border-[#E6E2D6] transition-all duration-300 flex-shrink-0 z-20 ${isSidebarOpen ? 'translate-x-0' : '-ml-72'}`}>
          <div className="p-6 border-b border-[#E6E2D6] flex justify-between items-center">
            <h3 className="font-serif font-bold text-[#2C363F] text-lg">全書目錄</h3>
            <button onClick={() => setIsSidebarOpen(false)} className="text-[#8C9398] hover:text-[#2C363F]">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-1">
            {MOCK_CHAPTERS.map(ch => (
              <button 
                key={ch.id}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-start gap-3
                  ${ch.status === 'in-progress' ? 'bg-[#186F65]/10 text-[#186F65]' : 'text-[#5A646E] hover:bg-[#F7F5F0] hover:text-[#2C363F]'}`}
              >
                <span className="mt-0.5 opacity-60 text-xs">{ch.id.toString().padStart(2, '0')}</span>
                <span className="leading-snug">{ch.title}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Main Workspace Area */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          
          {/* Workspace Header */}
          <div className="bg-white/80 backdrop-blur-sm border-b border-[#E6E2D6] px-4 md:px-6 py-3 flex items-center justify-between z-10 flex-shrink-0">
            <div className="flex items-center gap-3">
              {/* Sidebar Toggle */}
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                className={`hidden md:flex p-1.5 rounded-md hover:bg-[#F7F5F0] transition-colors ${isSidebarOpen ? 'text-[#8C9398]' : 'text-[#2C363F]'}`}
                title="切換目錄"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <button onClick={() => setCurrentRoute('home')} className="p-1.5 -ml-1.5 rounded text-[#8C9398] hover:bg-[#F7F5F0] hover:text-[#2C363F] transition-colors md:hidden">
                <ArrowLeft className="w-5 h-5" />
              </button>
              
              <div className="hidden md:flex items-center text-sm text-[#8C9398] gap-2">
                <span className="cursor-pointer hover:text-[#2C363F] transition-colors" onClick={() => setCurrentRoute('home')}>學習地圖</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-[#2C363F] font-medium bg-[#F7F5F0] px-2 py-0.5 rounded">第 03 章</span>
              </div>
              <h1 className="text-base font-serif text-[#2C363F] font-bold md:hidden truncate max-w-[150px]">第三章：技術架構選型</h1>
            </div>
            
            {/* Segmented Control */}
            <div className="bg-[#E6E2D6]/50 p-1 rounded-lg flex gap-1 border border-[#E6E2D6]">
              {modes.map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setChapterMode(mode.id)}
                  className={`
                    flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-300
                    ${mode.hiddenMobile ? 'hidden lg:flex' : 'flex'}
                    ${chapterMode === mode.id 
                      ? 'bg-white text-[#186F65] shadow-sm border border-[#E6E2D6]/50 translate-y-0' 
                      : 'text-[#5A646E] hover:text-[#2C363F] hover:bg-white/50 border border-transparent'}
                  `}
                >
                  <mode.icon className={`w-4 h-4 ${chapterMode === mode.id ? 'text-[#186F65]' : 'text-[#8C9398]'}`} />
                  <span className="hidden sm:inline">{mode.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Workspace Body Content */}
          <div className="flex-1 overflow-hidden relative flex">
            
            {/* Mode 1: Read Mode (Center Content + Right TOC) */}
            {chapterMode === 'read' && (
              <>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12 lg:p-16 animate-in fade-in zoom-in-95 duration-500">
                  <div className="max-w-2xl mx-auto bg-white p-8 md:p-14 rounded-2xl border border-[#E6E2D6] shadow-sm">
                    <div className="flex items-center gap-3 mb-6 text-[#C24914]">
                      <span className="font-bold text-sm tracking-widest uppercase bg-[#C24914]/10 px-3 py-1 rounded-full">Chapter 03</span>
                      <span className="text-sm font-medium flex items-center gap-1"><BookDashed className="w-4 h-4"/> 閱讀時間約 15 分鐘</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-serif text-[#2C363F] leading-tight mb-8">技術架構選型：<br/>為專案的規模化打底</h1>
                    <ArticleContent />
                  </div>
                </div>
                
                {/* Right Sidebar (Page TOC) - Desktop Only */}
                <aside className="hidden xl:block w-64 p-8 border-l border-[#E6E2D6] bg-[#F7F5F0]/30 overflow-y-auto">
                  <div className="sticky top-0">
                    <h4 className="text-xs font-bold text-[#8C9398] tracking-widest uppercase mb-4">本章段落導航</h4>
                    <ul className="space-y-3 border-l-2 border-[#E6E2D6]">
                      {['01 前後端分離 vs SSR', '02 資料庫的抉擇', '03 開發流程基礎建設'].map((item, idx) => (
                        <li key={idx} className="pl-4">
                          <a href={`#section-${idx+1}`} className={`text-sm transition-colors block leading-snug ${idx === 0 ? 'text-[#186F65] font-bold border-l-2 -ml-[2px] border-[#186F65] pl-[14px]' : 'text-[#5A646E] hover:text-[#2C363F]'}`}>
                            {item}
                          </a>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="mt-12 bg-white border border-[#E6E2D6] rounded-xl p-5 shadow-sm">
                      <h4 className="font-serif font-bold text-[#2C363F] mb-2 text-sm">準備好實作了嗎？</h4>
                      <p className="text-xs text-[#5A646E] mb-4">本章節共有 5 個檢查點等你完成。</p>
                      <button onClick={() => setChapterMode('compare')} className="w-full py-2 bg-[#186F65]/10 text-[#186F65] rounded-lg text-sm font-bold hover:bg-[#186F65] hover:text-white transition-colors">
                        開啟雙欄對照模式
                      </button>
                    </div>
                  </div>
                </aside>
              </>
            )}

            {/* Mode 2: Summary Mode */}
            {chapterMode === 'summary' && (
              <div className="flex-1 overflow-y-auto p-4 md:p-10 animate-in fade-in duration-500 bg-white">
                <div className="w-full max-w-3xl mx-auto py-10">
                  <div className="mb-10 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#C24914]/10 mb-4">
                      <Zap className="w-8 h-8 text-[#C24914]" />
                    </div>
                    <h2 className="text-3xl font-serif text-[#2C363F] mb-3">本章速讀大綱</h2>
                    <p className="text-[#5A646E]">濃縮精華，3 分鐘掌握核心技術觀念</p>
                  </div>
                  <div className="grid gap-6">
                    {MOCK_SUMMARY.map((sum, i) => (
                      <div key={i} className="group bg-white border-l-4 border-l-[#C24914] border border-[#E6E2D6] p-6 md:p-8 rounded-r-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1">
                        <h3 className="text-xl font-serif text-[#2C363F] font-bold mb-3 flex items-center gap-3">
                          <span className="text-[#C24914] opacity-50 text-sm">Point {i+1}</span>
                          {sum.title}
                        </h3>
                        <p className="text-[#3A4550] text-lg leading-relaxed">{sum.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Mode 3: Checklist Mode (Focus View) */}
            {chapterMode === 'checklist' && (
              <div className="flex-1 overflow-y-auto p-4 md:p-10 animate-in fade-in duration-500 bg-[#F7F5F0]">
                <div className="w-full max-w-2xl mx-auto bg-white p-8 md:p-12 rounded-2xl border border-[#E6E2D6] shadow-sm mt-4 lg:mt-10">
                   <ChecklistBoard />
                </div>
              </div>
            )}

            {/* Mode 4: Compare Mode (Desktop Only, Side-by-Side) */}
            {chapterMode === 'compare' && (
              <div className="flex-1 flex w-full animate-in fade-in duration-500">
                {/* Left: Reading */}
                <div className="w-3/5 overflow-y-auto bg-white border-r border-[#E6E2D6] p-8 lg:p-16 custom-scrollbar">
                  <div className="max-w-2xl mx-auto">
                    <div className="text-[#C24914] font-bold text-xs tracking-widest mb-4 uppercase bg-[#C24914]/10 inline-block px-3 py-1 rounded-full">Chapter 03</div>
                    <h1 className="text-3xl lg:text-4xl font-serif text-[#2C363F] leading-tight mb-8">技術架構選型：為規模化打底</h1>
                    <ArticleContent />
                  </div>
                </div>
                {/* Right: Working Board */}
                <div className="w-2/5 bg-[#F7F5F0]/80 overflow-hidden p-6 lg:p-10 shadow-inner flex flex-col">
                  <div className="bg-white rounded-2xl p-6 border border-[#E6E2D6] shadow-sm flex-1 overflow-hidden">
                    <ChecklistBoard compact={true} />
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Mobile Floating Bottom Bar */}
        <div className={`lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#E6E2D6] p-4 flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.08)] transition-transform duration-300 z-40 pb-safe ${chapterMode === 'checklist' ? 'translate-y-full' : 'translate-y-0'}`}>
           <div className="flex items-center gap-4">
             <div className="relative w-12 h-12 flex items-center justify-center bg-[#F7F5F0] rounded-full">
                <svg className="w-full h-full transform -rotate-90 p-0.5" viewBox="0 0 36 36">
                  <path className="text-[#E6E2D6]" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-[#186F65] transition-all duration-500" strokeWidth="4" strokeLinecap="round" strokeDasharray={`${progress}, 100`} stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <span className="absolute text-xs font-bold text-[#186F65]">{progress}%</span>
             </div>
             <div>
               <div className="text-xs text-[#5A646E] mb-0.5">實作進度</div>
               <div className="text-sm font-bold text-[#2C363F]">5 個檢查點</div>
             </div>
           </div>
           <button 
             onClick={() => setIsMobileChecklistOpen(true)}
             className="flex items-center gap-2 bg-[#2C363F] text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-md hover:bg-[#1a2026] transition-colors"
           >
             <ListChecks className="w-4 h-4" /> 開啟清單
           </button>
        </div>

        {/* Mobile Slide-up Checklist Drawer */}
        <div className={`lg:hidden fixed inset-0 z-50 flex flex-col justify-end transition-all duration-300 ${isMobileChecklistOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsMobileChecklistOpen(false)} />
          <div className={`relative bg-[#F7F5F0] h-[80vh] rounded-t-3xl shadow-2xl transition-transform duration-500 delay-75 flex flex-col overflow-hidden ${isMobileChecklistOpen ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="bg-white px-6 pt-4 pb-2 border-b border-[#E6E2D6] rounded-t-3xl flex-shrink-0 relative z-10">
              <div className="w-12 h-1.5 bg-[#E6E2D6] rounded-full mx-auto mb-4" />
              <div className="flex justify-between items-center mb-2">
                 <h3 className="text-lg font-serif font-bold text-[#2C363F] flex items-center gap-2">
                   <ListChecks className="text-[#186F65] w-5 h-5" /> 實作檢查清單
                 </h3>
                 <button onClick={() => setIsMobileChecklistOpen(false)} className="p-2 bg-[#F7F5F0] text-[#8C9398] hover:text-[#2C363F] rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto flex-1 bg-white">
              <ChecklistBoard compact={true} />
            </div>
          </div>
        </div>

      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F7F5F0] font-sans text-[#2C363F] overflow-x-hidden">
      {/* Required Fonts and Custom CSS */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&family=Noto+Serif+TC:wght@500;700&display=swap');
        .font-serif { font-family: 'Noto Serif TC', serif; }
        .font-sans { font-family: 'Noto Sans TC', sans-serif; }
        
        /* Subtle Custom Scrollbar for Workspace */
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #D5D0C5; border-radius: 20px; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        /* Smooth scrolling for anchor links */
        html { scroll-behavior: smooth; }
      `}</style>

      <TopNav />

      <main>
        {currentRoute === 'home' ? <HomeView /> : <ChapterWorkspace />}
      </main>

      {/* Global Back to Top (Desktop Home) */}
      <button 
        onClick={() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          const scrollable = document.querySelector('.overflow-y-auto');
          if(scrollable) scrollable.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className={`hidden lg:flex fixed bottom-8 right-8 p-3.5 rounded-full bg-white border border-[#E6E2D6] text-[#2C363F] shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(24,111,101,0.2)] hover:-translate-y-1 hover:text-[#186F65] hover:border-[#186F65]/30 transition-all duration-300 focus:outline-none z-40
          ${showBackToTop && currentRoute === 'home' ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}
        aria-label="返回頂部"
      >
        <ArrowUp className="w-5 h-5" />
      </button>
    </div>
  );
}