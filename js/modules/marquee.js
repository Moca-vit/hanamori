/* 流れる文字と写真
   .marquee__group を1つ書いておけば、途切れずにループするよう自動で複製する */
(function () {
  HANAMORI.marquee = {
    init: function () {
      document.querySelectorAll(".marquee__track").forEach(function (track) {
        const group = track.querySelector(".marquee__group");
        if (!group) return;
        const clone = group.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        clone.querySelectorAll("img").forEach(function (img) { img.alt = ""; });
        track.appendChild(clone);
      });
    }
  };
})();
