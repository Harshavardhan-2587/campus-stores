(() => {
  const storageKey = "campus-stores.shift.v1";
  const root = document.getElementById("campus-stores");
  if (!root) return;
  const q = (selector) => root.querySelector(selector);
  const requests = [
    {
      id: "RQ-214",
      club: "Film Society",
      event: "Courtyard screening",
      owner: "Isha Rao",
      due: "Fri 8 pm",
      items: ["HDMI projector", "Portable speaker", "USB-C → HDMI adapter"],
      note: "Playback is from a USB-C-only laptop. The host will collect at 4 pm.",
    },
    {
      id: "RQ-209",
      club: "Debate Union",
      event: "Finals rehearsal",
      owner: "Tara Shah",
      due: "Sat 10 am",
      items: ["Wireless microphone"],
      note: "Rehearsal runs into the evening.",
    },
    {
      id: "RQ-217",
      club: "Photo Circle",
      event: "Street portrait walk",
      owner: "Dev Menon",
      due: "Sat noon",
      items: ["Digital camera"],
      note: "Collection on Saturday morning.",
    },
  ];
  const assets = [
    { id: "PR-04", type: "HDMI projector", model: "BenQ MH550", bin: "A2" },
    {
      id: "PR-06",
      type: "HDMI projector",
      model: "Epson EB-X49",
      bin: "Workshop",
      repair: true,
    },
    { id: "SP-02", type: "Portable speaker", model: "JBL Eon One", bin: "B1" },
    { id: "SP-05", type: "Portable speaker", model: "Bose S1", bin: "B2" },
    {
      id: "AD-12",
      type: "USB-C → HDMI adapter",
      model: "Belkin AVC002",
      bin: "C4",
    },
    {
      id: "AD-15",
      type: "USB-C → HDMI adapter",
      model: "Anker A8312",
      bin: "C4",
    },
    { id: "MI-09", type: "Wireless microphone", model: "Shure BLX", bin: "B3" },
    { id: "CA-03", type: "Digital camera", model: "Sony A6400", bin: "D2" },
  ];
  const people = [
    "Isha Rao",
    "Kabir Sen",
    "Leela Das",
    "Tara Shah",
    "Dev Menon",
  ];
  const shifts = [
    {
      time: "Friday · 3:45 pm",
      short: "Fri 3:45 pm",
      step: "Pickup",
      at: 945,
      title: "Pickup at the counter",
      text: "Kabir is here for the Film Society screening. The film starts at four. Can he leave with everything he needs?",
      next: "Move to return time",
    },
    {
      time: "Friday · 7:30 pm",
      short: "Fri 7:30 pm",
      step: "Return",
      at: 1170,
      title: "The kit comes back in pieces",
      text: "Kabir has brought back the projector and speaker. “Leela still has the adapter. She’ll drop it off tomorrow at nine.” Take the return and hand over to the morning shift.",
      next: "Move to next morning",
    },
    {
      time: "Saturday · 9:00 am",
      short: "Sat 9:00 am",
      step: "Morning shift",
      at: 1980,
      title: "Morning shift",
      text: "You’ve just taken over. Leela walks in with an adapter. Work out what was outstanding from the screening and close the loan for the right item.",
    },
  ];
  // Minutes after Friday 00:00, so due times can be compared with desk time.
  const dueTimes = {
    "Fri 8 pm": 1200,
    "Sat 9 am": 1980,
    "Sat 10 am": 2040,
    "Sat noon": 2160,
  };
  const dueOptions = Object.keys(dueTimes);
  const filters = ["All items", "On shelf", "On loan", "In repair"];
  const pages = [
    ["Requests", "clipboard-list"],
    ["Inventory", "package"],
    ["Loan register", "book-open"],
    ["Desk book", "messages-square"],
  ];
  const blankDraft = () => ({ req: "", asset: "", who: "", due: "" });
  const original = () => ({
    version: 1,
    tab: "Requests",
    phase: 0,
    selected: "",
    filter: "All items",
    loans: [
      {
        num: 401,
        req: "RQ-209",
        asset: "MI-09",
        who: "Tara Shah",
        due: "Sat 10 am",
        back: false,
      },
    ],
    notes: [],
    editing: false,
    onlyOpen: true,
    checking: 0,
    draft: blankDraft(),
    err: null,
    notice: "Sample shift · All records are fictional.",
  });
  let s = original();
  const getAsset = (id) => assets.find((x) => x.id === id);
  const getReq = (id) => requests.find((x) => x.id === id);
  const getLoan = (num) => s.loans.find((l) => l.num === Number(num));
  const out = (id) => s.loans.find((l) => l.asset === id && !l.back);
  const typeOf = (l) => (getAsset(l.asset) || {}).type || "";
  const bin = (a) => (/^[A-Z]\d+$/.test(a.bin) ? "bin " + a.bin : a.bin);
  const tagKey = (x) =>
    String(x)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");
  const now = () => shifts[s.phase].at;
  const esc = (x) =>
    String(x).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const opts = (list, selected = "") =>
    list
      .map(
        ([v, t]) =>
          '<option value="' +
          esc(v) +
          '"' +
          (v === selected ? " selected" : "") +
          ">" +
          esc(t) +
          "</option>",
      )
      .join("");
  const btn = (label, act, val = "", style = "") =>
    '<button type="button" data-action="' +
    act +
    '" data-val="' +
    esc(val) +
    '" class="' +
    style +
    '">' +
    esc(label) +
    "</button>";
  const head = (title, sub, control = "") =>
    '<div class="sectionhead"><div><h2>' +
    esc(title) +
    "</h2><small>" +
    esc(sub) +
    "</small></div>" +
    control +
    "</div>";
  const row = (label, sub, right) =>
    '<div class="row"><div><strong>' +
    esc(label) +
    "</strong><small>" +
    esc(sub) +
    "</small></div><div class=\"rowact\">" +
    right +
    "</div></div>";
  const badge = (t, kind = "") =>
    '<span class="tag ' + kind + '">' + esc(t) + "</span>";
  const empty = (text, action = "") =>
    '<div class="empty"><p>' + esc(text) + "</p>" + action + "</div>";
  const alertAt = (at) =>
    s.err && s.err.at === at
      ? '<p class="alert" role="alert" tabindex="-1">' +
        esc(s.err.text) +
        "</p>"
      : "";
  const focusOn = (selector) => {
    const el = q(selector);
    if (el) el.focus();
  };
  // Due flag for an open slip, measured against the current desk time.
  function dueState(l) {
    const t = dueTimes[l.due];
    if (l.back || t === undefined) return ["", ""];
    const diff = t - now();
    if (diff < 0) return ["Overdue", "late"];
    if (diff === 0) return ["Due now", "warn"];
    if (diff <= 120) return ["Due soon", "warn"];
    return ["", ""];
  }
  // Where each approved item on a request stands right now.
  function kit(r) {
    return r.items.map((type) => {
      const mine = s.loans.filter((l) => l.req === r.id && typeOf(l) === type);
      const open = mine.find((l) => !l.back);
      if (open) return { type, state: "out", loan: open };
      if (mine.length) return { type, state: "back", loan: mine[mine.length - 1] };
      return { type, state: "todo" };
    });
  }
  function kitBadge(r) {
    const k = kit(r);
    const outs = k.filter((x) => x.state === "out");
    const backN = k.filter((x) => x.state === "back").length;
    const late = outs.some((x) => dueState(x.loan)[1] === "late");
    if (!outs.length && !backN) return badge("Not issued");
    if (!outs.length)
      return backN === k.length
        ? badge("All returned", "good")
        : badge("Partly returned");
    if (backN) return badge(outs.length + " still out", late ? "late" : "warn");
    return badge(
      outs.length + " of " + k.length + " out",
      late ? "late" : "info",
    );
  }
  function requestPage() {
    const html = head(
      "Approved requests",
      "Student Activities Office · " + requests.length + " approved forms",
    );
    const r = s.selected && getReq(s.selected);
    if (!r)
      return (
        html +
        requests
          .map((x) =>
            row(
              x.event,
              x.id + " · " + x.club + " · Return by " + x.due,
              kitBadge(x) + btn("View form", "request", x.id),
            ),
          )
          .join("")
      );
    const k = kit(r);
    const toIssue = k.some((x) => x.state === "todo");
    return (
      html +
      btn("Back to list", "close", "", "ghost") +
      '<div class="record"><small>' +
      esc(r.id) +
      " · Approved</small><h3>" +
      esc(r.event) +
      "</h3><p>" +
      esc(r.club + " · Filed by " + r.owner) +
      "</p><p><b>Return by</b> " +
      esc(r.due) +
      '</p><p><b>Approved equipment</b></p><ul class="kit">' +
      k
        .map((x) => {
          let sub = "Not issued yet";
          if (x.state === "out")
            sub =
              "Out on L-" +
              x.loan.num +
              " · " +
              x.loan.asset +
              " · " +
              (x.loan.holder ? "with " + x.loan.holder : x.loan.who);
          if (x.state === "back")
            sub = "Returned on L-" + x.loan.num + " · " + x.loan.asset;
          return (
            '<li class="' +
            x.state +
            '"><strong>' +
            esc(x.type) +
            "</strong><small>" +
            esc(sub) +
            "</small></li>"
          );
        })
        .join("") +
      "</ul><p>" +
      esc(r.note) +
      "</p>" +
      (toIssue
        ? '<div class="buttons">' +
          btn("Issue units for this request", "issuefor", r.id, "primary") +
          "</div>"
        : "") +
      "</div>"
    );
  }
  function inventory() {
    let html = head(
      "Inventory",
      "Physical units · home shelf and current availability",
    );
    html +=
      '<div class="buttons"><label>Show <select data-filter>' +
      opts(
        filters.map((f) => [f, f]),
        s.filter,
      ) +
      "</select></label></div>";
    let shown = 0;
    for (const a of assets) {
      const loan = out(a.id);
      const status = a.repair ? "In repair" : loan ? "On loan" : "On shelf";
      if (s.filter !== "All items" && s.filter !== status) continue;
      shown++;
      const late = loan && dueState(loan)[1] === "late";
      let sub = a.model + " · " + bin(a);
      if (loan)
        sub +=
          " · L-" +
          loan.num +
          " · " +
          (loan.holder ? "with " + loan.holder : loan.who);
      html += row(
        a.id + " · " + a.type,
        sub,
        badge(
          late ? "Overdue" : status,
          late
            ? "late"
            : status === "On shelf"
              ? "good"
              : status === "In repair"
                ? "warn"
                : "info",
        ),
      );
    }
    if (!shown)
      html += empty(
        "Nothing matches “" + s.filter + "” right now.",
        btn("Show all items", "filterall"),
      );
    return html;
  }
  function issueForm() {
    const d = s.draft;
    const r = getReq(d.req);
    const outTypes = r
      ? s.loans.filter((l) => l.req === r.id && !l.back).map(typeOf)
      : [];
    const left = r ? r.items.filter((t) => !outTypes.includes(t)) : [];
    const units = assets.filter(
      (a) =>
        !a.repair &&
        !out(a.id) &&
        (!r || (r.items.includes(a.type) && !outTypes.includes(a.type))),
    );
    const select = (label, key, options, value, first = "Select…") =>
      "<label><span>" +
      label +
      '</span><select name="' +
      key +
      '" required><option value="">' +
      first +
      "</option>" +
      opts(options, value) +
      "</select></label>";
    return (
      '<form data-issue class="panel"><h3>' +
      (r ? "Issue a unit for " + esc(r.id + " · " + r.club) : "New issue slip") +
      "</h3>" +
      (r
        ? '<p class="hint">' +
          esc(
            left.length
              ? "Still to issue: " + left.join(", ") + "."
              : "Everything on this request is already out.",
          ) +
          "</p>"
        : "") +
      '<div class="form">' +
      select(
        "Approved request",
        "req",
        requests.map((x) => [x.id, x.id + " · " + x.club]),
        d.req,
      ) +
      select(
        "Unit leaving the desk",
        "asset",
        units.map((a) => [a.id, a.id + " · " + a.type + " · " + bin(a)]),
        d.asset,
        units.length ? "Select…" : "No approved units available",
      ) +
      select(
        "Collected by",
        "who",
        people.map((p) => [p, p]),
        d.who,
      ) +
      select(
        "Return by",
        "due",
        dueOptions.map((x) => [x, x]),
        d.due,
      ) +
      "</div>" +
      alertAt("issue") +
      '<div class="buttons"><button type="submit" class="primary">Save issue slip</button></div></form>'
    );
  }
  function checkin(l) {
    const pick = (key, list, value) =>
      '<select name="' +
      key +
      '" required><option value="">Select…</option>' +
      opts(list, value) +
      "</select>";
    return (
      '<div class="checkin">' +
      '<form data-return class="checkpane"><input type="hidden" name="num" value="' +
      l.num +
      '"><h3>Unit is on the counter</h3><p class="hint">Scan or type the tag on the unit itself, not from this screen.</p><div class="form">' +
      '<label><span>Tag on the unit</span><input name="tag" required autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="e.g. AB-12" /></label>' +
      "<label><span>Returned by</span>" +
      pick(
        "by",
        people.map((p) => [p, p]),
        l.holder || l.who,
      ) +
      "</label></div>" +
      alertAt("return") +
      '<div class="buttons"><button type="submit" class="primary">Close slip L-' +
      l.num +
      "</button></div></form>" +
      '<form data-holder class="checkpane"><input type="hidden" name="num" value="' +
      l.num +
      '"><h3>Unit is still out</h3><p class="hint">Keep the slip open and tell the next shift who has it.</p><div class="form">' +
      "<label><span>Now with</span>" +
      pick(
        "holder",
        people.map((p) => [p, p]),
        l.holder || "",
      ) +
      "</label><label><span>Expected back</span>" +
      pick(
        "expect",
        dueOptions.filter((d) => dueTimes[d] >= now()).map((d) => [d, d]),
        l.expect || "",
      ) +
      "</label></div>" +
      alertAt("holder") +
      '<div class="buttons"><button type="submit">Save for next shift</button></div></form>' +
      '<div class="checkfoot">' +
      btn("Cancel", "cancelcheck", "", "ghost") +
      "</div></div>"
    );
  }
  function slip(l) {
    const a = getAsset(l.asset);
    const r = getReq(l.req);
    const [chip, kind] = dueState(l);
    let html =
      '<article class="slip ' +
      (l.back ? "done" : kind || "open") +
      '"><div class="slipmain"><div class="sliptitle"><strong>' +
      esc(l.asset + " · " + a.type) +
      "</strong>" +
      (l.back ? badge("Returned", "good") : chip ? badge(chip, kind) : "") +
      "</div><small>" +
      esc("L-" + l.num + " · " + r.club + " · " + r.event + " (" + r.id + ")") +
      "</small><small>" +
      esc(
        "Issued to " +
          l.who +
          " · Due " +
          l.due +
          " · " +
          a.model +
          " · " +
          bin(a),
      ) +
      "</small>";
    if (l.back)
      html +=
        '<p class="slipnote">' +
        esc(
          "Checked in" +
            (l.returnedAt ? " " + l.returnedAt : "") +
            (l.returnedBy ? " from " + l.returnedBy : ""),
        ) +
        "</p>";
    else if (l.holder)
      html +=
        '<p class="slipnote">' +
        esc("Still out with " + l.holder + " · expected " + l.expect) +
        "</p>";
    html += "</div>";
    if (!l.back && s.checking !== l.num)
      html +=
        '<div class="slipact">' +
        btn("Check in", "checkin", String(l.num)) +
        "</div>";
    if (!l.back && s.checking === l.num) html += checkin(l);
    return html + "</article>";
  }
  function register() {
    const open = s.loans.filter((l) => !l.back);
    const lateN = open.filter((l) => dueState(l)[1] === "late").length;
    let html = head(
      "Loan register",
      "One slip per physical unit · " +
        open.length +
        " outstanding" +
        (lateN ? " · " + lateN + " overdue" : ""),
      s.editing
        ? btn("Close form", "cancel", "", "ghost")
        : btn("New issue slip", "new", "", "primary"),
    );
    if (s.editing) html += issueForm();
    html +=
      '<div class="buttons">' +
      ["Outstanding", "All slips"]
        .map(
          (v, i) =>
            '<button type="button" data-action="scope" data-val="' +
            i +
            '" aria-pressed="' +
            (s.onlyOpen === (i === 0)) +
            '">' +
            v +
            "</button>",
        )
        .join("") +
      "</div>";
    const byDue = (a, b) =>
      (dueTimes[a.due] ?? 1e9) - (dueTimes[b.due] ?? 1e9) || b.num - a.num;
    const shown = [
      ...open.slice().sort(byDue),
      ...(s.onlyOpen ? [] : s.loans.filter((l) => l.back).reverse()),
    ];
    if (!shown.length)
      html += empty(
        s.onlyOpen
          ? "No outstanding slips. Every unit that left the desk has been checked in."
          : "No slips yet.",
        s.editing ? "" : btn("New issue slip", "new"),
      );
    for (const l of shown) html += slip(l);
    return html;
  }
  function deskbook() {
    let html = head(
      "Desk book",
      "Messages from clubs and notes for the next shift",
    );
    const entries = [
      [
        920,
        "Friday · 3:20 pm",
        "Isha Rao · Film Society",
        "Kabir Sen is picking up our whole screening kit. Please issue it in his name. I’m setting up in the courtyard.",
        "",
      ],
      [
        930,
        "Friday · 3:30 pm",
        "Tara Shah · Debate Union",
        "Our microphone stays with me overnight. I’ll return it by 10 am Saturday.",
        "",
      ],
    ];
    if (s.phase >= 1)
      entries.push([
        1170,
        "Friday · 7:30 pm",
        "Kabir Sen · Film Society",
        "I brought the projector and speaker. Leela Das has our adapter. She’ll be at the counter at 9 am tomorrow.",
        "",
      ]);
    for (const n of s.notes)
      entries.push([
        shifts[n.phase].at,
        shifts[n.phase].time,
        n.auto ? "Loan register · still out" : "Counter handover",
        n.text,
        n.auto ? "auto" : "handover",
      ]);
    // Newest first; entries made at the same desk time keep the order they were written.
    const ordered = entries
      .map((e, i) => [e, i])
      .sort((a, b) => b[0][0] - a[0][0] || b[1] - a[1])
      .map(([e]) => e);
    for (const [, t, author, body, kind] of ordered)
      html +=
        '<article class="record ' +
        kind +
        '"><small>' +
        esc(t) +
        "</small><h3>" +
        esc(author) +
        "</h3><p>" +
        esc(body) +
        "</p></article>";
    return (
      html +
      '<form data-note class="panel"><div class="form"><label class="full"><span>Note for the next shift</span><textarea name="note" rows="3" maxlength="400" required placeholder="What is still out, who has it, and when it is due back"></textarea></label></div>' +
      alertAt("note") +
      '<div class="buttons"><button type="submit" class="primary">Add handover note</button></div></form>'
    );
  }
  const screens = {
    Requests: requestPage,
    Inventory: inventory,
    "Loan register": register,
    "Desk book": deskbook,
  };
  const steps = document.createElement("ol");
  steps.className = "steps";
  steps.setAttribute("aria-label", "Shift timeline");
  const shiftBox = q(".shift > div");
  if (shiftBox) shiftBox.prepend(steps);
  function paint() {
    const phase = shifts[s.phase];
    q("[data-clock]").textContent = phase.time;
    q("[data-shift-title]").textContent = phase.title;
    q("[data-shift]").textContent = phase.text;
    steps.innerHTML = shifts
      .map(
        (x, i) =>
          '<li class="' +
          (i < s.phase ? "done" : "") +
          '"' +
          (i === s.phase ? ' aria-current="step"' : "") +
          "><b>" +
          esc(x.step) +
          "</b><small>" +
          esc(x.short) +
          "</small></li>",
      )
      .join("");
    const advance = q('[data-action="advance"]');
    advance.hidden = !phase.next;
    advance.textContent = phase.next || "";
    const open = s.loans.filter((l) => !l.back);
    const lateN = open.filter((l) => dueState(l)[1] === "late").length;
    q("[data-nav]").innerHTML = pages
      .map(([n, icon]) => {
        const count =
          n === "Loan register" && open.length
            ? '<span class="count' +
              (lateN ? " late" : "") +
              '" aria-hidden="true">' +
              open.length +
              '</span><span class="sr"> (' +
              open.length +
              " outstanding" +
              (lateN ? ", " + lateN + " overdue" : "") +
              ")</span>"
            : "";
        return (
          '<button type="button" data-action="tab" data-val="' +
          n +
          '" aria-pressed="' +
          (s.tab === n) +
          '"><svg aria-hidden="true" class="store-icon"><use href="#icon-' +
          icon +
          '"></use></svg><span>' +
          n +
          "</span>" +
          count +
          "</button>"
        );
      })
      .join("");
    q("[data-page]").innerHTML = screens[s.tab]();
    if (q("[data-filter]")) q("[data-filter]").value = s.filter;
    q("[data-status]").textContent = s.notice;
  }
  function commit(msg) {
    if (msg) s.notice = msg;
    paint();
    try {
      localStorage.setItem(storageKey, JSON.stringify(s));
    } catch {
      q("[data-status]").textContent +=
        " Browser storage is unavailable. Progress lasts for this visit.";
    }
  }
  function fail(at, text, selector) {
    s.err = { at, text };
    paint();
    focusOn(selector || ".alert");
  }
  let armed = 0;
  root.addEventListener("click", (e) => {
    const b = e.target.closest("[data-action]");
    if (!b) return;
    const v = b.dataset.val;
    let focus = "";
    switch (b.dataset.action) {
      case "restart":
        if (!armed) {
          b.textContent = "Tap again to restart";
          b.classList.add("armed");
          armed = setTimeout(() => {
            armed = 0;
            b.textContent = "Restart sample shift";
            b.classList.remove("armed");
          }, 4000);
          return;
        }
        clearTimeout(armed);
        armed = 0;
        b.textContent = "Restart sample shift";
        b.classList.remove("armed");
        s = original();
        s.notice = "Sample shift restarted. All records are fictional.";
        break;
      case "advance":
        if (s.phase < shifts.length - 1) s.phase++;
        s.checking = 0;
        s.err = null;
        s.notice = "Desk time is now " + shifts[s.phase].time + ".";
        break;
      case "tab":
        if (!Object.hasOwn(screens, v)) return;
        s.tab = v;
        s.editing = false;
        s.checking = 0;
        s.err = null;
        break;
      case "close":
        s.selected = "";
        break;
      case "request":
        if (!getReq(v)) return;
        s.selected = v;
        break;
      case "issuefor": {
        const r = getReq(v);
        if (!r) return;
        s.draft = {
          req: r.id,
          asset: "",
          who: s.draft.req === r.id ? s.draft.who : "",
          due: r.due,
        };
        s.tab = "Loan register";
        s.editing = true;
        s.checking = 0;
        s.err = null;
        focus = '[data-issue] [name="asset"]';
        break;
      }
      case "new":
        s.editing = true;
        s.checking = 0;
        s.err = null;
        focus = '[data-issue] [name="req"]';
        break;
      case "cancel":
        s.editing = false;
        s.err = null;
        break;
      case "scope":
        s.onlyOpen = v === "0";
        break;
      case "filterall":
        s.filter = "All items";
        break;
      case "checkin": {
        const l = getLoan(v);
        if (!l || l.back) return;
        s.checking = l.num;
        s.err = null;
        focus = '[data-return] [name="tag"]';
        break;
      }
      case "cancelcheck":
        s.checking = 0;
        s.err = null;
        break;
      default:
        return;
    }
    commit();
    if (focus) focusOn(focus);
  });
  root.addEventListener("change", (e) => {
    const t = e.target;
    if (t.matches("[data-filter]")) {
      if (filters.includes(t.value)) s.filter = t.value;
      commit();
      focusOn("[data-filter]");
      return;
    }
    if (!t.closest("[data-issue]") || !Object.hasOwn(s.draft, t.name)) return;
    s.draft[t.name] = t.value;
    if (t.name !== "req") return;
    // Picking a request narrows the unit list and fills in its return time.
    const r = getReq(t.value);
    const a = getAsset(s.draft.asset);
    if (r) s.draft.due = r.due;
    if (r && a && !r.items.includes(a.type)) s.draft.asset = "";
    s.err = null;
    commit();
    focusOn('[data-issue] [name="req"]');
  });
  root.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    const form = new FormData(f);
    const get = (k) => String(form.get(k) ?? "").trim();
    if (f.matches("[data-note]")) {
      const text = get("note");
      if (!text)
        return fail("note", "Write the note before saving it.", "[data-note] textarea");
      s.notes.push({ phase: s.phase, text });
      s.err = null;
      commit("Handover note saved to the desk book.");
      return;
    }
    if (f.matches("[data-return]")) {
      const l = getLoan(get("num"));
      if (!l || l.back) {
        s.checking = 0;
        commit("That slip is already closed.");
        return;
      }
      const tag = get("tag");
      const by = get("by");
      const field = '[data-return] [name="tag"]';
      if (!tag) return fail("return", "Scan or type the tag on the unit.", field);
      if (tagKey(tag) !== tagKey(l.asset)) {
        const other = assets.find((a) => tagKey(a.id) === tagKey(tag));
        const otherLoan = other && out(other.id);
        let text =
          "No unit has the tag “" +
          tag +
          "”. Check the label on the unit and try again.";
        if (otherLoan)
          text =
            other.id +
            " is on slip L-" +
            otherLoan.num +
            " (" +
            other.type +
            ", " +
            otherLoan.who +
            "), not this one. Check that slip in instead.";
        else if (other && other.repair)
          text =
            other.id +
            " is booked into the workshop for repair, so it can’t be on this loan. Check the unit again.";
        else if (other)
          text =
            other.id +
            " isn’t on loan; it belongs in " +
            bin(other) +
            ". This slip is for a " +
            typeOf(l) +
            ", so check which unit is on the counter.";
        return fail("return", text, field);
      }
      if (!people.includes(by))
        return fail("return", "Choose who handed the unit back.", '[data-return] [name="by"]');
      l.back = true;
      l.returnedBy = by;
      l.returnedAt = shifts[s.phase].short;
      s.checking = 0;
      s.err = null;
      commit(
        l.asset +
          " checked in from " +
          by +
          ". Slip L-" +
          l.num +
          " closed. Shelve it in " +
          bin(getAsset(l.asset)) +
          ".",
      );
      return;
    }
    if (f.matches("[data-holder]")) {
      const l = getLoan(get("num"));
      if (!l || l.back) {
        s.checking = 0;
        commit("That slip is already closed.");
        return;
      }
      const holder = get("holder");
      const expect = get("expect");
      if (!people.includes(holder))
        return fail("holder", "Choose who has the unit now.", '[data-holder] [name="holder"]');
      if (!Object.hasOwn(dueTimes, expect))
        return fail("holder", "Choose when it is expected back.", '[data-holder] [name="expect"]');
      l.holder = holder;
      l.expect = expect;
      s.notes.push({
        phase: s.phase,
        auto: true,
        text:
          "Slip L-" +
          l.num +
          " is still open: " +
          l.asset +
          " (" +
          typeOf(l) +
          ", " +
          getReq(l.req).club +
          ") is with " +
          holder +
          ", expected back " +
          expect +
          ". Check the tag when it comes in.",
      });
      s.checking = 0;
      s.err = null;
      commit(
        "Slip L-" +
          l.num +
          " stays open. The next shift will see " +
          l.asset +
          " is with " +
          holder +
          ".",
      );
      return;
    }
    if (!f.matches("[data-issue]")) return;
    const [req, asset, who, due] = ["req", "asset", "who", "due"].map(get);
    s.draft = { req, asset, who, due };
    const unit = getAsset(asset);
    const r = getReq(req);
    const pick = (k) => '[data-issue] [name="' + k + '"]';
    if (!r) return fail("issue", "Choose the approved request this unit is for.", pick("req"));
    if (!unit) return fail("issue", "Choose the unit leaving the desk.", pick("asset"));
    if (unit.repair)
      return fail("issue", unit.id + " is in repair and can’t leave the desk.", pick("asset"));
    const busy = out(unit.id);
    if (busy)
      return fail("issue", unit.id + " is already out on slip L-" + busy.num + ".", pick("asset"));
    if (!r.items.includes(unit.type))
      return fail(
        "issue",
        unit.type + " isn’t on " + r.id + ". Approved: " + r.items.join(", ") + ".",
        pick("asset"),
      );
    if (s.loans.some((l) => l.req === req && !l.back && typeOf(l) === unit.type))
      return fail(
        "issue",
        "The approved quantity of " + unit.type + " for " + r.id + " is already on loan.",
        pick("asset"),
      );
    if (!people.includes(who))
      return fail("issue", "Choose who is collecting the unit.", pick("who"));
    if (!Object.hasOwn(dueTimes, due))
      return fail("issue", "Choose when the unit is due back.", pick("due"));
    const num = Math.max(400, ...s.loans.map((l) => l.num)) + 1;
    s.loans.push({ num, req, asset, who, due, back: false });
    s.err = null;
    const left = r.items.filter(
      (t) => !s.loans.some((l) => l.req === req && !l.back && typeOf(l) === t),
    );
    const msg = "Issued " + asset + " to " + who + " on slip L-" + num + ".";
    if (left.length) {
      // Keep the form open with the same request, collector and due time for the next unit.
      s.draft = { req, asset: "", who, due };
      commit(msg + " Still to issue for " + req + ": " + left.join(", ") + ".");
      focusOn(pick("asset"));
      return;
    }
    s.editing = false;
    s.draft = blankDraft();
    commit(msg + " Everything on " + req + " is out.");
  });
  function restore(d) {
    if (
      !d ||
      d.version !== 1 ||
      !Object.hasOwn(screens, d.tab) ||
      !Number.isInteger(d.phase) ||
      !shifts[d.phase] ||
      (d.selected && !getReq(d.selected)) ||
      !Array.isArray(d.notes) ||
      !d.notes.every(
        (n) =>
          n &&
          Number.isInteger(n.phase) &&
          shifts[n.phase] &&
          typeof n.text === "string",
      ) ||
      !Array.isArray(d.loans) ||
      !d.loans.length ||
      !d.loans.every(
        (l) =>
          l &&
          getReq(l.req) &&
          getAsset(l.asset) &&
          Number.isInteger(l.num) &&
          typeof l.who === "string" &&
          typeof l.due === "string",
      )
    )
      return;
    const draft = d.draft && typeof d.draft === "object" ? d.draft : {};
    const clean = blankDraft();
    for (const k of Object.keys(clean))
      if (typeof draft[k] === "string") clean[k] = draft[k];
    s = {
      ...original(),
      ...d,
      filter: filters.includes(d.filter) ? d.filter : "All items",
      onlyOpen: d.onlyOpen !== false,
      editing: d.editing === true,
      checking: 0,
      err: null,
      draft: clean,
      loans: d.loans.map((l) => ({ ...l, back: l.back === true })),
      notes: d.notes.map((n) => ({ ...n })),
    };
    paint();
  }
  paint();
  try {
    restore(JSON.parse(localStorage.getItem(storageKey)));
  } catch {
    // Keep the fresh shift when storage is unavailable or the saved data is invalid.
  }
})();
