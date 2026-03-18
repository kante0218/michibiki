export default function CTA() {
  return (
    <section className="py-24 bg-slate-900 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6">
          あなたのキャリアを、
          <br />
          <span className="gradient-text">次のステージへ</span>
        </h2>
        <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
          Michibikiに登録して、AIがあなたに最適な仕事を見つけるのを体験してください。
          登録は無料、わずか5分で完了します。
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 rounded-xl text-lg font-medium transition-all hover:shadow-xl hover:shadow-indigo-500/25">
            無料で登録する
          </button>
          <button className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-10 py-4 rounded-xl text-lg font-medium transition-all">
            企業として登録する
          </button>
        </div>

        <p className="text-gray-600 text-sm mt-6">
          クレジットカード不要 ・ 即日利用可能 ・ いつでも退会可能
        </p>
      </div>
    </section>
  );
}
