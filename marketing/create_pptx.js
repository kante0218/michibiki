const pptxgen = require("pptxgenjs");

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "Michibiki";
pres.title = "導（みちびき）事業計画書";

// Color palette - Deep Indigo theme
const C = {
  navy: "1E1B4B",
  indigo: "4338CA",
  indigoLight: "6366F1",
  indigoSoft: "EEF2FF",
  dark: "111827",
  gray900: "1F2937",
  gray700: "374151",
  gray500: "6B7280",
  gray300: "D1D5DB",
  gray100: "F3F4F6",
  white: "FFFFFF",
  red: "DC2626",
  green: "059669",
  amber: "D97706",
  purple: "7C3AED",
};

const makeShadow = () => ({ type: "outer", blur: 8, offset: 2, angle: 135, color: "000000", opacity: 0.1 });

// ==================== SLIDE 1: TITLE ====================
{
  const slide = pres.addSlide();
  slide.background = { color: C.navy };

  // Decorative shapes
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.indigoLight } });
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.indigoLight } });

  // Large decorative circle (subtle)
  slide.addShape(pres.shapes.OVAL, { x: 6.5, y: -1.5, w: 6, h: 6, fill: { color: C.indigo, transparency: 80 } });
  slide.addShape(pres.shapes.OVAL, { x: 7.5, y: 2.5, w: 4, h: 4, fill: { color: C.indigoLight, transparency: 85 } });

  slide.addText("導", { x: 0.8, y: 0.8, w: 2, h: 1.8, fontSize: 80, fontFace: "Georgia", color: C.indigoLight, bold: true, margin: 0 });
  slide.addText("みちびき", { x: 0.8, y: 2.3, w: 4, h: 0.5, fontSize: 16, fontFace: "Calibri", color: C.gray500, margin: 0 });

  slide.addText("事業計画書", { x: 0.8, y: 3.0, w: 8, h: 0.8, fontSize: 36, fontFace: "Calibri", color: C.white, bold: true, margin: 0 });
  slide.addText("AI面接 × 人材マッチング — PeopleXを超える成長戦略", { x: 0.8, y: 3.8, w: 7, h: 0.5, fontSize: 16, fontFace: "Calibri", color: C.gray500, margin: 0 });

  slide.addText("2026年3月", { x: 0.8, y: 4.8, w: 3, h: 0.4, fontSize: 12, fontFace: "Calibri", color: C.gray500, margin: 0 });
}

// ==================== SLIDE 2: PeopleX 競合分析 ====================
{
  const slide = pres.addSlide();
  slide.background = { color: C.white };
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.04, fill: { color: C.indigo } });

  slide.addText("PeopleX 競合分析", { x: 0.7, y: 0.3, w: 8, h: 0.6, fontSize: 28, fontFace: "Calibri", color: C.dark, bold: true, margin: 0 });
  slide.addText("直接競合の徹底分析", { x: 0.7, y: 0.85, w: 6, h: 0.35, fontSize: 13, fontFace: "Calibri", color: C.gray500, margin: 0 });

  // Stats cards - top row
  const cards = [
    { label: "資金調達", value: "23.7億円", sub: "シードラウンド" },
    { label: "月次売上", value: "1億円+", sub: "月次連結売上高" },
    { label: "社員数", value: "140名", sub: "創業1年強" },
    { label: "導入企業", value: "~70社", sub: "AI面接プロダクト" },
  ];
  cards.forEach((c, i) => {
    const cx = 0.7 + i * 2.25;
    slide.addShape(pres.shapes.RECTANGLE, { x: cx, y: 1.5, w: 2.05, h: 1.3, fill: { color: C.gray100 }, shadow: makeShadow() });
    slide.addText(c.value, { x: cx, y: 1.6, w: 2.05, h: 0.55, fontSize: 26, fontFace: "Calibri", color: C.indigo, bold: true, align: "center", margin: 0 });
    slide.addText(c.label, { x: cx, y: 2.1, w: 2.05, h: 0.3, fontSize: 11, fontFace: "Calibri", color: C.dark, bold: true, align: "center", margin: 0 });
    slide.addText(c.sub, { x: cx, y: 2.35, w: 2.05, h: 0.3, fontSize: 9, fontFace: "Calibri", color: C.gray500, align: "center", margin: 0 });
  });

  // Info section
  slide.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 3.1, w: 8.6, h: 2.2, fill: { color: C.indigoSoft } });
  slide.addText([
    { text: "CEO: 橘大地（元クラウドサイン事業責任者・弁護士ドットコム取締役）", options: { breakLine: true, fontSize: 12, color: C.gray700 } },
    { text: "創業: 2024年4月 / 目標: 3年で売上100億円", options: { breakLine: true, fontSize: 12, color: C.gray700 } },
    { text: "主要プロダクト:", options: { breakLine: true, fontSize: 12, color: C.dark, bold: true } },
    { text: "AI面接 / AIロープレ / AI面談 / PeopleWork / PeopleAgent / PeopleConsulting", options: { breakLine: true, fontSize: 12, color: C.gray700 } },
    { text: "戦略: パートナービジネスで売上の50%を獲得、M&Aによる事業拡大", options: { fontSize: 12, color: C.gray700 } },
  ], { x: 1.0, y: 3.3, w: 8.0, h: 1.8, valign: "top" });
}

