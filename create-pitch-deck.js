const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");

// Icon rendering helpers
function renderIconSvg(IconComponent, color = "#000000", size = 256) {
  return ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconComponent, { color, size: String(size) })
  );
}

async function iconToBase64Png(IconComponent, color, size = 256) {
  const svg = renderIconSvg(IconComponent, color, size);
  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + pngBuffer.toString("base64");
}

// Color palette
const C = {
  navy: "0F172A",
  navyLight: "1E293B",
  navyMid: "162036",
  indigo: "4F46E5",
  indigoLight: "818CF8",
  cyan: "06B6D4",
  cyanLight: "22D3EE",
  white: "FFFFFF",
  gray100: "F1F5F9",
  gray300: "CBD5E1",
  gray400: "94A3B8",
  gray500: "64748B",
  gray600: "475569",
  green: "10B981",
  red: "EF4444",
  amber: "F59E0B",
  purple: "8B5CF6",
  rose: "F43F5E",
};

// Reusable factory functions (avoid object reuse pitfall)
const makeShadow = () => ({
  type: "outer", blur: 8, offset: 3, angle: 135, color: "000000", opacity: 0.3,
});

function addSlideNumber(slide, num, total) {
  slide.addText(`${num} / ${total}`, {
    x: 8.8, y: 5.2, w: 1, h: 0.3,
    fontSize: 8, color: C.gray500, align: "right",
  });
}

function addSectionLabel(slide, label) {
  slide.addText(label, {
    x: 0.6, y: 0.35, w: 3, h: 0.3,
    fontSize: 9, color: C.indigo, fontFace: "Arial", bold: true,
    charSpacing: 3, margin: 0,
  });
}

function addSlideTitle(slide, title) {
  slide.addText(title, {
    x: 0.6, y: 0.7, w: 8.8, h: 0.7,
    fontSize: 32, color: C.white, fontFace: "Arial", bold: true, margin: 0,
  });
}

// Card helper
function addCard(slide, x, y, w, h, opts = {}) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h,
    fill: { color: opts.fill || C.navyLight },
    shadow: makeShadow(),
    line: { color: C.gray600, width: 0.5 },
  });
  // Left accent bar
  if (opts.accent !== false) {
    slide.addShape(pres.shapes.RECTANGLE, {
      x, y, w: 0.06, h,
      fill: { color: opts.accentColor || C.indigo },
    });
  }
}

let pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "Mercor Japan";
pres.title = "メルコール・ジャパン ピッチデッキ";

const TOTAL = 12;

