const stories = [
  {
    name: "田中 優子",
    role: "フルスタックエンジニア",
    location: "福岡",
    rate: "¥9,500/時",
    quote:
      "地方在住でも、東京以上の報酬で世界的な企業のプロジェクトに参加できています。MichibikiのAIマッチングのおかげで、自分のスキルに最適な案件に出会えました。",
    avatar: "YT",
    color: "from-pink-500 to-rose-400",
  },
  {
    name: "佐藤 健一",
    role: "機械学習リサーチャー",
    location: "京都",
    rate: "¥12,000/時",
    quote:
      "大学の研究と両立しながら、最先端のAIプロジェクトに携われています。アカデミアとビジネスの橋渡しをしてくれるプラットフォームです。",
    avatar: "KS",
    color: "from-blue-500 to-indigo-400",
  },
  {
    name: "山本 真理",
    role: "プロダクトデザイナー",
    location: "札幌",
    rate: "¥8,000/時",
    quote:
      "子育てをしながら、フレキシブルにハイレベルな仕事ができる環境を見つけられました。AIが私の強みを理解してくれるので、ミスマッチがありません。",
    avatar: "MY",
    color: "from-emerald-500 to-teal-400",
  },
];

export default function TalentStories() {
  return (
    <section id="talent" className="py-24 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-indigo-400 text-sm font-medium tracking-wider uppercase">
            Talent Stories
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3 mb-4">
            Michibikiで活躍する人たち
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            全国から集まった優秀な人材が、自分らしい働き方で成果を出しています。
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {stories.map((story) => (
            <div
              key={story.name}
              className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:border-indigo-500/30 transition-all duration-300"
            >
              <div className="flex items-center gap-4 mb-5">
                <div
                  className={`w-12 h-12 rounded-full bg-gradient-to-br ${story.color} flex items-center justify-center text-white font-bold text-sm`}
                >
                  {story.avatar}
                </div>
                <div>
                  <h3 className="text-white font-semibold">{story.name}</h3>
                  <p className="text-gray-500 text-sm">{story.role}</p>
                </div>
              </div>

              <p className="text-gray-400 text-sm leading-relaxed mb-5 italic">
                &ldquo;{story.quote}&rdquo;
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <span className="text-gray-500 text-xs flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {story.location}
                </span>
                <span className="text-indigo-400 text-sm font-medium">
                  {story.rate}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