// ==================== SLIDE 3: PeopleXの収益モデル ====================
{
  const slide = pres.addSlide();
  slide.background = { color: C.white };
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.04, fill: { color: C.indigo } });

  slide.addText("PeopleXの収益モデル", { x: 0.7, y: 0.3, w: 8, h: 0.6, fontSize: 28, fontFace: "Calibri", color: C.dark, bold: true, margin: 0 });

  // Revenue model cards
  const models = [
    { title: "初期導入コンサル", desc: "導入時のみ発生\nセットアップ・研修費用", color: C.indigo },
    { title: "基本料金（年払い）", desc: "年間契約の固定費\n金額は非公開", color: C.purple },
    { title: "従量料金", desc: "面接件数に応じた課金\n利用分だけ請求", color: C.indigoLight },
  ];
  models.forEach((m, i) => {
    const cx = 0.7 + i * 3.05;
    slide.addShape(pres.shapes.RECTANGLE, { x: cx, y: 1.2, w: 2.85, h: 1.5, fill: { color: C.white }, shadow: makeShadow() });
    slide.addShape(pres.shapes.RECTANGLE, { x: cx, y: 1.2, w: 2.85, h: 0.06, fill: { color: m.color } });
    slide.addText(m.title, { x: cx + 0.15, y: 1.4, w: 2.55, h: 0.4, fontSize: 14, fontFace: "Calibri", color: C.dark, bold: true, margin: 0 });
    slide.addText(m.desc, { x: cx + 0.15, y: 1.8, w: 2.55, h: 0.7, fontSize: 11, fontFace: "Calibri", color: C.gray500, margin: 0 });
  });

  // Pricing details
  slide.addText("公開されている料金プラン", { x: 0.7, y: 3.0, w: 8, h: 0.4, fontSize: 16, fontFace: "Calibri", color: C.dark, bold: true, margin: 0 });

  const plans = [
    ["プラン", "料金", "備考"],
    ["無料プラン", "0円", "月3件まで"],
    ["アルバイト向け", "500円/面接", "10分以内"],
    ["通常プラン", "要問い合わせ", "金額非公開"],
    ["PeopleX割", "2サービス目以降無償", "初期費用・基本料金が0円"],
  ];
  slide.addTable(plans, {
    x: 0.7, y: 3.5, w: 8.6,
    colW: [2.5, 2.5, 3.6],
    fontSize: 11, fontFace: "Calibri",
    border: { pt: 0.5, color: C.gray300 },
    rowH: [0.35, 0.35, 0.35, 0.35, 0.35],
    autoPage: false,
  });
  // Style header row manually via cell options
  plans[0].forEach((_, ci) => {
    plans[0][ci] = { text: plans[0][ci], options: { fill: { color: C.indigo }, color: C.white, bold: true, fontSize: 11 } };
  });
  // Re-add with styled header
  // (Already added above, but let me fix this approach)
}

