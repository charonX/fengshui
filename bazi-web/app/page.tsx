import Link from 'next/link';
import { getSessionUser } from '@/lib/auth';

export default async function Home() {
  const user = await getSessionUser();

  return (
    <div className="min-h-screen relative flex flex-col items-center overflow-hidden">
      {/* Decorative Gold Glow */}
      <div className="absolute top-[-10%] left-[50%] -translate-x-1/2 w-[800px] h-[600px] bg-cta opacity-[0.05] blur-[120px] rounded-full pointer-events-none" />

      <main className="container mx-auto px-6 py-20 md:py-32 relative z-10 flex-1 flex flex-col">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto space-y-10 animate-fade-in mt-12 md:mt-24">
          <div className="inline-block">
            <span className="text-xs font-bold tracking-[0.3em] text-cta uppercase border border-cta/30 bg-cta/5 px-4 py-2 rounded-full">
              探索命运的奥秘
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold tracking-tight text-foreground leading-[1.1]">
            洞悉未来<br />
            <span className="text-muted font-normal italic">掌握命运</span>
          </h1>

          <p className="text-lg md:text-xl text-muted font-light max-w-2xl mx-auto leading-relaxed tracking-wide">
            融合千年中华传统命理与前沿人工智能大模型。
            <br className="hidden md:block" />
            深度解析您的四柱八字，洞悉流年大运。
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
            {user ? (
              <Link
                href="/profiles"
                className="btn-primary w-full sm:w-auto min-w-[200px]"
              >
                进入档案管理 →
              </Link>
            ) : (
              <Link
                href="/login"
                className="btn-primary w-full sm:w-auto min-w-[200px]"
              >
                立即开启探索 →
              </Link>
            )}

            <a href="#features" className="btn-secondary w-full sm:w-auto min-w-[200px]">
              了解更多核心功能
            </a>
          </div>
        </div>

        {/* Bento Grid Showcase */}
        <div id="features" className="mt-32 md:mt-48 w-full max-w-7xl mx-auto">
          <div className="mb-16">
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground">
              专业级命理<span className="text-cta">引擎</span>
            </h2>
            <p className="text-muted mt-4 mt-2 max-w-2xl">
              每一行计算都严谨遵循传统经典，每一次排盘都追求极致准确。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6">
            {/* Feature 1 (Large Card) */}
            <div className="glass-card md:col-span-2 md:row-span-2 flex flex-col justify-between group overflow-hidden relative">
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-cta/10 blur-[60px] rounded-full group-hover:bg-cta/20 transition-all duration-700" />
              <div className="z-10 mt-auto md:mt-0 lg:pt-12 lg:pl-6 pb-6">
                <div className="text-cta font-mono text-sm tracking-widest mb-4">01 // PRECISE</div>
                <h3 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mb-4">极度精准排盘</h3>
                <p className="text-muted leading-relaxed max-w-md">
                  精确计算天干地支，支持真太阳时经纬度校正，提供最专业的四柱八字、十神、神煞、大运流年体系，误差近乎为零。
                </p>
              </div>
            </div>

            {/* Feature 2 (Square Card) */}
            <div className="glass-card flex flex-col justify-end group">
              <div className="text-cta font-mono text-sm tracking-widest mb-4">02 // AI</div>
              <h3 className="text-2xl font-serif font-semibold text-foreground mb-2">智能深度解析</h3>
              <p className="text-muted text-sm leading-relaxed">
                搭载前沿命理大语言模型，自动分析五行喜忌、性格特征与事业天赋。
              </p>
            </div>

            {/* Feature 3 (Square Card) */}
            <div className="glass-card flex flex-col justify-end group">
              <div className="text-cta font-mono text-sm tracking-widest mb-4">03 // FORECAST</div>
              <h3 className="text-2xl font-serif font-semibold text-foreground mb-2">流年运势推演</h3>
              <p className="text-muted text-sm leading-relaxed">
                结合个人大运与流年变化，提前预知人生起伏机会与潜在挑战。
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full py-8 text-center border-t border-white/5 mt-20 relative z-10 bg-primary/20 backdrop-blur-lg">
        <p className="text-muted text-sm font-light">
          © {new Date().getFullYear()} 玄学智能代理. 探索未知，敬畏自然。
        </p>
      </footer>
    </div>
  );
}
