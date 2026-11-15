/* ==========================================================
   商品データ
   商品・価格・画像はここだけで管理する。
   本番化するときは、この配列を Shopify や Stripe の商品データに差し替える。
   ========================================================== */
window.HANAMORI = window.HANAMORI || {};

(function () {
  // 全シリーズ共通の商品構成（香りごとに同じラインナップ）
  const lineup = [
    { type: "shampoo",   label: "シャンプー",           sub: "300mL",            price: 3520, image: "shampoo" },
    { type: "treatment", label: "トリートメント",       sub: "250g",             price: 3850, image: "treatment" },
    { type: "set",       label: "シャンプー＋トリートメント セット", sub: "各1本", price: 6930, image: "set" },
    { type: "bath6",     label: "薬用入浴剤",           sub: "40g×6包［医薬部外品］", price: 1980, image: "bath" },
    { type: "bath1",     label: "薬用入浴剤（お試し）", sub: "40g×1包［医薬部外品］", price: 330,  image: "bath" },
    { type: "gift",      label: "ギフトセット",         sub: "シャンプー・トリートメント・入浴剤6包・ギフト箱", price: 8800, image: "set" }
  ];

  const series = [
    {
      id: "forest-breath",
      night: "頭の中がいっぱいの夜に",   // 「今夜はどんな気分？」のカードの問いかけ
      name: "Forest Breath",
      nameJa: "フォレストブレス",
      notes: "ヒノキ・ユーカリ・シダーウッド",
      mood: "朝の森を深呼吸するような、澄んだ木の香り。",
      desc: "雨上がりの森に足を踏み入れたときの、ひんやりと澄んだ空気。ヒノキとユーカリの清々しさに、シダーウッドがやさしく寄り添います。頭の中がいっぱいの日に、深呼吸をひとつ。",
      color: "#8FA68E",
      colorLight: "#DDE5D6",
      signature: true
    },
    {
      id: "flower-field",
      night: "こわばった気持ちをほどきたい夜に",   // 「今夜はどんな気分？」のカードの問いかけ
      name: "Flower Field",
      nameJa: "フラワーフィールド",
      notes: "ラベンダー・ゼラニウム",
      mood: "風にゆれる一面の花畑のような、やわらかな花の香り。",
      desc: "陽だまりの花畑を、風がやさしく渡っていく午後。ラベンダーとゼラニウムが、こわばった気持ちをふわりとほどきます。",
      color: "#B7A3C4",
      colorLight: "#ECE4F0"
    },
    {
      id: "morning-dew",
      night: "気分を切り替えたい夜に",   // 「今夜はどんな気分？」のカードの問いかけ
      name: "Morning Dew",
      nameJa: "モーニングデュウ",
      notes: "ゆず・ベルガモット・ミント",
      mood: "朝露に光る草原のような、すっきりとした柑橘の香り。",
      desc: "朝露がきらめく草原の、みずみずしい空気。ゆずとベルガモットの明るさにミントがすっと抜けて、気分を軽やかに切り替えます。",
      color: "#C9B37E",
      colorLight: "#F2ECDC"
    },
    {
      id: "moon-garden",
      night: "1日をゆっくり締めくくりたい夜に",   // 「今夜はどんな気分？」のカードの問いかけ
      name: "Moon Garden",
      nameJa: "ムーンガーデン",
      notes: "カモミール・ネロリ",
      mood: "月明かりの庭のような、眠る前のやすらぎの香り。",
      desc: "静かな夜の庭に、月の光がやわらかく降りてくる時間。カモミールとネロリの穏やかな香りが、1日の終わりをゆっくりと締めくくります。",
      color: "#A9A3BD",
      colorLight: "#E8E5EF"
    },
    {
      id: "mossy-rain",
      night: "静かに過ごしたい夜に",   // 「今夜はどんな気分？」のカードの問いかけ
      name: "Mossy Rain",
      nameJa: "モッシーレイン",
      notes: "ベチバー・パチュリ・オークモス",
      mood: "雨上がりの深い森のような、落ち着いた大人の香り。",
      desc: "苔むした森に雨が降り、土と緑の香りが立ちのぼる。ベチバーとパチュリの深い香りが、ざわついた心を静かに落ち着かせます。",
      color: "#6F7F68",
      colorLight: "#DCE0D5"
    }
  ];

  // シリーズ × ラインナップ から SKU（購入単位）を作る
  series.forEach(function (s) {
    // 商品画像は全シリーズともモック写真（WebP）。以前のイラストに戻すときは ".svg" にする
    const ext = ".webp";
    s.variants = lineup.map(function (item) {
      return {
        sku: s.id + "__" + item.type,
        type: item.type,
        label: item.label,
        sub: item.sub,
        price: item.price,
        image: "assets/images/products/" + s.id + "-" + item.image + ext
      };
    });
    s.images = ["shampoo", "treatment", "bath", "set"].map(function (k) {
      return "assets/images/products/" + s.id + "-" + k + ext;
    });
    s.url = "html/products/" + s.id + ".html";
    // 「今夜はどんな気分？」のカードの写真（香りの花や葉が水に浮かぶ写真・縦長 4:5）
    s.moodImage = "assets/images/moods/" + s.id + ".webp";
  });

  // 5つの香りのお試しセット（香りをまたぐ商品なので、シリーズとは別に1つだけ持つ）
  // サイトの主役のゴール。価格は 1包 ¥330 × 5 = ¥1,650 より少しお得にしている
  const trialSet = {
    id: "trial-set",
    name: "Trial Set",
    nameJa: "5つの香りのお試しセット",
    title: "5つの香りの<wbr>お試しセット",   // <wbr>：スマホで「お試しセット」の手前で改行できるように
    notes: "5つの香りの薬用入浴剤 各1包",
    mood: "5つの香りを1包ずつ。今夜の気分で選べるお試しです。",
    desc: "フォレストブレス、フラワーフィールド、モーニングデュウ、ムーンガーデン、モッシーレイン。5つの香りの薬用入浴剤を1包ずつお届けします。その日の気分で1包ずつ試して、いちばん好きな香りを見つけてください。",
    color: "#8FA68E",
    colorLight: "#DDE5D6",
    bathOnly: true,
    url: "html/products/trial-set.html",
    images: ["assets/images/products/trial-set.webp"].concat(series.map(function (s) {
      return "assets/images/products/" + s.id + "-bath.webp";
    }))
  };
  trialSet.variants = [{
    sku: "trial-set__trial5",
    type: "trial5",
    label: "5つの香りのお試しセット",
    sub: "40g×5包（5つの香り 各1包）［医薬部外品］送料無料",
    price: 1500,
    freeShipping: true,   // 送料無料（このセットを含む注文は送料がかからない）
    image: "assets/images/products/trial-set.webp"
  }];

  // 薬用入浴剤の効能効果（医薬部外品として表示する内容）
  const bathEffects = "疲労回復、肩のこり、腰痛、冷え症、産前産後の冷え症、神経痛、リウマチ、うちみ、くじき、痔、荒れ性、あせも、しっしん、にきび、しもやけ、ひび、あかぎれ";

  HANAMORI.products = {
    series: series,
    trialSet: trialSet,
    bathEffects: bathEffects,
    findSeries: function (id) {
      if (id === trialSet.id) return trialSet;
      return series.find(function (s) { return s.id === id; });
    },
    // 種類（type）から価格の見本を探す。どの香りも同じ価格なので最初のシリーズから取る
    findType: function (type) {
      return trialSet.variants.concat(series[0].variants).find(function (v) { return v.type === type; });
    },
    findSku: function (sku) {
      const id = sku.split("__")[0];
      const s = this.findSeries(id);
      if (!s) return null;
      const v = s.variants.find(function (x) { return x.sku === sku; });
      return v ? { series: s, variant: v } : null;
    }
  };
})();
