import Link from 'next/link';
import { getSessionUser } from '@/lib/auth';

export default async function Home() {
  const user = await getSessionUser();

  return (
    <div className="min-h-screen relative flex flex-col items-center">
      <main className="container mx-auto px-6 py-24 relative z-10 flex-1 flex flex-col items-center justify-center">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto space-y-8 mt-12">
          <div className="inline-block mb-4">
            <span className="text-xs font-bold tracking-[0.2em] text-zinc-400 uppercase">
              探索命运的奥秘
            </span>
          </div>

          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight text-white leading-tight">
            洞悉未来<br />
            <span className="text-zinc-400">掌握命运</span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 font-light max-w-2xl mx-auto leading-relaxed tracking-wide">
            融合千年中华传统命理与前沿人工智能。
            <br className="hidden md:block" />
            深度解析你的四柱八字，洞悉流年大运。
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-12">
            {user ? (
              <Link
                href="/profiles"
                className="group relative px-10 py-4 bg-white text-black font-bold text-sm tracking-widest uppercase transition-all hover:bg-zinc-200"
              >
                <span className="relative z-10 flex items-center gap-3">
                  进入档案管理
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="group relative px-10 py-4 bg-white text-black font-bold text-sm tracking-widest uppercase transition-all hover:bg-zinc-200"
              >
                <span className="relative z-10 flex items-center gap-3">
                  立即开启探索
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </Link>
            )}

            <a href="#features" className="text-zinc-400 hover:text-white transition-colors px-6 py-4 font-medium text-sm tracking-widest uppercase">
              了解更多
            </a>
          </div>
        </div>

        {/* Minimalist Info Sections */}
        <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-16 mt-40 w-full max-w-6xl text-left border-t border-zinc-800 pt-20">
          {[
            {
              title: '精准排盘',
              desc: '精确计算天干地支，支持真太阳时校正，提供最专业的四柱八字排盘。',
              num: '01'
            },
            {
              title: '智能解析',
              desc: 'AI 命理大模型深度解读，分析五行喜忌、性格特征与事业潜能。',
              num: '02'
            },
            {
              title: '流年运势',
              desc: '结合个人大运与流年变化，提前预知机会与挑战，把握人生大局。',
              num: '03'
            }
          ].map((feature, i) => (
            <div key={i} className="group flex flex-col items-start transition-opacity hover:opacity-100 opacity-70">
              <div className="text-zinc-400 font-mono text-sm tracking-widest mb-6">{feature.num}</div>
              <h3 className="text-2xl font-semibold tracking-wide text-white mb-4">{feature.title}</h3>
              <p className="text-zinc-400 leading-relax text-sm">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </main>

      <footer className="w-full py-8 text-center border-t border-white/5 mt-auto relative z-10">
        <p className="text-zinc-400 text-sm">
          © {new Date().getFullYear()} 玄学智能代理. 探索未知，敬畏自然。
        </p>
      </footer>
    </div>
  );
}
