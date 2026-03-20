"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar, TopBar } from "@/components/ExploreHeader";

// Interview categories organized by industry
const interviewGroups = [
  {
    group: "IT・エンジニアリング",
    categories: [
      {
        title: "ソフトウェアエンジニアリング",
        category: "software_engineering",
        duration: "25分",
        format: ["選択5問", "記述5問", "ビデオ面接"],
        icon: (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        ),
        description: "アルゴリズム、システム設計、コーディング実技を含む総合的な技術面接です。",
      },
      {
        title: "データサイエンス",
        category: "data_science",
        duration: "25分",
        format: ["選択5問", "記述5問", "ビデオ面接"],
        icon: (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        ),
        description: "統計分析、機械学習、データ可視化に関する実践的な面接です。",
      },
      {
        title: "AI・機械学習エンジニア",
        category: "ai_ml_engineer",
        duration: "25分",
        format: ["選択5問", "記述5問", "ビデオ面接"],
        icon: (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
          </svg>
        ),
        description: "深層学習、NLP、LLMの知識と実装力を評価する面接です。",
      },
      {
        title: "インフラ・DevOps",
        category: "infra_devops",
        duration: "25分",
        format: ["選択5問", "記述5問", "ビデオ面接"],
        icon: (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
          </svg>
        ),
        description: "クラウド、CI/CD、コンテナ技術の知識を評価する面接です。",
      },
      {
        title: "セキュリティエンジニア",
        category: "security_engineer",
        duration: "25分",
        format: ["選択5問", "記述5問", "ビデオ面接"],
        icon: (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        ),
        description: "脆弱性分析、ネットワークセキュリティの専門面接です。",
      },
      {
        title: "モバイルアプリ開発",
        category: "mobile_development",
        duration: "25分",
        format: ["選択5問", "記述5問", "ビデオ面接"],
        icon: (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
          </svg>
        ),
        description: "iOS/Android開発、React Native、Flutterの実践面接です。",
      },
    ],
  },
  {
    group: "デザイン・クリエイティブ",
    categories: [
      {
        title: "UI/UXデザイン",
        category: "design",
        duration: "20分",
        format: ["選択5問", "記述5問", "ビデオ面接"],
        icon: (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
        ),
        description: "デザイン思考、ユーザーリサーチ、プロトタイピング力を評価します。",
      },
      {
        title: "グラフィックデザイン",
        category: "graphic_design",
        duration: "20分",
        format: ["選択5問", "記述5問", "ビデオ面接"],
        icon: (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 21h18a1.5 1.5 0 001.5-1.5V4.5A1.5 1.5 0 0021 3H3a1.5 1.5 0 00-1.5 1.5v15A1.5 1.5 0 003 21z" />
          </svg>
        ),
        description: "ビジュアルデザイン、タイポグラフィ、ブランディングの面接です。",
      },
      {
        title: "動画制作・映像",
        category: "video_production",
        duration: "20分",
        format: ["選択5問", "記述5問", "ビデオ面接"],
        icon: (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
          </svg>
        ),
        description: "映像編集、企画力、ストーリーテリングを評価する面接です。",
      },
    ],
  },
  {
    group: "ビジネス・マネジメント",
    categories: [
      {
        title: "プロダクトマネジメント",
        category: "product_management",
        duration: "25分",
        format: ["選択5問", "記述5問", "ビデオ面接"],
        icon: (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        ),
        description: "プロダクト戦略、優先順位付け、ユーザー理解力を評価します。",
      },
      {
        title: "ビジネスコンサルティング",
        category: "business_consulting",
        duration: "25分",
        format: ["選択5問", "記述5問", "ビデオ面接"],
        icon: (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        ),
        description: "ケーススタディ、問題解決力、コミュニケーション力を評価します。",
      },
      {
        title: "営業・セールス",
        category: "sales",
        duration: "20分",
        format: ["選択5問", "記述5問", "ビデオ面接"],
        icon: (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
          </svg>
        ),
        description: "提案力、交渉力、顧客対応スキルを評価する面接です。",
      },
      {
        title: "マーケティング",
        category: "marketing",
        duration: "20分",
        format: ["選択5問", "記述5問", "ビデオ面接"],
        icon: (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
          </svg>
        ),
        description: "デジタルマーケティング、分析、戦略立案の面接です。",
      },
    ],
  },
  {
    group: "金融・ファイナンス",
    categories: [
      {
        title: "金融アナリスト",
        category: "financial_analyst",
        duration: "25分",
        format: ["選択5問", "記述5問", "ビデオ面接"],
        icon: (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
        ),
        description: "財務分析、バリュエーション、リスク管理の専門面接です。",
      },
      {
        title: "投資・ファンドマネジメント",
        category: "investment_fund",
        duration: "25分",
        format: ["選択5問", "記述5問", "ビデオ面接"],
        icon: (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
          </svg>
        ),
        description: "ポートフォリオ理論、投資戦略、市場分析の面接です。",
      },
      {
        title: "フィンテック",
        category: "fintech",
        duration: "25分",
        format: ["選択5問", "記述5問", "ビデオ面接"],
        icon: (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        description: "決済技術、ブロックチェーン、金融規制の面接です。",
      },
      {
        title: "会計・税務",
        category: "accounting_tax",
        duration: "25分",
        format: ["選択5問", "記述5問", "ビデオ面接"],
        icon: (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V13.5zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V18zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V13.5zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V18zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zm2.498-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zM8.25 6h7.5v2.25h-7.5V6zM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0012 2.25z" />
          </svg>
        ),
        description: "簿記、税法、監査手法の知識を評価する面接です。",
      },
    ],
  },
  {
    group: "医療・ヘルスケア",
    categories: [
      {
        title: "医療・臨床",
        category: "healthcare",
        duration: "25分",
        format: ["選択5問", "記述5問", "ビデオ面接"],
        icon: (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        ),
        description: "臨床知識、診断力、患者対応スキルを評価する面接です。",
      },
      {
        title: "看護・介護",
        category: "nursing_care",
        duration: "20分",
        format: ["選択5問", "記述5問", "ビデオ面接"],
        icon: (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
          </svg>
        ),
        description: "ケアプランニング、患者観察、チーム連携の面接です。",
      },
      {
        title: "薬剤師・製薬",
        category: "pharmacy",
        duration: "25分",
        format: ["選択5問", "記述5問", "ビデオ面接"],
        icon: (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5" />
          </svg>
        ),
        description: "調剤、薬理学、服薬指導の専門面接です。",
      },
      {
        title: "医療IT・ヘルステック",
        category: "health_tech",
        duration: "25分",
        format: ["選択5問", "記述5問", "ビデオ面接"],
        icon: (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
          </svg>
        ),
        description: "電子カルテ、遠隔医療、医療データ分析の面接です。",
      },
    ],
  },
  {
    group: "教育・研究",
    categories: [
      {
        title: "教育・講師",
        category: "education",
        duration: "20分",
        format: ["選択5問", "記述5問", "ビデオ面接"],
        icon: (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
          </svg>
        ),
        description: "教育理論、授業設計、生徒指導力を評価する面接です。",
      },
      {
        title: "EdTech",
        category: "edtech",
        duration: "20分",
        format: ["選択5問", "記述5問", "ビデオ面接"],
        icon: (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
          </svg>
        ),
        description: "教育テクノロジー、LMS、オンライン教材開発の面接です。",
      },
      {
        title: "研究員・アカデミア",
        category: "research_academia",
        duration: "25分",
        format: ["選択5問", "記述5問", "ビデオ面接"],
        icon: (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
        ),
        description: "研究計画、論文作成、学術発表の能力を評価する面接です。",
      },
    ],
  },
  {
    group: "クリエイター・インフルエンサー",
    categories: [
      {
        title: "インフルエンサー・SNS",
        category: "influencer_sns",
        duration: "20分",
        format: ["選択5問", "記述5問", "ビデオ面接"],
        icon: (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
          </svg>
        ),
        description: "コンテンツ企画、エンゲージメント、ブランド構築の面接です。",
      },
      {
        title: "YouTuber・配信者",
        category: "youtuber_streamer",
        duration: "20分",
        format: ["選択5問", "記述5問", "ビデオ面接"],
        icon: (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
          </svg>
        ),
        description: "動画企画、視聴者分析、収益化戦略の面接です。",
      },
      {
        title: "コンテンツクリエイター",
        category: "content_creator",
        duration: "20分",
        format: ["選択5問", "記述5問", "ビデオ面接"],
        icon: (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
        ),
        description: "ライティング、編集、マルチメディア制作の面接です。",
      },
    ],
  },
  {
    group: "コーポレート・管理",
    categories: [
      {
        title: "人事・採用",
        category: "hr_recruitment",
        duration: "20分",
        format: ["選択5問", "記述5問", "ビデオ面接"],
        icon: (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
        ),
        description: "採用戦略、労務管理、組織開発の面接です。",
      },
      {
        title: "経理・財務",
        category: "accounting_finance",
        duration: "20分",
        format: ["選択5問", "記述5問", "ビデオ面接"],
        icon: (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
          </svg>
        ),
        description: "財務諸表、予算管理、資金調達の面接です。",
      },
      {
        title: "法務・コンプライアンス",
        category: "legal_compliance",
        duration: "25分",
        format: ["選択5問", "記述5問", "ビデオ面接"],
        icon: (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" />
          </svg>
        ),
        description: "契約法、知的財産、コンプライアンス管理の面接です。",
      },
    ],
  },
  {
    group: "新領域・先端技術",
    categories: [
      {
        title: "ブロックチェーン・Web3",
        category: "blockchain_web3",
        duration: "25分",
        format: ["選択5問", "記述5問", "ビデオ面接"],
        icon: (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
          </svg>
        ),
        description: "スマートコントラクト、DeFi、NFTの専門面接です。",
      },
      {
        title: "ゲーム開発",
        category: "game_development",
        duration: "25分",
        format: ["選択5問", "記述5問", "ビデオ面接"],
        icon: (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.491 48.491 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z" />
          </svg>
        ),
        description: "Unity/Unreal、ゲームデザイン、3Dモデリングの面接です。",
      },
      {
        title: "DX推進・コンサルタント",
        category: "dx_consultant",
        duration: "20分",
        format: ["選択5問", "記述5問", "ビデオ面接"],
        icon: (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
          </svg>
        ),
        description: "デジタル変革、業務改善、テクノロジー導入の面接です。",
      },
    ],
  },
];

export default function InterviewPage() {
  const router = useRouter();
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  const handlePractice = (category: string) => {
    router.push(`/interview/practice?category=${category}`);
  };

  const toggleGroup = (group: string) => {
    setExpandedGroup(expandedGroup === group ? null : group);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar activeItem="interview" />
      <TopBar />

      {/* Main content */}
      <main className="ml-0 md:ml-[96px] pt-14">
        <div className="px-6 py-6 max-w-[1400px]">
          {/* Page header */}
          <div className="mb-8">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-2">面接練習</h1>
            <p className="text-sm text-gray-500">
              業界・分野別の面接を練習できます。選択問題5問＋記述問題5問のテストの後、AIビデオ面接を行います。
            </p>
          </div>

          {/* Industry groups */}
          <div className="space-y-4">
            {interviewGroups.map((group) => {
              const isExpanded = expandedGroup === group.group;
              // Show first 3 always, rest when expanded
              const visibleCategories = isExpanded ? group.categories : group.categories.slice(0, 3);
              const hasMore = group.categories.length > 3;

              return (
                <div key={group.group} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                  {/* Group header */}
                  <button
                    onClick={() => toggleGroup(group.group)}
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <h2 className="text-base font-bold text-gray-900">{group.group}</h2>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        {group.categories.length}分野
                      </span>
                    </div>
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Category cards */}
                  <div className="px-6 pb-5">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {visibleCategories.map((type) => (
                        <div
                          key={type.category}
                          className="flex flex-col border border-gray-100 rounded-xl p-5 hover:border-indigo-200 hover:shadow-md transition-all group cursor-pointer"
                          onClick={() => handlePractice(type.category)}
                        >
                          <div className="text-indigo-600 mb-3">{type.icon}</div>
                          <h3 className="text-sm font-semibold text-gray-900 mb-1">{type.title}</h3>
                          <p className="text-xs text-gray-500 mb-3 leading-relaxed line-clamp-2 flex-1">{type.description}</p>
                          <div className="flex items-center gap-1.5 mb-4 flex-wrap">
                            <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{type.duration}</span>
                            {type.format.map((f) => (
                              <span key={f} className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                                {f}
                              </span>
                            ))}
                          </div>
                          <button
                            className="w-full text-center text-xs bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium group-hover:bg-indigo-700 mt-auto"
                          >
                            練習する
                          </button>
                        </div>
                      ))}
                    </div>

                    {hasMore && !isExpanded && (
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleGroup(group.group); }}
                        className="mt-3 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        さらに{group.categories.length - 3}分野を表示 →
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
