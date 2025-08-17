"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";



// ----------------------------------------------------------------------------
// Design tokens (consistent styles everywhere)
// ----------------------------------------------------------------------------
const UI = {
  input:
    "appearance-none px-4 py-3 rounded-xl border border-zinc-200 bg-white/80 backdrop-blur placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400",
  inputSm:
    "appearance-none px-3 py-2 rounded-xl border border-zinc-200 bg-white/80 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400",
  btn:
    "rounded-xl px-4 py-3 bg-zinc-900 text-white font-medium hover:bg-zinc-800 active:scale-[.99] transition",
  btnGhost:
    "rounded-xl px-3 py-2 border border-zinc-200 bg-white hover:bg-zinc-50 active:scale-[.99] transition",
  chip: "text-xs px-2 py-1 rounded-full bg-zinc-100 text-zinc-700",
  iconBtn:
    "p-2 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 active:scale-[.98] transition",
  card: "rounded-xl border border-zinc-200 bg-white/85 backdrop-blur shadow-sm",
};

// --- Small helpers ----------------------------------------------------------
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
const todayISO = () => new Date().toISOString().slice(0, 10);
const inSameDay = (a, b) => new Date(a).toDateString() === new Date(b).toDateString();
const isWithinDays = (date, days) => {
  const d = new Date(date);
  const t = new Date();
  const diff = (d - new Date(t.getFullYear(), t.getMonth(), t.getDate())) / 86400000;
  return diff >= 0 && diff < days;
};
const formatDatePretty = (iso) => new Date(iso).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });

function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }, [key, value]);
  return [value, setValue];
}

// --- Pomodoro Timer ---------------------------------------------------------
function PomodoroTimer() {
  const [seconds, setSeconds] = useState(25 * 60); // 25 min default
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState("Focus"); // Focus / Break
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(intervalRef.current);
  }, [running]);

  useEffect(() => {
    if (seconds === 0 && running) {
      const isFocus = mode === "Focus";
      setMode(isFocus ? "Break" : "Focus");
      setSeconds(isFocus ? 5 * 60 : 25 * 60);
      if ("Notification" in window) {
        if (Notification.permission === "granted") new Notification(`${isFocus ? "Break" : "Focus"} time!`);
      }
    }
  }, [seconds, running, mode]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    
    <div className={`${UI.card} p-4 flex items-center justify-between gap-3`}>
      <div>
         <title>ZapList</title>
        <div className="text-xs text-zinc-500">Pomodoro Timer</div>
        <div className="text-2xl font-semibold">
          {mm}:{ss} <span className="text-sm font-normal text-zinc-500">{mode}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => setRunning((r) => !r)} className={`${UI.btn} px-3 py-2`}>{running ? "Pause" : "Start"}</button>
        <button
          onClick={() => {
            setRunning(false);
            setSeconds(25 * 60);
            setMode("Focus");
          }}
          className={`${UI.btnGhost}`}
        >
          Reset
        </button>
      </div>
    </div>
  );
}

