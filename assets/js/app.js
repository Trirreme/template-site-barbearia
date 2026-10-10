/*
 * Shared chrome for every page: header + HUD, pause menu, loader, bag drawer,
 * help box / zone name / mission-passed overlays, cheats and scroll reveals.
 */
(function () {
  const S = window.SITE;
  const D = window.DATA;
  const page = document.body.dataset.page;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const brl = (n) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const store = {
    get(key, fallback) {
      try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode */ }
    },
  };

  const icon = {
    scissors: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12"/></svg>',
    hanger: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7a2 2 0 1 1 2-2c0 1.2-2 1.5-2 3v1"/><path d="M12 9 2.8 16.2A1 1 0 0 0 3.4 18h17.2a1 1 0 0 0 .6-1.8L12 9z"/></svg>',
    fist: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 9.5V6.8a1.8 1.8 0 0 1 3.6 0V6a1.8 1.8 0 0 1 3.6 0v.5a1.8 1.8 0 0 1 3.6.3v1a1.8 1.8 0 0 1 3.2 1.1V14a7 7 0 0 1-7 7h-1.5A6.5 6.5 0 0 1 6 14.5v-1.3a2 2 0 0 1 1-1.7V9.5z"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="#000" stroke-width="1.2"><path d="m12 2 3 6.6 7.2.8-5.4 4.9 1.5 7.1L12 17.8l-6.3 3.6 1.5-7.1L1.8 9.4 9 8.6z"/></svg>',
    wa: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1a8 8 0 0 1-4-3.5c-.3-.5.3-.5.9-1.6.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5 1.9.8 2.6.9 3.6.7.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4l-.8-.5zM12 21.8a9.8 9.8 0 0 1-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4A9.8 9.8 0 1 1 12 21.8zm0-21.6A11.8 11.8 0 0 0 1.8 17.9L.2 23.8l6-1.6A11.8 11.8 0 1 0 12 .2z"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    left: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 4 6 12l10 8z"/></svg>',
    right: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="m8 4 10 8-10 8z"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="m4 12 5 5L20 6"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    insta: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
  };
  const stars = (n = 5) => `<span class="hud__stars" aria-hidden="true">${icon.star.repeat(n)}</span>`;

  const waLink = (msg) => `https://wa.me/${S.whatsapp}?text=${encodeURIComponent(msg)}`;
  const openWa = (msg) => window.open(waLink(msg), "_blank", "noopener");

  /* ---------- Chrome injection ---------- */

  const links = [
    { href: "index.html", label: "Início", id: "home" },
    { href: "barbearia.html", label: "Barbearia", id: "barber" },
    { href: "vestiario.html", label: "Vestiário", id: "store" },
    { href: "index.html#local", label: "Local", id: "local" },
  ];
  const navHtml = links
    .map((l) => `<a href="${l.href}"${l.id === page ? ' aria-current="page"' : ""}>${l.label}</a>`)
    .join("");
  const weapon = page === "barber" ? icon.scissors : page === "store" ? icon.hanger : icon.fist;

  document.body.insertAdjacentHTML(
    "afterbegin",
    `
    <header class="header" id="top">
      <div class="wrap header__inner">
        <a class="brand" href="index.html" aria-label="${S.name} — início">
          <span class="brand__name gta">${S.name.toLowerCase()}</span>
          <span class="brand__sub">${S.tagline}</span>
        </a>
        <nav class="nav" aria-label="Principal">${navHtml}</nav>
        <div class="hud">
          <div class="hud__weapon" aria-hidden="true">${weapon}</div>
          <div class="hud__stack">
            <span class="hud__clock" aria-hidden="true">00:00</span>
            <span class="hud__bar" aria-hidden="true" title="Progresso da página"><span></span></span>
            <button class="hud__money" type="button" aria-label="Abrir sacola">
              <span class="hud__amount">$00000000</span><span class="bag-count"></span>
            </button>
            <span title="Avaliação ${S.rating} de 5">${stars()}</span>
          </div>
          <button class="menu-btn" type="button" aria-label="Abrir menu" aria-expanded="false"><span></span></button>
        </div>
      </div>
    </header>

    <div class="pause" id="pause" role="dialog" aria-modal="true" aria-label="Menu">
      <button class="pause__close" type="button">Voltar ✕</button>
      <ul class="pause__list">
        ${links.map((l) => `<li><a class="gta" href="${l.href}">${l.label}</a></li>`).join("")}
        <li><a class="gta" href="${waLink(`Fala, ${S.name}! Vim pelo site.`)}" target="_blank" rel="noopener">WhatsApp</a></li>
      </ul>
      <p class="pause__hint">${S.hoursLabel}</p>
    </div>

    <div class="helpbox" role="status" aria-live="polite"></div>
    <div class="zone zone-font" aria-hidden="true"></div>
    <div class="mission" aria-hidden="true">
      <div class="mission__title gta"></div>
      <div class="mission__sub gta"></div>
    </div>

    <div class="scrim"></div>
    <aside class="bag" aria-label="Sacola" aria-hidden="true">
      <div class="bag__head">
        <h2 class="gta">sacola</h2>
        <button class="bag__close" type="button" aria-label="Fechar sacola">${icon.close}</button>
      </div>
      <div class="bag__items"></div>
      <div class="bag__foot"></div>
    </aside>
  `
  );

  document.body.insertAdjacentHTML(
    "beforeend",
    `
    <footer class="footer">
      <div class="wrap">
        <div class="footer__grid">
          <div>
            <a class="brand" href="index.html"><span class="brand__name gta" style="font-size:2.6rem">${S.name.toLowerCase()}</span><span class="brand__sub">${S.tagline}</span></a>
            <p style="color:var(--muted);margin:10px 0 0">${S.address}<br>${S.hoursLabel}</p>
          </div>
          <nav class="footer__links" aria-label="Rodapé">
            ${links.map((l) => `<a href="${l.href}">${l.label}</a>`).join("")}
            <a href="${waLink(`Fala, ${S.name}! Vim pelo site.`)}" target="_blank" rel="noopener">WhatsApp</a>
          </nav>
        </div>
        <div class="footer__note">
          <span>© <span data-year></span> ${S.name} ${S.tagline}. Marca fictícia — projeto demonstrativo.</span>
          <span>Site por <a href="${S.credit.url}" target="_blank" rel="noopener">${S.credit.name}</a></span>
        </div>
      </div>
    </footer>
    <a class="wa-float" href="${waLink(`Fala, ${S.name}! Vim pelo site.`)}" target="_blank" rel="noopener" aria-label="Chamar no WhatsApp">${icon.wa}</a>
  `
  );
  $("[data-year]").textContent = new Date().getFullYear();

  /* ---------- Loader (once per session) ---------- */

  // Resolves when the intro is gone, so entrance animations play in view.
  let endIntro;
  const introDone = new Promise((r) => { endIntro = r; });
  const loader = $(".loader");
  let seen = false;
  try { seen = sessionStorage.getItem("ganton.loaded") === "1"; sessionStorage.setItem("ganton.loaded", "1"); } catch { /* ignore */ }

  if (!loader || seen || reduced) {
    loader?.remove();
    endIntro();
  } else {
    document.body.classList.add("is-locked", "is-intro");
    const tips = [
      "Dica: agende seu horário em 30 segundos e confirme no WhatsApp.",
      "Dica: monte um look completo no Provador antes de vir à loja.",
      `Dica: digite ${S.cheat.code} na sacola. Confia.`,
    ];
    $(".loader__tip", loader).textContent = tips[Math.floor(Math.random() * tips.length)];

    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      loader.classList.add("is-done");
      document.body.classList.remove("is-locked", "is-intro");
      endIntro();
      setTimeout(() => loader.remove(), 600);
    };
    $(".loader__skip", loader).addEventListener("click", done);

    // Start only once the display fonts are in, so the logo never swaps mid-animation.
    const fontsReady = Promise.race([document.fonts?.ready, new Promise((r) => setTimeout(r, 1500))]);
    fontsReady.then(() => {
      loader.classList.add("is-go");
      setTimeout(done, 2300);
    });
  }

  /* ---------- Header: scroll state, health = page progress, clock ---------- */

  const header = $(".header");
  const health = $(".hud__bar span");
  const onScroll = () => {
    header.classList.toggle("is-scrolled", scrollY > 24);
    const max = document.documentElement.scrollHeight - innerHeight;
    health.style.setProperty("--p", max > 0 ? Math.min(1, scrollY / max) : 0);
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const clock = $(".hud__clock");
  const tick = () => {
    const d = new Date();
    clock.textContent = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };
  tick();
  setInterval(tick, 10000);

  /* ---------- Pause menu ---------- */

  const pause = $("#pause");
  const menuBtn = $(".menu-btn");
  const setPause = (open) => {
    pause.classList.toggle("is-open", open);
    menuBtn.setAttribute("aria-expanded", open);
    document.body.classList.toggle("is-locked", open);
    if (open) $("a", pause).focus();
  };
  menuBtn.addEventListener("click", () => setPause(true));
  $(".pause__close").addEventListener("click", () => setPause(false));
  $$("a", pause).forEach((a) => a.addEventListener("click", () => setPause(false)));

  /* ---------- Overlays ---------- */

  const helpEl = $(".helpbox");
  let helpTimer;
  const help = (html, ms = 3600) => {
    helpEl.innerHTML = html;
    helpEl.classList.add("is-on");
    clearTimeout(helpTimer);
    helpTimer = setTimeout(() => helpEl.classList.remove("is-on"), ms);
  };

  const zoneEl = $(".zone");
  let lastZone = "";
  const zone = (name) => {
    if (name === lastZone) return;
    lastZone = name;
    zoneEl.textContent = name;
    zoneEl.classList.remove("is-on");
    void zoneEl.offsetWidth;
    zoneEl.classList.add("is-on");
  };

  const missionEl = $(".mission");
  const mission = (title = "missão cumprida!", sub = "respeito +") => {
    $(".mission__title", missionEl).textContent = title;
    $(".mission__sub", missionEl).textContent = sub;
    missionEl.classList.remove("is-on");
    void missionEl.offsetWidth;
    missionEl.classList.add("is-on");
  };

  /* ---------- Reveal + zone names on scroll ---------- */

  const revealIO = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-in");
      revealIO.unobserve(e.target);
      // Drop the stagger delay once revealed so hover transitions stay instant.
      setTimeout(() => e.target.style.setProperty("--d", "0s"), 1400);
    }),
    { threshold: 0.18, rootMargin: "0px 0px -40px 0px" }
  );
  const observeReveals = (root = document) => $$("[data-reveal], .reveal-stats, .respect", root).forEach((el) => revealIO.observe(el));
  introDone.then(() => observeReveals());

  const zoneIO = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) zone(e.target.dataset.zone); }),
    { threshold: 0, rootMargin: "-45% 0px -45% 0px" }
  );
  $$("[data-zone]").forEach((el) => zoneIO.observe(el));

  // Split headline letters for the intro animation.
  $$("[data-split]").forEach((el) => {
    const text = el.textContent;
    el.textContent = "";
    el.classList.add("split-in");
    [...text].forEach((c, i) => {
      const s = document.createElement("span");
      s.className = "ch";
      s.style.setProperty("--i", i);
      s.textContent = c === " " ? " " : c;
      el.appendChild(s);
    });
    el.setAttribute("aria-label", text);
  });

  /* ---------- Bag ---------- */

  const findProduct = (id) => D.products.find((p) => p.id === id);
  let bag = store.get("ganton.bag", []).filter((i) => findProduct(i.id));
  let cheatOn = store.get("ganton.cheat", false);
  let delivery = "retirar";

  const totals = () => {
    const subtotal = bag.reduce((s, i) => s + findProduct(i.id).price * i.qty, 0);
    const off = cheatOn ? Math.round(subtotal * S.cheat.discount * 100) / 100 : 0;
    return { subtotal, off, total: subtotal - off, count: bag.reduce((s, i) => s + i.qty, 0) };
  };

  const moneyEl = $(".hud__money");
  const amountEl = $(".hud__amount");
  let shownMoney = 0;
  const rollMoney = (to) => {
    const from = shownMoney;
    shownMoney = to;
    const start = performance.now();
    const dur = reduced ? 1 : 700;
    const step = (t) => {
      const k = Math.min(1, (t - start) / dur);
      const v = Math.round(from + (to - from) * (1 - Math.pow(1 - k, 3)));
      amountEl.textContent = "$" + String(v).padStart(8, "0");
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const bagEl = $(".bag");
  const scrim = $(".scrim");
  const setBag = (open) => {
    bagEl.classList.toggle("is-open", open);
    scrim.classList.toggle("is-open", open);
    bagEl.setAttribute("aria-hidden", !open);
    document.body.classList.toggle("is-locked", open);
    if (open) $(".bag__close").focus();
  };
  moneyEl.addEventListener("click", () => setBag(true));
  $(".bag__close").addEventListener("click", () => setBag(false));
  scrim.addEventListener("click", () => setBag(false));
  addEventListener("keydown", (e) => {
    if (e.key === "Escape") { setBag(false); setPause(false); }
  });

  const renderBag = () => {
    store.set("ganton.bag", bag);
    const t = totals();
    rollMoney(Math.round(t.total));
    $(".bag-count").textContent = t.count || "";
    moneyEl.classList.remove("is-bump");
    void moneyEl.offsetWidth;
    moneyEl.classList.add("is-bump");

    const items = $(".bag__items");
    const foot = $(".bag__foot");
    if (!bag.length) {
      items.innerHTML = `<div class="bag__empty"><b>Sacola vazia</b><span>Bora passar no vestiário e escolher um kit.</span><a class="btn btn--sun" href="vestiario.html#catalogo">Ver catálogo</a></div>`;
      foot.innerHTML = "";
      return;
    }
    items.innerHTML = bag
      .map((i, idx) => {
        const p = findProduct(i.id);
        const sizeSel = p.sizes.length > 1
          ? `<select data-size="${idx}" aria-label="Tamanho">${p.sizes.map((s) => `<option${s === i.size ? " selected" : ""}>${s}</option>`).join("")}</select>`
          : `<span style="color:var(--muted);font-family:var(--f-ui)">${p.sizes[0]}</span>`;
        return `
        <div class="bitem">
          <img src="${p.thumb}" alt="" loading="lazy">
          <div>
            <div class="bitem__name">${p.name}</div>
            <div class="bitem__meta">${sizeSel}
              <span class="qty"><button type="button" data-dec="${idx}" aria-label="Diminuir">−</button><span>${i.qty}</span><button type="button" data-inc="${idx}" aria-label="Aumentar">+</button></span>
            </div>
          </div>
          <div class="bitem__right">
            <span class="bitem__price">${brl(p.price * i.qty)}</span>
            <button class="bitem__rm" type="button" data-rm="${idx}">remover</button>
          </div>
        </div>`;
      })
      .join("");

    foot.innerHTML = `
      <div class="bag__row"><span>Subtotal</span><span>${brl(t.subtotal)}</span></div>
      ${cheatOn ? `<div class="bag__row is-cheat"><span>Cheat ${S.cheat.code} (−${S.cheat.discount * 100}%)</span><span>−${brl(t.off)}</span></div>` : ""}
      <div class="bag__row bag__row--total"><span>Total</span><b>${brl(t.total)}</b></div>
      ${cheatOn ? "" : `<form class="bag__code"><input name="code" placeholder="Código / cheat" autocomplete="off" aria-label="Código de desconto"><button type="submit">Aplicar</button></form>`}
      <div class="seg" role="group" aria-label="Recebimento">
        <button type="button" data-del="retirar" aria-pressed="${delivery === "retirar"}">Retirar na loja</button>
        <button type="button" data-del="entrega" aria-pressed="${delivery === "entrega"}">Entrega</button>
      </div>
      <div class="field"><label for="bag-name">Seu nome</label><input id="bag-name" autocomplete="name" placeholder="Como te chamamos?"></div>
      <button class="btn btn--block" type="button" data-checkout>${icon.wa} Finalizar no WhatsApp</button>`;
  };

  $(".bag__items").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    const { inc, dec, rm } = b.dataset;
    if (inc) bag[inc].qty++;
    if (dec) { bag[dec].qty--; if (!bag[dec].qty) bag.splice(dec, 1); }
    if (rm) bag.splice(rm, 1);
    renderBag();
  });
  $(".bag__items").addEventListener("change", (e) => {
    const idx = e.target.dataset.size;
    if (idx == null) return;
    const item = bag[idx];
    item.size = e.target.value;
    // Merge with an existing line of the same product + size.
    const twin = bag.findIndex((o, j) => j !== +idx && o.id === item.id && o.size === item.size);
    if (twin > -1) { bag[twin].qty += item.qty; bag.splice(idx, 1); }
    renderBag();
  });

  const applyCheat = (raw) => {
    if (String(raw).trim().toUpperCase() !== S.cheat.code) return false;
    if (!cheatOn) {
      cheatOn = true;
      store.set("ganton.cheat", true);
      renderBag();
    }
    help(`<b>Cheat ativado</b><br><span class="g">−${S.cheat.discount * 100}% na sacola do vestiário.</span>`);
    return true;
  };

  $(".bag__foot").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = e.target.code;
    if (!applyCheat(input.value)) {
      input.value = "";
      input.placeholder = "Código inválido";
    }
  });
  $(".bag__foot").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.del) {
      delivery = b.dataset.del;
      $$("[data-del]").forEach((x) => x.setAttribute("aria-pressed", x === b));
    }
    if ("checkout" in b.dataset) {
      const name = $("#bag-name").value.trim();
      const t = totals();
      const lines = bag.map((i) => {
        const p = findProduct(i.id);
        return `• ${i.qty}x ${p.name} (${i.size}) — ${brl(p.price * i.qty)}`;
      });
      const msg = [
        `Fala, ${S.name}! 🛍️ Quero separar estes itens do vestiário:`,
        "",
        ...lines,
        "",
        `Subtotal: ${brl(t.subtotal)}`,
        cheatOn ? `Cheat ${S.cheat.code}: −${brl(t.off)}` : null,
        `*Total: ${brl(t.total)}*`,
        `Recebimento: ${delivery === "retirar" ? "Retirar na loja" : "Entrega (me passa o frete)"}`,
        name ? `Nome: ${name}` : null,
      ].filter((l) => l !== null).join("\n");
      openWa(msg);
      setBag(false);
      mission("pedido enviado!", "respeito +");
    }
  });

  const addToBag = (id, size, qty = 1, quiet = false) => {
    const p = findProduct(id);
    const line = bag.find((i) => i.id === id && i.size === size);
    if (line) line.qty += qty;
    else bag.push({ id, size, qty });
    renderBag();
    if (!quiet) help(`<b>${p.name}</b> (${size}) foi pra sacola.<br>Toque no <span class="g">$</span> do HUD pra ver.`);
  };

  renderBag();

  /* ---------- Keyboard cheats ---------- */

  let buffer = "";
  addEventListener("keydown", (e) => {
    if (e.target.closest("input, textarea, select")) return;
    if (e.key.length !== 1) return;
    buffer = (buffer + e.key.toUpperCase()).slice(-12);
    if (buffer.endsWith(S.cheat.code)) { buffer = ""; applyCheat(S.cheat.code); }
    if (buffer.endsWith("GROVESTREET")) { buffer = ""; help('<b>Grove Street.</b> Lar. Pelo menos era, antes de eu estragar tudo.'); }
  });

  /* ---------- Declarative bindings: data-site, data-icon, data-wa, data-maps ---------- */

  $$("[data-site]").forEach((el) => { el.textContent = S[el.dataset.site]; });
  $$("[data-icon]").forEach((el) => { el.innerHTML = icon[el.dataset.icon]; });
  $$("[data-wa]").forEach((el) => { el.href = waLink(el.dataset.wa); });
  $$("[data-maps]").forEach((el) => { el.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(S.mapsQuery)}`; });
  $$(".review .hud__stars").forEach((el) => { el.innerHTML = icon.star.repeat(5); });

  window.APP = { $, $$, brl, icon, stars, store, waLink, openWa, help, mission, zone, addToBag, observeReveals, reduced };
})();
