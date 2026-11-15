/* ==========================================================
   商品の表示
   - 一覧：[data-product-list]（data-filter="true" で種類別の絞り込みタブを表示）
   - 詳細：<body data-series="forest-breath"> のページの [data-product-detail]
   - 香りを気分で選ぶカード：[data-scent-list]
   ========================================================== */
(function () {
  const u = HANAMORI.utils;
  const P = HANAMORI.products;

  const typeTabs = [
    { key: "all", label: "すべて" },
    { key: "shampoo", label: "シャンプー" },
    { key: "treatment", label: "トリートメント" },
    { key: "bath6", label: "薬用入浴剤" },
    { key: "set", label: "セット" }
  ];

  // group：種類の絞り込みタブでどこに入るか（お試しセットは「薬用入浴剤」に入れる）
  function card(series, variant, group) {
    return (
      '<a class="product-card reveal" href="' + u.path(series.url) + "?type=" + variant.type + '" data-type="' + (group || variant.type) + '" data-series="' + series.id + '">' +
      '<div class="product-card__image"><img src="' + u.path(variant.image) + '" alt="' + series.name + " " + variant.label + '" width="400" height="500" loading="lazy"></div>' +
      '<div class="product-card__body">' +
      '<p class="product-card__series">' + series.name + "</p>" +
      '<h3 class="product-card__title"><span class="sparkle" data-sparkle>' + variant.label + "</span></h3>" +
      '<p class="product-card__notes">' + series.notes + "</p>" +
      '<p class="product-card__price">' + u.yen(variant.price) + '<small>（税込）／' + variant.sub + "</small></p>" +
      "</div></a>"
    );
  }

  function renderList() {
    document.querySelectorAll("[data-product-list]").forEach(function (box) {
      const only = box.dataset.type;                 // 特定の種類だけ表示（トップ用）
      const showTypes = only ? [only] : ["shampoo", "treatment", "bath6", "set"];
      const cards = [];
      // 一覧ページでは、主役のお試しセットを先頭に置く
      if (!only) cards.push(card(P.trialSet, P.trialSet.variants[0], "bath6"));
      showTypes.forEach(function (type) {
        P.series.forEach(function (s) {
          const v = s.variants.find(function (x) { return x.type === type; });
          if (v) cards.push(card(s, v));
        });
      });
      let html = '<div class="grid grid--3" data-cards>' + cards.join("") + "</div>";

      if (box.dataset.filter === "true") {
        html =
          '<div class="filter-tabs" role="group" aria-label="商品の種類で絞り込む">' +
          typeTabs.map(function (t, i) {
            return '<button type="button" data-filter-key="' + t.key + '" aria-pressed="' + (i === 0) + '">' + t.label + "</button>";
          }).join("") +
          "</div>" +
          // 香りで切り替えるタブ（選ぶと背景がその香りの色ににじむ）
          '<div class="filter-tabs filter-tabs--scent" role="group" aria-label="香りで絞り込む">' +
          '<button type="button" data-scent-key="all" aria-pressed="true">All</button>' +
          P.series.map(function (s) {
            return '<button type="button" data-scent-key="' + s.id + '" aria-pressed="false" style="--dot:' + s.color + '">' +
              '<span class="filter-tabs__dot" aria-hidden="true"></span>' + s.name + "</button>";
          }).join("") +
          "</div>" + html;
      }
      box.innerHTML = html;

      const state = { type: "all", scent: "all" };
      // 「?type=set」のように種類を指定して開いたら、そのタブを選んだ状態にする（お試しセットのページから来たとき）
      const preType = new URLSearchParams(location.search).get("type");
      const wash = box.closest(".section");
      if (box.dataset.filter === "true" && wash) wash.classList.add("scent-wash");

      box.addEventListener("click", function (e) {
        const typeBtn = e.target.closest("[data-filter-key]");
        const scentBtn = e.target.closest("[data-scent-key]");
        if (!typeBtn && !scentBtn) return;
        const btn = typeBtn || scentBtn;
        const attr = typeBtn ? "data-filter-key" : "data-scent-key";
        box.querySelectorAll("[" + attr + "]").forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
        if (typeBtn) state.type = typeBtn.dataset.filterKey;
        if (scentBtn) {
          state.scent = scentBtn.dataset.scentKey;
          const s = P.findSeries(state.scent);
          if (wash) wash.style.setProperty("--scent-tint", s ? s.color : "transparent");
        }
        box.querySelectorAll(".product-card").forEach(function (c) {
          c.hidden = (state.type !== "all" && c.dataset.type !== state.type) ||
                     (state.scent !== "all" && c.dataset.series !== state.scent);
        });
      });
      const preBtn = preType && box.querySelector('[data-filter-key="' + preType + '"]');
      if (preBtn) preBtn.click();
    });
  }

  // 「今夜はどんな気分？」：気分の問いかけ → 香りの名前 → 説明。押すと香りの商品ページへ。
  // PC はカーソルを乗せると説明が浮かび上がり、スマホは説明を最初から見せて指で横にめくる（top.css の .mood-card）
  function renderScents() {
    document.querySelectorAll("[data-scent-list]").forEach(function (box) {
      // 香りの商品ページでは、いま見ている香りを除いて「ほかの香り」だけを並べる
      const list = P.series.filter(function (s) { return s.id !== document.body.dataset.series; });
      box.innerHTML = '<ul class="mood-list" role="list" style="--count:' + list.length + '">' + list.map(function (s, i) {
        return (
          '<li class="mood-list__item reveal" data-delay="' + (i % 4) + '">' +
          '<a class="mood-card" href="' + u.path(s.url) + '" style="--scent-color:' + s.color + '">' +
          '<span class="mood-card__media"><img src="' + u.path(s.moodImage) + '" alt="" width="600" height="750" loading="lazy" decoding="async"></span>' +
          '<span class="mood-card__body">' +
          '<span class="mood-card__night">' + s.night + "</span>" +
          '<span class="mood-card__name">' + s.name + "</span>" +
          '<span class="mood-card__more"><span class="mood-card__more-inner">' +
          '<span class="mood-card__desc">' + s.mood + "</span>" +
          '<span class="mood-card__notes">' + s.notes + "</span>" +
          '<span class="mood-card__go" aria-hidden="true">この香りを見る →</span>' +
          "</span></span></span></a></li>"
        );
      }).join("") + "</ul>";
    });
  }

  function renderDetail() {
    const box = document.querySelector("[data-product-detail]");
    if (!box) return;
    const s = P.findSeries(document.body.dataset.series);
    if (!s) return;
    const params = new URLSearchParams(location.search);
    const wanted = params.get("type") || "set";
    // 指定の種類がない商品（お試しセットなど）は、最初の選択肢を選んでおく
    const initialType = s.variants.some(function (v) { return v.type === wanted; }) ? wanted : s.variants[0].type;
    const isBath = function (v) { return v.type.indexOf("bath") === 0; };

    const variants = s.variants.map(function (v) {
      return (
        '<label class="variant">' +
        '<input type="radio" name="sku" value="' + v.sku + '"' + (v.type === initialType ? " checked" : "") + ">" +
        '<span class="variant__name">' + v.label + "<small>" + v.sub + "</small></span>" +
        '<span class="variant__price">' + u.yen(v.price) + "</span></label>"
      );
    }).join("");

    const thumbs = s.images.map(function (src, i) {
      return '<button type="button" data-thumb="' + src + '"' + (i === 0 ? ' aria-current="true"' : "") + ' aria-label="画像' + (i + 1) + 'を表示"><img src="' + u.path(src) + '" alt="" width="72" height="72" loading="lazy"></button>';
    }).join("");

    const shareText = encodeURIComponent("HANAMORI " + s.name + " — " + s.mood);
    const shareUrl = encodeURIComponent(location.href.split("?")[0]);

    box.innerHTML =
      '<div class="product-detail container">' +
      '<div class="product-gallery">' +
      '<div class="product-gallery__main"><img data-main-image src="' + u.path(s.images[0]) + '" alt="' + s.name + 'の商品画像" width="800" height="800"></div>' +
      '<div class="product-gallery__thumbs">' + thumbs + "</div></div>" +
      '<div class="product-info">' +
      '<p class="product-info__series">' + s.name + "</p>" +
      "<h1>" + (s.title || s.nameJa + " シリーズ") + "</h1>" +
      '<p class="product-info__notes">' + (s.bathOnly ? "内容：" : "香り：") + s.notes + "</p>" +
      '<p class="product-info__desc">' + s.desc + "</p>" +
      '<form data-add-form>' +
      '<fieldset style="border:0;padding:0;margin:0"><legend class="visually-hidden">商品を選ぶ</legend><div class="variant-list">' + variants + "</div></fieldset>" +
      '<div class="purchase-row">' +
      '<div class="qty"><button type="button" data-step="-1" aria-label="数量を減らす">−</button><input type="number" name="qty" min="1" max="10" value="1" aria-label="数量"><button type="button" data-step="1" aria-label="数量を増やす">＋</button></div>' +
      '<button class="button" type="submit" id="add-to-cart">カートに入れる</button>' +
      "</div>" +
      // お試しセット：定期購入ではないことを添える。香りの商品：迷った人をお試しセットへ戻す道（文字リンクで控えめに）
      (s.id === P.trialSet.id
        ? '<p class="cta-note">送料無料・1回きりのお届けで、定期購入ではありません</p>'
        : '<p class="product-info__trial">ほかの香りも試したい方は <a class="text-link" href="' + u.path(P.trialSet.url) + '">5つの香りのお試しセット（送料無料）</a></p>') +
      "</form>" +
      '<div class="share-row">シェアする' +
      '<div class="sns-links"><a href="https://x.com/intent/post?text=' + shareText + "&url=" + shareUrl + '" target="_blank" rel="noopener" aria-label="Xでシェア（新しいタブで開く）">' + HANAMORI.icons.x + "</a></div></div>" +

      '<div class="spec-block"><h2>使い方</h2>' +
      (s.bathOnly
        ? "<p>お湯（約180L）に1包（40g）を入れ、よくかき混ぜてご入浴ください。</p></div>"
        : "<p>シャンプー：髪と頭皮を十分にぬらし、適量を手に取って泡立て、指の腹でやさしく洗います。トリートメント：シャンプー後に毛先を中心になじませ、1〜3分おいてからすすぎます。薬用入浴剤：お湯（約180L）に1包（40g）を入れ、よくかき混ぜてご入浴ください。</p></div>") +
      '<div class="spec-block"><h2>薬用入浴剤の効能効果</h2><p>' + P.bathEffects + '</p><p class="note">医薬部外品。有効成分：炭酸水素ナトリウム、乾燥硫酸ナトリウム。</p></div>' +
      '<div class="spec-block"><h2>ご注意</h2><p class="note">肌に異常が生じていないかよく注意して使用してください。肌に合わないときは使用を中止し、皮ふ科専門医等へご相談ください。' + (s.bathOnly ? "" : "シャンプー・トリートメントは化粧品です。") + '※本サイトは架空ブランドのデモのため、成分・効能は表示例です。</p></div>' +
      "</div></div>";

    // サムネイル切り替え
    const main = box.querySelector("[data-main-image]");
    box.querySelectorAll("[data-thumb]").forEach(function (b) {
      b.addEventListener("click", function () {
        main.src = u.path(b.dataset.thumb);
        box.querySelectorAll("[data-thumb]").forEach(function (x) { x.removeAttribute("aria-current"); });
        b.setAttribute("aria-current", "true");
      });
    });

    // 数量
    const qty = box.querySelector('input[name="qty"]');
    box.querySelectorAll("[data-step]").forEach(function (b) {
      b.addEventListener("click", function () {
        qty.value = Math.max(1, Math.min(10, (parseInt(qty.value, 10) || 1) + parseInt(b.dataset.step, 10)));
      });
    });

    // カートに入れる
    const form = box.querySelector("[data-add-form]");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const sku = form.querySelector('input[name="sku"]:checked').value;
      HANAMORI.cart.add(sku, parseInt(qty.value, 10) || 1);
      u.toast("カートに追加しました");
    });

    // スマートフォン用の固定購入バー
    const bar = document.querySelector("[data-buy-bar]");
    if (bar) {
      const updateBar = function () {
        const v = P.findSku(form.querySelector('input[name="sku"]:checked').value).variant;
        bar.querySelector("[data-bar-label]").innerHTML = "<strong>" + v.label + "</strong>" + u.yen(v.price) + "（税込）";
      };
      form.addEventListener("change", updateBar);
      updateBar();
      bar.querySelector("button").addEventListener("click", function () { form.requestSubmit(); });
    }
    // 画面に表示中の商品画像（初期選択に合わせる）
    const selected = P.findSku(form.querySelector('input[name="sku"]:checked').value).variant;
    main.src = u.path(selected.image);
  }

  // 料金一覧（トップ）：先頭はお試しセット。ほかは全シリーズ共通の価格
  const priceTypes = ["trial5", "bath1", "bath6", "shampoo", "treatment"];
  function renderPrices() {
    document.querySelectorAll("[data-price-list]").forEach(function (box) {
      const variants = priceTypes.map(P.findType);
      box.innerHTML =
        '<ul class="price-list reveal">' +
        variants.map(function (v, i) {
          return (
            '<li class="price-list__item' + (i === 0 ? " price-list__item--first" : "") + '">' +
            '<span class="price-list__name">' + v.label + "<small>" + v.sub + "</small></span>" +
            '<span class="price-list__price">' + u.yen(v.price) + "<small>（税込）</small></span></li>"
          );
        }).join("") +
        "</ul>";
    });
  }

  // お試しセットのお得さ：単品（1包）を5つ買う場合と比べる [data-trial-compare]
  function renderTrialCompare() {
    document.querySelectorAll("[data-trial-compare]").forEach(function (box) {
      const one = P.findType("bath1"), trial = P.trialSet.variants[0], fee = HANAMORI.site.shippingFee;
      box.innerHTML =
        '<table class="compare-table"><caption class="visually-hidden">お試しセットと単品5包の比較</caption>' +
        '<thead><tr><th scope="col"></th><th scope="col">単品を5包</th><th scope="col">お試しセット</th></tr></thead><tbody>' +
        '<tr><th scope="row">商品代</th><td>' + u.yen(one.price * 5) + '</td><td>' + u.yen(trial.price) + "</td></tr>" +
        '<tr><th scope="row">送料</th><td>' + u.yen(fee) + "</td><td>無料</td></tr>" +
        '<tr><th scope="row">香り</th><td>選んだ香り</td><td>5つの香り 各1包</td></tr>' +
        '<tr class="compare-table__total"><th scope="row">お支払い</th><td>' + u.yen(one.price * 5 + fee) + '</td><td><strong>' + u.yen(trial.price) + "</strong></td></tr>" +
        "</tbody></table>" +
        '<p class="note">価格はすべて税込。単品の送料は、ほかの商品と合わせて' + u.yen(HANAMORI.site.freeShippingFrom) + "以上で無料になります。</p>";
    });
  }

  // 5日間の香りめぐり（お試しセットのページ）[data-scent-tour]：1日1包、気分に合わせて
  function renderScentTour() {
    document.querySelectorAll("[data-scent-tour]").forEach(function (box) {
      box.innerHTML = '<ol class="scent-tour" role="list">' + P.series.map(function (s, i) {
        return (
          '<li class="scent-tour__item reveal" data-delay="' + (i % 4) + '">' +
          '<span class="scent-tour__media"><img src="' + u.path(s.moodImage) + '" alt="" width="600" height="750" loading="lazy" decoding="async"></span>' +
          '<span class="scent-tour__day en">Night ' + (i + 1) + "</span>" +
          '<span class="scent-tour__night">' + s.night + "</span>" +
          '<span class="scent-tour__name">' + s.name + "</span>" +
          '<span class="scent-tour__notes">' + s.notes + "</span></li>"
        );
      }).join("") + "</ol>";
    });
  }

  // お試しした方の声：[data-voices]（中身は site.js の voices）
  function renderVoices() {
    document.querySelectorAll("[data-voices]").forEach(function (box) {
      box.innerHTML = '<div class="voice-list">' + HANAMORI.site.voices.map(function (v, i) {
        return (
          '<figure class="voice-card reveal" data-delay="' + i + '">' +
          '<blockquote class="voice-card__text"><p>' + u.escape(v.text) + "</p></blockquote>" +
          '<figcaption class="voice-card__who">' + u.escape(v.who) + '<span class="voice-card__scent">' + u.escape(v.scent) + "</span></figcaption>" +
          "</figure>"
        );
      }).join("") + "</div>";
    });
  }

  // site.js の値を差し込む（送料・発送の目安など）
  function renderSiteValues() {
    document.querySelectorAll("[data-site-yen]").forEach(function (el) {
      el.textContent = u.yen(HANAMORI.site[el.dataset.siteYen]);
    });
    document.querySelectorAll("[data-site-text]").forEach(function (el) {
      el.textContent = HANAMORI.site[el.dataset.siteText];
    });
    // 商品の価格。例：data-price-of="trial5" → ¥1,500（お試しセット）、"bath1" → ¥330
    document.querySelectorAll("[data-price-of]").forEach(function (el) {
      const v = P.findType(el.dataset.priceOf);
      if (v) el.textContent = u.yen(v.price);
    });
  }

  // スマートフォンの追従ボタン：お試しのボタンが画面にないときだけ下から出す
  // 隠す目印：ファーストビュー、ページ内のお試しボタン、フッター（ボタンが2つ並ばないように）
  function trialBar() {
    const bar = document.querySelector("[data-trial-bar]");
    if (!bar || !("IntersectionObserver" in window)) return;
    const targets = [document.querySelector(".hero, .page-hero"), document.querySelector(".site-footer, footer")]
      .concat(Array.prototype.slice.call(document.querySelectorAll('main a.button[href*="trial-set"]')))
      .filter(Boolean);
    const seen = new Set();
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) seen.add(e.target); else seen.delete(e.target); });
      const show = seen.size === 0;
      bar.classList.toggle("is-visible", show);
      bar.inert = !show;            // 隠れている間はキーボードでも選ばれないように
    });
    bar.inert = true;
    targets.forEach(function (t) { io.observe(t); });
  }

  HANAMORI.product = {
    init: function () {
      renderList();
      renderScents();
      renderPrices();
      renderVoices();
      renderTrialCompare();
      renderScentTour();
      renderSiteValues();
      renderDetail();
      trialBar();
    }
  };
})();