// --- Mini Calendar (month view) --------------------------------------------
function MiniCalendar({ selectedDate, onSelectDate }) {
  const d = selectedDate ? new Date(selectedDate) : new Date();
  const year = d.getFullYear();
  const month = d.getMonth();
  const first = new Date(year, month, 1);
  const start = new Date(year, month, 1 - ((first.getDay() + 6) % 7)); // Monday-first grid
  const days = Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));

  const monthName = d.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  return (
    <div className={`${UI.card} p-4`}>
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold">{monthName}</div>
        <div className="flex gap-2">
          <button className={`${UI.btnGhost} text-xs`} onClick={() => onSelectDate(new Date(year, month - 1, d.getDate()).toISOString().slice(0, 10))}>{"<"}</button>
          <button className={`${UI.btnGhost} text-xs`} onClick={() => onSelectDate(new Date(year, month + 1, d.getDate()).toISOString().slice(0, 10))}>{">"}</button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-zinc-500 mb-1">
        {"MTWTFSS".split("").map((ch, i) => (
          <div key={i}>{ch}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          const iso = day.toISOString().slice(0, 10);
          const isCurMonth = day.getMonth() === month;
          const isSel = selectedDate && inSameDay(iso, selectedDate);
          return (
            <button
              key={i}
              onClick={() => onSelectDate(iso)}
              className={`aspect-square text-sm rounded-xl flex items-center justify-center ${
                isSel ? "bg-indigo-500 text-white" : isCurMonth ? "hover:bg-zinc-100" : "text-zinc-400"
              }`}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// --- Voice input (best-effort) ---------------------------------------------
function useVoiceInput(onResult) {
  const recRef = useRef(null);
  const start = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert("Speech recognition not supported in this browser.");
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.onresult = (e) => onResult(e.results[0][0].transcript);
    recRef.current = rec;
    rec.start();
  };
  const stop = () => recRef.current && recRef.current.stop();
  return { start, stop };
}

// --- Main Page --------------------------------------------------------------
export default function Page() {
  const [tasks, setTasks] = useLocalStorage("tasks.v3", []);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [due, setDue] = useState(todayISO());
  const [filter, setFilter] = useState("All"); // All / Today / Week / Month
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");


  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const { start: startVoice } = useVoiceInput((text) => setTitle(text));

  const addTask = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const t = {
      id: uid(),
      title: title.trim(),
      desc: desc.trim(),
      due,
      completed: false,
      createdAt: new Date().toISOString(),
      comments: [],
      reminderAt: null,
    };
    setTasks([t, ...tasks]);
    setTitle("");
    setDesc("");
    setDue(todayISO());
  };

  const toggleComplete = (id) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
    setPoints((p) => p + 10); // gamification
  };
  const removeTask = (id) => setTasks((prev) => prev.filter((t) => t.id !== id));
  const updateTask = (id, patch) => setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  // Smart reminder
  const setReminder = (id, minutes) => {
    const when = new Date(Date.now() + minutes * 60000);
    updateTask(id, { reminderAt: when.toISOString() });
    setTimeout(() => {
      const tk = tasks.find((x) => x.id === id);
      if (!tk) return;
      if ("Notification" in window && Notification.permission === "granted") new Notification(`Reminder: ${tk.title}`);
      else alert(`Reminder: ${tk.title}`);
    }, minutes * 60000);
  };

  const filtered = useMemo(() => {
    let list = tasks;
    if (filter === "Today") list = list.filter((t) => inSameDay(t.due, todayISO()));
    if (filter === "Week") list = list.filter((t) => isWithinDays(t.due, 7));
    if (filter === "Month") list = list.filter((t) => isWithinDays(t.due, 31));
    if (selectedDate) list = list.filter((t) => inSameDay(t.due, selectedDate));
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter((t) => t.title.toLowerCase().includes(s) || t.desc.toLowerCase().includes(s));
    }
    return list;
  }, [tasks, filter, search, selectedDate]);

  return (
    <div className="min-h-[100dvh] w-full bg-gradient-to-br from-zinc-50 to-zinc-100 text-zinc-900">
      <style jsx global>{`
        html, body, #__next { height: 100%; }
        ::-webkit-scrollbar { width: 10px; height: 10px; }
        ::-webkit-scrollbar-thumb { background: #d4d4d8; border-radius: 999px; }
        ::-webkit-scrollbar-track { background: transparent; }
      `}</style>

      <div className="grid grid-cols-12 gap-6 p-6 h-[100dvh]">
        {/* Sidebar */}
        <aside className="col-span-3 xl:col-span-2 h-full ${UI.card} p-5 overflow-y-auto">
          <MiniCalendar selectedDate={selectedDate || todayISO()} onSelectDate={(iso) => { setSelectedDate(iso); setFilter("All"); }} />

          <div className="mt-6">
            <div className="text-xs uppercase tracking-wide text-zinc-500 mb-2">Productivity & workflow</div>
            <div className="space-y-2">
              <button className={`w-full text-left ${UI.btnGhost}`}> Smart reminders</button>
              <button className={`w-full text-left ${UI.btnGhost} bg-zinc-900 text-white`}>Calendar view</button>
              <button className={`w-full text-left ${UI.btnGhost}`} onClick={() => alert("Kanban tip: use date filters as lanes.")}>Kanban Board mode</button>
              <PomodoroTimer />
              <button className={`w-full text-left ${UI.btnGhost}`} onClick={() => alert("Points/streaks increment when tasks complete.")}> Habit Tracking mode</button>
              <button className={`w-full text-left ${UI.btnGhost}`} onClick={() => alert("Works offline via localStorage.")}> Offline Support</button>
              <button className={`w-full text-left ${UI.btnGhost}`} onClick={startVoice}> Voice input</button>
             
            </div>
          </div>

          <div className="mt-6">
            <div className="text-xs uppercase tracking-wide text-zinc-500 mb-2">Collaboration & sharing</div>
            <div className="space-y-2">
              <button className={`w-full text-left ${UI.btnGhost}`} onClick={() => alert("Shared lists are local-only in this demo.")}> Shared Lists</button>
              <button className={`w-full text-left ${UI.btnGhost}`} onClick={() => alert("Assign by adding @name in the description.")}>Task assignment</button>
              <button className={`w-full text-left ${UI.btnGhost}`} onClick={() => alert("Open a task and add comments.")}> Comments</button>
              <button className={`w-full text-left ${UI.btnGhost}`} onClick={() => alert("Version history kept in localStorage (basic).")}> Version history</button>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="col-span-9 xl:col-span-10 h-full overflow-y-auto pr-2">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl font-extrabold tracking-tight">ZapList</h1>
            <div className="relative">
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search" className={`${UI.input} pl-9 w-72`} />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 text-lg">🔍︎
</span>

            </div>
          </div>

          {/* Add form */}
          <form onSubmit={addTask} className="mb-4 grid grid-cols-12 gap-3">
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter Task..." className={`${UI.input} col-span-4`} />
            <input type="text" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Enter Description..." className={`${UI.input} col-span-5`} />
            <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className={`${UI.input} col-span-2`} />
            <button className={`${UI.btn} col-span-1`}>Add</button>
          </form>

          {/* Filters */}
          <div className="mb-5 flex items-center gap-2">
            {["All", "Today", "Week", "Month"].map((f) => (
              <button key={f} onClick={() => { setFilter(f); setSelectedDate(""); }} className={`px-4 py-2 rounded-2xl border ${filter === f ? "bg-indigo-500 text-white border-indigo-500" : "hover:bg-zinc-100"}`}>{f}</button>
            ))}
            {selectedDate && (
              <div className={`${UI.btnGhost} ml-2 text-sm`}>Date: {formatDatePretty(selectedDate)} <button className="ml-2 text-indigo-600" onClick={() => setSelectedDate("")}>clear</button></div>
            )}
          </div>

          {/* List */}
          <div className="space-y-3">
            {filtered.length === 0 && (
              <div className={`${UI.card} p-6 text-zinc-500`}>No tasks match your filters.</div>
            )}

            {filtered.map((t) => (
              <TaskCard key={t.id} task={t} onToggle={() => toggleComplete(t.id)} onDelete={() => removeTask(t.id)} onEdit={(patch) => updateTask(t.id, patch)} onReminder={(m) => setReminder(t.id, m)} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

function TaskCard({ task, onToggle, onDelete, onEdit, onReminder }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [desc, setDesc] = useState(task.desc);
  const [due, setDue] = useState(task.due);
  const [newComment, setNewComment] = useState("");

  const save = () => {
    onEdit({ title: title.trim() || task.title, desc, due });
    setEditing(false);
  };

  return (
    <div className={`${UI.card} p-4 flex items-start justify-between gap-4`}>
      <div className="flex items-start gap-4 w-full">
        <button onClick={onToggle} className={`w-5 h-5 mt-1 rounded-full border flex items-center justify-center ${task.completed ? "bg-indigo-500 text-white border-indigo-500" : "border-zinc-300"}`}>{task.completed ? "✓" : ""}</button>
        <div className="flex-1 min-w-0">
          {!editing ? (
            <>
              <div className="flex items-center gap-2">
                <div className={`font-semibold text-lg truncate ${task.completed ? "line-through text-zinc-400" : ""}`}>{task.title}</div>
                <span className={`${UI.chip}`}>{formatDatePretty(task.due)}</span>
              </div>
              {task.desc && <div className="text-sm text-zinc-600 truncate">{task.desc}</div>}
            </>
          ) : (
            <div className="grid grid-cols-12 gap-2">
              <input className={`${UI.inputSm} col-span-4`} value={title} onChange={(e) => setTitle(e.target.value)} />
              <input className={`${UI.inputSm} col-span-5`} value={desc} onChange={(e) => setDesc(e.target.value)} />
              <input className={`${UI.inputSm} col-span-2`} type="date" value={due} onChange={(e) => setDue(e.target.value)} />
              <div className="col-span-1 flex gap-1">
                <button onClick={save} className={`${UI.btn}`}>Save</button>
                <button onClick={() => setEditing(false)} className={`${UI.btnGhost}`}>Cancel</button>
              </div>
            </div>
          )}

          {/* Comments */}
          <div className="mt-3">
            <div className="text-xs text-zinc-500 mb-1">Comments</div>
            {(task.comments || []).length === 0 && <div className="text-xs text-zinc-400">No comments yet.</div>}
            <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
              {(task.comments || []).map((c, idx) => (
                <div key={idx} className="text-sm bg-zinc-50 rounded-xl px-2 py-1 border border-zinc-200">{c}</div>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <input value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Add a comment..." className={`${UI.inputSm} flex-1`} />
              <button
                onClick={() => {
                  if (!newComment.trim()) return;
                  onEdit({ comments: [...(task.comments || []), newComment.trim()] });
                  setNewComment("");
                }}
                className={`${UI.btn}`}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>

     <div className="flex items-center gap-2">
      {!editing && (
        <>
          <button
            onClick={() => setEditing(true)}
            className={UI.iconBtn}
            title="Edit"
          >
            <EditIcon />
          </button>

          <button
            onClick={onDelete}
            className={`${UI.iconBtn} text-[#252525]`}
            title="Delete"
          >
            <DeleteIcon />
          </button>
        </>
      )}
    </div>

    </div>
  );
}