// ==================== SLIDE 4: PeopleXの弱点 ====================
{
  const slide = pres.addSlide();
  slide.background = { color: C.white };
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.04, fill: { color: C.red } });

  slide.addText("PeopleXの弱点", { x: 0.7, y: 0.3, w: 8, h: 0.6, fontSize: 28, fontFace: "Calibri", color: C.dark, bold: true, margin: 0 });
  slide.addText("導きが攻めるべきポイント", { x: 0.7, y: 0.85, w: 6, h: 0.35, fontSize: 13, fontFace: "Calibri", color: C.red, margin: 0 });

  const weaknesses = [
    { title: "AI評価がブラックボックス", desc: "評価根拠が不透明。候補者・企業双方から不信感。" },
    { title: "料金が非公開", desc: "「要問い合わせ」で企業の不信感を生む。比較検討しづらい。" },
    { title: "求職者メリットが薄い", desc: "企業向けツールに偏重。求職者側のメリットがほぼない。" },
    { title: "導入企業は実質70社", desc: "グループ3,000社は含む数字。AI面接単体では普及途上。" },
    { title: "冷たい印象問題", desc: "AI面接への心理的抵抗。特にシニア層や非IT職種で顕著。" },
    { title: "片面プラットフォーム", desc: "企業にしか価値提供できず、ネットワーク効果が働かない。" },
  ];

  weaknesses.forEach((w, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cx = 0.7 + col * 4.5;
    const cy = 1.4 + row * 1.3;
    slide.addShape(pres.shapes.RECTANGLE, { x: cx, y: cy, w: 4.2, h: 1.1, fill: { color: "FEF2F2" } });
    slide.addText(w.title, { x: cx + 0.2, y: cy + 0.1, w: 3.8, h: 0.35, fontSize: 13, fontFace: "Calibri", color: C.red, bold: true, margin: 0 });
    slide.addText(w.desc, { x: cx + 0.2, y: cy + 0.5, w: 3.8, h: 0.45, fontSize: 11, fontFace: "Calibri", color: C.gray700, margin: 0 });
  });
}

// ==================== SLIDE 5: 競争優位性 比較表 ====================
{
  const slide = pres.addSlide();
  slide.background = { color: C.white };
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.04, fill: { color: C.indigo } });

  slide.addText("導 vs PeopleX 競争優位性", { x: 0.7, y: 0.3, w: 8, h: 0.6, fontSize: 28, fontFace: "Calibri", color: C.dark, bold: true, margin: 0 });

  const tableData = [
    [
      { text: "比較項目", options: { fill: { color: C.navy }, color: C.white, bold: true, fontSize: 11 } },
      { text: "導（みちびき）", options: { fill: { color: C.indigo }, color: C.white, bold: true, fontSize: 11 } },
      { text: "PeopleX", options: { fill: { color: C.gray700 }, color: C.white, bold: true, fontSize: 11 } },
    ],
    [{ text: "求職者メリット", options: { bold: true, fontSize: 11 } }, { text: "無料で面接練習 + 求人マッチング", options: { color: C.green, fontSize: 11 } }, { text: "なし（企業向けツール）", options: { color: C.red, fontSize: 11 } }],
    [{ text: "専門分野", options: { bold: true, fontSize: 11 } }, { text: "33分野の専門面接", options: { color: C.green, fontSize: 11 } }, { text: "汎用的", options: { fontSize: 11, color: C.gray500 } }],
    [{ text: "技術テスト", options: { bold: true, fontSize: 11 } }, { text: "選択5問+記述5問（動的生成）", options: { color: C.green, fontSize: 11 } }, { text: "面接のみ", options: { fontSize: 11, color: C.gray500 } }],
    [{ text: "スキル評価", options: { bold: true, fontSize: 11 } }, { text: "4軸の透明な評価レポート", options: { color: C.green, fontSize: 11 } }, { text: "ブラックボックス", options: { color: C.red, fontSize: 11 } }],
    [{ text: "料金透明性", options: { bold: true, fontSize: 11 } }, { text: "全プラン料金公開", options: { color: C.green, fontSize: 11 } }, { text: "要問い合わせ", options: { color: C.red, fontSize: 11 } }],
    [{ text: "ユーザー基盤", options: { bold: true, fontSize: 11 } }, { text: "求職者+企業（両面）", options: { color: C.green, fontSize: 11 } }, { text: "企業のみ（片面）", options: { fontSize: 11, color: C.gray500 } }],
    [{ text: "コスト構造", options: { bold: true, fontSize: 11 } }, { text: "少人数・低コスト運営", options: { color: C.green, fontSize: 11 } }, { text: "140名の人件費", options: { color: C.red, fontSize: 11 } }],
  ];

  slide.addTable(tableData, {
    x: 0.5, y: 1.1, w: 9,
    colW: [2, 3.5, 3.5],
    border: { pt: 0.5, color: C.gray300 },
    rowH: [0.4, 0.45, 0.45, 0.45, 0.45, 0.45, 0.45, 0.45],
    autoPage: false,
  });
}

