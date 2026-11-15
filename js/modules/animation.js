/* ==========================================================
   演出まわり
   - ファーストビュー：コピーを1文字ずつ分割し、読み込み完了で順に表示
   - スクロールで要素がふわっと現れる（.reveal）
   - 画像の奥行き（.parallax-img）
   - ファーストビューの商品の奥行き（マウス／スクロールに合わせて揺れる）
   - 漂う光の粒（[data-particles]）
   動きはすべて「視差効果を減らす」設定のときは止める
   ========================================================== */
(function () {
  const u = HANAMORI.utils;

  function splitChars() {
    document.querySelectorAll("[data-split]").forEach(function (el) {
      const text = el.textContent;
      el.setAttribute("aria-label", text.replace(/\s+/g, ""));
      el.innerHTML = Array.from(text).map(function (ch, i) {
        if (ch === "\n") return "<br>";
        return '<span class="char" aria-hidden="true" style="--i:' + i + '">' + (ch === " " ? "&nbsp;" : ch) + "</span>";
      }).join("");
    });
  }

  // 画像を読み終えてから演出を始める。読み込みが遅くても 2.5 秒で開始する
  function startWhenReady() {
    const hero = document.querySelector(".hero");
    if (!hero) { document.body.classList.add("is-loaded"); return; }
    const imgs = Array.from(hero.querySelectorAll("img"));
    let done = false;
    const start = function () {
      if (done) return;
      done = true;
      requestAnimationFrame(function () { document.body.classList.add("is-loaded"); });
    };
    Promise.all(imgs.map(function (img) {
      return img.complete ? Promise.resolve() : new Promise(function (r) { img.addEventListener("load", r); img.addEventListener("error", r); });
    })).then(start);
    setTimeout(start, 2500);
  }

  function reveal() {
    const items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || u.reducedMotion()) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px 15% 0px" });   // 画面の下端より少し手前で始め、スクロールに遅れないようにする
    items.forEach(function (el) { io.observe(el); });
  }

  function parallax() {
    const imgs = document.querySelectorAll("[data-parallax]");
    if (!imgs.length || u.reducedMotion()) return;
    let ticking = false;
    const update = function () {
      const vh = window.innerHeight;
      imgs.forEach(function (img) {
        const rect = img.parentElement.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > vh) return;
        // 画像は枠より 15% 高い（top.css の .parallax-img img）。動かせるのはこの余り（spare）の中だけ。
        // 以前は「画面中央からの距離 × 速さ」をそのまま動かしていたため、枠が画面の下半分にあるとき
        // 余りより大きく上へずれて、枠の下に白い隙間が出ていた。進み具合を -1〜1 に収めて、はみ出さないようにする
        const speed = parseFloat(img.dataset.parallax) || 0.15;
        const spare = img.offsetHeight - rect.height;
        const progress = Math.max(-1, Math.min(1, (rect.top + rect.height / 2 - vh / 2) / (vh / 2 + rect.height / 2)));
        const amount = Math.min(1, speed / 0.22);   // 速さの値が大きいほど大きく動かす（0.22 で余りを使い切る）
        const shift = -spare / 2 - progress * (spare / 2) * amount;   // 0（画像の上端が枠の上端）〜 -spare（下端が枠の下端）
        img.style.transform = "translate3d(0," + shift.toFixed(1) + "px,0)";
      });
      ticking = false;
    };
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  // 音のない短い動画（data-autoplay-video）は、画面に入ったら再生し、外れたら止める。
  // 動きを減らす設定の人には再生せず、poster の1枚だけを見せる
  function autoplayVideos() {
    const videos = document.querySelectorAll("video[data-autoplay-video]");
    if (!videos.length || u.reducedMotion() || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        const v = e.target;
        if (e.isIntersecting) {
          v.preload = "auto";
          const p = v.play();
          if (p && p.catch) p.catch(function () {});   // 省電力モードなどで自動再生できないときは poster のまま
        } else {
          v.pause();
        }
      });
    }, { threshold: 0.25 });
    videos.forEach(function (v) { io.observe(v); });
  }

  // ファーストビューの奥行き：手前の商品ほど大きく動かし、背景の森はわずかに反対へ。
  // PC はマウス、スマホはスクロールに合わせる。目標へ毎フレーム少しずつ近づけて、やわらかく追いかけさせる
  function heroDepth() {
    const hero = document.querySelector(".hero");
    if (!hero || u.reducedMotion()) return;
    const bg = hero.querySelector(".hero__bg");
    const items = [
      { el: hero.querySelector(".hero__product--1"), depth: 1.0 },  // トリートメント（手前）
      { el: hero.querySelector(".hero__product--2"), depth: 0.6 },  // シャンプー
      { el: hero.querySelector(".hero__product--3"), depth: 0.35 }  // 入浴剤（奥）
    ].filter(function (it) { return it.el; });
    if (!items.length) return;

    let tx = 0, ty = 0, cx = 0, cy = 0, running = false;
    function frame() {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      items.forEach(function (it) {
        it.el.style.setProperty("--dx", (cx * 26 * it.depth).toFixed(2) + "px");
        it.el.style.setProperty("--dy", (cy * 16 * it.depth).toFixed(2) + "px");
      });
      if (bg) {
        bg.style.setProperty("--bgx", (cx * -10).toFixed(2) + "px");
        bg.style.setProperty("--bgy", (cy * -6).toFixed(2) + "px");
      }
      if (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) requestAnimationFrame(frame);
      else running = false;
    }
    function kick() {
      if (!running) { running = true; requestAnimationFrame(frame); }
    }

    if (window.matchMedia("(hover: hover)").matches) {
      hero.addEventListener("pointermove", function (e) {
        const r = hero.getBoundingClientRect();
        tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
        kick();
      });
      hero.addEventListener("pointerleave", function () { tx = 0; ty = 0; kick(); });
    } else {
      window.addEventListener("scroll", function () {
        tx = 0;
        ty = -Math.min(1, window.scrollY / window.innerHeight) * 5;
        kick();
      }, { passive: true });
    }
  }

  function particles() {
    if (u.reducedMotion()) return;
    document.querySelectorAll("[data-particles]").forEach(function (box) {
      const count = parseInt(box.dataset.particles, 10) || 14;
      const frag = document.createDocumentFragment();
      for (let i = 0; i < count; i++) {
        const s = document.createElement("span");
        const size = 4 + Math.random() * 10;
        s.style.width = s.style.height = size + "px";
        s.style.left = Math.random() * 100 + "%";
        s.style.animationDuration = 14 + Math.random() * 16 + "s";
        s.style.animationDelay = -Math.random() * 20 + "s";
        s.style.setProperty("--drift", (Math.random() * 80 - 40).toFixed(0) + "px");
        frag.appendChild(s);
      }
      box.appendChild(frag);
    });
  }

  HANAMORI.animation = {
    init: function () {
      splitChars();
      startWhenReady();
      reveal();
      parallax();
      autoplayVideos();
      heroDepth();
      particles();
    }
  };
})();
