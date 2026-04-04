// 高専生・大学院生特化 面接カテゴリ定数
// Landing page (page.tsx), Interview selection (interview/page.tsx), Home (home/page.tsx) で共有

export type InterviewCategory = {
  title: string;
  category: string;
  description: string;
};

export type InterviewGroup = {
  group: string;
  categories: InterviewCategory[];
};

export const interviewGroups: InterviewGroup[] = [
  {
    group: "高専・工学系",
    categories: [
      { title: "機械工学", category: "mechanical_engineering", description: "材料力学、機械設計、熱力学、流体力学の知識と実践力を評価する面接です。" },
      { title: "電気電子工学", category: "electrical_engineering", description: "回路設計、電子デバイス、制御工学、パワーエレクトロニクスの面接です。" },
      { title: "情報工学", category: "computer_science", description: "プログラミング、アルゴリズム、ネットワーク、データベースの技術面接です。" },
      { title: "物質・化学工学", category: "chemical_engineering", description: "有機化学、無機化学、化学プロセス、材料工学の知識を評価する面接です。" },
      { title: "建築・土木工学", category: "civil_engineering", description: "構造力学、都市計画、建築設計、環境工学の専門面接です。" },
      { title: "生物工学", category: "bioengineering", description: "バイオテクノロジー、遺伝子工学、生化学の知識を評価する面接です。" },
    ],
  },
  {
    group: "大学院・研究系",
    categories: [
      { title: "研究プレゼンテーション", category: "research_presentation", description: "研究内容を分かりやすく説明し、質疑応答に対応する力を評価します。" },
      { title: "論文ディスカッション", category: "thesis_discussion", description: "修士論文・博士論文の内容について深く議論し、研究の妥当性を評価します。" },
      { title: "学会発表シミュレーション", category: "conference_presentation", description: "学会発表を想定した発表と質疑応答の実践力を評価する面接です。" },
      { title: "研究計画策定", category: "research_planning", description: "新しい研究テーマの設定、実験計画、スケジュール策定能力を評価します。" },
    ],
  },
  {
    group: "情報・IT系",
    categories: [
      { title: "プログラミング", category: "programming", description: "コーディング実技、設計力、デバッグ能力を総合的に評価する面接です。" },
      { title: "データサイエンス", category: "data_science", description: "統計分析、機械学習、データ可視化の実践力を評価する面接です。" },
      { title: "AI・機械学習", category: "ai_ml", description: "深層学習、自然言語処理、コンピュータビジョンの知識と応用力を評価します。" },
      { title: "Web開発", category: "web_development", description: "フロントエンド、バックエンド、API設計の総合的な開発力を評価します。" },
    ],
  },
  {
    group: "ものづくり・設計",
    categories: [
      { title: "CAD・機械設計", category: "cad_design", description: "3D CAD、製図、機械設計の実務スキルを評価する面接です。" },
      { title: "電子回路設計", category: "circuit_design", description: "アナログ・デジタル回路設計、基板設計、シミュレーション技術の面接です。" },
      { title: "製造プロセス", category: "manufacturing", description: "加工技術、品質管理、生産工学の知識を評価する面接です。" },
    ],
  },
  {
    group: "基礎力・ポテンシャル",
    categories: [
      { title: "論理的思考力", category: "logical_thinking", description: "問題分析、仮説構築、論理的な問題解決能力を評価する面接です。" },
      { title: "コミュニケーション力", category: "communication", description: "プレゼンテーション、質疑応答、チーム内コミュニケーション力を評価します。" },
      { title: "チームワーク・リーダーシップ", category: "teamwork_leadership", description: "チームでの協働経験、リーダーシップ、プロジェクト推進力を評価します。" },
    ],
  },
  {
    group: "業界別適性",
    categories: [
      { title: "メーカー適性", category: "manufacturer_fit", description: "製造業で求められる技術力、品質意識、改善提案力を評価する面接です。" },
      { title: "IT企業適性", category: "it_company_fit", description: "IT業界で求められる技術力、学習意欲、問題解決力を評価する面接です。" },
      { title: "インフラ・公共適性", category: "infrastructure_fit", description: "社会インフラ・公共事業に必要な技術力と社会貢献意識を評価します。" },
    ],
  },
];

// フラットなカテゴリリスト
export const allCategories = interviewGroups.flatMap((g) => g.categories);

// カテゴリIDからタイトルを取得
export function getCategoryTitle(category: string): string {
  return allCategories.find((c) => c.category === category)?.title ?? category;
}

// カテゴリIDが存在するか
export function isValidCategory(category: string): boolean {
  return allCategories.some((c) => c.category === category);
}