// ==================== SLIDE 6: 両面プラットフォーム ====================
{
  const slide = pres.addSlide();
  slide.background = { color: C.navy };
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.04, fill: { color: C.indigoLight } });

  slide.addText("最大の武器: 両面プラットフォーム", { x: 0.7, y: 0.3, w: 9, h: 0.6, fontSize: 28, fontFace: "Calibri", color: C.white, bold: true, margin: 0 });

  // PeopleX model (left)
  slide.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 1.2, w: 4, h: 1.5, fill: { color: C.gray900 } });
  slide.addText("PeopleX = 片面モデル", { x: 0.7, y: 1.3, w: 4, h: 0.4, fontSize: 14, fontFace: "Calibri", color: C.gray300, bold: true, align: "center", margin: 0 });
  slide.addText("企業 → PeopleX → 候補者を評価", { x: 0.7, y: 1.8, w: 4, h: 0.3, fontSize: 12, fontFace: "Calibri", color: C.gray500, align: "center", margin: 0 });
  slide.addText("求職者にメリットなし", { x: 0.7, y: 2.2, w: 4, h: 0.3, fontSize: 12, fontFace: "Calibri", color: C.red, align: "center", margin: 0 });

  // Michibiki model (right)
  slide.addShape(pres.shapes.RECTANGLE, { x: 5.3, y: 1.2, w: 4, h: 1.5, fill: { color: C.indigo } });
  slide.addText("導き = 両面プラットフォーム", { x: 5.3, y: 1.3, w: 4, h: 0.4, fontSize: 14, fontFace: "Calibri", color: C.white, bold: true, align: "center", margin: 0 });
  slide.addText("求職者 ←→ 導き ←→ 企業", { x: 5.3, y: 1.8, w: 4, h: 0.3, fontSize: 12, fontFace: "Calibri", color: C.indigoSoft, align: "center", margin: 0 });
  slide.addText("双方にメリット", { x: 5.3, y: 2.2, w: 4, h: 0.3, fontSize: 12, fontFace: "Calibri", color: C.green, align: "center", margin: 0 });

  // Flywheel
  slide.addText("ネットワーク効果のフライホイール", { x: 0.7, y: 3.0, w: 9, h: 0.4, fontSize: 16, fontFace: "Calibri", color: C.indigoLight, bold: true, margin: 0 });

  const steps = [
    "求職者が無料で\nAI面接を受ける",
    "ユーザーデータ\nが蓄積される",
    "企業にとっての\n価値が上がる",
    "企業が課金する",
  ];
  steps.forEach((s, i) => {
    const cx = 0.7 + i * 2.35;
    slide.addShape(pres.shapes.OVAL, { x: cx + 0.45, y: 3.6, w: 1.4, h: 1.4, fill: { color: C.indigo } });
    slide.addText(s, { x: cx + 0.1, y: 3.8, w: 2.1, h: 1.0, fontSize: 10, fontFace: "Calibri", color: C.white, align: "center", valign: "middle", margin: 0 });
    if (i < 3) {
      slide.addText("→", { x: cx + 2.0, y: 3.9, w: 0.4, h: 0.8, fontSize: 24, fontFace: "Calibri", color: C.indigoLight, align: "center", valign: "middle", margin: 0 });
    }
  });

  slide.addText("Indeed、LinkedIn、Wantedlyと同じ構造", { x: 0.7, y: 5.1, w: 9, h: 0.3, fontSize: 11, fontFace: "Calibri", color: C.gray500, margin: 0 });
}

