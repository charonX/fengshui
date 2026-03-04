import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white dark:from-zinc-900 dark:to-black">
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-zinc-800 dark:text-zinc-100 mb-4">
            八字 AI 命理师
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-8">
            与 AI 朋友聊聊你的人生运势
          </p>
          <div className="flex justify-center">
            <Link
              href="/profiles"
              className="px-8 py-3 bg-amber-600 text-white rounded-full font-medium hover:bg-amber-700 transition-colors"
            >
              进入档案管理
            </Link>
          </div>
        </div>

        {/* Intro Section */}
        <div className="mt-16 text-center max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-100 mb-4">
            什么是八字？
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
            八字，又称四柱，是中国传统的命理学说。它根据一个人出生的年、月、日、时，
            用天干地支表示，共八个字，因此得名"八字"。通过分析这八个字的五行属性和相互关系，
            可以推算出一个人的性格特点、事业运势、健康状况等信息。
          </p>
        </div>
      </main>
    </div>
  );
}
