/* ==========================================================
   サイト全体の設定
   SNS の URL やナビゲーションはここを書き換えるだけで全ページに反映される
   ========================================================== */
window.HANAMORI = window.HANAMORI || {};

HANAMORI.site = {
  name: "HANAMORI",
  tagline: "花と森の、バスケア",
  shippingFee: 660,          // 送料（税込）
  freeShippingFrom: 5500,    // この金額以上で送料無料
  shippingDays: "3〜5営業日", // ご注文から発送までの目安

  // SNS（公開時に本番の URL へ差し替える）
  sns: {
    instagram: "https://www.instagram.com/hanamori_official_demo/",
    x: "https://x.com/hanamori_demo"
  },

  // ヘッダー・メニューに表示するリンク（path はサイトのルートからの相対パス）
  nav: [
    { label: "コンセプト", en: "Concept", path: "html/concept.html" },
    { label: "商品一覧", en: "Products", path: "html/products/index.html" },
    { label: "成分とこだわり", en: "Ingredients", path: "html/ingredients.html" },
    { label: "バスタイムの過ごし方", en: "Ritual", path: "html/how-to.html" },
    { label: "よくある質問", en: "FAQ", path: "html/faq.html" }
  ],

  // フッターに表示するリンク
  footerNav: [
    { label: "トップ", path: "index.html" },
    { label: "コンセプト", path: "html/concept.html" },
    { label: "商品一覧", path: "html/products/index.html" },
    { label: "成分とこだわり", path: "html/ingredients.html" },
    { label: "バスタイムの過ごし方", path: "html/how-to.html" },
    { label: "よくある質問", path: "html/faq.html" },
    { label: "お問い合わせ", path: "html/contact.html" },
    { label: "会社概要", path: "html/company.html" },
    { label: "特定商取引法に基づく表記", path: "html/legal.html" },
    { label: "プライバシーポリシー", path: "html/privacy.html" },
    { label: "利用規約", path: "html/terms.html" }
  ]
};
