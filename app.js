(() => {
  const React = window.React;
  const ReactDOM = window.ReactDOM;
  const XLSX = window.XLSX;
  const { useState, useEffect, useCallback, useRef } = React;
  const DEFAULTS = {
    // Heavy compounds
    "Back Squat": 5,
    "Trap Bar Deadlift": 5,
    "Weighted Pull-ups": 5,
    "Bent-Over Barbell Rows": 5,
    "Weighted Dips": 5,
    // Moderate accessories
    "Romanian Deadlift": 8,
    "Bulgarian Split Squat": 8,
    "Hip Thrust": 8,
    "Nordic Hamstring Curls": 8,
    "Step-Up (Tall Box)": 8,
    "Lat Pulldown (Neutral Grip)": 8,
    "Landmine Press (Single-Arm)": 8,
    "Single-Arm Dumbbell Rows": 8,
    // Low-load / activation
    "Single-Leg Calf Raise": 12,
    "Lateral Band Walk": 12,
    "Face Pulls": 12,
    "Cable Tricep Pushdowns": 12,
    "Band Pull-Aparts": 15,
    // Core
    "Pallof Press": 10,
    "Dead Bug": 10,
    "Copenhagen Plank": 10,
    "Hanging Leg Raise": 10,
    "Back Extension": 12,
    "Farmer's Carry": 1,
    "Ab Wheel Rollout": 10,
    "Side Plank with Hip Abduction": 10,
    "Cable Woodchop (High-to-Low)": 10
  };
  const WORKOUTS = [
    {
      id: "lb1",
      label: "LOWER 1",
      sub: "Back Squat \xB7 RDL \xB7 Split Squat",
      color: "#FF6B47",
      exercises: ["Back Squat", "Romanian Deadlift", "Bulgarian Split Squat"]
    },
    {
      id: "lb2",
      label: "LOWER 2",
      sub: "Hip Thrust \xB7 Nordic \xB7 Calf Raise",
      color: "#FF6B47",
      exercises: ["Hip Thrust", "Nordic Hamstring Curls", "Single-Leg Calf Raise"]
    },
    {
      id: "lb3",
      label: "LOWER 3",
      sub: "Trap Bar \xB7 Step-Up \xB7 Band Walk",
      color: "#FF6B47",
      exercises: ["Trap Bar Deadlift", "Step-Up (Tall Box)", "Lateral Band Walk"]
    },
    {
      id: "ub1",
      label: "UPPER 1",
      sub: "Pull-Ups \xB7 Rows \xB7 Dips",
      color: "#47BFFF",
      exercises: ["Weighted Pull-ups", "Bent-Over Barbell Rows", "Weighted Dips"]
    },
    {
      id: "ub2",
      label: "UPPER 2",
      sub: "Lat Pull \xB7 Landmine \xB7 Face Pulls",
      color: "#47BFFF",
      exercises: ["Lat Pulldown (Neutral Grip)", "Landmine Press (Single-Arm)", "Face Pulls"]
    },
    {
      id: "ub3",
      label: "UPPER 3",
      sub: "DB Rows \xB7 Triceps \xB7 Pull-Aparts",
      color: "#47BFFF",
      exercises: ["Single-Arm Dumbbell Rows", "Cable Tricep Pushdowns", "Band Pull-Aparts"]
    },
    {
      id: "core1",
      label: "CORE 1",
      sub: "Pallof \xB7 Dead Bug \xB7 Copenhagen",
      color: "#C084FC",
      exercises: ["Pallof Press", "Dead Bug", "Copenhagen Plank"]
    },
    {
      id: "core2",
      label: "CORE 2",
      sub: "Hang Raise \xB7 Extension \xB7 Carry",
      color: "#C084FC",
      exercises: ["Hanging Leg Raise", "Back Extension", "Farmer's Carry"]
    },
    {
      id: "core3",
      label: "CORE 3",
      sub: "Ab Wheel \xB7 Side Plank \xB7 Woodchop",
      color: "#C084FC",
      exercises: ["Ab Wheel Rollout", "Side Plank with Hip Abduction", "Cable Woodchop (High-to-Low)"]
    }
  ];
  const CARDIO_TYPES = [
    {
      id: "skate",
      label: "ROLLER SKI",
      sub: "Skate",
      color: "#47FFB2",
      sessions: [
        { id: "skate-base", label: "Aerobic Base", hint: "Zone 1\u20132 | 60\u201390 min | Conversational pace, flat to rolling terrain, HR < 75% max" },
        { id: "skate-int", label: "Interval", hint: "Zone 4\u20135 work | 6\xD73 min hard / 2 min easy (progress to 5\xD75 min / 2.5 min by August) | HR 88\u201395% max" },
        { id: "skate-thr", label: "Threshold", hint: "Zone 3 | 60\u201375 min | Comfortably uncomfortable, short sentences only. Use sparingly \u2014 max once every 2 weeks early summer" }
      ]
    },
    {
      id: "classic",
      label: "ROLLER SKI",
      sub: "Classic",
      color: "#47FFB2",
      sessions: [
        { id: "classic-base", label: "Aerobic Base", hint: "Zone 1\u20132 | 60\u201390 min | Focus on kick timing and double-pole rhythm, flat to moderate terrain" },
        { id: "classic-int", label: "Interval", hint: "Zone 4\u20135 work | 8\xD72 min hard / 90 sec easy | Focus on double-pole power or uphill diagonal" }
      ]
    },
    {
      id: "run",
      label: "RUNNING",
      sub: null,
      color: "#E8FF47",
      sessions: [
        { id: "run-base", label: "Aerobic Base", hint: "Zone 1\u20132 | 45\u201360 min | Nose-breathing pace. Flat to rolling terrain. No watch-chasing" },
        { id: "run-uphill", label: "Uphill / Run-Hike", hint: "Zone 1\u20132 | 50\u201370 min | Run flats, hike-run uphills, easy jog descents. Use poles if available \u2014 very ski-specific" }
      ]
    },
    {
      id: "hike",
      label: "HIKING",
      sub: null,
      color: "#E8FF47",
      sessions: [
        { id: "hike-long", label: "Long Aerobic", hint: "Zone 1\u20132 | 2\u20134 hrs | Sustained uphill with poles. HR solidly Zone 1\u20132 the whole time \u2014 this is volume, not a sufferfest. Eat and hydrate as you would in a race" },
        { id: "hike-weighted", label: "Weighted", hint: "Zone 1\u20132 | 90 min\u20132.5 hrs | 5\u201310 kg pack, moderate to steep terrain with poles. Introduce after 4\u20136 weeks of regular hiking. Treat as a harder session" }
      ]
    },
    {
      id: "swim",
      label: "OCEAN SWIM",
      sub: null,
      color: "#47BFFF",
      sessions: [
        { id: "swim-rec", label: "Active Recovery", hint: "Zone 1 | 30\u201345 min | Easy, unstructured. No pace targets. Blood flow and mental reset \u2014 not fitness development. Best the day after hard intervals" }
      ]
    }
  ];
  const SET_TYPES = ["STANDARD", "SUPERSET", "MYO-REP"];
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function loadData() {
    try {
      const r = localStorage.getItem("liftlog-v1");
      return r ? JSON.parse(r) : [];
    } catch (e) {
      return [];
    }
  }
  function saveData(logs) {
    try {
      localStorage.setItem("liftlog-v1", JSON.stringify(logs));
    } catch (e) {
    }
  }
  function today() {
    return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  }
  function fmtDate(d) {
    return (/* @__PURE__ */ new Date(d + "T12:00:00")).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }
  function LineChart({ data }) {
    if (!data || data.length < 2) return /* @__PURE__ */ React.createElement("div", { style: { padding: "30px 0", textAlign: "center", color: "#666", fontSize: 13, letterSpacing: ".06em" } }, "Log at least 2 sessions to see chart");
    const W = 320, H = 140, PL = 40, PR = 12, PT = 10, PB = 24;
    const vals = data.map((d) => d.weight);
    const minV = Math.min(...vals), maxV = Math.max(...vals), range = maxV - minV || 1;
    const iW = W - PL - PR, iH = H - PT - PB;
    const px = (i) => PL + i / (data.length - 1) * iW;
    const py = (v) => PT + iH - (v - minV) / range * iH;
    const points = data.map((d, i) => `${px(i)},${py(d.weight)}`).join(" ");
    const labelIdx = [0, Math.floor((data.length - 1) / 2), data.length - 1].filter((v, i, a) => a.indexOf(v) === i);
    return /* @__PURE__ */ React.createElement("svg", { viewBox: `0 0 ${W} ${H}`, style: { width: "100%", height: "auto", display: "block" } }, [0, 0.5, 1].map((t) => /* @__PURE__ */ React.createElement("line", { key: t, x1: PL, x2: W - PR, y1: PT + t * iH, y2: PT + t * iH, stroke: "#222", strokeDasharray: "3,3" })), [0, 0.5, 1].map((t) => /* @__PURE__ */ React.createElement("text", { key: t, x: PL - 4, y: PT + t * iH + 4, textAnchor: "end", fill: "#555", fontSize: "9", fontFamily: "JetBrains Mono,monospace" }, Math.round(minV + (1 - t) * range))), labelIdx.map((i) => /* @__PURE__ */ React.createElement("text", { key: i, x: px(i), y: H - 4, textAnchor: "middle", fill: "#555", fontSize: "9", fontFamily: "Barlow Condensed,sans-serif" }, data[i].date)), /* @__PURE__ */ React.createElement("polyline", { fill: "none", stroke: "#E8FF47", strokeWidth: "2", points }), data.map((d, i) => /* @__PURE__ */ React.createElement("circle", { key: i, cx: px(i), cy: py(d.weight), r: "3", fill: "#E8FF47" })));
  }
  const IcoHome = () => /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, /* @__PURE__ */ React.createElement("path", { d: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" }), /* @__PURE__ */ React.createElement("polyline", { points: "9 22 9 12 15 12 15 22" }));
  const IcoChart = () => /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, /* @__PURE__ */ React.createElement("polyline", { points: "22 12 18 12 15 21 9 3 6 12 2 12" }));
  const IcoClock = () => /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "10" }), /* @__PURE__ */ React.createElement("polyline", { points: "12 6 12 12 16 14" }));
  const IcoDl = ({ size = 20 }) => /* @__PURE__ */ React.createElement("svg", { style: { width: size, height: size }, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round" }, /* @__PURE__ */ React.createElement("path", { d: "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" }), /* @__PURE__ */ React.createElement("polyline", { points: "7 10 12 15 17 10" }), /* @__PURE__ */ React.createElement("line", { x1: "12", y1: "15", x2: "12", y2: "3" }));
  function Stepper({ value, onChange, step = 1, min = 0 }) {
    return /* @__PURE__ */ React.createElement("div", { className: "stepper" }, /* @__PURE__ */ React.createElement("button", { className: "stepper-btn", onClick: () => onChange(Math.max(min, +(value - step).toFixed(2))) }, "\u2212"), /* @__PURE__ */ React.createElement("input", { className: "stepper-val", type: "number", value, onChange: (e) => onChange(parseFloat(e.target.value) || 0) }), /* @__PURE__ */ React.createElement("button", { className: "stepper-btn", onClick: () => onChange(+(value + step).toFixed(2)) }, "+"));
  }
  function SetRow({ entry, index, onDel }) {
    var _a;
    let body;
    if (entry.setType === "superset") body = /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { style: { color: "var(--purple)", fontWeight: 700 } }, "SS "), entry.ex1Name, ": ", entry.ex1Weight, "lb\xD7", entry.ex1Reps, " + ", entry.ex2Name, ": ", entry.ex2Weight, "lb\xD7", entry.ex2Reps);
    else if (entry.setType === "myorep") body = /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { style: { color: "var(--blue)", fontWeight: 700 } }, "MYO "), entry.weight, "lb | Act:", entry.activationReps, ((_a = entry.miniSets) == null ? void 0 : _a.length) ? " + " + entry.miniSets.join("/") : "");
    else body = /* @__PURE__ */ React.createElement(React.Fragment, null, entry.weight, "lb \xD7 ", entry.reps);
    return /* @__PURE__ */ React.createElement("div", { className: "logged-set" }, /* @__PURE__ */ React.createElement("span", { className: "set-num" }, "SET ", index + 1), /* @__PURE__ */ React.createElement("span", { className: "set-data" }, body), /* @__PURE__ */ React.createElement("button", { className: "del-btn", onClick: onDel }, "\xD7"));
  }
  function StdLogger({ exName, logs, onLog, color }) {
    var _a, _b, _c;
    const last = [...logs].filter((l) => l.exercise === exName && l.setType === "standard").sort((a, b) => b.date.localeCompare(a.date))[0];
    const defaultReps = (_a = DEFAULTS[exName]) != null ? _a : 8;
    const [w, setW] = useState((_b = last == null ? void 0 : last.weight) != null ? _b : 45);
    const [r, setR] = useState((_c = last == null ? void 0 : last.reps) != null ? _c : defaultReps);
    const n = logs.filter((l) => l.date === today() && l.exercise === exName).length;
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "input-row" }, /* @__PURE__ */ React.createElement("div", { className: "input-group" }, /* @__PURE__ */ React.createElement("div", { className: "input-label" }, "WEIGHT (lb)"), /* @__PURE__ */ React.createElement(Stepper, { value: w, onChange: setW, step: 5 })), /* @__PURE__ */ React.createElement("div", { className: "input-group" }, /* @__PURE__ */ React.createElement("div", { className: "input-label" }, "REPS"), /* @__PURE__ */ React.createElement(Stepper, { value: r, onChange: setR, step: 1, min: 1 }))), /* @__PURE__ */ React.createElement("button", { className: "log-btn", style: { background: color, color: "#0d0d0d" }, onClick: () => onLog({ exercise: exName, setType: "standard", weight: w, reps: r, date: today(), ts: Date.now() }) }, "LOG SET ", n + 1));
  }
  function SSLogger({ exName, onLog }) {
    var _a;
    const [w1, setW1] = useState(45);
    const [r1, setR1] = useState((_a = DEFAULTS[exName]) != null ? _a : 8);
    const [ex2, setEx2] = useState("");
    const [w2, setW2] = useState(45);
    const [r2, setR2] = useState(8);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, fontWeight: 700, letterSpacing: ".1em", color: "var(--purple)", marginBottom: 8 } }, "EXERCISE 1: ", exName.toUpperCase()), /* @__PURE__ */ React.createElement("div", { className: "input-row" }, /* @__PURE__ */ React.createElement("div", { className: "input-group" }, /* @__PURE__ */ React.createElement("div", { className: "input-label" }, "WEIGHT (lb)"), /* @__PURE__ */ React.createElement(Stepper, { value: w1, onChange: setW1, step: 5 })), /* @__PURE__ */ React.createElement("div", { className: "input-group" }, /* @__PURE__ */ React.createElement("div", { className: "input-label" }, "REPS"), /* @__PURE__ */ React.createElement(Stepper, { value: r1, onChange: setR1, step: 1, min: 1 }))), /* @__PURE__ */ React.createElement("div", { className: "ss-divider" }, /* @__PURE__ */ React.createElement("div", { className: "ss-divider-line" }), /* @__PURE__ */ React.createElement("span", { className: "ss-divider-lbl" }, "PAIRED WITH"), /* @__PURE__ */ React.createElement("div", { className: "ss-divider-line" })), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, fontWeight: 700, letterSpacing: ".1em", color: "var(--purple)", marginBottom: 8 } }, "EXERCISE 2"), /* @__PURE__ */ React.createElement("input", { className: "ex-input", placeholder: "Exercise name...", value: ex2, onChange: (e) => setEx2(e.target.value) }), /* @__PURE__ */ React.createElement("div", { className: "input-row" }, /* @__PURE__ */ React.createElement("div", { className: "input-group" }, /* @__PURE__ */ React.createElement("div", { className: "input-label" }, "WEIGHT (lb)"), /* @__PURE__ */ React.createElement(Stepper, { value: w2, onChange: setW2, step: 5 })), /* @__PURE__ */ React.createElement("div", { className: "input-group" }, /* @__PURE__ */ React.createElement("div", { className: "input-label" }, "REPS"), /* @__PURE__ */ React.createElement(Stepper, { value: r2, onChange: setR2, step: 1, min: 1 }))), /* @__PURE__ */ React.createElement("button", { className: "log-btn purple", onClick: () => {
      if (!ex2.trim()) return;
      onLog({ exercise: exName, setType: "superset", ex1Name: exName, ex1Weight: w1, ex1Reps: r1, ex2Name: ex2.trim(), ex2Weight: w2, ex2Reps: r2, date: today(), ts: Date.now() });
    } }, "LOG SUPERSET"));
  }
  function MyoLogger({ exName, onLog }) {
    const [w, setW] = useState(45);
    const [actReps, setActReps] = useState(15);
    const [phase, setPhase] = useState("act");
    const [savedW, setSavedW] = useState(45);
    const [savedAct, setSavedAct] = useState(15);
    const [miniReps, setMiniReps] = useState(5);
    const [miniSets, setMiniSets] = useState([]);
    if (phase === "act") return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "phase-label" }, "ACTIVATION SET"), /* @__PURE__ */ React.createElement("div", { className: "phase-hint" }, "High-rep set to near failure. Rest 5-10 sec, then add mini-sets."), /* @__PURE__ */ React.createElement("div", { className: "input-row" }, /* @__PURE__ */ React.createElement("div", { className: "input-group" }, /* @__PURE__ */ React.createElement("div", { className: "input-label" }, "WEIGHT (lb)"), /* @__PURE__ */ React.createElement(Stepper, { value: w, onChange: setW, step: 5 })), /* @__PURE__ */ React.createElement("div", { className: "input-group" }, /* @__PURE__ */ React.createElement("div", { className: "input-label" }, "REPS"), /* @__PURE__ */ React.createElement(Stepper, { value: actReps, onChange: setActReps, step: 1, min: 1 }))), /* @__PURE__ */ React.createElement("button", { className: "log-btn blue", onClick: () => {
      setSavedW(w);
      setSavedAct(actReps);
      setMiniSets([]);
      setPhase("mini");
    } }, "DONE \u2014 ADD MINI-SETS \u2192"));
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "act-done" }, /* @__PURE__ */ React.createElement("div", { className: "act-done-lbl" }, "ACTIVATION \u2713"), /* @__PURE__ */ React.createElement("div", { className: "act-done-val" }, savedW, "lb \xD7 ", savedAct, " reps")), /* @__PURE__ */ React.createElement("div", { className: "phase-label" }, "MINI-SETS (", miniSets.length, ")"), miniSets.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "mini-chips" }, miniSets.map((r, i) => /* @__PURE__ */ React.createElement("span", { key: i, className: "mini-chip", onClick: () => setMiniSets((p) => p.filter((_, j) => j !== i)) }, r, "r \xD7"))), /* @__PURE__ */ React.createElement("div", { className: "input-row" }, /* @__PURE__ */ React.createElement("div", { className: "input-group" }, /* @__PURE__ */ React.createElement("div", { className: "input-label" }, "MINI-SET REPS"), /* @__PURE__ */ React.createElement(Stepper, { value: miniReps, onChange: setMiniReps, step: 1, min: 1 })), /* @__PURE__ */ React.createElement("div", { style: { flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end" } }, /* @__PURE__ */ React.createElement("button", { className: "log-btn blue", onClick: () => setMiniSets((p) => [...p, miniReps]) }, "+ MINI-SET"))), /* @__PURE__ */ React.createElement("button", { className: "log-btn ghost", onClick: () => {
      onLog({ exercise: exName, setType: "myorep", weight: savedW, activationReps: savedAct, miniSets, date: today(), ts: Date.now() });
      setPhase("act");
      setMiniSets([]);
    } }, "FINISH MYO-REP BLOCK \u2713"));
  }
  function ExItem({ name, logs, onLog, onDel, color }) {
    var _a;
    const [open, setOpen] = useState(false);
    const [st, setST] = useState("STANDARD");
    const todayLogs = logs.filter((l) => l.date === today() && l.exercise === name);
    const last = [...logs].filter((l) => l.exercise === name && l.setType === "standard").sort((a, b) => b.date.localeCompare(a.date))[0];
    const defaultReps = (_a = DEFAULTS[name]) != null ? _a : 8;
    const repHint = defaultReps <= 5 ? "Heavy \xB7 3\u20136 reps" : defaultReps <= 8 ? "Moderate \xB7 6\u201310 reps" : defaultReps <= 12 ? "Accessory \xB7 8\u201312 reps" : "Activation \xB7 10\u201315 reps";
    return /* @__PURE__ */ React.createElement("div", { className: "exercise-item" }, /* @__PURE__ */ React.createElement("div", { className: "ex-header", onClick: () => setOpen((o) => !o) }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "ex-name" }, name), /* @__PURE__ */ React.createElement("div", { className: "ex-last" }, last ? `${last.weight}lb \xD7 ${last.reps} last time` : repHint)), /* @__PURE__ */ React.createElement("div", { className: `sets-badge${todayLogs.length ? " has" : ""}` }, todayLogs.length > 0 ? `${todayLogs.length} SET${todayLogs.length > 1 ? "S" : ""}` : "LOG")), open && /* @__PURE__ */ React.createElement("div", { className: "ex-body" }, /* @__PURE__ */ React.createElement("div", { className: "type-tabs" }, SET_TYPES.map((t) => {
      const c = t === "STANDARD" ? "a-std" : t === "SUPERSET" ? "a-ss" : "a-myo";
      return /* @__PURE__ */ React.createElement("button", { key: t, className: `type-tab${st === t ? " " + c : ""}`, onClick: () => setST(t) }, t);
    })), st === "STANDARD" && /* @__PURE__ */ React.createElement(StdLogger, { exName: name, logs, onLog, color }), st === "SUPERSET" && /* @__PURE__ */ React.createElement(SSLogger, { exName: name, onLog }), st === "MYO-REP" && /* @__PURE__ */ React.createElement(MyoLogger, { exName: name, onLog }), todayLogs.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "logged-sets" }, todayLogs.map((s, i) => /* @__PURE__ */ React.createElement(SetRow, { key: s.ts, entry: s, index: i, onDel: () => onDel(s.ts) })))));
  }
  function WorkoutView({ workout, logs, onLog, onDel, onBack }) {
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "workout-header" }, /* @__PURE__ */ React.createElement("button", { className: "back-btn", onClick: onBack }, "\u2190 BACK"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "wh-title" }, workout.label), /* @__PURE__ */ React.createElement("div", { className: "wh-sub" }, workout.sub))), /* @__PURE__ */ React.createElement("div", { className: "exercise-list" }, workout.exercises.map((ex) => /* @__PURE__ */ React.createElement(ExItem, { key: ex, name: ex, logs, onLog, onDel, color: workout.color }))));
  }
  function CardioView({ onLog, onBack }) {
    const [typeIdx, setTypeIdx] = useState(0);
    const [sessionIdx, setSessionIdx] = useState(0);
    const [dur, setDur] = useState(60);
    const [notes, setNotes] = useState("");
    const [done, setDone] = useState(false);
    const ct = CARDIO_TYPES[typeIdx];
    const session = ct.sessions[Math.min(sessionIdx, ct.sessions.length - 1)];
    function handleTypeChange(i) {
      setTypeIdx(i);
      setSessionIdx(0);
      setDone(false);
    }
    function logIt() {
      const label = ct.sub ? `${ct.label} (${ct.sub}) \u2014 ${session.label}` : `${ct.label} \u2014 ${session.label}`;
      onLog({
        exercise: label,
        setType: "cardio",
        duration: dur,
        notes,
        date: today(),
        ts: Date.now()
      });
      setDone(true);
    }
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "workout-header" }, /* @__PURE__ */ React.createElement("button", { className: "back-btn", onClick: onBack }, "\u2190 BACK"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "wh-title" }, "CARDIO"), /* @__PURE__ */ React.createElement("div", { className: "wh-sub" }, "Log your session"))), /* @__PURE__ */ React.createElement("div", { className: "sub-view" }, /* @__PURE__ */ React.createElement("div", { className: "sec-label" }, "Activity"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 } }, CARDIO_TYPES.map((ct2, i) => /* @__PURE__ */ React.createElement(
      "div",
      {
        key: ct2.id,
        className: `cardio-type-row${typeIdx === i ? " active-ct" : ""}`,
        style: {
          background: typeIdx === i ? "rgba(71,255,178,.07)" : "var(--bg2)",
          border: `1px solid ${typeIdx === i ? ct2.color : "var(--border)"}`,
          borderRadius: 8,
          padding: "12px 14px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 10
        },
        onClick: () => handleTypeChange(i)
      },
      /* @__PURE__ */ React.createElement("div", { style: { width: 3, height: 36, borderRadius: 2, background: ct2.color, flexShrink: 0 } }),
      /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 16, fontWeight: 900, letterSpacing: ".06em", color: typeIdx === i ? ct2.color : "var(--text)" } }, ct2.label, ct2.sub && /* @__PURE__ */ React.createElement("span", { style: { color: "var(--muted)", fontWeight: 600 } }, " \xB7 ", ct2.sub)))
    ))), /* @__PURE__ */ React.createElement("div", { className: "sec-label" }, "Session Type"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 } }, ct.sessions.map((s, i) => /* @__PURE__ */ React.createElement(
      "div",
      {
        key: s.id,
        style: {
          background: sessionIdx === i ? "rgba(232,255,71,.05)" : "var(--bg3)",
          border: `1px solid ${sessionIdx === i ? "var(--accent)" : "var(--border)"}`,
          borderRadius: 6,
          padding: "10px 14px",
          cursor: "pointer"
        },
        onClick: () => setSessionIdx(i)
      },
      /* @__PURE__ */ React.createElement("div", { style: { fontSize: 15, fontWeight: 700, letterSpacing: ".05em", color: sessionIdx === i ? "var(--accent)" : "var(--text)" } }, s.label)
    ))), /* @__PURE__ */ React.createElement("div", { style: { background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 6, padding: "10px 14px", marginBottom: 16 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, fontWeight: 700, letterSpacing: ".1em", color: "var(--muted)", marginBottom: 4 } }, "PRESCRIPTION"), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 13, lineHeight: 1.6, color: "var(--text)" } }, session.hint)), /* @__PURE__ */ React.createElement("div", { className: "sec-label" }, "Duration (min)"), /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 14 } }, /* @__PURE__ */ React.createElement(Stepper, { value: dur, onChange: setDur, step: 5, min: 5 })), /* @__PURE__ */ React.createElement("div", { className: "field-group" }, /* @__PURE__ */ React.createElement("div", { className: "sec-label" }, "Notes"), /* @__PURE__ */ React.createElement("input", { className: "field-input", placeholder: "How'd it go? HR, conditions, distance\u2026", value: notes, onChange: (e) => setNotes(e.target.value) })), !done ? /* @__PURE__ */ React.createElement("button", { className: "log-btn", style: { background: ct.color, color: "#0d0d0d" }, onClick: logIt }, "LOG SESSION") : /* @__PURE__ */ React.createElement("div", { className: "done-msg", style: { color: ct.color } }, "\u2713 SESSION LOGGED")));
  }
  function MobilityView({ onLog, onBack }) {
    const [dur, setDur] = useState(15);
    const [notes, setNotes] = useState("");
    const [done, setDone] = useState(false);
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "workout-header" }, /* @__PURE__ */ React.createElement("button", { className: "back-btn", onClick: onBack }, "\u2190 BACK"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "wh-title" }, "MOBILITY"), /* @__PURE__ */ React.createElement("div", { className: "wh-sub" }, "Stretching \xB7 Yoga \xB7 Recovery"))), /* @__PURE__ */ React.createElement("div", { className: "sub-view" }, /* @__PURE__ */ React.createElement("div", { className: "sec-label" }, "Duration (min)"), /* @__PURE__ */ React.createElement("div", { style: { marginBottom: 16 } }, /* @__PURE__ */ React.createElement(Stepper, { value: dur, onChange: setDur, step: 5, min: 5 })), /* @__PURE__ */ React.createElement("div", { className: "field-group" }, /* @__PURE__ */ React.createElement("div", { className: "sec-label" }, "Notes"), /* @__PURE__ */ React.createElement("input", { className: "field-input", placeholder: "What did you work on?", value: notes, onChange: (e) => setNotes(e.target.value) })), !done ? /* @__PURE__ */ React.createElement("button", { className: "log-btn blue", onClick: () => {
      onLog({ exercise: "Mobility", setType: "mobility", duration: dur, notes, date: today(), ts: Date.now() });
      setDone(true);
    } }, "LOG SESSION") : /* @__PURE__ */ React.createElement("div", { className: "done-msg", style: { color: "var(--blue)" } }, "\u2713 SESSION LOGGED")));
  }
  const ALL_EXERCISES = [...new Set(WORKOUTS.flatMap((w) => w.exercises))];
  function ProgressView({ logs }) {
    const [sel, setSel] = useState(ALL_EXERCISES[0]);
    const exLogs = logs.filter((l) => l.exercise === sel && l.setType === "standard").sort((a, b) => a.date.localeCompare(b.date));
    const byDate = {};
    exLogs.forEach((l) => {
      if (!byDate[l.date] || l.weight > byDate[l.date].weight) byDate[l.date] = l;
    });
    const chartData = Object.values(byDate).map((l) => ({ date: fmtDate(l.date), weight: l.weight }));
    const allW = exLogs.map((l) => l.weight);
    const maxW = allW.length ? Math.max(...allW) : 0;
    const delta = allW.length > 1 ? maxW - allW[0] : 0;
    const recentDates = [...new Set(exLogs.map((l) => l.date))].sort((a, b) => b.localeCompare(a)).slice(0, 5);
    return /* @__PURE__ */ React.createElement("div", { className: "progress-view" }, /* @__PURE__ */ React.createElement("select", { className: "ex-select", value: sel, onChange: (e) => setSel(e.target.value) }, WORKOUTS.map((w) => /* @__PURE__ */ React.createElement("optgroup", { key: w.id, label: w.label }, w.exercises.map((ex) => /* @__PURE__ */ React.createElement("option", { key: ex }, ex))))), chartData.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "no-data" }, "No data yet for this exercise") : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "stat-row" }, /* @__PURE__ */ React.createElement("div", { className: "stat-box" }, /* @__PURE__ */ React.createElement("div", { className: "stat-val" }, maxW, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: "var(--muted)" } }, "lb")), /* @__PURE__ */ React.createElement("div", { className: "stat-lbl" }, "PR")), /* @__PURE__ */ React.createElement("div", { className: "stat-box" }, /* @__PURE__ */ React.createElement("div", { className: "stat-val" }, exLogs.length), /* @__PURE__ */ React.createElement("div", { className: "stat-lbl" }, "SETS")), /* @__PURE__ */ React.createElement("div", { className: "stat-box" }, /* @__PURE__ */ React.createElement("div", { className: "stat-val", style: { color: delta > 0 ? "var(--green)" : delta < 0 ? "var(--red)" : "var(--text)" } }, delta > 0 ? "+" : "", delta, /* @__PURE__ */ React.createElement("span", { style: { fontSize: 12, color: "var(--muted)" } }, "lb")), /* @__PURE__ */ React.createElement("div", { className: "stat-lbl" }, "GAIN"))), /* @__PURE__ */ React.createElement("div", { className: "chart-wrap" }, /* @__PURE__ */ React.createElement("div", { className: "chart-title" }, "MAX WEIGHT PER SESSION"), /* @__PURE__ */ React.createElement(LineChart, { data: chartData })), /* @__PURE__ */ React.createElement("div", { className: "sec-label", style: { marginBottom: 10 } }, "RECENT SESSIONS"), recentDates.map((date) => {
      const ds = exLogs.filter((l) => l.date === date);
      return /* @__PURE__ */ React.createElement("div", { className: "hist-item", key: date }, /* @__PURE__ */ React.createElement("div", { className: "hist-date" }, fmtDate(date)), ds.map((s, i) => /* @__PURE__ */ React.createElement("div", { key: s.ts, style: { fontFamily: "JetBrains Mono,monospace", fontSize: 13, marginTop: 3 } }, "Set ", i + 1, ": ", s.weight, "lb \xD7 ", s.reps)));
    })));
  }
  function buildRows(logs) {
    return logs.map((l) => {
      var _a;
      if (l.setType === "standard") return { Date: l.date, Type: "Standard", Exercise: l.exercise, Weight: l.weight, Reps: l.reps, Notes: "" };
      if (l.setType === "superset") return { Date: l.date, Type: "Superset", Exercise: `${l.ex1Name} + ${l.ex2Name}`, Weight: `${l.ex1Weight}/${l.ex2Weight}`, Reps: `${l.ex1Reps}/${l.ex2Reps}`, Notes: "" };
      if (l.setType === "myorep") return { Date: l.date, Type: "Myo-Rep", Exercise: l.exercise, Weight: l.weight, Reps: l.activationReps, Notes: `Mini: ${((_a = l.miniSets) == null ? void 0 : _a.join(",")) || ""}` };
      if (l.setType === "cardio") return { Date: l.date, Type: "Cardio", Exercise: l.exercise, Weight: "", Reps: "", Notes: `${l.duration}min${l.notes ? " / " + l.notes : ""}` };
      if (l.setType === "mobility") return { Date: l.date, Type: "Mobility", Exercise: "Mobility", Weight: "", Reps: "", Notes: `${l.duration}min${l.notes ? " / " + l.notes : ""}` };
      return { Date: l.date, Type: "?", Exercise: l.exercise || "", Weight: "", Reps: "", Notes: "" };
    });
  }
  function doExport(logs, label) {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(buildRows(logs));
    ws["!cols"] = [{ wch: 12 }, { wch: 10 }, { wch: 36 }, { wch: 10 }, { wch: 8 }, { wch: 40 }];
    XLSX.utils.book_append_sheet(wb, ws, "Log");
    const exes = ALL_EXERCISES;
    if (exes.length) {
      const prs = exes.map((ex) => {
        var _a, _b, _c;
        const ls = logs.filter((l) => l.exercise === ex && l.setType === "standard");
        if (!ls.length) return null;
        const pr = [...ls].sort((a, b) => b.weight - a.weight)[0];
        return { Exercise: ex, "PR Weight": (_a = pr == null ? void 0 : pr.weight) != null ? _a : "", "PR Reps": (_b = pr == null ? void 0 : pr.reps) != null ? _b : "", "PR Date": (_c = pr == null ? void 0 : pr.date) != null ? _c : "", "Total Sets": ls.length };
      }).filter(Boolean);
      if (prs.length) {
        const ws2 = XLSX.utils.json_to_sheet(prs);
        XLSX.utils.book_append_sheet(wb, ws2, "PRs");
      }
    }
    XLSX.writeFile(wb, `LiftLog_${label}.xlsx`);
  }
  function ExportView({ logs }) {
    const now = /* @__PURE__ */ new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth());
    const mStr = `${year}-${String(month + 1).padStart(2, "0")}`;
    const mLogs = logs.filter((l) => l.date.startsWith(mStr));
    const days = [...new Set(mLogs.map((l) => l.date))].length;
    return /* @__PURE__ */ React.createElement("div", { className: "export-view" }, /* @__PURE__ */ React.createElement("div", { className: "sec-label", style: { marginBottom: 14 } }, "SELECT MONTH"), /* @__PURE__ */ React.createElement("div", { className: "year-row" }, /* @__PURE__ */ React.createElement("button", { className: "year-nav", onClick: () => setYear((y) => y - 1) }, "\u2039"), /* @__PURE__ */ React.createElement("span", { className: "year-lbl" }, year), /* @__PURE__ */ React.createElement("button", { className: "year-nav", onClick: () => setYear((y) => y + 1) }, "\u203A")), /* @__PURE__ */ React.createElement("div", { className: "month-grid" }, MONTHS.map((m, i) => /* @__PURE__ */ React.createElement("div", { key: m, className: `month-chip${month === i ? " sel" : ""}`, onClick: () => setMonth(i) }, m))), /* @__PURE__ */ React.createElement("div", { className: "export-summary" }, /* @__PURE__ */ React.createElement("div", { className: "export-summary-title" }, MONTHS[month].toUpperCase(), " ", year, " \u2014 SUMMARY"), /* @__PURE__ */ React.createElement("div", { className: "ex-stat" }, /* @__PURE__ */ React.createElement("span", { className: "ex-stat-lbl" }, "Training Days"), /* @__PURE__ */ React.createElement("span", { className: "ex-stat-val" }, days)), /* @__PURE__ */ React.createElement("div", { className: "ex-stat" }, /* @__PURE__ */ React.createElement("span", { className: "ex-stat-lbl" }, "Lifting Sets"), /* @__PURE__ */ React.createElement("span", { className: "ex-stat-val" }, mLogs.filter((l) => l.setType === "standard").length)), /* @__PURE__ */ React.createElement("div", { className: "ex-stat" }, /* @__PURE__ */ React.createElement("span", { className: "ex-stat-lbl" }, "Cardio Sessions"), /* @__PURE__ */ React.createElement("span", { className: "ex-stat-val" }, mLogs.filter((l) => l.setType === "cardio").length)), /* @__PURE__ */ React.createElement("div", { className: "ex-stat" }, /* @__PURE__ */ React.createElement("span", { className: "ex-stat-lbl" }, "Total Entries"), /* @__PURE__ */ React.createElement("span", { className: "ex-stat-val" }, mLogs.length))), /* @__PURE__ */ React.createElement("button", { className: "export-btn", disabled: mLogs.length === 0, onClick: () => doExport(mLogs, `${MONTHS[month]}_${year}`) }, /* @__PURE__ */ React.createElement(IcoDl, { size: 22 }), " EXPORT ", MONTHS[month].toUpperCase(), " ", year), /* @__PURE__ */ React.createElement("button", { className: "export-btn ghost", onClick: () => doExport(logs, "All_Time") }, "\u2193  Export All-Time Data"));
  }
  function HomeScreen({ logs, onSelectWorkout, onSelectCardio, onSelectMobility }) {
    const todayN = [...new Set(logs.filter((l) => l.date === today()).map((l) => l.exercise))].length;
    const groups = [
      { label: "LOWER BODY", workouts: WORKOUTS.slice(0, 3) },
      { label: "UPPER BODY", workouts: WORKOUTS.slice(3, 6) },
      { label: "CORE", workouts: WORKOUTS.slice(6, 9) }
    ];
    return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "header" }, /* @__PURE__ */ React.createElement("div", { className: "header-title" }, "LIFT LOG"), /* @__PURE__ */ React.createElement("div", { className: "header-sub" }, todayN > 0 ? `${todayN} exercise${todayN > 1 ? "s" : ""} logged today` : "READY TO TRAIN")), /* @__PURE__ */ React.createElement("div", { style: { padding: "12px 16px 0" } }, groups.map((g) => /* @__PURE__ */ React.createElement("div", { key: g.label, style: { marginBottom: 16 } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, fontWeight: 700, letterSpacing: ".14em", color: "var(--muted)", marginBottom: 8 } }, g.label), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 } }, g.workouts.map((w) => {
      const todaySets = logs.filter((l) => l.date === today() && w.exercises.includes(l.exercise)).length;
      return /* @__PURE__ */ React.createElement("div", { key: w.id, className: "workout-card", style: { padding: "14px 12px" }, onClick: () => onSelectWorkout(w) }, /* @__PURE__ */ React.createElement("div", { className: "card-accent", style: { background: w.color } }), /* @__PURE__ */ React.createElement("div", { className: "card-label", style: { color: w.color, fontSize: 18 } }, w.label), /* @__PURE__ */ React.createElement("div", { className: "card-sub", style: { marginTop: 4, fontSize: 11 } }, w.sub.split("\xB7")[0].trim()), todaySets > 0 && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 6, fontSize: 11, fontFamily: "JetBrains Mono,monospace", color: w.color } }, todaySets, " sets"));
    })))), /* @__PURE__ */ React.createElement("div", { style: { fontSize: 11, fontWeight: 700, letterSpacing: ".14em", color: "var(--muted)", marginBottom: 8 } }, "CARDIO & RECOVERY"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 } }, /* @__PURE__ */ React.createElement("div", { className: "cardio-card", onClick: onSelectCardio }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "card-label", style: { color: "var(--green)" } }, "CARDIO"), /* @__PURE__ */ React.createElement("div", { className: "card-sub" }, "Ski \xB7 Run \xB7 Hike \xB7 Swim")), /* @__PURE__ */ React.createElement("span", { style: { color: "var(--muted)", fontSize: 20 } }, "\u203A")), /* @__PURE__ */ React.createElement("div", { className: "cardio-card", onClick: onSelectMobility }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "card-label", style: { color: "var(--blue)" } }, "MOBILITY"), /* @__PURE__ */ React.createElement("div", { className: "card-sub" }, "Stretching \xB7 Yoga \xB7 Recovery")), /* @__PURE__ */ React.createElement("span", { style: { color: "var(--muted)", fontSize: 20 } }, "\u203A")))));
  }
  function App() {
    const [tab, setTab] = useState("home");
    const [view, setView] = useState(null);
    const [logs, setLogs] = useState(() => loadData());
    const [toast, setToast] = useState(null);
    const [toastKey, setToastKey] = useState(0);
    const handleLog = useCallback((entry) => {
      const next = [...logs, entry];
      setLogs(next);
      saveData(next);
      const msg = entry.setType === "standard" ? `${entry.weight}lb \xD7 ${entry.reps} \u2713` : entry.setType === "superset" ? "SUPERSET LOGGED \u2713" : entry.setType === "myorep" ? "MYO-REP BLOCK \u2713" : "SESSION LOGGED \u2713";
      setToast(msg);
      setToastKey((k) => k + 1);
      setTimeout(() => setToast(null), 1700);
    }, [logs]);
    const handleDel = useCallback((ts) => {
      const next = logs.filter((l) => l.ts !== ts);
      setLogs(next);
      saveData(next);
    }, [logs]);
    return /* @__PURE__ */ React.createElement(React.Fragment, null, toast && /* @__PURE__ */ React.createElement("div", { className: "toast", key: toastKey }, toast), /* @__PURE__ */ React.createElement("div", { className: "app" }, view ? /* @__PURE__ */ React.createElement(React.Fragment, null, view.type === "workout" && /* @__PURE__ */ React.createElement(WorkoutView, { workout: view.workout, logs, onLog: handleLog, onDel: handleDel, onBack: () => setView(null) }), view.type === "cardio" && /* @__PURE__ */ React.createElement(CardioView, { onLog: handleLog, onBack: () => setView(null) }), view.type === "mobility" && /* @__PURE__ */ React.createElement(MobilityView, { onLog: handleLog, onBack: () => setView(null) })) : /* @__PURE__ */ React.createElement(React.Fragment, null, tab === "home" && /* @__PURE__ */ React.createElement(HomeScreen, { logs, onSelectWorkout: (w) => setView({ type: "workout", workout: w }), onSelectCardio: () => setView({ type: "cardio" }), onSelectMobility: () => setView({ type: "mobility" }) }), tab === "progress" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "header" }, /* @__PURE__ */ React.createElement("div", { className: "header-title" }, "PROGRESS"), /* @__PURE__ */ React.createElement("div", { className: "header-sub" }, "TRACK YOUR GAINS")), /* @__PURE__ */ React.createElement(ProgressView, { logs })), tab === "history" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "header" }, /* @__PURE__ */ React.createElement("div", { className: "header-title" }, "HISTORY"), /* @__PURE__ */ React.createElement("div", { className: "header-sub" }, "ALL SESSIONS")), /* @__PURE__ */ React.createElement("div", { style: { padding: 16 } }, (() => {
      const dates = [...new Set(logs.map((l) => l.date))].sort((a, b) => b.localeCompare(a)).slice(0, 30);
      if (!dates.length) return /* @__PURE__ */ React.createElement("div", { className: "no-data" }, "No sessions logged yet");
      return dates.map((date) => {
        const exes = [...new Set(logs.filter((l) => l.date === date).map((l) => l.exercise))];
        return /* @__PURE__ */ React.createElement("div", { className: "hist-item", key: date }, /* @__PURE__ */ React.createElement("div", { className: "hist-date" }, fmtDate(date)), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 } }, exes.map((ex) => /* @__PURE__ */ React.createElement("span", { key: ex, style: { background: "var(--bg3)", borderRadius: 4, padding: "3px 8px", fontSize: 13, fontWeight: 700 } }, ex))));
      });
    })())), tab === "export" && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "header" }, /* @__PURE__ */ React.createElement("div", { className: "header-title" }, "EXPORT"), /* @__PURE__ */ React.createElement("div", { className: "header-sub" }, "DOWNLOAD AS SPREADSHEET")), /* @__PURE__ */ React.createElement(ExportView, { logs }))), !view && /* @__PURE__ */ React.createElement("nav", { className: "nav" }, /* @__PURE__ */ React.createElement("button", { className: `nav-btn${tab === "home" ? " active" : ""}`, onClick: () => setTab("home") }, /* @__PURE__ */ React.createElement(IcoHome, null), "HOME"), /* @__PURE__ */ React.createElement("button", { className: `nav-btn${tab === "progress" ? " active" : ""}`, onClick: () => setTab("progress") }, /* @__PURE__ */ React.createElement(IcoChart, null), "PROGRESS"), /* @__PURE__ */ React.createElement("button", { className: `nav-btn${tab === "history" ? " active" : ""}`, onClick: () => setTab("history") }, /* @__PURE__ */ React.createElement(IcoClock, null), "HISTORY"), /* @__PURE__ */ React.createElement("button", { className: `nav-btn${tab === "export" ? " active" : ""}`, onClick: () => setTab("export") }, /* @__PURE__ */ React.createElement(IcoDl, null), "EXPORT"))));
  }
  ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App));
})();
