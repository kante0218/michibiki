export default function Enterprise() {
  return (
    <section id="enterprise" className="py-24 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-indigo-400 text-sm font-medium tracking-wider uppercase">
              Enterprise
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-3 mb-6">
              企業の採用を、
              <br />
              AIで根本から変える
            </h2>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Michibikiエンタープライズは、採用プロセスのあらゆる段階をAIで最適化。
              書類選考の自動化から、カルチャーフィットの予測、オンボーディングの効率化まで、
              採用に関わるすべてのコストと時間を劇的に削減します。
            </p>

            <div className="space-y-4 mb-8">
              {[
                { metric: "採用コスト", value: "60%削減", desc: "従来のエージェント手数料と比較" },
                { metric: "採用期間", value: "平均5日", desc: "マッチングから契約完了まで" },
                { metric: "定着率", value: "94%", desc: "6ヶ月後の継続率" },
              ].map((item) => (
                <div
                  key={item.metric}
                  className="flex items-center gap-4 bg-white/[0.03] border border-white/[0.06] rounded-xl p-4"
                >
                  <div className="text-2xl font-bold text-indigo-400 min-w-[100px]">
                    {item.value}
                  </div>
                  <div>
                    <div className="text-white text-sm font-medium">
                      {item.metric}
                    </div>
                    <div className="text-gray-500 text-xs">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-indigo-500/25">
              企業向けデモを予約する
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-cyan-500/20 rounded-3xl blur-2xl" />
            <div className="relative bg-white/[0.03] border border-white/[0.06] rounded-3xl p-8">
              <h3 className="text-white font-semibold mb-6">
                エンタープライズ機能
              </h3>
              <div className="space-y-4">
                {[
                  "AIによる候補者スクリーニング自動化",
                  "カルチャーフィット予測スコア",
                  "チーム構成の最適化レコメンド",
                  "リアルタイムパフォーマンスダッシュボード",
                  "専任カスタマーサクセスマネージャー",
                  "SOC2 Type II / ISO 27001 準拠",
                  "日本語完全対応サポート",
                  "カスタムAPI / SSO連携",
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
