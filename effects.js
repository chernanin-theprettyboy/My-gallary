// effects.js - falling effects for the gallery.
// Each effect: n = name, e = list of emoji/characters, d = "down" or "up",
// t = seconds for one trip (bigger = slower), w = sway in px, r = spin in degrees,
// s = size multiplier, c = optional colour, g = optional glow.
var FX = {
  none:      {n: "None"},
  sakura:    {n: "Sakura petals",   e: ["🌸"],               d: "down", t: 10, w: 25, r: 90},
  blossom:   {n: "White blossoms",  e: ["💮"],               d: "down", t: 11, w: 30, r: 120},
  spring:    {n: "Spring flowers",  e: ["🌼","🌷","🌻"],     d: "down", t: 12, w: 30, r: 60},
  snow:      {n: "Snow",           e: ["❄️"],               d: "down", t: 12, w: 30, r: 180, s: 0.8},
  softsnow:  {n: "Soft snow",      e: ["❅","❆"],           d: "down", t: 16, w: 20, r: 90,  s: 0.9, c: "#ffffff", g: "0 0 6px #9ec5ff"},
  rain:      {n: "Rain drops",     e: ["💧"],               d: "down", t: 2.5, w: 0, r: 0,   s: 0.6},
  autumn:    {n: "Autumn leaves",  e: ["🍂"],               d: "down", t: 11, w: 35, r: 150},
  maple:     {n: "Maple leaves",   e: ["🍁"],               d: "down", t: 10, w: 35, r: 150},
  leaves:    {n: "Green leaves",   e: ["🍃"],               d: "down", t: 9,  w: 40, r: 160},
  clover:    {n: "Lucky clovers",  e: ["🍀"],               d: "down", t: 11, w: 30, r: 120},
  feathers:  {n: "Feathers",       e: ["🪶"],               d: "down", t: 15, w: 45, r: 70},
  confetti:  {n: "Confetti",       e: ["🎊","🎉"],          d: "down", t: 7,  w: 30, r: 360},
  hearts:    {n: "Hearts",         e: ["💗","💖","💕"],     d: "up",   t: 10, w: 20, r: 0},
  stars:     {n: "Falling stars",  e: ["⭐","🌟"],          d: "down", t: 8,  w: 15, r: 180},
  night:     {n: "Night sky",      e: ["🌙","⭐","✨"],     d: "down", t: 18, w: 15, r: 20,  s: 0.9},
  sparkles:  {n: "Sparkles",       e: ["✨"],               d: "up",   t: 9,  w: 20, r: 40},
  fireflies: {n: "Fireflies",      e: ["●"],                d: "up",   t: 16, w: 40, r: 0,   s: 0.5, c: "#ffe36e", g: "0 0 10px #ffd84a, 0 0 18px #ffd84a"},
  bubbles:   {n: "Bubbles",        e: ["🫧"],               d: "up",   t: 10, w: 25, r: 0},
  butterfly: {n: "Butterflies",    e: ["🦋"],               d: "up",   t: 14, w: 60, r: 20},
  ladybugs:  {n: "Ladybugs",       e: ["🐞"],               d: "down", t: 14, w: 40, r: 60,  s: 0.8},
  doves:     {n: "Doves",          e: ["🕊️"],              d: "up",   t: 13, w: 50, r: 10},
  lanterns:  {n: "Paper lanterns", e: ["🏮"],               d: "up",   t: 16, w: 20, r: 0},
  balloons:  {n: "Balloons",       e: ["🎈"],               d: "up",   t: 12, w: 25, r: 10},
  japan:     {n: "Japan mix",      e: ["🌸","🎐","🍡","🎏"], d: "down", t: 11, w: 30, r: 60},
  mix:       {n: "Surprise mix",   e: null,                 d: "down", t: 11, w: 30, r: 90}
};

