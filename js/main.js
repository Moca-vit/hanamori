/* ==========================================================
   HANAMORI main.js
   各モジュールを順に起動する。モジュールを追加したら、
   HTML で読み込み、ここに init を1行足す。
   ========================================================== */
(function () {
  function start() {
    const H = window.HANAMORI;
    H.header.init();
    H.product && H.product.init();     // 商品を描画してから演出を登録する
    H.cart && H.cart.init();
    H.utils.keepTail();                // 描画した文も含めて、文末の1文字だけの改行を防ぐ
    H.marquee && H.marquee.init();
    H.form && H.form.init();
    H.sparkle && H.sparkle.init();
    H.animation && H.animation.init();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
