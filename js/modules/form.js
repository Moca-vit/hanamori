/* ==========================================================
   フォームの入力チェック（お問い合わせ・注文手続き共通）
   <form data-validate data-form-type="contact|checkout">
   ========================================================== */
(function () {
  const u = HANAMORI.utils;

  const messages = {
    valueMissing: "入力してください",
    typeMismatch: "正しい形式で入力してください",
    patternMismatch: "正しい形式で入力してください",
    tooShort: "文字数が足りません"
  };

  function check(field) {
    const input = field.querySelector("input, select, textarea");
    const error = field.querySelector(".form-error");
    if (!input) return true;
    let msg = "";
    for (const key in messages) {
      if (input.validity[key]) { msg = input.dataset.message || messages[key]; break; }
    }
    field.classList.toggle("is-invalid", !!msg);
    input.setAttribute("aria-invalid", String(!!msg));
    if (error) error.textContent = msg;
    return !msg;
  }

  function onSubmit(form, e) {
    e.preventDefault();
    const fields = Array.from(form.querySelectorAll(".form-field"));
    const ok = fields.map(check).every(Boolean);
    if (!ok) {
      const first = form.querySelector(".is-invalid input, .is-invalid select, .is-invalid textarea");
      if (first) first.focus();
      return;
    }
    const data = Object.fromEntries(new FormData(form).entries());
    if (form.dataset.formType === "checkout") {
      HANAMORI.cart.placeOrder(data);
      location.href = u.path("html/complete.html");
    } else {
      form.innerHTML = '<p class="demo-notice">送信ありがとうございました。（デモのため、実際には送信されていません）</p>';
    }
  }

  HANAMORI.form = {
    init: function () {
      document.querySelectorAll("form[data-validate]").forEach(function (form) {
        form.noValidate = true;
        form.addEventListener("submit", function (e) { onSubmit(form, e); });
        form.addEventListener("blur", function (e) {
          const field = e.target.closest(".form-field");
          if (field && e.target.value) check(field);
        }, true);
      });
    }
  };
})();