// ==================== SLIDE 7: 収益モデル ====================
{
  const slide = pres.addSlide();
  slide.background = { color: C.white };
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.04, fill: { color: C.indigo } });

  slide.addText("収益モデル（3段階）", { x: 0.7, y: 0.3, w: 8, h: 0.6, fontSize: 28, fontFace: "Calibri", color: C.dark, bold: true, margin: 0 });

  const phases = [
    {
      title: "Phase 1", sub: "今すぐ・許可不要", color: C.indigo,
      items: ["企業向けSaaS月額課金\n5〜30万円/月", "初期導入コンサル\n50万円/件"],
    },
    {
      title: "Phase 2", sub: "許可取得後", color: C.purple,
      items: ["成果報酬マッチング\n年収の25%\n（1件100〜200万円）"],
    },
    {
      title: "Phase 3", sub: "スケール期", color: C.indigoLight,
      items: ["AI面接API提供\n従量課金", "求職者プレミアム\n月額1,000〜3,000円"],
    },
  ];

  phases.forEach((p, i) => {
    const cx = 0.7 + i * 3.15;
    slide.addShape(pres.shapes.RECTANGLE, { x: cx, y: 1.2, w: 2.95, h: 4.0, fill: { color: C.white }, shadow: makeShadow() });
    slide.addShape(pres.shapes.RECTANGLE, { x: cx, y: 1.2, w: 2.95, h: 0.7, fill: { color: p.color } });
    slide.addText(p.title, { x: cx, y: 1.25, w: 2.95, h: 0.35, fontSize: 18, fontFace: "Calibri", color: C.white, bold: true, align: "center", margin: 0 });
    slide.addText(p.sub, { x: cx, y: 1.6, w: 2.95, h: 0.25, fontSize: 11, fontFace: "Calibri", color: "C7D2FE", align: "center", margin: 0 });

    p.items.forEach((item, j) => {
      const iy = 2.1 + j * 1.5;
      slide.addShape(pres.shapes.RECTANGLE, { x: cx + 0.15, y: iy, w: 2.65, h: 1.2, fill: { color: C.gray100 } });
      slide.addText(item, { x: cx + 0.3, y: iy + 0.1, w: 2.35, h: 1.0, fontSize: 12, fontFace: "Calibri", color: C.gray700, valign: "middle", margin: 0 });
    });
  });
}

