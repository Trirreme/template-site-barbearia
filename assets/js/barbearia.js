/* Barbershop page: services menu, barber select, schedule and WhatsApp booking. */
(function () {
  const S = window.SITE;
  const D = window.DATA;
  const { $, $$, brl, icon, waLink, openWa, help, mission, observeReveals } = window.APP;

  const state = { services: new Set(), barber: "any", date: null, time: null };
  let onUpdate = () => {};

  const fmtDur = (min) => (min < 60 ? `${min} min` : `${Math.floor(min / 60)}h${min % 60 ? String(min % 60).padStart(2, "0") : ""}`);
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const toMin = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };
  const toHHMM = (min) => `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

  /* ---------- Services (game menu) ---------- */

  const list = $("#svc-list");
  list.innerHTML = D.services
    .map((s) => `
      <li><button class="grow" type="button" data-svc="${s.id}" aria-pressed="false">
        <span class="grow__check">${icon.check}</span>
        <span class="grow__name">${s.name}${s.tag ? ` <span class="tag" style="font-size:.85rem">${s.tag}</span>` : ""}<small>${fmtDur(s.min)}</small><span class="grow__desc">${s.desc}</span></span>
        <span class="grow__price">${brl(s.price)}</span>
      </button></li>`)
    .join("");

  const pvImg = $("#pv-img");
  let pvCurrent = null;
  const preview = (id) => {
    if (id === pvCurrent) return;
    pvCurrent = id;
    const s = D.services.find((x) => x.id === id);
    $$(".grow").forEach((r) => r.classList.toggle("is-hot", r.dataset.svc === id));
    $("#pv-name").textContent = s.name.toLowerCase();
    $("#pv-desc").textContent = `${s.desc} · ${fmtDur(s.min)} · ${brl(s.price)}`;
    pvImg.classList.add("is-swap");
    const next = new Image();
    next.onload = () => { pvImg.src = s.img; pvImg.alt = s.name; pvImg.classList.remove("is-swap"); };
    next.src = s.img;
  };
  preview(D.services[0].id);

  list.addEventListener("pointerover", (e) => { const r = e.target.closest(".grow"); if (r) preview(r.dataset.svc); });
  list.addEventListener("focusin", (e) => { const r = e.target.closest(".grow"); if (r) preview(r.dataset.svc); });
  list.addEventListener("click", (e) => {
    const r = e.target.closest(".grow");
    if (!r) return;
    const id = r.dataset.svc;
    preview(id);
    if (state.services.has(id)) state.services.delete(id);
    else state.services.add(id);
    r.setAttribute("aria-pressed", state.services.has(id));
    update();
  });

  /* ---------- Team (character select) ---------- */

  $("#team").innerHTML = D.barbers
    .map((b, i) => `
      <button class="char reveal-stats" type="button" data-barber="${b.id}" aria-pressed="${b.id === state.barber}" data-reveal style="--d:${i * 0.08}s">
        <span class="char__img">${b.img ? `<img src="${b.img}" alt="${b.name}" loading="lazy">` : '<span class="char__any gta">?</span>'}<span class="char__sel">Selecionado</span></span>
        <span class="char__body">
          <span class="char__name gta">${b.name}</span>
          <span class="char__role">${b.role}</span>
          ${b.stats ? `<span class="stats">${Object.entries(b.stats).map(([k, v], j) => `<span class="stat"><span>${k}</span><span class="stat__bar"><span style="--v:${v}%;--d:${0.2 + j * 0.12}s"></span></span></span>`).join("")}</span>` : '<span style="color:var(--muted);margin-top:10px">Pega o primeiro barbeiro com horário livre.</span>'}
        </span>
      </button>`)
    .join("");
  observeReveals($("#team"));

  $("#team").addEventListener("click", (e) => {
    const c = e.target.closest(".char");
    if (!c) return;
    state.barber = c.dataset.barber;
    $$(".char").forEach((x) => x.setAttribute("aria-pressed", x === c));
    renderSlots();
    update();
  });

  /* ---------- Days + slots ---------- */

  const days = [];
  for (let i = 0, d = new Date(); days.length < 12 && i < 30; i++) {
    const day = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i);
    if (S.hours[day.getDay()]) days.push(day);
  }
  const wk = (d) => d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
  const mo = (d) => d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");

  $("#days").innerHTML = days
    .map((d, i) => `<button class="day" type="button" data-date="${iso(d)}" aria-pressed="false"><small>${i === 0 && iso(d) === iso(new Date()) ? "hoje" : wk(d)}</small><b>${d.getDate()}</b><small>${mo(d)}</small></button>`)
    .join("");

  // Deterministic fake occupancy so the demo looks lived-in and stays stable on reload.
  const hash = (str) => { let h = 2166136261; for (const c of str) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return (h >>> 0) % 100; };
  const realBarbers = D.barbers.filter((b) => b.stats).map((b) => b.id);
  const isTaken = (date, time, barber) =>
    barber === "any" ? realBarbers.every((b) => isTaken(date, time, b)) : hash(`${date}|${time}|${barber}`) < 34;

  const slotsFor = (dateStr) => {
    const d = new Date(`${dateStr}T00:00`);
    const [open, close] = S.hours[d.getDay()];
    const now = new Date();
    const isToday = dateStr === iso(now);
    const nowMin = now.getHours() * 60 + now.getMinutes() + 30;
    const out = [];
    for (let m = toMin(open); m + 30 <= toMin(close); m += 30) {
      const t = toHHMM(m);
      out.push({ t, off: (isToday && m < nowMin) || isTaken(dateStr, t, state.barber) });
    }
    return out;
  };

  const renderSlots = () => {
    const box = $("#slots");
    const who = D.barbers.find((b) => b.id === state.barber);
    $("#slot-who").textContent = state.barber === "any" ? "" : `· ${who.name}`;
    if (!state.date) { box.innerHTML = '<div class="slots-empty">Escolha um dia pra ver os horários.</div>'; return; }
    const slots = slotsFor(state.date);
    if (state.time && slots.find((s) => s.t === state.time)?.off) {
      state.time = null;
      help("Esse horário não está livre com esse barbeiro. <b>Escolha outro.</b>");
    }
    box.innerHTML = slots.every((s) => s.off)
      ? '<div class="slots-empty">Agenda cheia nesse dia. Tenta outro?</div>'
      : slots.map((s) => `<button class="slot" type="button" data-time="${s.t}" ${s.off ? "disabled" : ""} aria-pressed="${s.t === state.time}">${s.t}</button>`).join("");
  };

  $("#days").addEventListener("click", (e) => {
    const b = e.target.closest(".day");
    if (!b) return;
    state.date = b.dataset.date;
    state.time = null;
    $$(".day").forEach((x) => x.setAttribute("aria-pressed", x === b));
    renderSlots();
    update();
  });
  $("#slots").addEventListener("click", (e) => {
    const b = e.target.closest(".slot");
    if (!b || b.disabled) return;
    state.time = b.dataset.time;
    $$(".slot").forEach((x) => x.setAttribute("aria-pressed", x === b));
    update();
  });

  // Preselect the first open day so slots show immediately.
  const firstDay = days.find((d) => slotsFor(iso(d)).some((s) => !s.off));
  if (firstDay) { state.date = iso(firstDay); $(`.day[data-date="${state.date}"]`).setAttribute("aria-pressed", "true"); }
  renderSlots();

  /* ---------- Summary ---------- */

  const nameInput = $("#bk-name");
  const sendBtn = $("#bk-send");

  const picked = () => D.services.filter((s) => state.services.has(s.id));
  const whenLabel = () => {
    if (!state.date) return null;
    const d = new Date(`${state.date}T00:00`);
    const day = d.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "2-digit" });
    return state.time ? `${day} às ${state.time}` : day;
  };

  const setDd = (sel, text) => {
    const el = $(sel);
    el.textContent = text || "—";
    el.classList.toggle("is-empty", !text);
  };

  function update() {
    const svcs = picked();
    const total = svcs.reduce((s, x) => s + x.price, 0);
    const mins = svcs.reduce((s, x) => s + x.min, 0);

    $("#svc-count").textContent = svcs.length ? `${svcs.length} serviço${svcs.length > 1 ? "s" : ""} · ${fmtDur(mins)}` : "Nenhum serviço";
    $("#svc-total").textContent = brl(total);

    setDd("#sm-svc", svcs.map((s) => s.name).join(", "));
    setDd("#sm-barber", D.barbers.find((b) => b.id === state.barber).name);
    setDd("#sm-when", state.time ? whenLabel() : null);
    setDd("#sm-dur", mins ? fmtDur(mins) : null);
    $("#sm-total").textContent = brl(total);

    const missing = [];
    if (!svcs.length) missing.push("serviço");
    if (!state.time) missing.push("horário");
    if (!nameInput.value.trim()) missing.push("seu nome");
    sendBtn.disabled = missing.length > 0;
    sendBtn.innerHTML = `${icon.wa} Confirmar no WhatsApp`;
    $("#bk-hint").textContent = missing.length ? `Falta: ${missing.join(", ")}.` : "Tudo certo. É só confirmar.";

    $("#st-label").textContent = svcs.length ? `${svcs.length} serviço${svcs.length > 1 ? "s" : ""}${state.time ? ` · ${state.time}` : ""}` : "Monte seu horário";
    $("#st-total").textContent = brl(total);
    onUpdate();
  }
  nameInput.addEventListener("input", update);
  update();

  sendBtn.addEventListener("click", () => {
    const svcs = picked();
    const total = svcs.reduce((s, x) => s + x.price, 0);
    const mins = svcs.reduce((s, x) => s + x.min, 0);
    const note = $("#bk-note").value.trim();
    const msg = [
      `Fala, ${S.name}! 💈 Quero agendar um horário:`,
      "",
      `• Serviços: ${svcs.map((s) => s.name).join(", ")}`,
      `• Barbeiro: ${D.barbers.find((b) => b.id === state.barber).name}`,
      `• Quando: ${whenLabel()}`,
      `• Duração aprox.: ${fmtDur(mins)}`,
      `• *Total: ${brl(total)}*`,
      "",
      `Nome: ${nameInput.value.trim()}`,
      note ? `Obs.: ${note}` : null,
    ].filter((l) => l !== null).join("\n");
    openWa(msg);
    mission("horário marcado!", "respeito +");
  });

  // Mobile sticky bar: show while the summary is off-screen.
  const sticky = $("#sticky");
  let summaryVisible = false;
  new IntersectionObserver(([e]) => { summaryVisible = e.isIntersecting; syncSticky(); }).observe($("#resumo"));
  const syncSticky = () => {
    const on = state.services.size > 0 && !summaryVisible;
    sticky.classList.toggle("is-on", on);
    document.body.classList.toggle("sticky-on", on);
  };
  onUpdate = syncSticky;

  /* ---------- Gallery + lightbox ---------- */

  const lb = $("#lightbox");
  $("#gallery").innerHTML = D.gallery
    .map((src, i) => `<button class="panel g${i + 1}" type="button" data-reveal style="--d:${i * 0.06}s" data-full="${src.replace(/w=\d+/, "w=1600")}" aria-label="Ampliar foto ${i + 1}"><img src="${src}" alt="" loading="lazy"></button>`)
    .join("");
  observeReveals($("#gallery"));
  $("#gallery").addEventListener("click", (e) => {
    const b = e.target.closest("[data-full]");
    if (!b) return;
    $("img", lb).src = b.dataset.full;
    lb.showModal();
  });
  lb.addEventListener("click", (e) => { if (e.target === lb) lb.close(); });

  /* ---------- Plans ---------- */

  $("#plans").innerHTML = D.plans
    .map((p, i) => `
      <div class="plan${p.hot ? " plan--hot" : ""}" data-reveal style="--d:${i * 0.1}s">
        ${p.hot ? '<span class="plan__badge">Mais assinado</span>' : ""}
        <h3 class="gta">${p.name.toLowerCase()}</h3>
        <div class="plan__price">${brl(p.price).replace(",00", "")}<small> /mês</small></div>
        <ul>${p.perks.map((x) => `<li>${x}</li>`).join("")}</ul>
        <a class="btn ${p.hot ? "btn--sun" : "btn--ghost"} btn--block" target="_blank" rel="noopener"
           href="${waLink(`Fala, ${S.name}! Quero assinar o plano ${p.name} (${brl(p.price)}/mês). Como funciona?`)}">Quero esse</a>
      </div>`)
    .join("");
  observeReveals($("#plans"));
})();
