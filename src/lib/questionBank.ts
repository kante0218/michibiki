// Question Bank - 全カテゴリの問題プール
// 各カテゴリ: 選択問題50問 + 記述問題50問 = 100問
// 毎回ランダムに選択5問+記述5問を出題し、暗記・不正を防止

// 追加問題ファイルのインポート
import { designQuestions, graphicDesignQuestions, videoProductionQuestions, productManagementQuestions, businessConsultingQuestions, salesQuestions, marketingQuestions } from "./questions/design_business";
import { investmentFundQuestions, fintechQuestions, accountingTaxQuestions, nursingCareQuestions, pharmacyQuestions, healthTechQuestions, edtechQuestions, researchAcademiaQuestions } from "./questions/finance_medical_edu";
import { infraDevopsQuestions, securityEngineerQuestions, mobileDevelopmentQuestions } from "./questions/it_extra";
import { influencerSnsQuestions, youtuberStreamerQuestions, contentCreatorQuestions, hrRecruitmentQuestions, accountingFinanceQuestions, legalComplianceQuestions, blockchainWeb3Questions, gameDevelopmentQuestions, dxConsultantQuestions } from "./questions/creator_corporate";
import { softwareEngineeringExtra, dataScienceExtra, aiMlEngineerExtra } from "./questions/existing_expanded_1";
import { financialAnalystExtra, healthcareExtra, educationExtra } from "./questions/existing_expanded_2";

export interface BankQuestion {
  id: string;
  type: "multiple_choice" | "short_answer" | "case_study";
  question: string;
  options?: string[];
  correctAnswer?: string;
  hint: string;
  difficulty: "easy" | "medium" | "hard";
  timeLimit: number;
  points: number;
}

export interface CategoryQuestionBank {
  multipleChoice: BankQuestion[];
  written: BankQuestion[];
}

// ランダムに n 個選ぶユーティリティ（Fisher-Yates）
export function pickRandom<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, n);
}

// 選択問題の選択肢もシャッフル（正解位置を変える）
export function shuffleOptions(q: BankQuestion): BankQuestion {
  if (q.type !== "multiple_choice" || !q.options || !q.correctAnswer) return q;
  const shuffledOpts = [...q.options];
  for (let i = shuffledOpts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledOpts[i], shuffledOpts[j]] = [shuffledOpts[j], shuffledOpts[i]];
  }
  return { ...q, options: shuffledOpts };
}

// 問題バンクから10問を生成
export function generateTestFromBank(category: string): BankQuestion[] | null {
  const bank = questionBank[category];
  if (!bank) return null;

  const mc = pickRandom(bank.multipleChoice, 5).map((q, i) =>
    shuffleOptions({ ...q, id: `mc_${i + 1}` })
  );
  const written = pickRandom(bank.written, 5).map((q, i) => ({
    ...q,
    id: `wr_${i + 1}`,
  }));

  return [...mc, ...written];
}

// 既存バンクと追加問題をマージするヘルパー
function mergeBank(base: CategoryQuestionBank, extra: CategoryQuestionBank): CategoryQuestionBank {
  return {
    multipleChoice: [...base.multipleChoice, ...extra.multipleChoice],
    written: [...base.written, ...extra.written],
  };
}

// ================================================================
// 問題バンク本体
// ================================================================

