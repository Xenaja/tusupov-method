(function(){
  "use strict";

  /* ⚠ ПЛЕЙСХОЛДЕРЫ — заменить перед запуском рекламы.
     Запись по городам: Москва — Telegram-бот, Казахстан — WhatsApp. */
  var TG_BOT = "PLACEHOLDER_BOT"; // username Telegram-бота, без @ (Москва)
  var WA_KZ  = "70000000000";     // номер WhatsApp менеджера, только цифры (Казахстан)

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Telegram (Москва): data-tg — start-параметр кодирует место клика */
  document.querySelectorAll("[data-tg]").forEach(function(a){
    a.href = "https://t.me/" + TG_BOT + "?start=" + a.dataset.tg;
  });
  /* WhatsApp (Казахстан): data-wa — текст предзаполненного сообщения */
  document.querySelectorAll("[data-wa]").forEach(function(a){
    var msg = a.dataset.wa || "Здравствуйте! Хочу записаться";
    a.href = "https://wa.me/" + WA_KZ + "?text=" + encodeURIComponent(msg);
  });

  /* ---------- Сертификаты + лайтбокс ---------- */
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
        '<source srcset="photos/certs/' + c.file + '-thumb.webp" type="image/webp">' +
        '<img src="photos/certs/' + c.file + '-thumb.jpg" alt="' + c.name + '" loading="lazy" decoding="async">' +
        '</picture></div>' +
        '<div class="cert-name">' + c.name + "</div>";
      btn.addEventListener("click", function(){ openLightbox(i); });
      lane.appendChild(btn);
    });
    function openLightbox(i){
      lbImg.src = "photos/certs/" + certs[i].file + ".jpg";
      lbImg.alt = certs[i].name;
      lbName.textContent = certs[i].name;
      lb.classList.add("open");
      document.body.style.overflow = "hidden";
    }
    function closeLightbox(){
      lb.classList.remove("open");
      document.body.style.overflow = "";
    }
    lb.addEventListener("click", function(e){ if (e.target === lb) closeLightbox(); });
    document.getElementById("lightboxClose").addEventListener("click", closeLightbox);
    document.addEventListener("keydown", function(e){ if (e.key === "Escape") closeLightbox(); });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if (reduce || !("IntersectionObserver" in window)) {
    revealEls.forEach(function(el){ el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function(el){ io.observe(el); });
  }

  /* ---------- Счётчики ---------- */
  var strip = document.querySelector(".counters");
  if (strip && document.querySelectorAll("[data-count-to]").length) {
    if ("IntersectionObserver" in window) {
      var cio = new IntersectionObserver(function(es){
        es.forEach(function(e){
          if (!e.isIntersecting) return;
          cio.disconnect();
          document.querySelectorAll("[data-count-to]").forEach(function(el){
            var to = +el.dataset.countTo;
            if (reduce) { el.textContent = to.toLocaleString("ru-RU"); return; }
            var dur = 1500, st = performance.now();
            (function tick(now){
              var p = Math.min(1, ((now || performance.now()) - st) / dur);
              var ease = 1 - Math.pow(1 - p, 3);
              el.textContent = Math.round(to * ease).toLocaleString("ru-RU");
              if (p < 1) requestAnimationFrame(tick);
            })(st);
          });
        });
      }, { threshold: 0.4 });
      cio.observe(strip);
    } else {
      document.querySelectorAll("[data-count-to]").forEach(function(el){
        el.textContent = (+el.dataset.countTo).toLocaleString("ru-RU");
      });
    }
  }

  /* ---------- Таймлайн (вертикальная линия с прорисовкой) ---------- */
  var fill = document.getElementById("tlFill");
  var days = document.querySelectorAll(".tl-day");
  if (fill && days.length) {
    var total = days.length, maxDay = 0;
    var setDay = function(n){
      maxDay = Math.max(maxDay, n);
      fill.style.height = (Math.min(maxDay, total) / total * 100) + "%";
      days.forEach(function(d, i){ d.classList.toggle("is-on", i < maxDay); });
    };
    if (reduce || !("IntersectionObserver" in window)) {
      setDay(total);
    } else {
      var tio = new IntersectionObserver(function(es){
        es.forEach(function(e){
          if (e.isIntersecting) setDay(+e.target.dataset.day + 1);
        });
      }, { rootMargin: "-45% 0px -45% 0px" });
      days.forEach(function(d){ tio.observe(d); });
    }
  }

  /* ---------- FAQ ---------- */
  document.querySelectorAll(".faq-q").forEach(function(btn){
    btn.addEventListener("click", function(){
      var item = btn.parentElement;
      var wasOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach(function(o){
        o.classList.remove("open");
        o.querySelector(".faq-q").setAttribute("aria-expanded", "false");
      });
      if (!wasOpen) {
        item.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---------- Меню ---------- */
  var header = document.getElementById("siteHeader");
  var burger = document.getElementById("burger");
  var mobileMenu = document.getElementById("mobileMenu");
  if (burger && mobileMenu) {
    var setMenu = function(open){
      document.body.classList.toggle("menu-open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
    };
    burger.addEventListener("click", function(){
      setMenu(!document.body.classList.contains("menu-open"));
    });
    mobileMenu.querySelectorAll("a").forEach(function(a){
      a.addEventListener("click", function(){ setMenu(false); });
    });
    document.addEventListener("keydown", function(e){ if (e.key === "Escape") setMenu(false); });
  }
  if (header) {
    var onScroll = function(){ header.classList.toggle("scrolled", window.scrollY > 40); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Sticky CTA ---------- */
  var sticky = document.getElementById("stickyCta");
  var hero = document.getElementById("hero");
  if (sticky && hero) {
    if ("IntersectionObserver" in window) {
      var sio = new IntersectionObserver(function(es){
        es.forEach(function(e){ sticky.classList.toggle("show", !e.isIntersecting); });
      }, { threshold: 0 });
      sio.observe(hero);
    } else {
      sticky.classList.add("show");
    }
  }
})();
