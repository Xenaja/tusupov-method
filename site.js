(function(){
  "use strict";

  /* Боевые каналы записи. Москва → Telegram-бот, Казахстан → WhatsApp.
     WA_BASE — редиректор wa.clck.bar (не wa.me), по требованию заказчика. */
  var TG_BOT  = "Lids_Erzhan_bot";        // username Telegram-бота, без @ (Москва)
  var WA_KZ   = "77764687733";            // номер WhatsApp менеджера (Казахстан)
  var WA_BASE = "https://wa.clck.bar/";   // редиректор WhatsApp (домен заказчика)

  document.querySelectorAll("[data-tg]").forEach(function(a){
    a.href = "https://t.me/" + TG_BOT + "?start=" + a.dataset.tg;
  });
  document.querySelectorAll("[data-wa]").forEach(function(a){
    a.href = WA_BASE + WA_KZ + "?text=" + encodeURIComponent(a.dataset.wa || "Добрый день!");
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

  /* ---------- Сертификаты: лайтбокс (только на странице «Сеансы») ---------- */
  var lb = document.getElementById("lightbox");
  var certCards = document.querySelectorAll(".cert[data-full]");
  if (lb && certCards.length) {
    var lbImg = document.getElementById("lightboxImg");
    var lbName = document.getElementById("lightboxName");
    var openLightbox = function(full, title){
      lbImg.src = full;
      lbImg.alt = title;
      lbName.textContent = title;
      lb.classList.add("open");
      document.body.style.overflow = "hidden";
    };
    var closeLightbox = function(){
      lb.classList.remove("open");
      document.body.style.overflow = "";
    };
    certCards.forEach(function(card){
      var titleEl = card.querySelector(".cert-title");
      var title = titleEl ? titleEl.textContent : "Сертификат";
      card.setAttribute("aria-label", "Открыть сертификат: " + title);
      card.addEventListener("click", function(){ openLightbox(card.dataset.full, title); });
    });
    /* Клик в любом месте оверлея (включая само фото) закрывает — курсор zoom-out */
    lb.addEventListener("click", closeLightbox);
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
