/* Store page: wardrobe (provador), drop countdown and catalog. */
(function () {
  const D = window.DATA;
  const { $, $$, brl, icon, help, addToBag, observeReveals, reduced } = window.APP;

  const byCat = (cats) => D.products.filter((p) => cats.includes(p.cat));
  const defaultSize = (p) => p.sizes[Math.floor((p.sizes.length - 1) / 2)];

  /* ---------- Wardrobe ---------- */

  const slots = [
    { key: "cap", label: "Cabeça", items: [null, ...byCat(["bones"])], empty: "Sem boné" },
    { key: "top", label: "Torso", items: byCat(["camisetas", "moletons"]) },
    { key: "legs", label: "Pernas", items: byCat(["calcas"]) },
    { key: "feet", label: "Pés", items: byCat(["tenis"]) },
  ];
  const pick = { cap: 1, top: 0, legs: 0, feet: 0 };
  let active = 1;

  const rows = $("#wd-rows");
  rows.innerHTML = slots
    .map((s, i) => `
      <div class="wrow" role="listitem" data-row="${i}">
        <span class="wrow__slot">${s.label}</span>
        <div class="wrow__pick">
          <button class="wrow__arrow" type="button" data-step="-1" aria-label="${s.label}: peça anterior">${icon.left}</button>
          <div class="wrow__item" aria-live="polite"></div>
          <button class="wrow__arrow" type="button" data-step="1" aria-label="${s.label}: próxima peça">${icon.right}</button>
        </div>
      </div>`)
    .join("");

  const man = $("#mannequin");
  man.innerHTML = `
    <div class="panel m-cap"></div>
    <div class="m-total"><small>Total do look</small><b id="wd-total">R$ 0</b></div>
    <div class="panel m-top"></div>
    <div class="panel m-legs"></div>
    <div class="panel m-feet"></div>`;

  const current = (s) => s.items[pick[s.key]];

  const paint = (i, dir = 0) => {
    const s = slots[i];
    const p = current(s);
    const item = $(`[data-row="${i}"] .wrow__item`, rows);
    item.innerHTML = p ? `<b>${p.name}</b><span>${brl(p.price)}</span>` : `<b>${s.empty}</b><span>—</span>`;
    if (dir) {
      item.style.setProperty("--dir", `${dir * 14}px`);
      item.classList.remove("is-flip");
      void item.offsetWidth;
      item.classList.add("is-flip");
    }
    $(`.m-${s.key}`, man).innerHTML = p ? `<img src="${p.img.replace("w=900", "w=600")}" alt="${p.name}">` : `<div class="m-empty">${s.empty}</div>`;
    const total = slots.reduce((sum, x) => sum + (current(x)?.price || 0), 0);
    $("#wd-total").textContent = brl(total).replace(",00", "");
  };

  const setActive = (i) => {
    active = (i + slots.length) % slots.length;
    $$(".wrow", rows).forEach((r, j) => r.classList.toggle("is-active", j === active));
  };

  const step = (i, dir) => {
    const s = slots[i];
    pick[s.key] = (pick[s.key] + dir + s.items.length) % s.items.length;
    paint(i, dir);
  };

  slots.forEach((_, i) => paint(i));
  setActive(active);

  rows.addEventListener("click", (e) => {
    const row = e.target.closest(".wrow");
    if (!row) return;
    const i = +row.dataset.row;
    setActive(i);
    const b = e.target.closest("[data-step]");
    if (b) step(i, +b.dataset.step);
  });

  // Arrow keys drive the wardrobe while it is on screen.
  let wardrobeVisible = false;
  new IntersectionObserver(([e]) => { wardrobeVisible = e.isIntersecting; }, { threshold: 0.5 }).observe($("#provador .wardrobe"));
  addEventListener("keydown", (e) => {
    if (!wardrobeVisible || e.target.closest("input, textarea, select")) return;
    const map = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
    const m = map[e.key];
    if (!m) return;
    e.preventDefault();
    if (m[0]) setActive(active + m[0]);
    else step(active, m[1]);
  });

  $("#wd-random").addEventListener("click", () => {
    slots.forEach((s, i) => {
      pick[s.key] = Math.floor(Math.random() * s.items.length);
      paint(i, 1);
    });
  });

  $("#wd-add").addEventListener("click", () => {
    const items = slots.map(current).filter(Boolean);
    items.forEach((p) => addToBag(p.id, defaultSize(p), 1, true));
    help(`<b>Look completo</b> foi pra sacola (${items.length} peças).<br><span class="g">Ajuste os tamanhos na sacola.</span>`, 4200);
  });

  /* ---------- Drop countdown: next Friday 19:00 ---------- */

  const nextDrop = () => {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 19, 0, 0);
    d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7));
    if (d <= now) d.setDate(d.getDate() + 7);
    return d;
  };
  let target = nextDrop();
  const units = Object.fromEntries($$("#count [data-u]").map((el) => [el.dataset.u, el]));
  const tickCount = () => {
    let s = Math.max(0, Math.floor((target - Date.now()) / 1000));
    if (!s) target = nextDrop();
    const vals = { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
    for (const k in vals) {
      const v = String(vals[k]).padStart(2, "0");
      if (units[k].textContent !== v) units[k].textContent = v;
    }
  };
  tickCount();
  setInterval(tickCount, 1000);

  /* ---------- Catalog ---------- */

  const filters = $("#filters");
  filters.innerHTML = [{ id: "all", label: "Todos" }, ...D.categories]
    .map((c) => `<button class="chip" type="button" data-cat="${c.id}" aria-pressed="${c.id === "all"}">${c.label}</button>`)
    .join("");

  const grid = $("#grid");
  grid.innerHTML = D.products
    .map((p, i) => {
      const single = p.sizes.length === 1;
      return `
      <article class="card" data-cat="${p.cat}" data-id="${p.id}" data-reveal style="--d:${(i % 4) * 0.07}s">
        <div class="card__img">
          <img src="${p.img.replace("w=900", "w=600")}" alt="${p.name}" loading="lazy">
          ${p.tag ? `<span class="card__tag${p.tag === "Drop" ? " card__tag--grove" : ""}">${p.tag}</span>` : ""}
        </div>
        <div class="card__body">
          <div>
            <h3 class="card__name">${p.name}</h3>
            <div class="card__price">${brl(p.price)}</div>
          </div>
          <div class="sizes" role="group" aria-label="Tamanho" style="--cols:${p.sizes.length === 6 ? 3 : Math.min(4, p.sizes.length)}">
            ${p.sizes.map((s) => `<button class="size" type="button" data-size="${s}" aria-pressed="${single}">${s}</button>`).join("")}
          </div>
          <button class="btn" type="button" data-add>+ Sacola</button>
        </div>
      </article>`;
    })
    .join("");
  observeReveals(grid);

  filters.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    const cat = chip.dataset.cat;
    $$(".chip", filters).forEach((c) => c.setAttribute("aria-pressed", c === chip));
    let n = 0;
    $$(".card", grid).forEach((card) => {
      const show = cat === "all" || card.dataset.cat === cat;
      card.classList.toggle("is-hidden", !show);
      card.classList.remove("is-enter");
      if (show && !reduced) {
        card.classList.add("is-in");
        card.style.setProperty("--d", `${Math.min(n++, 8) * 0.05}s`);
        void card.offsetWidth;
        card.classList.add("is-enter");
      }
    });
  });

  grid.addEventListener("click", (e) => {
    const card = e.target.closest(".card");
    if (!card) return;
    const size = e.target.closest(".size");
    if (size) {
      $$(".size", card).forEach((s) => s.setAttribute("aria-pressed", s === size));
      return;
    }
    if (e.target.closest("[data-add]")) {
      const chosen = $('.size[aria-pressed="true"]', card);
      if (!chosen) {
        const box = $(".sizes", card);
        box.classList.remove("is-shake");
        void box.offsetWidth;
        box.classList.add("is-shake");
        help("Escolhe o <b>tamanho</b> primeiro.", 2200);
        return;
      }
      addToBag(card.dataset.id, chosen.dataset.size);
    }
  });
})();
