/* ホバーで文字がきらめく：光の帯（CSS）＋ 小さな光の粒（ここで生成） */
(function () {
  const u = HANAMORI.utils;

  function burst(el) {
    const rect = el.getBoundingClientRect();
    for (let i = 0; i < 4; i++) {
      const dot = document.createElement("span");
      dot.className = "sparkle-dot";
      dot.style.left = Math.random() * rect.width + "px";
      dot.style.top = Math.random() * rect.height - 4 + "px";
      dot.style.animationDelay = i * 0.12 + "s";
      el.appendChild(dot);
      setTimeout(function () { dot.remove(); }, 1400);
    }
  }

  HANAMORI.sparkle = {
    init: function () {
      if (u.reducedMotion()) return;
      document.addEventListener("pointerenter", function (e) {
        if (e.pointerType === "touch") return;
        const target = e.target.closest && e.target.closest("[data-sparkle]");
        if (target && !target._sparkling) {
          target._sparkling = true;
          burst(target);
          setTimeout(function () { target._sparkling = false; }, 900);
        }
      }, true);
    }
  };
})();
