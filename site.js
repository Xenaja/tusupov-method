(function(){
  "use strict";

  /* ⚠ ПЛЕЙСХОЛДЕРЫ – заменить перед запуском рекламы */
  var TG_BOT = "PLACEHOLDER_BOT"; // username Telegram-бота, без @ (Москва)
  var WA_KZ  = "70000000000";     // номер WhatsApp менеджера, только цифры (Казахстан)

  document.querySelectorAll("[data-tg]").forEach(function(a){
    a.href = "https://t.me/" + TG_BOT + "?start=" + a.dataset.tg;
  });
  document.querySelectorAll("[data-wa]").forEach(function(a){
    a.href = "https://wa.me/" + WA_KZ + "?text=" + encodeURIComponent(a.dataset.wa || "Здравствуйте!");
  });

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Таймлайн шагов (только на странице «Ретрит») ---------- */
  var stepRows = document.querySelectorAll(".step-row");
  if (stepRows.length) {
    if (reduce || !("IntersectionObserver" in window)) {
      stepRows.forEach(function(el){ el.classList.add("in"); });
    } else {
      var stepIo = new IntersectionObserver(function(es){
        es.forEach(function(e){
          if (e.isIntersecting) { e.target.classList.add("in"); stepIo.unobserve(e.target); }
        });
      }, { threshold: 0.35, rootMargin: "0px 0px -10% 0px" });
      stepRows.forEach(function(el){ stepIo.observe(el); });
    }
  }

  /* ---------- Счётчики ---------- */
  function runCounter(el){
    var to = +el.dataset.countTo;
    if (reduce) { el.textContent = to.toLocaleString("ru-RU"); return; }
    var dur = 1400, t0 = performance.now();
    (function step(now){
      var p = Math.min(1, (now - t0) / dur);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * e).toLocaleString("ru-RU");
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }
  var counters = document.querySelectorAll("[data-count-to]");
  if (counters.length) {
    if ("IntersectionObserver" in window) {
      var cio = new IntersectionObserver(function(es){
        es.forEach(function(e){ if (e.isIntersecting) { runCounter(e.target); cio.unobserve(e.target); } });
      }, { threshold: 0.5 });
      counters.forEach(function(el){ cio.observe(el); });
    } else {
      counters.forEach(runCounter);
    }
  }

  /* ---------- Сертификаты + лайтбокс (только на странице «Сеансы») ---------- */
  /* CERT_V — поднять число при каждой замене файлов cert-*.jpg/webp,
     чтобы браузер не показывал закэшированную старую версию скана */
  var CERT_V = "2";
  var lane = document.getElementById("certLane");
  var lb = document.getElementById("lightbox");
  if (lane && lb) {
    var certs = [
      { file: "cert-1", name: "Séminaire d'ostéopathie biodynamique, niveau 1 – Alexandre Neel, D.O. (32 часа)" },
      { file: "cert-2", name: "La cohérence cardiaque et le viscéral en biodynamie II – Alexandre Neel, D.O. (32 часа)" },
      { file: "cert-3", name: "Оздоровительная краниоритмическая остеопрактика 1. Структуры тела (32 часа)" },
      { file: "cert-4", name: "Оздоровительная краниоритмическая остеопрактика 2. Мозговой череп (32 часа)" },
      { file: "cert-5", name: "Оздоровительная краниоритмическая остеопрактика 3. Лицевой череп (32 часа)" },
      { file: "cert-6", name: "Оздоровительная висцеромоторная остеопрактика 4. Внутренние органы (32 часа)" },
      { file: "cert-7", name: "Mental self-destructive programs: diagnosis and correction – КАПК (24 часа)" }
    ];
    var lbImg = document.getElementById("lightboxImg");
    var lbName = document.getElementById("lightboxName");
    certs.forEach(function(c, i){
      var btn = document.createElement("button");
      btn.className = "cert";
      btn.setAttribute("aria-label", "Открыть сертификат: " + c.name);
      btn.innerHTML =
        '<div class="cert-img"><picture>' +
        '<source srcset="photos/certs/' + c.file + '-thumb.webp?v=' + CERT_V + '" type="image/webp">' +
        '<img src="photos/certs/' + c.file + '-thumb.jpg?v=' + CERT_V + '" alt="' + c.name + '" loading="lazy" decoding="async">' +
        '</picture></div>' +
        '<div class="cert-name">' + c.name + "</div>";
      btn.addEventListener("click", function(){ openLightbox(i); });
      lane.appendChild(btn);
    });
    var openLightbox = function(i){
      lbImg.src = "photos/certs/" + certs[i].file + ".jpg?v=" + CERT_V;
      lbImg.alt = certs[i].name;
      lbName.textContent = certs[i].name;
      lb.classList.add("open");
      document.body.style.overflow = "hidden";
    };
    var closeLightbox = function(){
      lb.classList.remove("open");
      document.body.style.overflow = "";
    };
    lb.addEventListener("click", function(e){ if (e.target === lb) closeLightbox(); });
    var lbClose = document.getElementById("lightboxClose");
    if (lbClose) lbClose.addEventListener("click", closeLightbox);
    document.addEventListener("keydown", function(e){ if (e.key === "Escape") closeLightbox(); });
  }

  /* ---------- FAQ (только на странице «Сеансы») ---------- */
  document.querySelectorAll(".faq-q").forEach(function(btn){
    btn.addEventListener("click", function(){
      var item = btn.parentElement;
      var willOpen = !item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach(function(o){
        o.classList.remove("open");
        o.querySelector(".faq-q").setAttribute("aria-expanded", "false");
        o.querySelector(".faq-sign").textContent = "+";
      });
      if (willOpen) {
        item.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
        item.querySelector(".faq-sign").textContent = "–";
      }
    });
  });

  /* ---------- Мобильное меню ---------- */
  var burger = document.getElementById("burger");
  var mobileMenu = document.getElementById("mobileMenu");
  if (burger && mobileMenu) {
    var setMenu = function(open){
      document.body.classList.toggle("menu-open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
      burger.querySelector(".icon-open").style.display = open ? "none" : "block";
      burger.querySelector(".icon-close").style.display = open ? "block" : "none";
    };
    burger.addEventListener("click", function(){ setMenu(!document.body.classList.contains("menu-open")); });
    mobileMenu.querySelectorAll("a").forEach(function(a){ a.addEventListener("click", function(){ setMenu(false); }); });
    document.addEventListener("keydown", function(e){ if (e.key === "Escape") setMenu(false); });
  }
})();