export const questionBank: Record<string, CategoryQuestionBank> = {
  // ================================================================
  // IT・エンジニアリング
  // ================================================================
  software_engineering: {
    multipleChoice: [
      {
        id: "se_mc_1", type: "multiple_choice",
        question: "時間計算量がO(n log n)のソートアルゴリズムはどれですか？",
        options: ["バブルソート", "マージソート", "挿入ソート", "選択ソート"],
        correctAnswer: "マージソート",
        hint: "分割統治法を用いるアルゴリズムです",
        difficulty: "easy", timeLimit: 60, points: 10,
      },
      {
        id: "se_mc_2", type: "multiple_choice",
        question: "RESTful APIにおいて、リソースの更新に最も適切なHTTPメソッドはどれですか？",
        options: ["GET", "POST", "PUT", "DELETE"],
        correctAnswer: "PUT",
        hint: "冪等性のある更新操作です",
        difficulty: "easy", timeLimit: 60, points: 10,
      },
      {
        id: "se_mc_3", type: "multiple_choice",
        question: "Gitで直前のコミットを修正するコマンドはどれですか？",
        options: ["git revert HEAD", "git commit --amend", "git reset --soft HEAD~1", "git stash"],
        correctAnswer: "git commit --amend",
        hint: "直前のコミットメッセージや内容を変更できます",
        difficulty: "easy", timeLimit: 60, points: 10,
      },
      {
        id: "se_mc_4", type: "multiple_choice",
        question: "SOLID原則の「S」は何を意味しますか？",
        options: ["Single Responsibility Principle", "Substitution Principle", "Separation of Concerns", "State Management Principle"],
        correctAnswer: "Single Responsibility Principle",
        hint: "クラスは一つの責任だけを持つべきという原則です",
        difficulty: "medium", timeLimit: 60, points: 10,
      },
      {
        id: "se_mc_5", type: "multiple_choice",
        question: "マイクロサービスアーキテクチャの主なデメリットはどれですか？",
        options: ["スケーラビリティが低い", "技術スタックの選択が制限される", "分散システムの複雑性が増す", "デプロイ頻度が下がる"],
        correctAnswer: "分散システムの複雑性が増す",
        hint: "サービス間通信やデータ一貫性の管理が課題です",
        difficulty: "medium", timeLimit: 60, points: 10,
      },
      {
        id: "se_mc_6", type: "multiple_choice",
        question: "データベースのACID特性のうち「I」は何を意味しますか？",
        options: ["Integrity", "Isolation", "Idempotency", "Indexing"],
        correctAnswer: "Isolation",
        hint: "トランザクション間の相互干渉に関する特性です",
        difficulty: "medium", timeLimit: 60, points: 10,
      },
      {
        id: "se_mc_7", type: "multiple_choice",
        question: "CIの「Continuous Integration」で最も重要な実践はどれですか？",
        options: ["週次のコードレビュー", "頻繁なメインブランチへの統合とテスト", "手動デプロイの自動化", "ドキュメントの自動生成"],
        correctAnswer: "頻繁なメインブランチへの統合とテスト",
        hint: "統合の頻度と自動テストが鍵です",
        difficulty: "medium", timeLimit: 60, points: 10,
      },
      {
        id: "se_mc_8", type: "multiple_choice",
        question: "TCP/IPモデルのトランスポート層に属するプロトコルはどれですか？",
        options: ["HTTP", "IP", "TCP", "ARP"],
        correctAnswer: "TCP",
        hint: "信頼性のあるデータ転送を保証するプロトコルです",
        difficulty: "medium", timeLimit: 60, points: 10,
      },
      {
        id: "se_mc_9", type: "multiple_choice",
        question: "ハッシュマップの平均的な検索時間計算量はどれですか？",
        options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
        correctAnswer: "O(1)",
        hint: "ハッシュ関数による直接アクセスです",
        difficulty: "easy", timeLimit: 60, points: 10,
      },
      {
        id: "se_mc_10", type: "multiple_choice",
        question: "Observer パターンの主な用途はどれですか？",
        options: ["オブジェクトの生成を抽象化する", "オブジェクト間の1対多の依存関係を定義する", "アルゴリズムを交換可能にする", "複雑なオブジェクトを段階的に構築する"],
        correctAnswer: "オブジェクト間の1対多の依存関係を定義する",
        hint: "イベント駆動プログラミングで頻繁に使われます",
        difficulty: "hard", timeLimit: 60, points: 10,
      },
      {
        id: "se_mc_11", type: "multiple_choice",
        question: "WebSocketとHTTPの主な違いはどれですか？",
        options: ["WebSocketはTCPを使わない", "WebSocketは全二重通信が可能", "HTTPはリアルタイム通信に適している", "WebSocketはステートレスである"],
        correctAnswer: "WebSocketは全二重通信が可能",
        hint: "サーバーからクライアントへのプッシュが可能です",
        difficulty: "hard", timeLimit: 60, points: 10,
      },
      {
        id: "se_mc_12", type: "multiple_choice",
        question: "デッドロックの発生条件に含まれないのはどれですか？",
        options: ["相互排除", "保持と待機", "優先度逆転", "循環待ち"],
        correctAnswer: "優先度逆転",
        hint: "デッドロックの4つの必要条件を思い出してください",
        difficulty: "hard", timeLimit: 60, points: 10,
      },
      {
        id: "se_mc_13", type: "multiple_choice",
        question: "CAP定理で、分散システムが同時に保証できないのはどれですか？",
        options: ["一貫性と可用性とパーティション耐性の全て", "一貫性と可用性のみ", "可用性とパーティション耐性のみ", "一貫性のみ"],
        correctAnswer: "一貫性と可用性とパーティション耐性の全て",
        hint: "3つのうち最大2つしか同時に保証できません",
        difficulty: "hard", timeLimit: 60, points: 10,
      },
      {
        id: "se_mc_14", type: "multiple_choice",
        question: "TypeScriptのunion型「string | number」の変数に対して安全に操作するための手法はどれですか？",
        options: ["型アサーション", "型ガード（typeof）", "any型へのキャスト", "Object.keysの使用"],
        correctAnswer: "型ガード（typeof）",
        hint: "ランタイムで型を絞り込む手法です",
        difficulty: "medium", timeLimit: 60, points: 10,
      },
      {
        id: "se_mc_15", type: "multiple_choice",
        question: "Docker ComposeとKubernetesの主な違いはどれですか？",
        options: ["Composeはコンテナを使わない", "Kubernetesは単一ホスト専用", "Kubernetesはオーケストレーションとスケーリングに優れる", "Composeの方がスケーリングに強い"],
        correctAnswer: "Kubernetesはオーケストレーションとスケーリングに優れる",
        hint: "本番環境での大規模運用を想定しています",
        difficulty: "hard", timeLimit: 60, points: 10,
      },
    ],
    written: [
      {
        id: "se_wr_1", type: "short_answer",
        question: "あなたのチームでは本番環境でメモリリークが発生しています。発見から解決までのアプローチを説明してください。",
        hint: "モニタリング、プロファイリング、原因特定の流れを考えてみましょう",
        difficulty: "medium", timeLimit: 180, points: 10,
      },
      {
        id: "se_wr_2", type: "case_study",
        question: "月間100万ユーザーのECサイトで、決済処理のレスポンスが5秒を超えることが頻発しています。原因の調査方法と改善策を3つ提案してください。",
        hint: "ボトルネックの特定手法と、キャッシュ/非同期処理/DB最適化を検討",
        difficulty: "hard", timeLimit: 240, points: 10,
      },
      {
        id: "se_wr_3", type: "short_answer",
        question: "モノリスからマイクロサービスへの移行を検討しています。どのような基準でサービスを分割しますか？",
        hint: "ビジネスドメイン、チーム構成、データの結合度を考慮",
        difficulty: "hard", timeLimit: 180, points: 10,
      },
      {
        id: "se_wr_4", type: "short_answer",
        question: "コードレビューで最も重視すべきポイントを3つ挙げ、その理由を説明してください。",
        hint: "可読性、セキュリティ、パフォーマンスなど",
        difficulty: "easy", timeLimit: 180, points: 10,
      },
      {
        id: "se_wr_5", type: "case_study",
        question: "新しいWebアプリケーションの技術スタック（フロントエンド・バックエンド・DB・インフラ）を選定してください。選定理由もそれぞれ説明してください。",
        hint: "チームのスキル、スケーラビリティ、保守性を考慮",
        difficulty: "medium", timeLimit: 240, points: 10,
      },
      {
        id: "se_wr_6", type: "short_answer",
        question: "N+1クエリ問題とは何ですか？具体例と解決策を説明してください。",
        hint: "ORMでよく発生するデータベースアクセスの問題です",
        difficulty: "medium", timeLimit: 180, points: 10,
      },
      {
        id: "se_wr_7", type: "case_study",
        question: "チームメンバーが書いたコードにセキュリティ上の問題（SQLインジェクションの脆弱性）を発見しました。どのように対処し、再発を防ぎますか？",
        hint: "即時対応、根本原因分析、仕組みでの防止を考えましょう",
        difficulty: "medium", timeLimit: 240, points: 10,
      },
      {
        id: "se_wr_8", type: "short_answer",
        question: "テスト駆動開発（TDD）のメリットとデメリットをそれぞれ2つ挙げてください。",
        hint: "開発速度、品質、設計への影響を考慮",
        difficulty: "easy", timeLimit: 180, points: 10,
      },
      {
        id: "se_wr_9", type: "case_study",
        question: "APIのバージョニング戦略について、URLパス方式とヘッダー方式のメリット・デメリットを比較してください。あなたならどちらを選びますか？",
        hint: "互換性、クライアントの利便性、キャッシュを考慮",
        difficulty: "hard", timeLimit: 240, points: 10,
      },
      {
        id: "se_wr_10", type: "short_answer",
        question: "非同期処理（async/await）と並行処理（Promise.all）の使い分けを具体的なシナリオで説明してください。",
        hint: "依存関係の有無が判断基準になります",
        difficulty: "medium", timeLimit: 180, points: 10,
      },
    ],
  },

  data_science: {
    multipleChoice: [
      { id: "ds_mc_1", type: "multiple_choice", question: "教師あり学習のアルゴリズムはどれですか？", options: ["K-means", "ランダムフォレスト", "DBSCAN", "主成分分析"], correctAnswer: "ランダムフォレスト", hint: "ラベル付きデータで学習するアルゴリズムです", difficulty: "easy", timeLimit: 60, points: 10 },
      { id: "ds_mc_2", type: "multiple_choice", question: "過学習を防ぐ手法として適切でないのはどれですか？", options: ["ドロップアウト", "データ拡張", "学習率を極端に大きくする", "正則化"], correctAnswer: "学習率を極端に大きくする", hint: "モデルの汎化性能を考えましょう", difficulty: "easy", timeLimit: 60, points: 10 },
      { id: "ds_mc_3", type: "multiple_choice", question: "F1スコアの説明として正しいのはどれですか？", options: ["精度と再現率の算術平均", "精度と再現率の調和平均", "正解率と誤答率の比", "真陽性率のみで計算される指標"], correctAnswer: "精度と再現率の調和平均", hint: "Precision と Recall のバランスを取る指標です", difficulty: "medium", timeLimit: 60, points: 10 },
      { id: "ds_mc_4", type: "multiple_choice", question: "Pandasでデータフレームの欠損値を確認するメソッドはどれですか？", options: ["df.empty()", "df.isnull().sum()", "df.missing()", "df.count_na()"], correctAnswer: "df.isnull().sum()", hint: "各カラムのnull数を集計します", difficulty: "easy", timeLimit: 60, points: 10 },
      { id: "ds_mc_5", type: "multiple_choice", question: "次元削減に使われる手法はどれですか？", options: ["ロジスティック回帰", "t-SNE", "XGBoost", "ナイーブベイズ"], correctAnswer: "t-SNE", hint: "高次元データの可視化に使われます", difficulty: "medium", timeLimit: 60, points: 10 },
      { id: "ds_mc_6", type: "multiple_choice", question: "A/Bテストで統計的有意性を判断するために使う値はどれですか？", options: ["R²値", "p値", "AUC値", "RMSE"], correctAnswer: "p値", hint: "帰無仮説の棄却に使います", difficulty: "medium", timeLimit: 60, points: 10 },
      { id: "ds_mc_7", type: "multiple_choice", question: "勾配降下法で学習率が大きすぎる場合に起こることはどれですか？", options: ["収束が遅くなる", "局所最適解に陥る", "損失が発散する", "過学習が解消される"], correctAnswer: "損失が発散する", hint: "パラメータの更新幅が大きすぎます", difficulty: "medium", timeLimit: 60, points: 10 },
      { id: "ds_mc_8", type: "multiple_choice", question: "バイアスとバリアンスのトレードオフについて正しいのはどれですか？", options: ["バイアスが低いほど常に良いモデル", "バリアンスが低いほど常に良いモデル", "両方を同時に最小化するのは困難", "両者は独立した概念"], correctAnswer: "両方を同時に最小化するのは困難", hint: "モデルの複雑さに関係します", difficulty: "hard", timeLimit: 60, points: 10 },
      { id: "ds_mc_9", type: "multiple_choice", question: "時系列データの定常性を検定する方法はどれですか？", options: ["カイ二乗検定", "ADF検定", "t検定", "ANOVA"], correctAnswer: "ADF検定", hint: "Augmented Dickey-Fullerテストです", difficulty: "hard", timeLimit: 60, points: 10 },
      { id: "ds_mc_10", type: "multiple_choice", question: "特徴量選択でフィルター法に分類されるのはどれですか？", options: ["再帰的特徴量除去", "相関係数によるフィルタリング", "Lasso正則化", "前方選択法"], correctAnswer: "相関係数によるフィルタリング", hint: "モデルに依存しない手法です", difficulty: "medium", timeLimit: 60, points: 10 },
      { id: "ds_mc_11", type: "multiple_choice", question: "交差検証（Cross-Validation）の主な目的はどれですか？", options: ["学習速度の向上", "モデルの汎化性能の推定", "データの前処理", "特徴量の生成"], correctAnswer: "モデルの汎化性能の推定", hint: "過学習の検出に有効です", difficulty: "easy", timeLimit: 60, points: 10 },
      { id: "ds_mc_12", type: "multiple_choice", question: "正規分布の特徴として正しくないのはどれですか？", options: ["平均=中央値=最頻値", "左右対称", "歪度は常に正", "68-95-99.7ルールが適用される"], correctAnswer: "歪度は常に正", hint: "歪度は0です", difficulty: "medium", timeLimit: 60, points: 10 },
      { id: "ds_mc_13", type: "multiple_choice", question: "LightGBMの特徴として正しいのはどれですか？", options: ["深さ優先で木を成長させる", "葉優先で木を成長させる", "ランダムに木を成長させる", "全ての葉を同時に成長させる"], correctAnswer: "葉優先で木を成長させる", hint: "Leaf-wise growthが特徴です", difficulty: "hard", timeLimit: 60, points: 10 },
      { id: "ds_mc_14", type: "multiple_choice", question: "自然言語処理でTF-IDFの「IDF」が表すのはどれですか？", options: ["単語の出現頻度", "逆文書頻度", "情報利得", "相互情報量"], correctAnswer: "逆文書頻度", hint: "珍しい単語ほど重みが大きくなります", difficulty: "medium", timeLimit: 60, points: 10 },
      { id: "ds_mc_15", type: "multiple_choice", question: "混同行列において「偽陰性（FN）」が特に問題になるのはどんな場面ですか？", options: ["スパムメール検出", "医療診断（がん検出）", "商品推薦", "天気予報"], correctAnswer: "医療診断（がん検出）", hint: "見逃しが致命的な場面です", difficulty: "hard", timeLimit: 60, points: 10 },
    ],
    written: [
      { id: "ds_wr_1", type: "short_answer", question: "欠損値の処理方法を3つ挙げ、それぞれどのような場面で使うべきか説明してください。", hint: "削除、補完、モデルベース補完など", difficulty: "easy", timeLimit: 180, points: 10 },
      { id: "ds_wr_2", type: "case_study", question: "ECサイトの離脱率予測モデルを構築します。使用する特徴量を5つ提案し、モデル選定の理由と評価指標を説明してください。", hint: "ユーザー行動データ、購買履歴、セッション情報など", difficulty: "hard", timeLimit: 240, points: 10 },
      { id: "ds_wr_3", type: "short_answer", question: "データの不均衡（imbalanced data）に対処する手法を3つ説明してください。", hint: "サンプリング手法やコスト関数の調整など", difficulty: "medium", timeLimit: 180, points: 10 },
      { id: "ds_wr_4", type: "case_study", question: "小売チェーン店の需要予測システムを設計してください。データ収集から予測モデルの運用までの流れを説明してください。", hint: "ETL、特徴量エンジニアリング、モデル運用を含む", difficulty: "hard", timeLimit: 240, points: 10 },
      { id: "ds_wr_5", type: "short_answer", question: "相関関係と因果関係の違いを具体例を用いて説明してください。", hint: "アイスクリームの売上と溺死事故の関係など", difficulty: "easy", timeLimit: 180, points: 10 },
      { id: "ds_wr_6", type: "short_answer", question: "特徴量エンジニアリングの重要性と、よく使われる手法を3つ説明してください。", hint: "エンコーディング、スケーリング、交互作用特徴量など", difficulty: "medium", timeLimit: 180, points: 10 },
      { id: "ds_wr_7", type: "case_study", question: "機械学習モデルの説明可能性（Explainability）が求められる場面を挙げ、SHAP値やLIMEなどの手法の使い分けを説明してください。", hint: "金融、医療、法律の分野で特に重要です", difficulty: "hard", timeLimit: 240, points: 10 },
      { id: "ds_wr_8", type: "short_answer", question: "A/Bテストの設計手順を説明してください。サンプルサイズの決定方法にも触れてください。", hint: "効果量、有意水準、検出力から算出します", difficulty: "medium", timeLimit: 180, points: 10 },
      { id: "ds_wr_9", type: "short_answer", question: "データパイプラインの品質管理で重要なポイントを4つ挙げてください。", hint: "データの鮮度、完全性、一貫性、正確性など", difficulty: "medium", timeLimit: 180, points: 10 },
      { id: "ds_wr_10", type: "case_study", question: "ある企業のデータ分析チームのリーダーとして、非技術者の経営陣にモデルの結果をどのように説明しますか？具体的な方法を述べてください。", hint: "可視化、ビジネスインパクト、シンプルな言葉", difficulty: "medium", timeLimit: 240, points: 10 },
    ],
  },

  ai_ml_engineer: {
    multipleChoice: [
      { id: "ai_mc_1", type: "multiple_choice", question: "Transformerアーキテクチャの核心メカニズムはどれですか？", options: ["畳み込み", "再帰的結合", "Self-Attention", "プーリング"], correctAnswer: "Self-Attention", hint: "入力系列の全ての位置間の関係を直接計算します", difficulty: "easy", timeLimit: 60, points: 10 },
      { id: "ai_mc_2", type: "multiple_choice", question: "GPTモデルが使用するアーキテクチャはどれですか？", options: ["Encoderのみ", "Decoderのみ", "Encoder-Decoder", "RNN"], correctAnswer: "Decoderのみ", hint: "自己回帰的にテキストを生成します", difficulty: "easy", timeLimit: 60, points: 10 },
      { id: "ai_mc_3", type: "multiple_choice", question: "勾配消失問題を緩和するために導入されたのはどれですか？", options: ["Sigmoid活性化関数", "バッチ正規化とReLU", "全結合層の増加", "学習率の固定"], correctAnswer: "バッチ正規化とReLU", hint: "深いネットワークの学習を安定させます", difficulty: "medium", timeLimit: 60, points: 10 },
      { id: "ai_mc_4", type: "multiple_choice", question: "RAG（Retrieval Augmented Generation）の主な利点はどれですか？", options: ["モデルサイズの削減", "最新の知識を外部から取得できる", "学習時間の短縮", "推論速度の向上"], correctAnswer: "最新の知識を外部から取得できる", hint: "LLMの知識の限界を補完します", difficulty: "medium", timeLimit: 60, points: 10 },
      { id: "ai_mc_5", type: "multiple_choice", question: "LoRA（Low-Rank Adaptation）の目的はどれですか？", options: ["モデルの精度向上", "少ないパラメータで効率的にファインチューニング", "推論速度の高速化", "データ前処理の自動化"], correctAnswer: "少ないパラメータで効率的にファインチューニング", hint: "低ランク行列分解を利用します", difficulty: "hard", timeLimit: 60, points: 10 },
      { id: "ai_mc_6", type: "multiple_choice", question: "CNNで特徴マップのサイズを小さくする操作はどれですか？", options: ["活性化関数", "プーリング", "バッチ正規化", "ドロップアウト"], correctAnswer: "プーリング", hint: "Max PoolingやAverage Poolingがあります", difficulty: "easy", timeLimit: 60, points: 10 },
      { id: "ai_mc_7", type: "multiple_choice", question: "Prompt Engineeringで「Few-shot」とは何を意味しますか？", options: ["プロンプトを少なく与える", "少数の例示をプロンプトに含める", "小さいモデルを使う", "短い回答を生成させる"], correctAnswer: "少数の例示をプロンプトに含める", hint: "In-context learningの一形態です", difficulty: "medium", timeLimit: 60, points: 10 },
      { id: "ai_mc_8", type: "multiple_choice", question: "RLHF（Reinforcement Learning from Human Feedback）の主な目的はどれですか？", options: ["モデルの学習速度向上", "モデルの出力を人間の好みに合わせる", "データ量の削減", "推論コストの削減"], correctAnswer: "モデルの出力を人間の好みに合わせる", hint: "ChatGPTなどの対話モデルの学習に使われます", difficulty: "hard", timeLimit: 60, points: 10 },
      { id: "ai_mc_9", type: "multiple_choice", question: "転移学習の説明として正しいのはどれですか？", options: ["ゼロからモデルを学習する", "事前学習済みモデルを別のタスクに適用する", "データを別のドメインに変換する", "モデルを別のハードウェアに移植する"], correctAnswer: "事前学習済みモデルを別のタスクに適用する", hint: "学習データが少ない場合に有効です", difficulty: "easy", timeLimit: 60, points: 10 },
      { id: "ai_mc_10", type: "multiple_choice", question: "LLMのHallucination（幻覚）を減らす方法はどれですか？", options: ["Temperature を上げる", "検索拡張生成（RAG）を使う", "Max tokens を増やす", "Top-p を1.0にする"], correctAnswer: "検索拡張生成（RAG）を使う", hint: "外部知識ソースでファクトチェックします", difficulty: "medium", timeLimit: 60, points: 10 },
      { id: "ai_mc_11", type: "multiple_choice", question: "GANの構成要素はどれですか？", options: ["Encoder と Decoder", "Generator と Discriminator", "Teacher と Student", "Actor と Critic"], correctAnswer: "Generator と Discriminator", hint: "生成と判別の二つのネットワークが競合します", difficulty: "medium", timeLimit: 60, points: 10 },
      { id: "ai_mc_12", type: "multiple_choice", question: "Attention機構のQuery、Key、Valueのうち、類似度の計算に使われるのはどれですか？", options: ["QueryとKeyのみ", "KeyとValueのみ", "QueryとValueのみ", "3つ全て同時"], correctAnswer: "QueryとKeyのみ", hint: "内積で類似度を計算し、Valueを重み付けします", difficulty: "hard", timeLimit: 60, points: 10 },
      { id: "ai_mc_13", type: "multiple_choice", question: "モデルの量子化（Quantization）の目的はどれですか？", options: ["精度の向上", "メモリ使用量と推論速度の改善", "学習データの拡張", "過学習の防止"], correctAnswer: "メモリ使用量と推論速度の改善", hint: "FP32からINT8などに変換します", difficulty: "hard", timeLimit: 60, points: 10 },
      { id: "ai_mc_14", type: "multiple_choice", question: "Diffusionモデルの学習プロセスで行うことはどれですか？", options: ["ノイズの追加と除去の学習", "敵対的学習", "変分推論", "強化学習"], correctAnswer: "ノイズの追加と除去の学習", hint: "ノイズを段階的に除去して画像を生成します", difficulty: "hard", timeLimit: 60, points: 10 },
      { id: "ai_mc_15", type: "multiple_choice", question: "BERTとGPTの主な違いはどれですか？", options: ["BERTは双方向、GPTは一方向", "BERTの方がパラメータが多い", "GPTは分類タスク専用", "BERTは生成タスク専用"], correctAnswer: "BERTは双方向、GPTは一方向", hint: "文脈の捉え方が異なります", difficulty: "medium", timeLimit: 60, points: 10 },
    ],
    written: [
      { id: "ai_wr_1", type: "short_answer", question: "LLMを使ったチャットボットを開発する際、安全性を確保するための対策を4つ挙げてください。", hint: "プロンプトインジェクション対策、出力フィルタリングなど", difficulty: "medium", timeLimit: 180, points: 10 },
      { id: "ai_wr_2", type: "case_study", question: "社内文書を検索・回答するRAGシステムを設計してください。ベクトルDB選定、チャンク戦略、プロンプト設計について述べてください。", hint: "Embedding、チャンクサイズ、リランキングを考慮", difficulty: "hard", timeLimit: 240, points: 10 },
      { id: "ai_wr_3", type: "short_answer", question: "ファインチューニングとプロンプトエンジニアリングの使い分けの基準を説明してください。", hint: "データ量、コスト、タスクの特性を考慮", difficulty: "medium", timeLimit: 180, points: 10 },
      { id: "ai_wr_4", type: "case_study", question: "画像分類モデルの精度が本番環境で低下しています。考えられる原因と対処法を説明してください。", hint: "データドリフト、分布の変化、前処理の違いなど", difficulty: "hard", timeLimit: 240, points: 10 },
      { id: "ai_wr_5", type: "short_answer", question: "MLOpsの重要性と、モデルの継続的な品質管理に必要な要素を説明してください。", hint: "CI/CD、モニタリング、再学習パイプライン", difficulty: "medium", timeLimit: 180, points: 10 },
      { id: "ai_wr_6", type: "short_answer", question: "Edge AIとクラウドAIの使い分けについて、具体的なユースケースとともに説明してください。", hint: "レイテンシ、プライバシー、コスト、精度のトレードオフ", difficulty: "medium", timeLimit: 180, points: 10 },
      { id: "ai_wr_7", type: "case_study", question: "大規模言語モデルのAPIコストを50%削減する方法を3つ提案してください。品質への影響も述べてください。", hint: "キャッシュ、モデルサイズ、プロンプト最適化", difficulty: "hard", timeLimit: 240, points: 10 },
      { id: "ai_wr_8", type: "short_answer", question: "AI倫理の観点から、顔認識技術の導入で考慮すべきリスクを3つ挙げてください。", hint: "プライバシー、バイアス、同意の問題", difficulty: "easy", timeLimit: 180, points: 10 },
      { id: "ai_wr_9", type: "short_answer", question: "Transformerモデルの推論を高速化する手法を3つ挙げ、それぞれのトレードオフを説明してください。", hint: "量子化、蒸留、KVキャッシュなど", difficulty: "hard", timeLimit: 180, points: 10 },
      { id: "ai_wr_10", type: "case_study", question: "マルチモーダルAI（テキスト+画像）を活用した新しいプロダクトのアイデアを1つ提案し、技術的な実現方法を説明してください。", hint: "CLIP、GPT-4V、Geminiなどの技術を活用", difficulty: "medium", timeLimit: 240, points: 10 },
    ],
  },

  // ================================================================
  // 金融・ファイナンス
  // ================================================================
  financial_analyst: {
    multipleChoice: [
      { id: "fa_mc_1", type: "multiple_choice", question: "DCF法（割引キャッシュフロー法）で使用する割引率は通常何ですか？", options: ["ROE", "WACC", "ROA", "EPS"], correctAnswer: "WACC", hint: "加重平均資本コストです", difficulty: "easy", timeLimit: 60, points: 10 },
      { id: "fa_mc_2", type: "multiple_choice", question: "PER（株価収益率）が高い企業について正しい説明はどれですか？", options: ["収益性が低い", "成長期待が高い", "配当が多い", "負債が少ない"], correctAnswer: "成長期待が高い", hint: "将来の成長を織り込んだ指標です", difficulty: "easy", timeLimit: 60, points: 10 },
      { id: "fa_mc_3", type: "multiple_choice", question: "財務諸表のうち、企業の一定期間のキャッシュの動きを表すのはどれですか？", options: ["貸借対照表", "損益計算書", "キャッシュフロー計算書", "株主資本等変動計算書"], correctAnswer: "キャッシュフロー計算書", hint: "営業・投資・財務の3区分で表示されます", difficulty: "easy", timeLimit: 60, points: 10 },
      { id: "fa_mc_4", type: "multiple_choice", question: "β（ベータ）値が1.5の株式について正しいのはどれですか？", options: ["市場平均より変動が小さい", "市場平均と同じ変動", "市場平均の1.5倍変動する", "無リスク資産と同じ"], correctAnswer: "市場平均の1.5倍変動する", hint: "システマティックリスクの指標です", difficulty: "medium", timeLimit: 60, points: 10 },
      { id: "fa_mc_5", type: "multiple_choice", question: "流動比率の計算式はどれですか？", options: ["固定資産÷流動負債", "流動資産÷流動負債", "当座資産÷流動負債", "総資産÷総負債"], correctAnswer: "流動資産÷流動負債", hint: "短期的な支払い能力を表します", difficulty: "easy", timeLimit: 60, points: 10 },
      { id: "fa_mc_6", type: "multiple_choice", question: "イールドカーブが逆転した場合、一般に何を示唆しますか？", options: ["景気拡大", "インフレ加速", "景気後退の可能性", "金利上昇の継続"], correctAnswer: "景気後退の可能性", hint: "短期金利が長期金利を上回る状態です", difficulty: "hard", timeLimit: 60, points: 10 },
      { id: "fa_mc_7", type: "multiple_choice", question: "EVA（経済的付加価値）がプラスの場合、何を意味しますか？", options: ["赤字である", "資本コストを上回るリターンを生んでいる", "負債が減少している", "配当が増加している"], correctAnswer: "資本コストを上回るリターンを生んでいる", hint: "NOPAT - (投下資本 × WACC)で計算されます", difficulty: "hard", timeLimit: 60, points: 10 },
      { id: "fa_mc_8", type: "multiple_choice", question: "デュレーションが長い債券の特徴はどれですか？", options: ["金利変動の影響が小さい", "金利変動の影響が大きい", "信用リスクが低い", "流動性が高い"], correctAnswer: "金利変動の影響が大きい", hint: "金利感応度の指標です", difficulty: "medium", timeLimit: 60, points: 10 },
      { id: "fa_mc_9", type: "multiple_choice", question: "M&Aにおけるシナジー効果に含まれないのはどれですか？", options: ["コスト削減", "収益拡大", "税務上の恩恵", "競合他社の株価下落"], correctAnswer: "競合他社の株価下落", hint: "統合による企業価値の増加に関するものです", difficulty: "medium", timeLimit: 60, points: 10 },
      { id: "fa_mc_10", type: "multiple_choice", question: "フリーキャッシュフロー（FCF）の計算式として正しいのはどれですか？", options: ["売上高 - 費用", "営業CF - 設備投資", "純利益 + 減価償却費", "総資産 - 総負債"], correctAnswer: "営業CF - 設備投資", hint: "企業が自由に使えるキャッシュフローです", difficulty: "medium", timeLimit: 60, points: 10 },
      { id: "fa_mc_11", type: "multiple_choice", question: "CAPMで期待リターンを計算する際に必要な要素はどれですか？", options: ["ROE、PER、PBR", "無リスク利子率、β、市場リスクプレミアム", "EPS、BPS、配当性向", "売上高、営業利益、純利益"], correctAnswer: "無リスク利子率、β、市場リスクプレミアム", hint: "E(R) = Rf + β(Rm - Rf)", difficulty: "hard", timeLimit: 60, points: 10 },
      { id: "fa_mc_12", type: "multiple_choice", question: "のれん（Goodwill）が計上されるのはどのような場合ですか？", options: ["固定資産を購入した時", "買収価格が純資産の時価を上回った時", "研究開発費を資産計上した時", "株式を発行した時"], correctAnswer: "買収価格が純資産の時価を上回った時", hint: "M&Aに関連する無形資産です", difficulty: "medium", timeLimit: 60, points: 10 },
      { id: "fa_mc_13", type: "multiple_choice", question: "VaR（Value at Risk）は何を測定する指標ですか？", options: ["企業価値", "一定期間における最大損失予想額", "投資収益率", "流動性リスク"], correctAnswer: "一定期間における最大損失予想額", hint: "リスク管理で使われる統計的手法です", difficulty: "hard", timeLimit: 60, points: 10 },
      { id: "fa_mc_14", type: "multiple_choice", question: "ROEを分解するデュポン分析の3つの要素はどれですか？", options: ["売上高利益率×総資産回転率×財務レバレッジ", "成長率×配当性向×PER", "営業利益率×経常利益率×純利益率", "自己資本比率×負債比率×流動比率"], correctAnswer: "売上高利益率×総資産回転率×財務レバレッジ", hint: "ROEの要因分析に使います", difficulty: "hard", timeLimit: 60, points: 10 },
      { id: "fa_mc_15", type: "multiple_choice", question: "ESG投資の「S」は何を意味しますか？", options: ["Strategy", "Social", "Sustainability", "Stakeholder"], correctAnswer: "Social", hint: "環境・社会・ガバナンスの3要素です", difficulty: "easy", timeLimit: 60, points: 10 },
    ],
    written: [
      { id: "fa_wr_1", type: "short_answer", question: "ある企業のPERが業界平均の2倍です。考えられる理由を3つ挙げてください。", hint: "成長期待、利益の質、市場のセンチメントなど", difficulty: "easy", timeLimit: 180, points: 10 },
      { id: "fa_wr_2", type: "case_study", question: "スタートアップ企業のバリュエーションを行う際、DCF法が使いにくい理由と代替手法を提案してください。", hint: "将来CFの予測困難性、マルチプル法、VC法など", difficulty: "hard", timeLimit: 240, points: 10 },
      { id: "fa_wr_3", type: "short_answer", question: "金利上昇が企業業績に与える影響を、プラス面とマイナス面それぞれ説明してください。", hint: "借入コスト、預金金利、通貨への影響を考慮", difficulty: "medium", timeLimit: 180, points: 10 },
      { id: "fa_wr_4", type: "case_study", question: "製造業A社と小売業B社の財務諸表を比較分析する際、特に注目すべき財務指標を5つ挙げ、その理由を説明してください。", hint: "業種特性による指標の重要度の違い", difficulty: "medium", timeLimit: 240, points: 10 },
      { id: "fa_wr_5", type: "short_answer", question: "ポートフォリオの分散投資効果について、相関係数との関係を説明してください。", hint: "相関が低いほど分散効果が高い", difficulty: "medium", timeLimit: 180, points: 10 },
      { id: "fa_wr_6", type: "case_study", question: "クライアントから「この株を買うべきか？」と聞かれました。定量・定性の両面からどのように分析・助言しますか？", hint: "バリュエーション、業界動向、リスク要因を総合的に", difficulty: "hard", timeLimit: 240, points: 10 },
      { id: "fa_wr_7", type: "short_answer", question: "為替リスクのヘッジ手法を3つ挙げ、それぞれのメリット・デメリットを説明してください。", hint: "先物、オプション、自然ヘッジなど", difficulty: "hard", timeLimit: 180, points: 10 },
      { id: "fa_wr_8", type: "short_answer", question: "粉飾決算を見抜くための財務分析のポイントを3つ挙げてください。", hint: "異常な利益率、CFと利益の乖離、在庫の急増など", difficulty: "hard", timeLimit: 180, points: 10 },
      { id: "fa_wr_9", type: "short_answer", question: "ESG投資が企業価値に与える影響を、肯定的・否定的の両面から説明してください。", hint: "長期的なリスク低減 vs 短期的なコスト増", difficulty: "medium", timeLimit: 180, points: 10 },
      { id: "fa_wr_10", type: "case_study", question: "ある企業が新規事業への大型投資（100億円）を検討しています。投資判断に必要な分析フレームワークを説明してください。", hint: "NPV、IRR、感度分析、シナリオ分析を活用", difficulty: "hard", timeLimit: 240, points: 10 },
    ],
  },

  // ================================================================
  // 医療・ヘルスケア
  // ================================================================
  healthcare: {
    multipleChoice: [
      { id: "hc_mc_1", type: "multiple_choice", question: "インフォームド・コンセントの説明として正しいのはどれですか？", options: ["医師が治療法を決定すること", "患者に十分な説明を行い同意を得ること", "保険会社の承認を得ること", "カルテに記録すること"], correctAnswer: "患者に十分な説明を行い同意を得ること", hint: "患者の自己決定権に基づく概念です", difficulty: "easy", timeLimit: 60, points: 10 },
      { id: "hc_mc_2", type: "multiple_choice", question: "バイタルサインに含まれないのはどれですか？", options: ["血圧", "体温", "血液型", "脈拍"], correctAnswer: "血液型", hint: "生命徴候を示す基本的な指標です", difficulty: "easy", timeLimit: 60, points: 10 },
      { id: "hc_mc_3", type: "multiple_choice", question: "EBM（Evidence-Based Medicine）の説明として正しいのはどれですか？", options: ["経験のみに基づく医療", "科学的根拠に基づく医療", "コスト最優先の医療", "患者の希望のみに基づく医療"], correctAnswer: "科学的根拠に基づく医療", hint: "臨床研究のエビデンスを活用します", difficulty: "easy", timeLimit: 60, points: 10 },
      { id: "hc_mc_4", type: "multiple_choice", question: "GCP（Good Clinical Practice）は何に関する基準ですか？", options: ["医薬品の製造管理", "臨床試験の実施基準", "医療機器の安全基準", "病院の運営基準"], correctAnswer: "臨床試験の実施基準", hint: "治験の信頼性と被験者保護のための基準です", difficulty: "medium", timeLimit: 60, points: 10 },
      { id: "hc_mc_5", type: "multiple_choice", question: "トリアージで「赤」タグが意味するのはどれですか？", options: ["軽症", "緊急度が最も高い", "死亡または不可逆的", "搬送保留"], correctAnswer: "緊急度が最も高い", hint: "最優先で治療が必要な状態です", difficulty: "medium", timeLimit: 60, points: 10 },
      { id: "hc_mc_6", type: "multiple_choice", question: "DPC/PDPSとは何の略称ですか？", options: ["医薬品副作用報告制度", "包括評価支払い制度", "診療記録の電子化基準", "医療安全管理体制"], correctAnswer: "包括評価支払い制度", hint: "入院医療費の支払い方式です", difficulty: "medium", timeLimit: 60, points: 10 },
      { id: "hc_mc_7", type: "multiple_choice", question: "医療安全管理で「ヒヤリハット」と「インシデント」の関係はどれですか？", options: ["同じ意味", "ヒヤリハットはインシデントの一部", "インシデントはヒヤリハットの一部", "全く無関係"], correctAnswer: "ヒヤリハットはインシデントの一部", hint: "患者に影響が出なかった事例です", difficulty: "medium", timeLimit: 60, points: 10 },
      { id: "hc_mc_8", type: "multiple_choice", question: "チーム医療の考え方として最も適切なのはどれですか？", options: ["医師がすべて決定する", "各専門職が対等に連携する", "看護師が中心に管理する", "患者は関与しない"], correctAnswer: "各専門職が対等に連携する", hint: "多職種連携が重要です", difficulty: "easy", timeLimit: 60, points: 10 },
      { id: "hc_mc_9", type: "multiple_choice", question: "臨床試験のフェーズIIIで主に行われることはどれですか？", options: ["健常者での安全性試験", "少数患者での用量設定", "大規模な有効性と安全性の検証", "市販後調査"], correctAnswer: "大規模な有効性と安全性の検証", hint: "承認申請のための重要な段階です", difficulty: "hard", timeLimit: 60, points: 10 },
      { id: "hc_mc_10", type: "multiple_choice", question: "個人情報保護法における要配慮個人情報に含まれるのはどれですか？", options: ["氏名", "住所", "病歴", "電話番号"], correctAnswer: "病歴", hint: "不当な差別につながりうる情報です", difficulty: "medium", timeLimit: 60, points: 10 },
      { id: "hc_mc_11", type: "multiple_choice", question: "QOL（Quality of Life）を評価する際に考慮すべき側面はどれですか？", options: ["身体的側面のみ", "経済的側面のみ", "身体的・精神的・社会的側面", "治療コストのみ"], correctAnswer: "身体的・精神的・社会的側面", hint: "WHOの健康の定義に基づきます", difficulty: "easy", timeLimit: 60, points: 10 },
      { id: "hc_mc_12", type: "multiple_choice", question: "医療過誤防止のための「5R」に含まれないのはどれですか？", options: ["Right Patient（正しい患者）", "Right Drug（正しい薬剤）", "Right Revenue（正しい収益）", "Right Dose（正しい用量）"], correctAnswer: "Right Revenue（正しい収益）", hint: "投薬時の安全確認事項です", difficulty: "medium", timeLimit: 60, points: 10 },
      { id: "hc_mc_13", type: "multiple_choice", question: "地域包括ケアシステムの中心的な理念はどれですか？", options: ["大病院への集約", "住み慣れた地域での生活継続", "医療費の削減", "専門医のみによる治療"], correctAnswer: "住み慣れた地域での生活継続", hint: "住まい・医療・介護・予防・生活支援の一体的提供", difficulty: "medium", timeLimit: 60, points: 10 },
      { id: "hc_mc_14", type: "multiple_choice", question: "SBARコミュニケーションの「S」は何を意味しますか？", options: ["Solution", "Situation", "System", "Safety"], correctAnswer: "Situation", hint: "医療者間の簡潔な報告フレームワークです", difficulty: "hard", timeLimit: 60, points: 10 },
      { id: "hc_mc_15", type: "multiple_choice", question: "クリニカルパスの主な目的はどれですか？", options: ["医師の裁量権の拡大", "標準的な治療計画の共有と効率化", "患者の入院期間の延長", "新薬の開発促進"], correctAnswer: "標準的な治療計画の共有と効率化", hint: "医療の質の均一化と効率化を図ります", difficulty: "hard", timeLimit: 60, points: 10 },
    ],
    written: [
      { id: "hc_wr_1", type: "short_answer", question: "患者さんが治療を拒否した場合、医療者としてどのように対応しますか？", hint: "患者の自己決定権の尊重と適切な説明のバランス", difficulty: "easy", timeLimit: 180, points: 10 },
      { id: "hc_wr_2", type: "case_study", question: "80歳の独居高齢者が退院するにあたり、在宅医療の体制をどのように構築しますか？必要な職種と連携方法を説明してください。", hint: "訪問医、訪問看護、ケアマネ、薬剤師など", difficulty: "hard", timeLimit: 240, points: 10 },
      { id: "hc_wr_3", type: "short_answer", question: "医療現場でのバーンアウト（燃え尽き症候群）の予防策を4つ挙げてください。", hint: "ワークライフバランス、サポート体制、業務改善など", difficulty: "medium", timeLimit: 180, points: 10 },
      { id: "hc_wr_4", type: "case_study", question: "新型感染症の院内アウトブレイクが疑われる状況で、初動対応の手順を説明してください。", hint: "隔離、報告、接触者追跡、感染対策委員会", difficulty: "hard", timeLimit: 240, points: 10 },
      { id: "hc_wr_5", type: "short_answer", question: "AIの医療への応用で期待される分野を3つ挙げ、課題もそれぞれ説明してください。", hint: "画像診断、薬剤開発、予後予測など", difficulty: "medium", timeLimit: 180, points: 10 },
      { id: "hc_wr_6", type: "short_answer", question: "終末期医療において、患者の意思決定を支援するACP（アドバンス・ケア・プランニング）の進め方を説明してください。", hint: "価値観の確認、代理意思決定者の選定、定期的な見直し", difficulty: "medium", timeLimit: 180, points: 10 },
      { id: "hc_wr_7", type: "case_study", question: "医療ミスが発生した際の患者・家族への説明方法と、再発防止策の立て方を説明してください。", hint: "真摯な謝罪、原因分析、システム改善", difficulty: "hard", timeLimit: 240, points: 10 },
      { id: "hc_wr_8", type: "short_answer", question: "遠隔医療（テレメディシン）のメリットとデメリットをそれぞれ3つ挙げてください。", hint: "アクセス性、費用、身体診察の限界など", difficulty: "easy", timeLimit: 180, points: 10 },
      { id: "hc_wr_9", type: "short_answer", question: "多職種カンファレンスの効果的な運営方法を説明してください。", hint: "目的の明確化、ファシリテーション、記録と共有", difficulty: "medium", timeLimit: 180, points: 10 },
      { id: "hc_wr_10", type: "case_study", question: "患者中心の医療を実現するために、あなたの専門分野でどのような取り組みができますか？具体例を挙げて説明してください。", hint: "共同意思決定、患者教育、アウトカム重視", difficulty: "medium", timeLimit: 240, points: 10 },
    ],
  },

  // ================================================================
  // 教育・研究
  // ================================================================
  education: {
    multipleChoice: [
      { id: "ed_mc_1", type: "multiple_choice", question: "ブルームの教育目標分類の最上位はどれですか？", options: ["理解", "適用", "分析", "創造"], correctAnswer: "創造", hint: "認知領域の6段階の最上位です", difficulty: "easy", timeLimit: 60, points: 10 },
      { id: "ed_mc_2", type: "multiple_choice", question: "アクティブラーニングの説明として正しいのはどれですか？", options: ["教師中心の一方向の授業", "学生が能動的に学習に参加する手法", "eラーニングの別名", "暗記中心の学習法"], correctAnswer: "学生が能動的に学習に参加する手法", hint: "グループワークやディスカッションを含みます", difficulty: "easy", timeLimit: 60, points: 10 },
      { id: "ed_mc_3", type: "multiple_choice", question: "形成的評価の目的はどれですか？", options: ["成績をつける", "学習の途中で改善のためのフィードバックを与える", "卒業認定を行う", "入学選抜を行う"], correctAnswer: "学習の途中で改善のためのフィードバックを与える", hint: "学習プロセスの改善に焦点を当てます", difficulty: "medium", timeLimit: 60, points: 10 },
      { id: "ed_mc_4", type: "multiple_choice", question: "ヴィゴツキーの「最近接発達領域（ZPD）」の説明として正しいのはどれですか？", options: ["一人でできることの範囲", "支援があればできる範囲", "全くできないことの範囲", "既に習得したことの範囲"], correctAnswer: "支援があればできる範囲", hint: "足場かけ（scaffolding）と関連します", difficulty: "medium", timeLimit: 60, points: 10 },
      { id: "ed_mc_5", type: "multiple_choice", question: "反転授業（Flipped Classroom）の特徴はどれですか？", options: ["教室で講義、自宅で実践", "自宅で講義視聴、教室で実践", "全てオンライン", "全て対面"], correctAnswer: "自宅で講義視聴、教室で実践", hint: "教室の時間をより活用する手法です", difficulty: "easy", timeLimit: 60, points: 10 },
      { id: "ed_mc_6", type: "multiple_choice", question: "ユニバーサルデザイン for ラーニング（UDL）の原則に含まれないのはどれですか？", options: ["多様な表現手段の提供", "多様な行動と表出の手段", "多様な取り組みの手段", "統一されたテスト方法"], correctAnswer: "統一されたテスト方法", hint: "学習者の多様性に対応する設計原則です", difficulty: "hard", timeLimit: 60, points: 10 },
      { id: "ed_mc_7", type: "multiple_choice", question: "ルーブリック評価の主な利点はどれですか？", options: ["採点時間の大幅短縮", "評価基準の透明性と一貫性", "記述問題の廃止", "順位付けの容易さ"], correctAnswer: "評価基準の透明性と一貫性", hint: "明確な基準で公平に評価します", difficulty: "medium", timeLimit: 60, points: 10 },
      { id: "ed_mc_8", type: "multiple_choice", question: "ピアジェの認知発達理論で、抽象的思考が可能になる段階はどれですか？", options: ["感覚運動段階", "前操作段階", "具体的操作段階", "形式的操作段階"], correctAnswer: "形式的操作段階", hint: "11歳頃からの段階です", difficulty: "medium", timeLimit: 60, points: 10 },
      { id: "ed_mc_9", type: "multiple_choice", question: "STEAM教育の「A」は何を意味しますか？", options: ["Algorithm", "Art", "Analysis", "Assessment"], correctAnswer: "Art", hint: "Science, Technology, Engineering, Art, Mathematics", difficulty: "easy", timeLimit: 60, points: 10 },
      { id: "ed_mc_10", type: "multiple_choice", question: "動機づけ理論で「自己決定理論」の3つの基本的欲求に含まれないのはどれですか？", options: ["自律性", "有能感", "関係性", "報酬"], correctAnswer: "報酬", hint: "内発的動機づけに関する理論です", difficulty: "hard", timeLimit: 60, points: 10 },
      { id: "ed_mc_11", type: "multiple_choice", question: "インストラクショナルデザインのADDIEモデルの「D」は何を表しますか？", options: ["Delivery", "Design and Development", "Discussion", "Data"], correctAnswer: "Design and Development", hint: "Analysis, Design, Development, Implementation, Evaluation", difficulty: "medium", timeLimit: 60, points: 10 },
      { id: "ed_mc_12", type: "multiple_choice", question: "協調学習と協同学習の主な違いはどれですか？", options: ["全く同じ概念", "協調学習は役割分担が明確", "協同学習は構造化された手法", "協調学習はオンライン限定"], correctAnswer: "協同学習は構造化された手法", hint: "グループ学習のアプローチの違いです", difficulty: "hard", timeLimit: 60, points: 10 },
      { id: "ed_mc_13", type: "multiple_choice", question: "特別支援教育のインクルージョンの考え方はどれですか？", options: ["障害のある子を別の学校で教育する", "すべての子どもが共に学ぶ環境を整える", "能力別にクラスを分ける", "特別支援学校を増やす"], correctAnswer: "すべての子どもが共に学ぶ環境を整える", hint: "多様性を包含する教育理念です", difficulty: "easy", timeLimit: 60, points: 10 },
      { id: "ed_mc_14", type: "multiple_choice", question: "カークパトリックの研修評価モデルのレベル3は何を測定しますか？", options: ["反応・満足度", "学習成果", "行動変容", "組織への影響"], correctAnswer: "行動変容", hint: "研修後に実務で行動が変わったかを評価します", difficulty: "hard", timeLimit: 60, points: 10 },
      { id: "ed_mc_15", type: "multiple_choice", question: "GIGAスクール構想の主な目的はどれですか？", options: ["プログラミング教育の必修化", "児童生徒1人1台端末と高速通信環境の整備", "教員の給与引き上げ", "大学入試改革"], correctAnswer: "児童生徒1人1台端末と高速通信環境の整備", hint: "ICT環境の整備を目指す国の施策です", difficulty: "easy", timeLimit: 60, points: 10 },
    ],
    written: [
      { id: "ed_wr_1", type: "short_answer", question: "生徒のモチベーションが低下している場合、どのようなアプローチで改善を図りますか？3つの方法を提案してください。", hint: "内発的動機づけ、成功体験、関係性の構築", difficulty: "easy", timeLimit: 180, points: 10 },
      { id: "ed_wr_2", type: "case_study", question: "30人のクラスで学力差が大きい場合、全員の学びを保証するための授業設計を提案してください。", hint: "個別最適化、協調学習、ICT活用", difficulty: "hard", timeLimit: 240, points: 10 },
      { id: "ed_wr_3", type: "short_answer", question: "AI時代に必要な教育のあり方について、あなたの考えを述べてください。", hint: "批判的思考、創造性、人間力", difficulty: "medium", timeLimit: 180, points: 10 },
      { id: "ed_wr_4", type: "case_study", question: "いじめの早期発見と対応について、学校全体での取り組み方を説明してください。", hint: "観察、相談体制、保護者連携、組織的対応", difficulty: "medium", timeLimit: 240, points: 10 },
      { id: "ed_wr_5", type: "short_answer", question: "プロジェクトベース学習（PBL）の設計手順と注意点を説明してください。", hint: "実社会の課題、評価方法、振り返り", difficulty: "medium", timeLimit: 180, points: 10 },
      { id: "ed_wr_6", type: "short_answer", question: "教員のICTスキル向上のための研修プログラムを提案してください。", hint: "段階的なスキルアップ、実践的な内容、フォロー体制", difficulty: "medium", timeLimit: 180, points: 10 },
      { id: "ed_wr_7", type: "case_study", question: "不登校の生徒に対して、学びの機会を保証するためにどのような支援が考えられますか？", hint: "オンライン学習、適応指導教室、家庭訪問", difficulty: "hard", timeLimit: 240, points: 10 },
      { id: "ed_wr_8", type: "short_answer", question: "フィードバックが効果的になるための条件を4つ挙げてください。", hint: "具体的、タイムリー、行動可能、肯定的", difficulty: "easy", timeLimit: 180, points: 10 },
      { id: "ed_wr_9", type: "short_answer", question: "探究学習の指導で教師が果たすべき役割を説明してください。", hint: "ファシリテーター、問いの設計、学習環境の整備", difficulty: "medium", timeLimit: 180, points: 10 },
      { id: "ed_wr_10", type: "case_study", question: "保護者との信頼関係を構築するための具体的な方策を5つ挙げてください。", hint: "コミュニケーション、透明性、共同的な姿勢", difficulty: "easy", timeLimit: 240, points: 10 },
    ],
  },

  // ================================================================
  // デザイン・クリエイティブ
  // ================================================================
  design: designQuestions,
  graphic_design: graphicDesignQuestions,
  video_production: videoProductionQuestions,

  // ================================================================
  // ビジネス・コンサルティング
  // ================================================================
  product_management: productManagementQuestions,
  business_consulting: businessConsultingQuestions,
  sales: salesQuestions,
  marketing: marketingQuestions,

  // ================================================================
  // 金融・ファイナンス（追加）
  // ================================================================
  investment_fund: investmentFundQuestions,
  fintech: fintechQuestions,
  accounting_tax: accountingTaxQuestions,

  // ================================================================
  // 医療・ヘルスケア（追加）
  // ================================================================
  nursing_care: nursingCareQuestions,
  pharmacy: pharmacyQuestions,
  health_tech: healthTechQuestions,

  // ================================================================
  // 教育（追加）
  // ================================================================
  edtech: edtechQuestions,
  research_academia: researchAcademiaQuestions,

  // ================================================================
  // IT・エンジニアリング（追加）
  // ================================================================
  infra_devops: infraDevopsQuestions,
  security_engineer: securityEngineerQuestions,
  mobile_development: mobileDevelopmentQuestions,

  // ================================================================
  // クリエイター・インフルエンサー
  // ================================================================
  influencer_sns: influencerSnsQuestions,
  youtuber_streamer: youtuberStreamerQuestions,
  content_creator: contentCreatorQuestions,

  // ================================================================
  // コーポレート・管理部門
  // ================================================================
  hr_recruitment: hrRecruitmentQuestions,
  accounting_finance: accountingFinanceQuestions,
  legal_compliance: legalComplianceQuestions,

  // ================================================================
  // 新技術・専門
  // ================================================================
  blockchain_web3: blockchainWeb3Questions,
  game_development: gameDevelopmentQuestions,
  dx_consultant: dxConsultantQuestions,
};

// 既存カテゴリに追加問題をマージ
questionBank.software_engineering = mergeBank(questionBank.software_engineering, softwareEngineeringExtra);
questionBank.data_science = mergeBank(questionBank.data_science, dataScienceExtra);
questionBank.ai_ml_engineer = mergeBank(questionBank.ai_ml_engineer, aiMlEngineerExtra);
questionBank.financial_analyst = mergeBank(questionBank.financial_analyst, financialAnalystExtra);
questionBank.healthcare = mergeBank(questionBank.healthcare, healthcareExtra);
questionBank.education = mergeBank(questionBank.education, educationExtra);

// AI生成フォールバック用: バンクがないカテゴリはnullを返す
export function hasQuestionBank(category: string): boolean {
  return category in questionBank;
}
