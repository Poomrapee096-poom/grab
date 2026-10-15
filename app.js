(() => {
  const GATED = new Set(["supplier", "group", "recipes", "ledger", "news", "assistant", "howto", "buy", "close"]);

  const state = {
    screen: "home",
    unlimited: true,
    supplierTab: "delivery",
    newsLane: "foryou",
    cat: "All",
    search: "",
    menus: JSON.parse(JSON.stringify(MENUS_SEED)),
    stock: { ...STOCK_SEED },
    banks: JSON.parse(JSON.stringify(BANKS)),
    joined: {},
    cart: {},
    chat: [
      {
        role: "ai",
        text: "Hi! Based on your sales, you may need 5 kg of pork tomorrow. Supplier B offers the lowest delivered cost today — or join the Sukhumvit pool to save 15%.",
      },
    ],
    toast: "",
    recipeId: "basil-rice",
    poolId: "chicken-pool",
    newsId: "chicken",
  };

  const $app = document.getElementById("app");
  const $tab = document.getElementById("tabbar");
  const $sheet = document.getElementById("sheet");
  const $sheetCard = document.getElementById("sheetCard");

  const baht = (n) =>
    "฿" +
    Number(n).toLocaleString("en-TH", {
      maximumFractionDigits: n % 1 === 0 ? 0 : 2,
    });

  const product = (id) => PRODUCTS.find((p) => p.id === id);
  const gate = () => GATED.has(state.screen) && !state.unlimited;

  function go(screen, extra = {}) {
    Object.assign(state, extra, { screen });
    render();
  }

  function toast(msg) {
    state.toast = msg;
    render();
    setTimeout(() => {
      state.toast = "";
      render();
    }, 1800);
  }

  function neededMap() {
    const need = {};
    state.menus.forEach((m) => {
      m.ingredients.forEach((ing) => {
        need[ing.productId] = (need[ing.productId] || 0) + ing.qty * m.forecast;
      });
    });
    return need;
  }

  function buyPlan() {
    const need = neededMap();
    return PRODUCTS.map((p) => {
      const needed = need[p.id] || 0;
      const stock = state.stock[p.id] || 0;
      const raw = Math.max(0, needed - stock);
      const pack = p.unit === "pcs" ? Math.ceil(raw) : Math.ceil(raw * 10) / 10;
      const leftover = Math.max(0, stock + pack - needed);
      const leftoverPct = needed ? leftover / Math.max(needed, 0.01) : 0;
      const usePool = leftoverPct > 0.18 && pack > 0;
      const buyQty = usePool ? Math.max(0, Math.round((pack * 0.7) * 10) / 10) : pack;
      const leftover2 = Math.max(0, stock + buyQty - needed);
      return {
        ...p,
        needed,
        stock,
        pack,
        buyQty,
        leftover: leftover2,
        leftoverPct,
        usePool,
        retailCost: buyQty * p.retail,
        wholesaleCost: buyQty * p.wholesale,
      };
    }).filter((r) => r.needed > 0 || r.stock > 0);
  }

  function header(title, { back, light, extra } = {}) {
    return `
      <div class="hero ${light ? "light" : ""}">
        <div class="row between">
          <div class="row">
            ${back ? `<button class="back" data-act="back">‹</button>` : ""}
            <div class="brand">${title}</div>
          </div>
          <div class="row">
            ${
              state.unlimited
                ? `<span class="gold">UNLIMITED</span>`
                : `<button class="pill" data-go="unlimited">Unlimited</button>`
            }
            ${extra || ""}
          </div>
        </div>
        ${
          light
            ? ""
            : `<div class="search">
            <span>⌕</span>
            <input data-search placeholder="What are you looking for?" value="${escapeAttr(state.search)}" />
          </div>`
        }
      </div>`;
  }

  function escapeAttr(s) {
    return String(s || "").replace(/"/g, "&quot;");
  }

  function homeScreen() {
    const services = [
      ["🚗", "Car"],
      ["🍱", "Food"],
      ["📦", "Express"],
      ["🏪", "Mart"],
      ["🛵", "Transport"],
      ["🎁", "Gifts"],
      ["🏨", "Hotels"],
      ["🛒", "Supplier", true],
    ];
    return `
      <div class="hero">
        <div class="row between">
          <div class="brand">Grab</div>
          ${state.unlimited ? `<span class="gold">UNLIMITED</span>` : `<span class="pill">Standard</span>`}
        </div>
        <p class="muted" style="color:#e8fff2;margin-top:6px">${SHOP.name} · ${SHOP.area}</p>
        <div class="search"><span>⌕</span><input disabled placeholder="Search Grab" /></div>
      </div>
      <div class="pad">
        <div class="grid-services">
          ${services
            .map(
              ([ico, name, neu]) => `
            <button class="service" data-go="${neu ? "supplier" : "soon"}" data-soon="${name}">
              <div class="bubble">${ico}</div>
              ${neu ? `<span class="new">New!</span>` : ""}
              ${name}
            </button>`
            )
            .join("")}
        </div>
        <div class="promo">
          <div class="row between">
            <strong>Grab Supplier</strong>
            <span class="badge">MSME</span>
          </div>
          <p>Source ingredients at competitive prices, pool orders for wholesale, and let AI cut leftover food. Unlimited merchants only.</p>
          <button class="btn" style="margin-top:12px;background:#fff;color:#0b3d2e" data-go="supplier">Open Grab Supplier</button>
        </div>
        <div class="card">
          <h3>Demo membership</h3>
          <p class="muted">Toggle this to preview Standard vs Unlimited. Features stay locked unless Unlimited is on.</p>
          <div class="row between" style="margin-top:10px">
            <span class="toggle">Grab Unlimited</span>
            <button class="switch ${state.unlimited ? "on" : ""}" data-act="toggle-unlimited"><i></i></button>
          </div>
        </div>
      </div>`;
  }

  function paywallScreen() {
    return `
      <div class="paywall">
        <div class="hero-copy">
          <div class="row between">
            <button class="back" data-act="back">‹</button>
            <span class="gold">GRAB UNLIMITED</span>
          </div>
          <h2>Unlock Grab Supplier for your shop</h2>
          <p class="muted" style="color:#cdebd8">News, group wholesale, Grab delivery, bank close, menus and AI planning are included with Grab Unlimited.</p>
        </div>
        <div class="price-card">
          <div class="row between">
            <div>
              <div class="muted">Merchant plan</div>
              <strong style="font-size:22px">${UNLIMITED.price}</strong>
            </div>
            <span class="tag green">MSME</span>
          </div>
          <div style="margin-top:10px">
            ${UNLIMITED.benefits
              .map((b) => `<div class="benefit" style="color:#1c1c1c;border-color:#eee"><span>✔</span><span>${b}</span></div>`)
              .join("")}
          </div>
          <button class="btn" style="margin-top:14px" data-act="upgrade">Upgrade to Unlimited</button>
          <button class="btn ghost" style="margin-top:8px" data-go="home">Stay on Standard</button>
        </div>
        <p class="muted" style="text-align:center;margin:14px 16px;color:#9ecfb3">Demo: you can also flip Unlimited on Home.</p>
      </div>`;
  }

  function supplierScreen() {
    const cats = ["All", "Meat", "Produce", "Dry", "Seafood", "Dairy"];
    const list = PRODUCTS.filter(
      (p) =>
        (state.cat === "All" || p.cat === state.cat) &&
        p.name.toLowerCase().includes(state.search.toLowerCase())
    );
    const info = state.supplierTab === "information";
    const pickup = state.supplierTab === "pickup";

    return `
      ${header("Grab Supplier")}
      <div class="pad">
        <div class="tabs">
          ${["delivery", "pickup", "information"]
            .map(
              (t) =>
                `<button class="${state.supplierTab === t ? "on" : ""}" data-act="stab" data-tab="${t}">${
                  t === "information" ? "Information" : t[0].toUpperCase() + t.slice(1)
                }</button>`
            )
            .join("")}
        </div>
        ${
          info
            ? newsPane()
            : `
          <div class="h-scroll" style="margin-top:8px">
            ${cats
              .map(
                (c) =>
                  `<button class="chip ${state.cat === c ? "on" : ""}" data-act="cat" data-cat="${c}">${c}</button>`
              )
              .join("")}
          </div>
          <div class="alert">
            🐔 Chicken cost has risen <span class="up">12%</span> this week.
            ${pickup ? "Pickup at the morning hub still includes wholesale pool pricing." : "Join the Sukhumvit chicken pool to keep yesterday’s wholesale rate."}
          </div>
          ${list
            .map((p) => {
              const qty = state.cart[p.id] || 0;
              return `
              <div class="list-item">
                <div class="thumb">${p.icon}</div>
                <div class="grow">
                  <strong>${p.name}</strong>
                  <div class="muted">${p.cat} · per ${p.unit}</div>
                </div>
                <div>
                  <div class="price">${baht(p.wholesale)}</div>
                  <div class="strike">${baht(p.retail)}</div>
                  <button class="btn small" style="margin-top:4px" data-act="add" data-id="${p.id}">${
                    qty ? qty + " " + p.unit : "Add"
                  }</button>
                </div>
              </div>`;
            })
            .join("")}
          <div class="stack">
            <button class="btn" data-go="buy">Review AI buy list</button>
            <button class="btn ghost" data-go="howto">How to use</button>
          </div>`
        }
      </div>
      <button class="fab" data-go="assistant">AI Assistant</button>`;
  }

  function newsPane() {
    const items = state.newsLane === "general" ? NEWS : NEWS;
    return `
      <div class="tabs">
        <button class="${state.newsLane === "foryou" ? "on" : ""}" data-act="lane" data-lane="foryou">For You</button>
        <button class="${state.newsLane === "general" ? "on" : ""}" data-act="lane" data-lane="general">General</button>
      </div>
      <div class="card" style="margin-top:8px">
        ${items
          .map(
            (n) => `
          <button class="news" data-go="news" data-id="${n.id}" style="width:100%;text-align:left">
            <div class="mark">${n.icon}</div>
            <div class="grow">
              <div class="muted">${n.tag}</div>
              <h4>${n.title}</h4>
              <span class="${n.tone}">${n.change}</span>
            </div>
          </button>`
          )
          .join("")}
      </div>`;
  }

  function newsScreen() {
    const n = NEWS.find((x) => x.id === state.newsId) || NEWS[0];
    return `
      ${header("Information", { back: true, light: true })}
      <div class="pad">
        <div class="card">
          <div class="muted">${n.tag}</div>
          <h3 style="font-size:18px;margin:8px 0">${n.icon} ${n.title}</h3>
          <p class="muted">${n.body}</p>
          <div class="alert">${n.action}</div>
          <div class="stack">
            <button class="btn" data-go="group">Join wholesale pool</button>
            <button class="btn ghost" data-go="assistant">Ask AI Assistant</button>
          </div>
        </div>
      </div>`;
  }

  function howtoScreen() {
    const steps = [
      ["1", "Set up your shop", "Confirm menus, location, and Grab Unlimited."],
      ["2", "Add ingredients & demand", "Enter grams per dish and expected covers."],
      ["3", "Compare suppliers & total cost", "Retail vs wholesale + delivery + waste."],
      ["4", "Choose delivery and order", "Grab Supplier Delivery or hub pickup."],
    ];
    return `
      ${header("How to use", { back: true, light: true })}
      <div class="pad">
        <p class="muted" style="padding-top:4px">An all-in-one purchasing platform for small businesses: source ingredients, compare total cost, and buy smarter.</p>
        <div class="card">
          <div class="steps">
            ${steps.map(([n, t, d]) => `<div class="step"><b>STEP ${n}</b><span>${t}</span><p class="muted">${d}</p></div>`).join("")}
          </div>
        </div>
        <div class="card">
          <h3>From sourcing to savings</h3>
          <div class="list-item"><div class="thumb">👥</div><div class="grow"><strong>Smart Group Buying</strong><p class="muted">Combine nearby shops’ demand to unlock wholesale prices.</p></div></div>
          <div class="list-item"><div class="thumb">🤖</div><div class="grow"><strong>AI Cost Optimizer</strong><p class="muted">Compare product price, delivery, minimum order and waste risk.</p></div></div>
          <div class="list-item"><div class="thumb">🚚</div><div class="grow"><strong>Flexible Delivery</strong><p class="muted">Grab Supplier Delivery or pickup based on your kitchen hours.</p></div></div>
        </div>
      </div>`;
  }

  function groupScreen() {
    return `
      ${header("Group Buy", { light: true, back: true })}
      <div class="pad">
        <p class="muted">Grab combines ingredient orders from nearby merchants, bargains wholesale, then moves stock on Grab Supplier Delivery.</p>
        ${POOLS.map((pool) => {
          const p = product(pool.item);
          const pct = Math.round((pool.joinedKg / pool.targetKg) * 100);
          const mine = state.joined[pool.id] || 0;
          return `
            <div class="card">
              <div class="row between">
                <h3>${pool.title}</h3>
                <span class="tag green">−${pool.savePct}%</span>
              </div>
              <p class="muted">${p.icon} ${p.name} · ${pool.shops} shops pooling</p>
              <div class="progress"><span style="width:${pct}%"></span></div>
              <p class="muted">${pool.joinedKg}/${pool.targetKg} ${p.unit} · cutoff ${pool.cutoff}</p>
              <p class="muted">${pool.drop}</p>
              ${mine ? `<p class="muted">Your commit: <strong>${mine} ${p.unit}</strong></p>` : ""}
              <button class="btn" style="margin-top:10px" data-go="group" data-id="${pool.id}" data-act="open-pool">Join this pool</button>
            </div>`;
        }).join("")}
      </div>`;
  }

  function poolSheet(id) {
    const pool = POOLS.find((p) => p.id === id);
    const p = product(pool.item);
    const qty = state.joined[id] || 5;
    return `
      <h3>Join ${pool.title}</h3>
      <p class="muted">Wholesale ${baht(p.wholesale)}/${p.unit} vs retail ${baht(p.retail)}. Delivered by Grab.</p>
      <div class="field"><label>Commit quantity (${p.unit})</label>
        <input id="poolQty" type="number" min="1" step="0.5" value="${qty}" />
      </div>
      <div class="stack">
        <button class="btn" data-act="commit-pool" data-id="${id}">Lock wholesale + Grab delivery</button>
        <button class="btn outline" data-close-sheet>Cancel</button>
      </div>`;
  }

  function recipesScreen() {
    return `
      ${header("Menus & recipes", { light: true, back: true })}
      <div class="pad">
        <p class="muted">Enter ingredient amounts per dish. AI uses GrabFood demand so you buy what customers will actually order — not leftover stock.</p>
        ${state.menus
          .map(
            (m) => `
          <button class="card" style="width:100%;text-align:left" data-go="recipes" data-id="${m.id}" data-act="open-recipe">
            <div class="row between">
              <h3>${m.name}</h3>
              <span>${baht(m.price)}</span>
            </div>
            <p class="muted">${m.ingredients.length} ingredients · forecast ${m.forecast} covers tomorrow</p>
          </button>`
          )
          .join("")}
        <button class="btn" style="margin-top:12px" data-go="buy">Calculate what to buy</button>
      </div>`;
  }

  function recipeSheet(id) {
    const m = state.menus.find((x) => x.id === id);
    return `
      <h3>${m.name}</h3>
      <div class="field"><label>Expected covers tomorrow</label>
        <input id="fc" type="number" value="${m.forecast}" />
      </div>
      <p class="muted" style="margin-top:10px">Amount per 1 dish</p>
      ${m.ingredients
        .map((ing, i) => {
          const p = product(ing.productId);
          return `<div class="ing">
            <input value="${p.name}" disabled />
            <input data-ing="${i}" type="number" step="0.001" value="${ing.qty}" />
            <span class="muted">${p.unit}</span>
            <button data-act="del-ing" data-i="${i}">✕</button>
          </div>`;
        })
        .join("")}
      <div class="stack">
        <button class="btn" data-act="save-recipe" data-id="${id}">Save recipe</button>
        <button class="btn outline" data-close-sheet>Close</button>
      </div>`;
  }

  function buyScreen() {
    const plan = buyPlan().filter((r) => r.buyQty > 0 || r.needed > 0);
    const retail = plan.reduce((s, r) => s + r.retailCost, 0);
    const whole = plan.reduce((s, r) => s + r.wholesaleCost, 0);
    const recs = plan.filter((r) => r.usePool || r.leftoverPct > 0.15 || (r.stock > r.needed && r.needed > 0));
    return `
      ${header("AI buy list", { light: true, back: true })}
      <div class="pad">
        <div class="kpi">
          <div><div class="muted">Retail if bought solo</div><b>${baht(retail)}</b></div>
          <div><div class="muted">Group wholesale</div><b>${baht(whole)}</b></div>
        </div>
        <div class="card">
          <h3>AI-Powered Cost & Inventory Assistant</h3>
          <p class="muted">Calculated from your menus × tomorrow’s demand − current stock. Rounded to reduce leftover food.</p>
          <table class="table">
            <tr><th>Item</th><th>Need</th><th>Buy</th><th>Left</th></tr>
            ${plan
              .map(
                (r) => `
              <tr>
                <td>${r.icon} ${r.name}</td>
                <td>${r.needed.toFixed(2)}</td>
                <td><strong>${r.buyQty}</strong></td>
                <td>${r.leftover.toFixed(2)}</td>
              </tr>`
              )
              .join("")}
          </table>
        </div>
        <div class="card">
          <h3>Recommendations</h3>
          ${
            recs.length
              ? recs
                  .map((r) => {
                    if (r.stock > r.needed)
                      return `<p class="muted">• Skip extra ${r.name}. You already have ${r.stock} ${r.unit} vs ${r.needed.toFixed(2)} needed — leftover risk if you restock.</p>`;
                    if (r.usePool)
                      return `<p class="muted">• Buy ${r.buyQty} ${r.unit} of ${r.name} and put the rest in group buy so you don’t sit on surplus.</p>`;
                    return `<p class="muted">• ${r.name}: buy ${r.buyQty} ${r.unit} to hit demand with minimal leftover.</p>`;
                  })
                  .join("")
              : `<p class="muted">Your plan already matches demand closely. Place the wholesale order.</p>`
          }
        </div>
        <div class="stack">
          <button class="btn" data-act="place-order">Order via Grab Supplier Delivery</button>
          <button class="btn ghost" data-go="group">Send remainder to group buy</button>
        </div>
      </div>`;
  }

  function ledgerScreen() {
    const net =
      LEDGER.foodSales + LEDGER.otherIncome - LEDGER.grabFees - LEDGER.supplierSpend - LEDGER.deliverySpend;
    const linked = state.banks.filter((b) => b.connected).length;
    return `
      ${header("Close the books", { light: true, back: true })}
      <div class="pad">
        <p class="muted">AI connects Grab payouts to your bank accounts so you can close the period and see payments vs real income.</p>
        <div class="kpi">
          <div><div class="muted">Sales ${LEDGER.period}</div><b>${baht(LEDGER.foodSales)}</b></div>
          <div><div class="muted">Net after costs</div><b>${baht(net)}</b></div>
        </div>
        <div class="card">
          <h3>Linked accounts</h3>
          ${state.banks
            .map(
              (b) => `
            <div class="bank">
              <span class="dot ${b.connected ? "" : "off"}"></span>
              <div class="grow">
                <strong>${b.name}</strong>
                <div class="muted">${b.connected ? "•••• " + b.last4 + " · " + baht(b.balance) : "Not connected"}</div>
              </div>
              <button class="btn small ${b.connected ? "ghost" : ""}" data-act="bank" data-id="${b.id}">${
                b.connected ? "Unlink" : "Link"
              }</button>
            </div>`
            )
            .join("")}
        </div>
        <div class="card">
          <h3>Period close</h3>
          <table class="table">
            <tr><td>GrabFood + delivery sales</td><td class="price">${baht(LEDGER.foodSales)}</td></tr>
            <tr><td>Other income</td><td class="price">${baht(LEDGER.otherIncome)}</td></tr>
            <tr><td>Grab fees</td><td class="price up">−${baht(LEDGER.grabFees)}</td></tr>
            <tr><td>Ingredient spend (Supplier)</td><td class="price">−${baht(LEDGER.supplierSpend)}</td></tr>
            <tr><td>Supplier delivery</td><td class="price">−${baht(LEDGER.deliverySpend)}</td></tr>
            <tr><td>Pending payouts</td><td class="price">${baht(LEDGER.payoutsPending)}</td></tr>
          </table>
          <button class="btn" style="margin-top:12px" data-act="close-books">Close period with ${linked} banks</button>
        </div>
      </div>`;
  }

  function assistantScreen() {
    return `
      ${header("AI Assistant", { light: true, back: true })}
      <div class="pad">
        <div class="chat">
          ${state.chat
            .map((m) => `<div class="${m.role === "ai" ? "bubble-ai" : "bubble-me"}">${m.text}</div>`)
            .join("")}
        </div>
        <div class="h-scroll" style="margin-top:10px">
          <button class="chip" data-act="ask" data-q="What should I buy tomorrow?">Buy list</button>
          <button class="chip" data-act="ask" data-q="Chicken prices rose — what do I do?">Chicken shock</button>
          <button class="chip" data-act="ask" data-q="How do I close my books this period?">Close books</button>
        </div>
        <div class="composer">
          <input id="chatIn" placeholder="Ask about cost, demand, pools…" />
          <button class="btn small" data-act="send-chat">Send</button>
        </div>
      </div>`;
  }

  function aiReply(q) {
    const ql = q.toLowerCase();
    if (ql.includes("chicken"))
      return "Chicken is +12% this week. Keep Basil Fried Rice on the menu but join the Sukhumvit chicken pool (wholesale ฿73/kg vs ฿89) and don’t overbuy rice — you already have 8.5 kg in stock.";
    if (ql.includes("close") || ql.includes("bank") || ql.includes("book"))
      return "Link KBank, SCB and GrabPay, then tap Close period. AI matches GrabFood sales, fees, supplier invoices and bank inflows so you see net income — not just payouts.";
    if (ql.includes("buy") || ql.includes("tomorrow") || ql.includes("leftover")) {
      const plan = buyPlan().filter((r) => r.buyQty > 0);
      const top = plan
        .slice(0, 4)
        .map((r) => `${r.buyQty}${r.unit} ${r.name}`)
        .join(", ");
      return `From your recipes and forecast: buy ${top}. Skip extra rice to avoid leftover. Remainder of meat goes to group wholesale + Grab 5:30 AM delivery.`;
    }
    return "I can plan ingredients from your menus, pool wholesale with nearby shops, route Grab Supplier Delivery, and close your bank period. Try asking what to buy tomorrow.";
  }

  function render() {
    const showTabs = state.screen !== "home" && state.screen !== "unlimited";
    $tab.hidden = !showTabs;
    [...$tab.querySelectorAll(".tab")].forEach((b) => {
      const nav = b.dataset.nav;
      b.classList.toggle("active", nav === state.screen || (nav === "supplier" && ["news", "howto", "assistant", "buy"].includes(state.screen)));
    });

    let html;
    if (state.screen === "home") html = homeScreen();
    else if (state.screen === "unlimited" || gate()) html = paywallScreen();
    else if (state.screen === "supplier") html = supplierScreen();
    else if (state.screen === "news") html = newsScreen();
    else if (state.screen === "howto") html = howtoScreen();
    else if (state.screen === "group") html = groupScreen();
    else if (state.screen === "recipes") html = recipesScreen();
    else if (state.screen === "buy") html = buyScreen();
    else if (state.screen === "ledger") html = ledgerScreen();
    else if (state.screen === "assistant") html = assistantScreen();
    else html = homeScreen();

    $app.innerHTML = html + (state.toast ? `<div class="fab" style="left:18px;right:auto">${state.toast}</div>` : "");
  }

  function closeSheet() {
    $sheet.hidden = true;
  }

  function openSheet(html) {
    $sheetCard.innerHTML = html;
    $sheet.hidden = false;
  }

  $tab.addEventListener("click", (e) => {
    const b = e.target.closest("[data-nav]");
    if (!b) return;
    go(b.dataset.nav);
  });

  $app.addEventListener("click", (e) => {
    const t = e.target.closest("[data-act],[data-go],[data-close-sheet]");
    if (!t) return;
    const act = t.dataset.act;
    const next = t.dataset.go;

    if (act === "back") {
      if (gate() || state.screen === "unlimited" || ["supplier", "group", "recipes", "ledger"].includes(state.screen)) {
        go("home");
      } else {
        go("supplier");
      }
      return;
    }
    if (act === "toggle-unlimited") {
      state.unlimited = !state.unlimited;
      render();
      return;
    }
    if (act === "upgrade") {
      state.unlimited = true;
      go("supplier");
      toast("Unlimited on — Supplier unlocked");
      return;
    }
    if (act === "stab") {
      state.supplierTab = t.dataset.tab;
      render();
      return;
    }
    if (act === "lane") {
      state.newsLane = t.dataset.lane;
      render();
      return;
    }
    if (act === "cat") {
      state.cat = t.dataset.cat;
      render();
      return;
    }
    if (act === "add") {
      const id = t.dataset.id;
      state.cart[id] = (state.cart[id] || 0) + 1;
      toast("Added to order");
      return;
    }
    if (act === "open-pool") {
      state.poolId = t.dataset.id;
      openSheet(poolSheet(state.poolId));
      return;
    }
    if (act === "commit-pool") {
      const qty = Number(document.getElementById("poolQty").value) || 1;
      state.joined[t.dataset.id] = qty;
      closeSheet();
      toast("Pooled · Grab delivery booked");
      return;
    }
    if (act === "open-recipe") {
      state.recipeId = t.dataset.id;
      openSheet(recipeSheet(state.recipeId));
      return;
    }
    if (act === "save-recipe") {
      const m = state.menus.find((x) => x.id === t.dataset.id);
      m.forecast = Number(document.getElementById("fc").value) || m.forecast;
      $sheetCard.querySelectorAll("[data-ing]").forEach((inp) => {
        m.ingredients[Number(inp.dataset.ing)].qty = Number(inp.value) || 0;
      });
      closeSheet();
      toast("Recipe saved");
      return;
    }
    if (act === "del-ing") {
      const m = state.menus.find((x) => x.id === state.recipeId);
      m.ingredients.splice(Number(t.dataset.i), 1);
      openSheet(recipeSheet(state.recipeId));
      return;
    }
    if (act === "place-order") {
      toast("Wholesale order placed · 05:30 delivery");
      return;
    }
    if (act === "bank") {
      const b = state.banks.find((x) => x.id === t.dataset.id);
      b.connected = !b.connected;
      if (b.connected) b.last4 = "2290";
      render();
      return;
    }
    if (act === "close-books") {
      toast("Period closed · banks matched");
      return;
    }
    if (act === "ask") {
      const q = t.dataset.q;
      state.chat.push({ role: "me", text: q }, { role: "ai", text: aiReply(q) });
      render();
      $app.scrollTop = $app.scrollHeight;
      return;
    }
    if (act === "send-chat") {
      const inp = document.getElementById("chatIn");
      const q = (inp.value || "").trim();
      if (!q) return;
      state.chat.push({ role: "me", text: q }, { role: "ai", text: aiReply(q) });
      render();
      return;
    }
    if (next === "soon") {
      toast(`${t.dataset.soon} is in the main Grab app`);
      return;
    }
    if (next === "news") {
      go("news", { newsId: t.dataset.id });
      return;
    }
    if (next) go(next);
  });

  $app.addEventListener("input", (e) => {
    if (e.target.matches("[data-search]")) state.search = e.target.value;
  });
  $app.addEventListener("change", (e) => {
    if (e.target.matches("[data-search]")) {
      state.search = e.target.value;
      render();
    }
  });
  $app.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.matches("[data-search]")) {
      state.search = e.target.value;
      render();
    }
  });

  $sheet.addEventListener("click", (e) => {
    if (e.target.closest("[data-close-sheet]")) closeSheet();
  });

  $sheetCard.addEventListener("click", (e) => {
    const t = e.target.closest("[data-act],[data-close-sheet]");
    if (!t) return;
    if (t.hasAttribute("data-close-sheet")) {
      closeSheet();
      return;
    }
    const act = t.dataset.act;
    if (act === "commit-pool") {
      const qty = Number(document.getElementById("poolQty").value) || 1;
      state.joined[t.dataset.id] = qty;
      closeSheet();
      toast("Pooled · Grab delivery booked");
    } else if (act === "save-recipe") {
      const m = state.menus.find((x) => x.id === t.dataset.id);
      m.forecast = Number(document.getElementById("fc").value) || m.forecast;
      $sheetCard.querySelectorAll("[data-ing]").forEach((inp) => {
        m.ingredients[Number(inp.dataset.ing)].qty = Number(inp.value) || 0;
      });
      closeSheet();
      toast("Recipe saved");
    } else if (act === "del-ing") {
      const m = state.menus.find((x) => x.id === state.recipeId);
      m.ingredients.splice(Number(t.dataset.i), 1);
      openSheet(recipeSheet(state.recipeId));
    }
  });

  document.getElementById("clock").textContent = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  render();
})();