// ==================== SLIDE 8: 料金プラン ====================
{
  const slide = pres.addSlide();
  slide.background = { color: C.white };
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.04, fill: { color: C.indigo } });

  slide.addText("料金プラン — PeopleXより透明で安い", { x: 0.7, y: 0.3, w: 9, h: 0.6, fontSize: 26, fontFace: "Calibri", color: C.dark, bold: true, margin: 0 });

  const plans = [
    { name: "無料", price: "0円", count: "月5件", note: "PeopleXは3件", highlight: false },
    { name: "スターター", price: "5万円/月", count: "月30件", note: "小規模企業向け", highlight: false },
    { name: "ビジネス", price: "15万円/月", count: "月100件", note: "中小企業向け", highlight: true },
    { name: "エンタープライズ", price: "30万円〜/月", count: "無制限", note: "大手企業向け", highlight: false },
  ];

  plans.forEach((p, i) => {
    const cx = 0.5 + i * 2.35;
    const bgColor = p.highlight ? C.indigo : C.white;
    const textColor = p.highlight ? C.white : C.dark;
    const subColor = p.highlight ? "C7D2FE" : C.gray500;

    slide.addShape(pres.shapes.RECTANGLE, { x: cx, y: 1.1, w: 2.15, h: 3.2, fill: { color: bgColor }, shadow: makeShadow() });
    if (p.highlight) {
      slide.addText("人気", { x: cx + 1.4, y: 1.2, w: 0.6, h: 0.25, fontSize: 9, fontFace: "Calibri", color: C.white, fill: { color: C.amber }, align: "center", bold: true });
    }
    slide.addText(p.name, { x: cx, y: 1.4, w: 2.15, h: 0.4, fontSize: 15, fontFace: "Calibri", color: textColor, bold: true, align: "center", margin: 0 });
    slide.addText(p.price, { x: cx, y: 1.9, w: 2.15, h: 0.5, fontSize: 22, fontFace: "Calibri", color: p.highlight ? C.white : C.indigo, bold: true, align: "center", margin: 0 });
    slide.addText(p.count, { x: cx, y: 2.5, w: 2.15, h: 0.3, fontSize: 13, fontFace: "Calibri", color: subColor, align: "center", margin: 0 });
    slide.addShape(pres.shapes.LINE, { x: cx + 0.3, y: 3.0, w: 1.55, h: 0, line: { color: p.highlight ? "6366F1" : C.gray300, width: 0.5 } });
    slide.addText(p.note, { x: cx, y: 3.1, w: 2.15, h: 0.3, fontSize: 10, fontFace: "Calibri", color: subColor, align: "center", margin: 0 });
  });

  slide.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 4.5, w: 9, h: 0.7, fill: { color: C.indigoSoft } });
  slide.addText("全プラン共通: 初期導入費 50万円  |  候補者プール付き  |  33分野対応  |  透明な料金体系", {
    x: 0.7, y: 4.55, w: 8.6, h: 0.6, fontSize: 12, fontFace: "Calibri", color: C.indigo, align: "center", valign: "middle", margin: 0,
  });
}

