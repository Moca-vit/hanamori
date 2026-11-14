/* ==========================================================
   ヘッダー・フッターの共通部品
   各ページの <div data-include="header"></div> / <div data-include="footer"></div>
   に差し込む。リンクを変えるときは js/data/site.js を編集する。
   ========================================================== */
(function () {
  const u = HANAMORI.utils;
  const site = HANAMORI.site;
  const icons = HANAMORI.icons;

  function snsLinks() {
    return (
      '<div class="sns-links">' +
      '<a href="' + site.sns.instagram + '" target="_blank" rel="noopener" aria-label="Instagram（新しいタブで開く）">' + icons.instagram + "</a>" +
      '<a href="' + site.sns.x + '" target="_blank" rel="noopener" aria-label="X（新しいタブで開く）">' + icons.x + "</a>" +
      "</div>"
    );
  }

  function isCurrent(path) {
    const here = location.pathname.replace(/\/$/, "/index.html");
    return here.endsWith("/" + path) ? ' aria-current="page"' : "";
  }

  function headerHTML() {
    const navItems = site.nav.map(function (n) {
      return '<li><a href="' + u.path(n.path) + '"' + isCurrent(n.path) + '><span class="sparkle" data-sparkle>' + n.label + "</span></a></li>";
    }).join("");
    const drawerItems = site.nav.concat([{ label: "お問い合わせ", en: "Contact", path: "html/contact.html" }]).map(function (n) {
      return '<li><a href="' + u.path(n.path) + '"><span class="en">' + n.en + "</span>" + n.label + "</a></li>";
    }).join("");

    return (
      '<header class="site-header">' +
      '<div class="site-header__inner">' +
      '<a class="site-header__logo" href="' + u.path("index.html") + '" aria-label="HANAMORI トップへ">HANAMORI<small>花と森のバスケア</small></a>' +
      '<nav class="site-nav" aria-label="メインメニュー"><ul class="site-nav__list" role="list">' + navItems + "</ul></nav>" +
      '<div class="site-header__tools">' +
      '<a class="icon-button" href="' + u.path("html/cart.html") + '" aria-label="カートを見る">' + icons.cart +
      '<span class="cart-count" data-cart-count data-count="0">0</span></a>' +
      '<button class="icon-button menu-toggle" type="button" aria-label="メニューを開く" aria-expanded="false" aria-controls="drawer"><span></span></button>' +
      "</div></div></header>" +
      '<div class="drawer" id="drawer" aria-hidden="true">' +
      '<ul class="drawer__list" role="list">' + drawerItems + "</ul>" + snsLinks() +
      "</div>"
    );
  }

  function footerHTML() {
    const links = site.footerNav.map(function (n) {
      return '<li><a href="' + u.path(n.path) + '">' + n.label + "</a></li>";
    }).join("");
    return (
      '<footer class="site-footer">' +
      '<div class="site-footer__inner">' +
      "<div>" +
      '<p class="site-footer__logo">HANAMORI</p>' +
      '<p class="site-footer__lead">1日の終わりに、花と森の香りを。</p>' +
      '<div style="margin-top:1.5rem">' + snsLinks() + "</div>" +
      "</div>" +
      '<nav aria-label="フッターメニュー"><ul class="site-footer__nav" role="list">' + links + "</ul></nav>" +
      "</div>" +
      '<p class="site-footer__bottom">このサイトはポートフォリオ用に制作した架空ブランドのデモサイトです。実在の商品・販売はありません。<br>&copy; HANAMORI (Portfolio Demo)</p>' +
      "</footer>"
    );
  }

  function bindMenu() {
    const toggle = document.querySelector(".menu-toggle");
    const drawer = document.getElementById("drawer");
    if (!toggle || !drawer) return;
    toggle.addEventListener("click", function () {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      toggle.setAttribute("aria-label", open ? "メニューを開く" : "メニューを閉じる");
      drawer.classList.toggle("is-open", !open);
      drawer.setAttribute("aria-hidden", String(open));
      document.body.style.overflow = open ? "" : "hidden";
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") toggle.click();
    });
  }

  function bindScroll() {
    const header = document.querySelector(".site-header");
    if (!header) return;
    const onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 24); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  HANAMORI.header = {
    init: function () {
      const h = document.querySelector('[data-include="header"]');
      const f = document.querySelector('[data-include="footer"]');
      if (h) h.outerHTML = headerHTML();
      if (f) f.outerHTML = footerHTML();
      // ページ内の SNS リンク置き場（[data-sns-slot]）にも同じリンクを差し込む
      document.querySelectorAll("[data-sns-slot]").forEach(function (el) { el.innerHTML = snsLinks(); });
      // ページ内の SNS のリンク先・アカウント名・アイコンも site.js から差し込む
      document.querySelectorAll("[data-sns-href]").forEach(function (el) { el.href = site.sns[el.dataset.snsHref]; });
      document.querySelectorAll("[data-sns-handle]").forEach(function (el) {
        el.textContent = site.sns[el.dataset.snsHandle].split("/").filter(Boolean).pop();
      });
      document.querySelectorAll("[data-sns-icon]").forEach(function (el) { el.innerHTML = icons[el.dataset.snsIcon]; });
      bindMenu();
      bindScroll();
    },
    snsLinks: snsLinks
  };
})();
