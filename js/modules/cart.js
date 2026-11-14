/* ==========================================================
   カート（デモ版）
   - 中身はブラウザの localStorage に保存（決済・在庫連携はしない）
   - カートページ：[data-cart-view]
   - 注文手続き：[data-checkout]、完了：[data-complete]
   ========================================================== */
(function () {
  const u = HANAMORI.utils;
  const site = HANAMORI.site;
  const P = HANAMORI.products;
  const KEY = "hanamori-cart";
  const ORDER_KEY = "hanamori-last-order";

  function load() {
    try {
      const data = JSON.parse(localStorage.getItem(KEY) || "[]");
      return Array.isArray(data) ? data.filter(function (i) { return P.findSku(i.sku); }) : [];
    } catch (e) { return []; }
  }
  function save(items) {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) { /* 保存できない環境では何もしない */ }
    updateBadge();
  }

  const cart = {
    items: load,
    add: function (sku, qty) {
      const items = load();
      const found = items.find(function (i) { return i.sku === sku; });
      if (found) found.qty = Math.min(found.qty + qty, 10);
      else items.push({ sku: sku, qty: Math.min(qty, 10) });
      save(items);
    },
    setQty: function (sku, qty) {
      const items = load().map(function (i) { return i.sku === sku ? { sku: sku, qty: Math.max(1, Math.min(qty, 10)) } : i; });
      save(items);
    },
    remove: function (sku) { save(load().filter(function (i) { return i.sku !== sku; })); },
    clear: function () { save([]); },
    count: function () { return load().reduce(function (n, i) { return n + i.qty; }, 0); },
    subtotal: function () {
      return load().reduce(function (sum, i) { return sum + P.findSku(i.sku).variant.price * i.qty; }, 0);
    },
    // 送料無料の商品（お試しセット）が入っていれば、注文全体を送料無料にする
    hasFreeShippingItem: function () {
      return load().some(function (i) { return P.findSku(i.sku).variant.freeShipping; });
    },
    shipping: function () {
      const sub = this.subtotal();
      return sub === 0 || sub >= site.freeShippingFrom || this.hasFreeShippingItem() ? 0 : site.shippingFee;
    },
    total: function () { return this.subtotal() + this.shipping(); }
  };

  function updateBadge() {
    const n = cart.count();
    document.querySelectorAll("[data-cart-count]").forEach(function (el) {
      el.textContent = n;
      el.dataset.count = n;
    });
  }

  function itemRow(item, editable) {
    const hit = P.findSku(item.sku);
    const s = hit.series, v = hit.variant;
    return (
      '<li class="cart-item">' +
      '<img src="' + u.path(v.image) + '" alt="" width="88" height="88" loading="lazy">' +
      "<div>" +
      '<p class="cart-item__name">' + s.name + "　" + v.label + "</p>" +
      '<p class="cart-item__meta">' + s.notes + "／" + v.sub + "</p>" +
      '<div class="cart-item__row">' +
      (editable
        ? '<div class="qty" data-sku="' + v.sku + '">' +
          '<button type="button" data-qty="-1" aria-label="数量を減らす">−</button>' +
          '<input type="number" min="1" max="10" value="' + item.qty + '" aria-label="数量">' +
          '<button type="button" data-qty="1" aria-label="数量を増やす">＋</button></div>'
        : "<span>数量：" + item.qty + "</span>") +
      "<span>" + u.yen(v.price * item.qty) + "</span>" +
      (editable ? '<button type="button" class="cart-item__remove" data-remove="' + v.sku + '">削除</button>' : "") +
      "</div></div></li>"
    );
  }

  function summaryHTML(buttonHTML) {
    const sub = cart.subtotal();
    const ship = cart.shipping();
    const remain = site.freeShippingFrom - sub;
    return (
      '<div class="summary"><dl>' +
      "<dt>小計</dt><dd>" + u.yen(sub) + "</dd>" +
      "<dt>送料</dt><dd>" + (ship === 0 ? "無料" : u.yen(ship)) + "</dd>" +
      '<dt class="summary__total">合計（税込）</dt><dd class="summary__total">' + u.yen(cart.total()) + "</dd>" +
      "</dl>" +
      (cart.hasFreeShippingItem() && remain > 0
        ? '<p class="note">お試しセットを含むご注文は、送料無料でお届けします。</p>'
        : remain > 0 ? '<p class="note">あと ' + u.yen(remain) + " で送料無料になります。</p>" : '<p class="note">送料無料でお届けします。</p>') +
      (buttonHTML || "") +
      "</div>"
    );
  }

  function renderCart() {
    const view = document.querySelector("[data-cart-view]");
    if (!view) return;
    const items = load();
    if (!items.length) {
      view.innerHTML =
        '<div class="cart-empty"><p>カートに商品が入っていません。</p>' +
        '<a class="button" href="' + u.path("html/products/index.html") + '">商品を見る</a></div>';
      return;
    }
    view.innerHTML =
      '<div class="cart-layout">' +
      '<ul role="list">' + items.map(function (i) { return itemRow(i, true); }).join("") + "</ul>" +
      summaryHTML('<a class="button button--block" href="' + u.path("html/checkout.html") + '">ご注文手続きへ</a>' +
        '<a class="text-link" style="margin-top:1rem" href="' + u.path("html/products/index.html") + '">お買い物を続ける</a>') +
      "</div>";
  }

  function bindCart() {
    const view = document.querySelector("[data-cart-view]");
    if (!view) return;
    view.addEventListener("click", function (e) {
      const btn = e.target.closest("button");
      if (!btn) return;
      if (btn.dataset.remove) { cart.remove(btn.dataset.remove); renderCart(); u.toast("商品を削除しました"); return; }
      if (btn.dataset.qty) {
        const box = btn.closest(".qty");
        const input = box.querySelector("input");
        cart.setQty(box.dataset.sku, parseInt(input.value, 10) + parseInt(btn.dataset.qty, 10));
        renderCart();
      }
    });
    view.addEventListener("change", function (e) {
      if (e.target.matches(".qty input")) {
        cart.setQty(e.target.closest(".qty").dataset.sku, parseInt(e.target.value, 10) || 1);
        renderCart();
      }
    });
  }

  function renderCheckout() {
    const box = document.querySelector("[data-order-summary]");
    if (!box) return;
    const items = load();
    if (!items.length) {
      location.replace(u.path("html/cart.html"));
      return;
    }
    box.innerHTML = '<ul role="list">' + items.map(function (i) { return itemRow(i, false); }).join("") + "</ul>" + summaryHTML();
  }

  function renderComplete() {
    const box = document.querySelector("[data-complete]");
    if (!box) return;
    let order = null;
    try { order = JSON.parse(sessionStorage.getItem(ORDER_KEY) || "null"); } catch (e) { /* noop */ }
    const num = box.querySelector("[data-order-number]");
    if (num) num.textContent = order ? "ご注文番号：" + order.number : "";
  }

  HANAMORI.cart = Object.assign(cart, {
    init: function () {
      updateBadge();
      renderCart();
      bindCart();
      renderCheckout();
      renderComplete();
      // 他のタブでカートが変わったときもバッジを更新
      window.addEventListener("storage", function (e) { if (e.key === KEY) { updateBadge(); renderCart(); } });
    },
    placeOrder: function (customer) {
      const order = {
        number: "HM-" + Date.now().toString().slice(-8),
        total: cart.total(),
        name: customer.name
      };
      try { sessionStorage.setItem(ORDER_KEY, JSON.stringify(order)); } catch (e) { /* noop */ }
      cart.clear();
      return order;
    }
  });
})();