// ==================== SLIDE 9: ロードマップ ====================
{
  const slide = pres.addSlide();
  slide.background = { color: C.white };
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.04, fill: { color: C.indigo } });

  slide.addText("今年度 利益1億円ロードマップ", { x: 0.7, y: 0.3, w: 8, h: 0.6, fontSize: 28, fontFace: "Calibri", color: C.dark, bold: true, margin: 0 });

  const quarters = [
    { q: "Q1", period: "4-6月", label: "基盤構築", companies: "15社", revenue: "500万円", color: C.indigo },
    { q: "Q2", period: "7-9月", label: "拡大", companies: "33社", revenue: "2,500万円", color: C.purple },
    { q: "Q3", period: "10-12月", label: "スケール", companies: "40社", revenue: "4,000万円", color: C.indigoLight },
    { q: "Q4", period: "1-3月", label: "利益確定", companies: "40社+", revenue: "5,200万円", color: C.green },
  ];

  // Timeline bar
  slide.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: 2.3, w: 8.6, h: 0.08, fill: { color: C.gray300 } });

  quarters.forEach((q, i) => {
    const cx = 0.7 + i * 2.3;
    // Circle on timeline
    slide.addShape(pres.shapes.OVAL, { x: cx + 0.8, y: 2.05, w: 0.55, h: 0.55, fill: { color: q.color } });
    slide.addText(q.q, { x: cx + 0.8, y: 2.08, w: 0.55, h: 0.5, fontSize: 11, fontFace: "Calibri", color: C.white, bold: true, align: "center", valign: "middle", margin: 0 });

    // Card below
    slide.addShape(pres.shapes.RECTANGLE, { x: cx, y: 2.8, w: 2.1, h: 2.3, fill: { color: C.white }, shadow: makeShadow() });
    slide.addShape(pres.shapes.RECTANGLE, { x: cx, y: 2.8, w: 2.1, h: 0.05, fill: { color: q.color } });

    slide.addText(q.period, { x: cx, y: 2.95, w: 2.1, h: 0.3, fontSize: 11, fontFace: "Calibri", color: C.gray500, align: "center", margin: 0 });
    slide.addText(q.label, { x: cx, y: 3.2, w: 2.1, h: 0.35, fontSize: 15, fontFace: "Calibri", color: C.dark, bold: true, align: "center", margin: 0 });
    slide.addText(q.companies, { x: cx, y: 3.65, w: 2.1, h: 0.35, fontSize: 13, fontFace: "Calibri", color: C.gray700, align: "center", margin: 0 });
    slide.addText(q.revenue, { x: cx, y: 4.1, w: 2.1, h: 0.45, fontSize: 20, fontFace: "Calibri", color: q.color, bold: true, align: "center", margin: 0 });
  });

  // Total
  slide.addShape(pres.shapes.RECTANGLE, { x: 2.5, y: 1.1, w: 5, h: 0.7, fill: { color: C.navy } });
  slide.addText("年間売上 1.22億円  /  利益 1億円", { x: 2.5, y: 1.1, w: 5, h: 0.7, fontSize: 18, fontFace: "Calibri", color: C.white, bold: true, align: "center", valign: "middle", margin: 0 });
}

// ==================== SLIDE 10: 3つの戦略 ====================
{
  const slide = pres.addSlide();
  slide.background = { color: C.navy };
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.04, fill: { color: C.indigoLight } });

  slide.addText("PeopleXに勝つための3つの戦略", { x: 0.7, y: 0.3, w: 9, h: 0.6, fontSize: 28, fontFace: "Calibri", color: C.white, bold: true, margin: 0 });

  const strategies = [
    { num: "01", title: "価格で勝つ", desc: "無料枠を多く（5件 vs 3件）\n料金を完全公開\nPeopleXの半額以下の月額設定", color: C.indigo },
    { num: "02", title: "ネットワークで勝つ", desc: "求職者1万人のユーザー基盤\n「候補者プール付き」の営業武器\n両面プラットフォームのネットワーク効果", color: C.purple },
    { num: "03", title: "専門性で勝つ", desc: "33分野の専門面接（PeopleXは汎用）\n技術テスト+面接の複合評価\n4軸の透明なスキルレポート", color: C.indigoLight },
  ];

  strategies.forEach((s, i) => {
    const cy = 1.2 + i * 1.45;
    slide.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: cy, w: 8.6, h: 1.25, fill: { color: C.gray900 } });
    slide.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: cy, w: 0.08, h: 1.25, fill: { color: s.color } });

    slide.addText(s.num, { x: 1.1, y: cy + 0.1, w: 0.8, h: 0.8, fontSize: 32, fontFace: "Georgia", color: s.color, bold: true, margin: 0 });
    slide.addText(s.title, { x: 2.1, y: cy + 0.1, w: 2.5, h: 0.4, fontSize: 18, fontFace: "Calibri", color: C.white, bold: true, margin: 0 });
    slide.addText(s.desc, { x: 2.1, y: cy + 0.5, w: 7, h: 0.7, fontSize: 11, fontFace: "Calibri", color: C.gray500, margin: 0 });
  });
}

