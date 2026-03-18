const jobs = [
  {
    title: "ソフトウェアエンジニア",
    category: "エンジニアリング",
    rate: "¥7,000〜¥13,000/時",
    tags: ["React", "TypeScript", "Node.js"],
    color: "from-blue-500 to-cyan-400",
    openings: 23,
  },
  {
    title: "機械学習エンジニア",
    category: "AI・データサイエンス",
    rate: "¥8,000〜¥15,000/時",
    tags: ["Python", "PyTorch", "LLM"],
    color: "from-purple-500 to-pink-400",
    openings: 15,
  },
  {
    title: "プロダクトマネージャー",
    category: "プロダクト",
    rate: "¥6,000〜¥12,000/時",
    tags: ["SaaS", "アジャイル", "戦略"],
    color: "from-amber-500 to-orange-400",
    openings: 8,
  },
  {
    title: "サイバーセキュリティエンジニア",
    category: "セキュリティ",
    rate: "¥8,000〜¥14,000/時",
    tags: ["ペネトレーション", "SOC", "GRC"],
    color: "from-red-500 to-rose-400",
    openings: 6,
  },
  {
    title: "研究員（PhD）",
    category: "リサーチ",
    rate: "¥6,000〜¥10,000/時",
    tags: ["物理", "生物", "化学", "工学"],
    color: "from-emerald-500 to-teal-400",
    openings: 12,
  },
  {
    title: "UIデザイナー",
    category: "デザイン",
    rate: "¥5,000〜¥10,000/時",
    tags: ["Figma", "デザインシステム", "UXリサーチ"],
    color: "from-fuchsia-500 to-violet-400",
    openings: 10,
  },
];

export default function Jobs() {
  return (
    <section id="jobs" className="py-24 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-indigo-400 text-sm font-medium tracking-wider uppercase">
            Open Roles
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3 mb-4">
            今すぐ応募できる求人
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            すべてリモートワーク対応。あなたのスキルに最適なポジションを見つけましょう。
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div
              key={job.title}
              className="group bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden hover:border-indigo-500/30 transition-all duration-300"
            >
              <div className={`h-1 bg-gradient-to-r ${job.color}`} />
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full">
                    {job.category}
                  </span>
                  <span className="text-xs text-green-400">
                    {job.openings}件の募集
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {job.title}
                </h3>
                <p className="text-indigo-400 font-medium text-sm mb-4">
                  {job.rate}
                </p>
                <div className="flex flex-wrap gap-2 mb-5">
                  {job.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs text-gray-400 bg-white/5 px-2.5 py-1 rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <button className="w-full bg-white/5 hover:bg-indigo-600 text-gray-300 hover:text-white py-2.5 rounded-xl text-sm font-medium transition-all duration-300">
                  詳細を見る
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8 py-3 rounded-xl text-sm font-medium transition-all">
            すべての求人を見る →
          </button>
        </div>
      </div>
    </section>
  );
}