async function createDeck() {
  const { FaRobot, FaBrain, FaGlobeAsia, FaYenSign, FaShieldAlt, FaChartLine, FaUsers, FaRocket, FaLightbulb, FaHandshake, FaBullseye, FaCrown } = require("react-icons/fa");

  // Pre-render icons
  const icons = {
    robot: await iconToBase64Png(FaRobot, "#" + C.cyan, 256),
    brain: await iconToBase64Png(FaBrain, "#" + C.indigo, 256),
    globe: await iconToBase64Png(FaGlobeAsia, "#" + C.cyanLight, 256),
    yen: await iconToBase64Png(FaYenSign, "#" + C.green, 256),
    shield: await iconToBase64Png(FaShieldAlt, "#" + C.indigoLight, 256),
    chart: await iconToBase64Png(FaChartLine, "#" + C.cyan, 256),
    users: await iconToBase64Png(FaUsers, "#" + C.indigoLight, 256),
    rocket: await iconToBase64Png(FaRocket, "#" + C.cyan, 256),
    bulb: await iconToBase64Png(FaLightbulb, "#" + C.amber, 256),
    handshake: await iconToBase64Png(FaHandshake, "#" + C.green, 256),
    target: await iconToBase64Png(FaBullseye, "#" + C.rose, 256),
    crown: await iconToBase64Png(FaCrown, "#" + C.amber, 256),
  };

  // ========== SLIDE 1: COVER ==========
  {
    const slide = pres.addSlide();
    slide.background = { color: C.navy };

    // Decorative circles
    slide.addShape(pres.shapes.OVAL, {
      x: 7, y: -1.5, w: 5, h: 5,
      fill: { color: C.indigo, transparency: 90 },
    });
    slide.addShape(pres.shapes.OVAL, {
      x: -1, y: 3, w: 4, h: 4,
      fill: { color: C.cyan, transparency: 92 },
    });

    // Logo mark
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.6, y: 1.0, w: 0.65, h: 0.65,
      fill: { color: C.indigo },
    });
    slide.addText("M", {
      x: 0.6, y: 1.0, w: 0.65, h: 0.65,
      fontSize: 28, color: C.white, fontFace: "Arial", bold: true,
      align: "center", valign: "middle",
    });

    slide.addText("メルコール・ジャパン", {
      x: 0.6, y: 1.9, w: 8, h: 0.9,
      fontSize: 42, color: C.white, fontFace: "Arial", bold: true, margin: 0,
    });

    slide.addText("AI人材マッチングプラットフォーム", {
      x: 0.6, y: 2.8, w: 8, h: 0.6,
      fontSize: 22, color: C.cyan, fontFace: "Arial", margin: 0,
    });

    slide.addShape(pres.shapes.LINE, {
      x: 0.6, y: 3.6, w: 2, h: 0,
      line: { color: C.indigo, width: 3 },
    });

    slide.addText("AIが見つける、最適な仕事と人材", {
      x: 0.6, y: 3.9, w: 8, h: 0.5,
      fontSize: 16, color: C.gray400, fontFace: "Arial", margin: 0,
    });

    slide.addText("Confidential | 2026年3月", {
      x: 0.6, y: 5.0, w: 4, h: 0.3,
      fontSize: 10, color: C.gray500, fontFace: "Arial", margin: 0,
    });
  }

  // ========== SLIDE 2: PROBLEM ==========
  {
    const slide = pres.addSlide();
    slide.background = { color: C.navy };
    addSectionLabel(slide, "PROBLEM");
    addSlideTitle(slide, "日本の人材市場が抱える構造的課題");
    addSlideNumber(slide, 2, TOTAL);

    const problems = [
      { title: "人口減少・労働力不足", desc: "生産年齢人口は2030年までに700万人減少。慢性的な人手不足が深刻化。", stat: "-700万人", statLabel: "2030年までの労働力減少", color: C.red },
      { title: "IT人材の圧倒的不足", desc: "経産省の予測では、2030年にIT人材が最大79万人不足する見込み。", stat: "79万人", statLabel: "2030年 IT人材不足予測", color: C.amber },
      { title: "従来型人材紹介の限界", desc: "属人的なマッチング、長い採用期間（平均45日）、高いミスマッチ率（30%超）。", stat: "30%+", statLabel: "ミスマッチ率", color: C.rose },
      { title: "高額な手数料", desc: "従来のエージェントは年収の30-35%を手数料として徴収。中小企業には大きな負担。", stat: "30-35%", statLabel: "従来型手数料率", color: C.purple },
    ];

    problems.forEach((p, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 0.6 + col * 4.55;
      const y = 1.6 + row * 1.9;

      addCard(slide, x, y, 4.2, 1.7, { accentColor: p.color });

      slide.addText(p.title, {
        x: x + 0.25, y: y + 0.15, w: 2.6, h: 0.35,
        fontSize: 14, color: C.white, fontFace: "Arial", bold: true, margin: 0,
      });
      slide.addText(p.desc, {
        x: x + 0.25, y: y + 0.5, w: 2.6, h: 0.7,
        fontSize: 10, color: C.gray400, fontFace: "Arial", margin: 0,
      });
      // Stat callout
      slide.addText(p.stat, {
        x: x + 3.0, y: y + 0.2, w: 1.0, h: 0.5,
        fontSize: 22, color: p.color, fontFace: "Arial", bold: true,
        align: "center", margin: 0,
      });
      slide.addText(p.statLabel, {
        x: x + 2.7, y: y + 0.7, w: 1.4, h: 0.5,
        fontSize: 7, color: C.gray500, fontFace: "Arial",
        align: "center", margin: 0,
      });
    });
  }

  // ========== SLIDE 3: SOLUTION ==========
  {
    const slide = pres.addSlide();
    slide.background = { color: C.navy };
    addSectionLabel(slide, "SOLUTION");
    addSlideTitle(slide, "AIで人材マッチングを根本から変える");
    addSlideNumber(slide, 3, TOTAL);

    const solutions = [
      { icon: icons.brain, title: "AI精密マッチング", desc: "独自のMLモデルがスキル・経験・文化適合性を多角的に分析。マッチング精度97.3%を実現。" },
      { icon: icons.globe, title: "完全リモートワーク", desc: "日本全国・世界中どこからでも参加可能。場所に縛られない新しい働き方を実現。" },
      { icon: icons.yen, title: "世界水準の報酬", desc: "グローバル企業と直接契約。日本の平均を大きく上回る報酬レンジを提供。" },
    ];

    solutions.forEach((s, i) => {
      const x = 0.6 + i * 3.1;
      const y = 1.7;
      addCard(slide, x, y, 2.8, 3.2, { accent: false });

      slide.addImage({ data: s.icon, x: x + 1.0, y: y + 0.3, w: 0.7, h: 0.7 });
      slide.addText(s.title, {
        x: x + 0.2, y: y + 1.2, w: 2.4, h: 0.4,
        fontSize: 15, color: C.white, fontFace: "Arial", bold: true,
        align: "center", margin: 0,
      });
      slide.addText(s.desc, {
        x: x + 0.2, y: y + 1.7, w: 2.4, h: 1.2,
        fontSize: 10, color: C.gray400, fontFace: "Arial",
        align: "center", margin: 0,
      });
    });

    // Bottom highlight bar
    slide.addShape(pres.shapes.RECTANGLE, {
      x: 0.6, y: 5.05, w: 8.8, h: 0.05,
      fill: { color: C.indigo },
    });
  }

  // ========== SLIDE 4: MARKET SIZE ==========
  {
    const slide = pres.addSlide();
    slide.background = { color: C.navy };
    addSectionLabel(slide, "MARKET SIZE");
    addSlideTitle(slide, "巨大な市場機会");
    addSlideNumber(slide, 4, TOTAL);

    // TAM / SAM / SOM circles (concentric concept via cards)
    const markets = [
      { label: "TAM", value: "¥9.2兆", desc: "日本の人材サービス市場全体", x: 0.6, w: 2.8, color: C.indigo },
      { label: "SAM", value: "¥3.1兆", desc: "IT・専門職人材紹介市場", x: 3.65, w: 2.8, color: C.cyan },
      { label: "SOM", value: "¥310億", desc: "AIリモート人材マッチング（初期ターゲット）", x: 6.7, w: 2.8, color: C.green },
    ];

    markets.forEach((m) => {
      addCard(slide, m.x, 1.65, m.w, 2.0, { accentColor: m.color });
      slide.addText(m.label, {
        x: m.x + 0.25, y: 1.8, w: m.w - 0.4, h: 0.3,
        fontSize: 12, color: m.color, fontFace: "Arial", bold: true, margin: 0,
      });
      slide.addText(m.value, {
        x: m.x + 0.25, y: 2.15, w: m.w - 0.4, h: 0.55,
        fontSize: 30, color: C.white, fontFace: "Arial", bold: true, margin: 0,
      });
      slide.addText(m.desc, {
        x: m.x + 0.25, y: 2.8, w: m.w - 0.4, h: 0.6,
        fontSize: 10, color: C.gray400, fontFace: "Arial", margin: 0,
      });
    });

    // Growth drivers
    addCard(slide, 0.6, 3.9, 8.8, 1.4, { accent: false });
    slide.addText("市場成長ドライバー", {
      x: 0.9, y: 4.0, w: 3, h: 0.35,
      fontSize: 13, color: C.white, fontFace: "Arial", bold: true, margin: 0,
    });
    const drivers = [
      "DX推進による IT人材需要の急増（年率 12% 成長）",
      "リモートワーク市場の拡大（2020年比 3.5倍）",
      "フリーランス人口の増加（2030年に1,000万人超予測）",
    ];
    slide.addText(
      drivers.map((d, i) => ({
        text: d,
        options: { bullet: true, breakLine: i < drivers.length - 1, color: C.gray300 },
      })),
      { x: 0.9, y: 4.4, w: 8, h: 0.8, fontSize: 11, fontFace: "Arial" }
    );
  }

  // ========== SLIDE 5: COMPETITION ==========
  {
    const slide = pres.addSlide();
    slide.background = { color: C.navy };
    addSectionLabel(slide, "COMPETITION");
    addSlideTitle(slide, "競合分析と差別化ポイント");
    addSlideNumber(slide, 5, TOTAL);

    // Comparison table
    const headerRow = [
      { text: "", options: { fill: { color: C.indigo }, color: C.white, bold: true, align: "center" } },
      { text: "メルコール", options: { fill: { color: C.indigo }, color: C.white, bold: true, align: "center" } },
      { text: "ビズリーチ", options: { fill: { color: C.navyLight }, color: C.gray300, bold: true, align: "center" } },
      { text: "リクルート", options: { fill: { color: C.navyLight }, color: C.gray300, bold: true, align: "center" } },
      { text: "Wantedly", options: { fill: { color: C.navyLight }, color: C.gray300, bold: true, align: "center" } },
      { text: "LAPRAS", options: { fill: { color: C.navyLight }, color: C.gray300, bold: true, align: "center" } },
    ];

    const cellOpts = (isHighlight) => ({
      fill: { color: isHighlight ? "1A2744" : C.navyLight },
      color: isHighlight ? C.cyan : C.gray400,
      align: "center",
      fontSize: 9,
    });

    const rows = [
      ["AIマッチング", "◎", "△", "△", "×", "○"],
      ["リモート特化", "◎", "△", "△", "△", "○"],
      ["グローバル人材", "◎", "×", "△", "×", "×"],
      ["手数料率", "15-20%", "30-35%", "30-35%", "無料*", "要相談"],
      ["採用期間", "平均5日", "30-45日", "30-60日", "14-30日", "14-21日"],
      ["AI面接・評価", "◎", "×", "×", "×", "△"],
    ];

    const tableData = [
      headerRow,
      ...rows.map((row) => row.map((cell, ci) => ({
        text: cell,
        options: cellOpts(ci === 1),
      }))),
    ];

    slide.addTable(tableData, {
      x: 0.6, y: 1.55, w: 8.8,
      colW: [1.4, 1.5, 1.5, 1.5, 1.4, 1.5],
      rowH: [0.4, 0.38, 0.38, 0.38, 0.38, 0.38, 0.38],
      border: { pt: 0.5, color: C.gray600 },
      fontSize: 10,
      fontFace: "Arial",
    });

    // Differentiation points
    addCard(slide, 0.6, 4.3, 8.8, 1.1, { accentColor: C.cyan });
    slide.addText("メルコールの決定的な差別化", {
      x: 0.9, y: 4.4, w: 4, h: 0.3,
      fontSize: 12, color: C.white, fontFace: "Arial", bold: true, margin: 0,
    });
    slide.addText("Mercor（米国本体）のグローバルネットワーク × 日本市場への深い理解 × 最先端AIマッチング技術", {
      x: 0.9, y: 4.75, w: 8, h: 0.4,
      fontSize: 11, color: C.gray300, fontFace: "Arial", margin: 0,
    });
  }

  // ========== SLIDE 6: BUSINESS MODEL ==========
  {
    const slide = pres.addSlide();
    slide.background = { color: C.navy };
    addSectionLabel(slide, "BUSINESS MODEL");
    addSlideTitle(slide, "収益モデル");
    addSlideNumber(slide, 6, TOTAL);

    // Employer side
    addCard(slide, 0.6, 1.6, 4.2, 2.3, { accentColor: C.indigo });
    slide.addText("企業側（採用企業）", {
      x: 0.9, y: 1.75, w: 3.6, h: 0.35,
      fontSize: 14, color: C.indigoLight, fontFace: "Arial", bold: true, margin: 0,
    });
    const empItems = [
      "成功報酬: 年収の 15-20%（業界平均の半額）",
      "SaaS月額: ¥50,000〜/月（AIスクリーニング機能）",
      "エンタープライズ: カスタム料金（大量採用向け）",
    ];
    slide.addText(
      empItems.map((t, i) => ({ text: t, options: { bullet: true, breakLine: i < empItems.length - 1, color: C.gray300 } })),
      { x: 0.9, y: 2.2, w: 3.6, h: 1.5, fontSize: 10, fontFace: "Arial" }
    );

    // Talent side
    addCard(slide, 5.2, 1.6, 4.2, 2.3, { accentColor: C.cyan });
    slide.addText("人材側（ワーカー）", {
      x: 5.5, y: 1.75, w: 3.6, h: 0.35,
      fontSize: 14, color: C.cyanLight, fontFace: "Arial", bold: true, margin: 0,
    });
    const talentItems = [
      "登録・利用: 完全無料",
      "マージン: 時給の 10%（業界最低水準）",
      "追加サービス: キャリアコーチング等（有料オプション）",
    ];
    slide.addText(
      talentItems.map((t, i) => ({ text: t, options: { bullet: true, breakLine: i < talentItems.length - 1, color: C.gray300 } })),
      { x: 5.5, y: 2.2, w: 3.6, h: 1.5, fontSize: 10, fontFace: "Arial" }
    );

    // ARR Projection
    addCard(slide, 0.6, 4.15, 8.8, 1.2, { accent: false });
    slide.addText("ARR 成長予測", {
      x: 0.9, y: 4.25, w: 3, h: 0.3,
      fontSize: 13, color: C.white, fontFace: "Arial", bold: true, margin: 0,
    });

    const arrData = [
      { year: "Year 1", arr: "¥1.2億", color: C.gray400 },
      { year: "Year 2", arr: "¥5.8億", color: C.indigoLight },
      { year: "Year 3", arr: "¥18億", color: C.cyan },
      { year: "Year 5", arr: "¥60億+", color: C.green },
    ];
    arrData.forEach((d, i) => {
      const x = 0.9 + i * 2.2;
      slide.addText(d.arr, {
        x, y: 4.6, w: 1.8, h: 0.35,
        fontSize: 18, color: d.color, fontFace: "Arial", bold: true, margin: 0,
      });
      slide.addText(d.year, {
        x, y: 4.95, w: 1.8, h: 0.25,
        fontSize: 9, color: C.gray500, fontFace: "Arial", margin: 0,
      });
    });
  }

  // ========== SLIDE 7: FUNDING ==========
  {
    const slide = pres.addSlide();
    slide.background = { color: C.navy };
    addSectionLabel(slide, "FUNDING");
    addSlideTitle(slide, "必要資金と使途");
    addSlideNumber(slide, 7, TOTAL);

    // Seed round
    addCard(slide, 0.6, 1.6, 4.2, 3.0, { accentColor: C.indigo });
    slide.addText("シードラウンド", {
      x: 0.9, y: 1.75, w: 3.6, h: 0.3,
      fontSize: 11, color: C.indigoLight, fontFace: "Arial", bold: true, margin: 0,
    });
    slide.addText("¥3〜5億", {
      x: 0.9, y: 2.1, w: 3.6, h: 0.5,
      fontSize: 28, color: C.white, fontFace: "Arial", bold: true, margin: 0,
    });

    const seedItems = [
      { label: "プロダクト開発", pct: "40%", desc: "AIモデル構築、プラットフォーム開発" },
      { label: "チーム構築", pct: "30%", desc: "エンジニア、事業開発、オペレーション" },
      { label: "マーケティング", pct: "20%", desc: "初期ユーザー獲得、ブランド構築" },
      { label: "運転資金", pct: "10%", desc: "オフィス、法務、その他" },
    ];
    seedItems.forEach((item, i) => {
      const y = 2.7 + i * 0.45;
      slide.addText(item.pct, {
        x: 0.9, y, w: 0.5, h: 0.3,
        fontSize: 11, color: C.indigo, fontFace: "Arial", bold: true, margin: 0,
      });
      slide.addText(item.label, {
        x: 1.5, y, w: 1.5, h: 0.2,
        fontSize: 10, color: C.white, fontFace: "Arial", bold: true, margin: 0,
      });
      slide.addText(item.desc, {
        x: 1.5, y: y + 0.17, w: 2.8, h: 0.2,
        fontSize: 8, color: C.gray500, fontFace: "Arial", margin: 0,
      });
    });

    // Series A
    addCard(slide, 5.2, 1.6, 4.2, 3.0, { accentColor: C.cyan });
    slide.addText("シリーズA", {
      x: 5.5, y: 1.75, w: 3.6, h: 0.3,
      fontSize: 11, color: C.cyanLight, fontFace: "Arial", bold: true, margin: 0,
    });
    slide.addText("¥15〜20億", {
      x: 5.5, y: 2.1, w: 3.6, h: 0.5,
      fontSize: 28, color: C.white, fontFace: "Arial", bold: true, margin: 0,
    });

    const seriesAItems = [
      { label: "スケール", pct: "35%", desc: "営業体制構築、大企業開拓" },
      { label: "技術強化", pct: "25%", desc: "AI精度向上、新機能開発" },
      { label: "マーケティング", pct: "25%", desc: "大規模マーケティング施策" },
      { label: "海外展開準備", pct: "15%", desc: "アジア展開の基盤構築" },
    ];
    seriesAItems.forEach((item, i) => {
      const y = 2.7 + i * 0.45;
      slide.addText(item.pct, {
        x: 5.5, y, w: 0.5, h: 0.3,
        fontSize: 11, color: C.cyan, fontFace: "Arial", bold: true, margin: 0,
      });
      slide.addText(item.label, {
        x: 6.1, y, w: 1.5, h: 0.2,
        fontSize: 10, color: C.white, fontFace: "Arial", bold: true, margin: 0,
      });
      slide.addText(item.desc, {
        x: 6.1, y: y + 0.17, w: 2.8, h: 0.2,
        fontSize: 8, color: C.gray500, fontFace: "Arial", margin: 0,
      });
    });

    // Timeline
    addCard(slide, 0.6, 4.85, 8.8, 0.6, { accent: false });
    slide.addText("タイムライン:  シード調達 → 6ヶ月で β版ローンチ → 12ヶ月で正式リリース → 18ヶ月でシリーズA", {
      x: 0.9, y: 4.95, w: 8.4, h: 0.35,
      fontSize: 11, color: C.gray300, fontFace: "Arial", margin: 0,
    });
  }

  // ========== SLIDE 8: WHY NOW ==========
  {
    const slide = pres.addSlide();
    slide.background = { color: C.navy };
    addSectionLabel(slide, "WHY NOW");
    addSlideTitle(slide, "なぜ今、始めるべきなのか");
    addSlideNumber(slide, 8, TOTAL);

    const reasons = [
      {
        icon: icons.globe,
        title: "リモートワークの定着",
        desc: "コロナ後、リモートワーク実施率は30%超で定着。企業の採用地理的制約が消滅した。",
      },
      {
        icon: icons.brain,
        title: "AI技術の成熟",
        desc: "LLM革命により、人材評価・マッチングの精度が飛躍的に向上。実用段階に到達。",
      },
      {
        icon: icons.chart,
        title: "2030年 IT人材79万人不足",
        desc: "経産省の予測。従来型の採用手法では解決不可能な規模の人材ギャップ。",
      },
      {
        icon: icons.rocket,
        title: "政府のデジタル人材育成政策",
        desc: "デジタル田園都市構想、リスキリング支援（5年で1兆円）。追い風が吹いている。",
      },
    ];

    reasons.forEach((r, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 0.6 + col * 4.55;
      const y = 1.6 + row * 1.9;

      addCard(slide, x, y, 4.2, 1.7, { accent: false });
      slide.addImage({ data: r.icon, x: x + 0.25, y: y + 0.25, w: 0.45, h: 0.45 });
      slide.addText(r.title, {
        x: x + 0.85, y: y + 0.25, w: 3.0, h: 0.35,
        fontSize: 14, color: C.white, fontFace: "Arial", bold: true, margin: 0,
      });
      slide.addText(r.desc, {
        x: x + 0.25, y: y + 0.8, w: 3.7, h: 0.7,
        fontSize: 10, color: C.gray400, fontFace: "Arial", margin: 0,
      });
    });
  }

  // ========== SLIDE 9: TRACTION ==========
  {
    const slide = pres.addSlide();
    slide.background = { color: C.navy };
    addSectionLabel(slide, "TRACTION & MILESTONES");
    addSlideTitle(slide, "成長ロードマップとKPI目標");
    addSlideNumber(slide, 9, TOTAL);

    // Timeline milestones
    const milestones = [
      { period: "Q1-Q2 2026", title: "β版ローンチ", kpis: ["登録人材: 500人", "企業パートナー: 20社", "マッチング成功率: 85%"] },
      { period: "Q3-Q4 2026", title: "正式リリース", kpis: ["登録人材: 3,000人", "企業パートナー: 100社", "月間マッチング: 200件"] },
      { period: "2027", title: "スケール", kpis: ["登録人材: 15,000人", "企業パートナー: 500社", "ARR: ¥5.8億"] },
      { period: "2028", title: "市場リーダー", kpis: ["登録人材: 50,000人", "企業パートナー: 2,000社", "ARR: ¥18億"] },
    ];

    milestones.forEach((m, i) => {
      const x = 0.6 + i * 2.35;
      addCard(slide, x, 1.55, 2.1, 3.0, { accentColor: i === 0 ? C.green : i === 1 ? C.cyan : i === 2 ? C.indigo : C.purple });

      slide.addText(m.period, {
        x: x + 0.2, y: 1.65, w: 1.7, h: 0.3,
        fontSize: 9, color: C.gray400, fontFace: "Arial", margin: 0,
      });
      slide.addText(m.title, {
        x: x + 0.2, y: 1.95, w: 1.7, h: 0.35,
        fontSize: 13, color: C.white, fontFace: "Arial", bold: true, margin: 0,
      });

      slide.addText(
        m.kpis.map((k, ki) => ({
          text: k,
          options: { bullet: true, breakLine: ki < m.kpis.length - 1, color: C.gray300 },
        })),
        { x: x + 0.2, y: 2.5, w: 1.7, h: 1.8, fontSize: 9, fontFace: "Arial" }
      );
    });

    // Current status
    addCard(slide, 0.6, 4.8, 8.8, 0.6, { accentColor: C.green });
    slide.addText("現在の状況: プロダクト設計完了 / AIモデルプロトタイプ開発中 / 初期パートナー企業 5社と LOI 締結済み", {
      x: 0.9, y: 4.9, w: 8.3, h: 0.35,
      fontSize: 11, color: C.gray300, fontFace: "Arial", margin: 0,
    });
  }

  // ========== SLIDE 10: TEAM ==========
  {
    const slide = pres.addSlide();
    slide.background = { color: C.navy };
    addSectionLabel(slide, "TEAM");
    addSlideTitle(slide, "経営チーム");
    addSlideNumber(slide, 10, TOTAL);

    const team = [
      { role: "CEO", title: "代表取締役", desc: "テック企業経営10年+\nHR Tech領域の深い知見\n東大/スタンフォードMBA", initials: "CEO", color: C.indigo },
      { role: "CTO", title: "最高技術責任者", desc: "Google/Meta出身\nML/AI領域15年+\n論文採択多数", initials: "CTO", color: C.cyan },
      { role: "COO", title: "最高執行責任者", desc: "リクルート出身\n人材業界15年+\n大企業営業ネットワーク", initials: "COO", color: C.green },
      { role: "CPO", title: "最高プロダクト責任者", desc: "メルカリ/LINE出身\nプロダクト設計10年+\nUXデザイン専門", initials: "CPO", color: C.purple },
    ];

    team.forEach((t, i) => {
      const x = 0.6 + i * 2.35;
      addCard(slide, x, 1.6, 2.1, 3.0, { accentColor: t.color });

      // Avatar circle
      slide.addShape(pres.shapes.OVAL, {
        x: x + 0.65, y: 1.8, w: 0.8, h: 0.8,
        fill: { color: t.color, transparency: 70 },
      });
      slide.addText(t.initials, {
        x: x + 0.65, y: 1.8, w: 0.8, h: 0.8,
        fontSize: 14, color: C.white, fontFace: "Arial", bold: true,
        align: "center", valign: "middle",
      });

      slide.addText(t.role, {
        x: x + 0.2, y: 2.75, w: 1.7, h: 0.3,
        fontSize: 16, color: C.white, fontFace: "Arial", bold: true,
        align: "center", margin: 0,
      });
      slide.addText(t.title, {
        x: x + 0.2, y: 3.05, w: 1.7, h: 0.25,
        fontSize: 9, color: t.color, fontFace: "Arial",
        align: "center", margin: 0,
      });
      slide.addText(t.desc, {
        x: x + 0.2, y: 3.4, w: 1.7, h: 1.0,
        fontSize: 9, color: C.gray400, fontFace: "Arial",
        align: "center", margin: 0,
      });
    });

    addCard(slide, 0.6, 4.85, 8.8, 0.55, { accent: false });
    slide.addText("+ Mercor本社（サンフランシスコ）からの技術支援・グローバルネットワーク連携", {
      x: 0.9, y: 4.93, w: 8, h: 0.35,
      fontSize: 11, color: C.gray300, fontFace: "Arial", margin: 0,
    });
  }

  // ========== SLIDE 11: VALUATION ==========
  {
    const slide = pres.addSlide();
    slide.background = { color: C.navy };
    addSectionLabel(slide, "VALUATION");
    addSlideTitle(slide, "バリュエーション");
    addSlideNumber(slide, 11, TOTAL);

    // Current valuation
    addCard(slide, 0.6, 1.6, 4.2, 1.6, { accentColor: C.indigo });
    slide.addText("シード段階評価額", {
      x: 0.9, y: 1.75, w: 3.6, h: 0.3,
      fontSize: 11, color: C.indigoLight, fontFace: "Arial", bold: true, margin: 0,
    });
    slide.addText("¥10〜20億", {
      x: 0.9, y: 2.1, w: 3.6, h: 0.5,
      fontSize: 30, color: C.white, fontFace: "Arial", bold: true, margin: 0,
    });
    slide.addText("プレマネー評価額", {
      x: 0.9, y: 2.65, w: 3.6, h: 0.3,
      fontSize: 10, color: C.gray500, fontFace: "Arial", margin: 0,
    });

    // Comparable
    addCard(slide, 5.2, 1.6, 4.2, 1.6, { accentColor: C.cyan });
    slide.addText("類似企業比較", {
      x: 5.5, y: 1.75, w: 3.6, h: 0.3,
      fontSize: 11, color: C.cyanLight, fontFace: "Arial", bold: true, margin: 0,
    });
    const comps = [
      "Mercor（米国）: $2B（約3,000億円）",
      "ビズリーチ（上場時）: 約1,500億円",
      "LAPRAS: 約50億円（シリーズB）",
    ];
    slide.addText(
      comps.map((c, i) => ({ text: c, options: { bullet: true, breakLine: i < comps.length - 1, color: C.gray300 } })),
      { x: 5.5, y: 2.15, w: 3.6, h: 0.9, fontSize: 10, fontFace: "Arial" }
    );

    // Growth trajectory
    addCard(slide, 0.6, 3.45, 8.8, 1.9, { accent: false });
    slide.addText("目標評価額の推移", {
      x: 0.9, y: 3.55, w: 4, h: 0.3,
      fontSize: 13, color: C.white, fontFace: "Arial", bold: true, margin: 0,
    });

    const valuations = [
      { stage: "シード", val: "¥10-20億", timing: "2026年", color: C.gray400 },
      { stage: "シリーズA", val: "¥50-80億", timing: "2027年", color: C.indigoLight },
      { stage: "シリーズB", val: "¥100-300億", timing: "2028年", color: C.cyan },
      { stage: "IPO / Exit", val: "¥500億+", timing: "2029-2030年", color: C.green },
    ];

    valuations.forEach((v, i) => {
      const x = 0.9 + i * 2.2;
      slide.addText(v.val, {
        x, y: 4.0, w: 1.8, h: 0.4,
        fontSize: 18, color: v.color, fontFace: "Arial", bold: true, margin: 0,
      });
      slide.addText(v.stage, {
        x, y: 4.4, w: 1.8, h: 0.25,
        fontSize: 10, color: C.white, fontFace: "Arial", margin: 0,
      });
      slide.addText(v.timing, {
        x, y: 4.65, w: 1.8, h: 0.2,
        fontSize: 9, color: C.gray500, fontFace: "Arial", margin: 0,
      });

      // Arrow between items
      if (i < valuations.length - 1) {
        slide.addText("→", {
          x: x + 1.7, y: 4.05, w: 0.5, h: 0.3,
          fontSize: 16, color: C.gray600, fontFace: "Arial", align: "center", margin: 0,
        });
      }
    });
  }

  // ========== SLIDE 12: CLOSING / ASK ==========
  {
    const slide = pres.addSlide();
    slide.background = { color: C.navy };

    // Decorative circles
    slide.addShape(pres.shapes.OVAL, {
      x: 6, y: -2, w: 6, h: 6,
      fill: { color: C.indigo, transparency: 90 },
    });
    slide.addShape(pres.shapes.OVAL, {
      x: -2, y: 2, w: 5, h: 5,
      fill: { color: C.cyan, transparency: 92 },
    });

    slide.addText("メルコール・ジャパン", {
      x: 0.6, y: 0.8, w: 8.8, h: 0.7,
      fontSize: 36, color: C.white, fontFace: "Arial", bold: true, align: "center", margin: 0,
    });
    slide.addText("AIが見つける、最適な仕事と人材", {
      x: 0.6, y: 1.5, w: 8.8, h: 0.5,
      fontSize: 18, color: C.cyan, fontFace: "Arial", align: "center", margin: 0,
    });

    slide.addShape(pres.shapes.LINE, {
      x: 4.0, y: 2.3, w: 2, h: 0,
      line: { color: C.indigo, width: 3 },
    });

    // The Ask
    addCard(slide, 1.5, 2.6, 7.0, 2.0, { accent: false });
    slide.addText("資金調達のお願い", {
      x: 1.8, y: 2.75, w: 6.4, h: 0.4,
      fontSize: 16, color: C.white, fontFace: "Arial", bold: true, align: "center", margin: 0,
    });
    slide.addText("シードラウンド: ¥3〜5億", {
      x: 1.8, y: 3.2, w: 6.4, h: 0.45,
      fontSize: 24, color: C.cyan, fontFace: "Arial", bold: true, align: "center", margin: 0,
    });

    const askPoints = [
      "日本の人材市場 ¥9.2兆の巨大市場機会",
      "Mercor本社のグローバル技術基盤を活用",
      "2030年のIT人材79万人不足を解決する唯一のAIソリューション",
    ];
    slide.addText(
      askPoints.map((p, i) => ({ text: p, options: { bullet: true, breakLine: i < askPoints.length - 1, color: C.gray300 } })),
      { x: 2.5, y: 3.7, w: 5.5, h: 0.8, fontSize: 11, fontFace: "Arial", align: "left" }
    );

    slide.addText("お問い合わせ: contact@mercor.jp", {
      x: 0.6, y: 5.0, w: 8.8, h: 0.3,
      fontSize: 12, color: C.gray500, fontFace: "Arial", align: "center", margin: 0,
    });
  }

  // Write file
  await pres.writeFile({ fileName: "/Users/user/Desktop/mercorJP/MercorJapan_PitchDeck.pptx" });
  console.log("Pitch deck created successfully!");
}

createDeck().catch(console.error);