// ==================== SLIDE 11: 営業戦略 ====================
{
  const slide = pres.addSlide();
  slide.background = { color: C.white };
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.04, fill: { color: C.indigo } });

  slide.addText("営業戦略 — PeopleXの顧客を奪う", { x: 0.7, y: 0.3, w: 9, h: 0.6, fontSize: 26, fontFace: "Calibri", color: C.dark, bold: true, margin: 0 });

  const tactics = [
    { title: "PeopleX無料プラン利用企業を狙う", desc: "月3件では足りない企業に「月5件無料+候補者プール付き」を提案。乗り換えコストゼロ。" },
    { title: "スタートアップ・中小企業を先取り", desc: "PeopleXはエンタープライズ重視。導きは月額5万円からの低価格で中小企業を先に獲得。" },
    { title: "パートナー戦略", desc: "人材紹介会社と提携し、AI面接ツールを提供。パートナー経由で企業を獲得（PeopleXと同じ戦略）。" },
    { title: "求職者ユーザーの所属企業に逆営業", desc: "1万人のユーザーが所属する企業のHR部門にアプローチ。「御社の社員が既に使っています」。" },
  ];

  tactics.forEach((t, i) => {
    const cy = 1.1 + i * 1.1;
    slide.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: cy, w: 8.6, h: 0.9, fill: { color: C.gray100 } });
    slide.addShape(pres.shapes.RECTANGLE, { x: 0.7, y: cy, w: 0.06, h: 0.9, fill: { color: C.indigo } });
    slide.addText(t.title, { x: 1.0, y: cy + 0.05, w: 8, h: 0.35, fontSize: 14, fontFace: "Calibri", color: C.dark, bold: true, margin: 0 });
    slide.addText(t.desc, { x: 1.0, y: cy + 0.4, w: 8, h: 0.4, fontSize: 11, fontFace: "Calibri", color: C.gray700, margin: 0 });
  });
}

// ==================== SLIDE 12: まとめ ====================
{
  const slide = pres.addSlide();
  slide.background = { color: C.navy };
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.04, fill: { color: C.indigoLight } });
  slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.585, w: 10, h: 0.04, fill: { color: C.indigoLight } });

  // Decorative
  slide.addShape(pres.shapes.OVAL, { x: -2, y: -2, w: 5, h: 5, fill: { color: C.indigo, transparency: 85 } });
  slide.addShape(pres.shapes.OVAL, { x: 7, y: 3, w: 5, h: 5, fill: { color: C.indigo, transparency: 85 } });

  slide.addText("まとめ", { x: 0.7, y: 0.4, w: 8, h: 0.6, fontSize: 28, fontFace: "Calibri", color: C.white, bold: true, margin: 0 });

  const points = [
    "導きはPeopleXにない「両面プラットフォーム」",
    "求職者の無料利用がネットワーク効果を生む",
    "透明な料金と33分野の専門性で差別化",
    "今年度 売上1.22億円・利益1億円は達成可能",
  ];

  points.forEach((p, i) => {
    slide.addShape(pres.shapes.RECTANGLE, { x: 1.5, y: 1.3 + i * 0.7, w: 7, h: 0.5, fill: { color: C.gray900 } });
    slide.addShape(pres.shapes.RECTANGLE, { x: 1.5, y: 1.3 + i * 0.7, w: 0.06, h: 0.5, fill: { color: C.indigoLight } });
    slide.addText(p, { x: 1.8, y: 1.3 + i * 0.7, w: 6.5, h: 0.5, fontSize: 14, fontFace: "Calibri", color: C.white, valign: "middle", margin: 0 });
  });

  slide.addText("「AIで、すべての人に公平な面接を。」", {
    x: 1.5, y: 4.2, w: 7, h: 0.7, fontSize: 22, fontFace: "Georgia", color: C.indigoLight, italic: true, align: "center", valign: "middle", margin: 0,
  });

  slide.addText("michibiki.tech", { x: 1.5, y: 5.0, w: 7, h: 0.4, fontSize: 13, fontFace: "Calibri", color: C.gray500, align: "center", margin: 0 });
}

// Save
pres.writeFile({ fileName: "/Users/user/Desktop/mercorJP/marketing/導き_事業計画書_vs_PeopleX.pptx" })
  .then(() => console.log("DONE: Presentation saved"))
  .catch(err => console.error("ERROR:", err));