(function () {
  // The container that holds the particles.
  var box = document.getElementById("fx");
  var selEl = document.getElementById("fxs");
  var amtEl = document.getElementById("fxa");
  var spdEl = document.getElementById("fxv");
  var sizEl = document.getElementById("fxz");

  // Animations for falling, rising and swaying.
  var css = document.createElement("style");
  css.textContent =
    ".fxp{position:absolute;top:0;opacity:.85;animation-timing-function:linear;animation-iteration-count:infinite}" +
    ".fxp span{display:block;animation:fx-sway 3s ease-in-out infinite alternate}" +
    "@keyframes fx-down{from{transform:translateY(-12vh)}to{transform:translateY(112vh)}}" +
    "@keyframes fx-up{from{transform:translateY(112vh)}to{transform:translateY(-12vh)}}" +
    "@keyframes fx-sway{from{transform:translateX(calc(var(--sw) * -1)) rotate(0deg)}" +
    "to{transform:translateX(var(--sw)) rotate(var(--rot))}}" +
    "#pn{max-height:70vh;overflow:auto}" +
    "#pn input[type=range]{width:55%;accent-color:var(--accent)}";
  document.head.appendChild(css);

  // The settings. Default matches the original sakura look.
  var DEFAULT = {fx: "sakura", amt: 14, spd: 1, siz: 1};
  var cfg = {fx: DEFAULT.fx, amt: DEFAULT.amt, spd: DEFAULT.spd, siz: DEFAULT.siz};
  try {
    var saved = JSON.parse(localStorage.getItem("gal-fx"));
    if (saved && FX[saved.fx]) cfg = saved;
  } catch (e) {}

  // Fill the drop-down list from the FX table above.
  Object.keys(FX).forEach(function (k) {
    var o = document.createElement("option");
    o.value = k;
    o.textContent = FX[k].n;
    selEl.appendChild(o);
  });

  // Every emoji from every effect, used by "Surprise mix".
  function allEmoji() {
    var all = [];
    Object.keys(FX).forEach(function (k) {
      if (FX[k].e) all = all.concat(FX[k].e);
    });
    return all;
  }

  function build() {
    box.innerHTML = "";
    var f = FX[cfg.fx];
    if (!f || !f.e && cfg.fx !== "mix") return;
    var list = cfg.fx === "mix" ? allEmoji() : f.e;
    for (var i = 0; i < cfg.amt; i++) {
      var p = document.createElement("div");
      var s = document.createElement("span");
      var dur = (f.t / cfg.spd) * (0.7 + Math.random() * 0.6);
      p.className = "fxp";
      s.textContent = list[Math.floor(Math.random() * list.length)];
      p.style.left = Math.random() * 100 + "%";
      p.style.fontSize = 22 * (f.s || 1) * cfg.siz * (0.6 + Math.random() * 0.8) + "px";
      p.style.animationName = f.d === "up" ? "fx-up" : "fx-down";
      p.style.animationDuration = dur + "s";
      p.style.animationDelay = -Math.random() * dur + "s"; // negative = already in motion
      s.style.setProperty("--sw", (f.w || 0) + "px");
      s.style.setProperty("--rot", (f.r || 0) + "deg");
      s.style.animationDuration = 2 + Math.random() * 3 + "s";
      if (f.c) s.style.color = f.c;
      if (f.g) s.style.textShadow = f.g;
      p.appendChild(s);
      box.appendChild(p);
    }
  }

  function save() {
    try { localStorage.setItem("gal-fx", JSON.stringify(cfg)); } catch (e) {}
  }

  function sync() {
    selEl.value = cfg.fx;
    amtEl.value = cfg.amt;
    spdEl.value = cfg.spd;
    sizEl.value = cfg.siz;
  }

  selEl.onchange = function () { cfg.fx = selEl.value; save(); build(); };
  amtEl.oninput = function () { cfg.amt = +amtEl.value; save(); build(); };
  spdEl.oninput = function () { cfg.spd = +spdEl.value; save(); build(); };
  sizEl.oninput = function () { cfg.siz = +sizEl.value; save(); build(); };

  // "Reset to default" also resets the falling effect.
  document.getElementById("rs").addEventListener("click", function () {
    cfg = {fx: DEFAULT.fx, amt: DEFAULT.amt, spd: DEFAULT.spd, siz: DEFAULT.siz};
    save(); sync(); build();
  });
  // lets index.html change the effect, for example when a theme is picked
  window.setFx = function (key) {
    if (!FX[key]) return;
    cfg.fx = key;
    save(); sync(); build();
  };
  sync();
  build();
})();
