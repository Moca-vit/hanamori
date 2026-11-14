/* 共通で使う小さな関数 */
window.HANAMORI = window.HANAMORI || {};

HANAMORI.utils = {
  // <body data-root="../"> から、サイトのルートへの相対パスを得る
  root: function () {
    return document.body.dataset.root || "./";
  },
  // ルートからのパスを、今いるページからのパスに変換する
  path: function (p) {
    return this.root() + p;
  },
  yen: function (n) {
    return "¥" + Number(n).toLocaleString("ja-JP");
  },
  escape: function (str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  },
  reducedMotion: function () {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  },
  toast: function (message) {
    let el = document.querySelector(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      el.setAttribute("role", "status");
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add("is-show");
    clearTimeout(el._timer);
    el._timer = setTimeout(function () { el.classList.remove("is-show"); }, 2400);
  }
};

HANAMORI.icons = {
  cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M5 7h14l-1.2 12.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8L5 7Z"/><path d="M9 7V6a3 3 0 0 1 6 0v1"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="0.9" fill="currentColor" stroke="none"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.8 3h3.1l-6.8 7.8L22 21h-6.3l-4.9-6.4L5.2 21H2.1l7.3-8.3L1.8 3h6.4l4.4 5.9L17.8 3Zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5Z"/></svg>',
  leaf: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 52c0-22 14-38 40-40 0 26-16 40-38 40"/><path d="M12 52 36 28"/></svg>'
};
