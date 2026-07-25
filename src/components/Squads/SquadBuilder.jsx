import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
  getDocs,
  limit,
  query,
} from "firebase/firestore";

import { db } from "../../lib/firebase/config";
import { useAuth } from "../../context/AuthContext";

import { Text } from "../ui/Text";
import { Button } from "../ui/Button";
import { Search, Plus, X, Target, Save } from "lucide-react";

const SQUAD_CACHE_KEY = "squad_builder_players";
const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

const CATEGORIES = [
  "",
  "GK",
  "CB",
  "LB",
  "RB",
  "LWB",
  "RWB",
  "CDM",
  "CM",
  "CAM",
  "LM",
  "RM",
  "LW",
  "RW",
  "CF",
  "ST",
];

const POSITION_ORDER = [
  "GK",
  "CB",
  "LB",
  "RB",
  "LWB",
  "RWB",
  "CDM",
  "CM",
  "CAM",
  "LM",
  "RM",
  "LW",
  "RW",
  "CF",
  "ST",
];

const SquadBuilder = () => {
  const { user } = useAuth();
  const [targets, setTargets] = useState([]);
  const [allPlayers, setAllPlayers] = useState([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [positionFilter, setPositionFilter] = useState("");
  const [lastSaved, setLastSaved] = useState(null);
  const [status, setStatus] = useState(null);
  const [viewMode, setViewMode] = useState("market");

  const saveTimer = useRef(null);

  function PlayerPhoto({ playerId, name, size = "w-10 h-10" }) {
    const [failed, setFailed] = React.useState(false);
    if (!failed) {
      return (
        <img
          src={`/player_photos/${playerId}.png`}
          alt={name}
          loading="lazy"
          onError={() => setFailed(true)}
          className={`${size} rounded-xl object-cover object-top border border-fifa-border bg-fifa-surface shrink-0`}
        />
      );
    }
    return (
      <div className={`${size} rounded-xl bg-fifa-surface border border-fifa-border flex items-center justify-center shrink-0`}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-fifa-text-muted">
          <circle cx="12" cy="8" r="4" fill="currentColor" opacity="0.4" />
          <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" fill="currentColor" opacity="0.4" />
        </svg>
      </div>
    );
  }

  /* ---------------- LOAD PLAYERS (cached) ---------------- */
  useEffect(() => {
    const loadPlayers = async () => {
      try {
        const cached = localStorage.getItem(SQUAD_CACHE_KEY);
        if (cached) {
          const { data, savedAt } = JSON.parse(cached);
          if (Date.now() - savedAt < CACHE_MAX_AGE_MS) {
            setAllPlayers(data);
            return;
          }
          localStorage.removeItem(SQUAD_CACHE_KEY);
        }
      } catch {
        localStorage.removeItem(SQUAD_CACHE_KEY);
      }

      setLoadingPlayers(true);
      try {
        const data = (await getDocs(query(collection(db, "players"), limit(500)))).docs.map((d) => ({
          id: d.id,
          ...d.data(),
          Overall: Number(d.data().Overall),
        }));
        setAllPlayers(data);
        localStorage.setItem(
          SQUAD_CACHE_KEY,
          JSON.stringify({ data, savedAt: Date.now() })
        );
      } catch (err) {
        console.error("Error fetching players:", err);
        setStatus({ type: "error", msg: "Failed to load players." });
      } finally {
        setLoadingPlayers(false);
      }
    };

    loadPlayers();
  }, []);

  /* ---------------- LOAD USER TARGETS ---------------- */
  useEffect(() => {
    if (!user?.uid) return;
    const ref = doc(db, "user_squads", user.uid);
    getDoc(ref).then((snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setTargets(data.players || []);
        setLastSaved(data.updatedAt);
      }
    });
  }, [user?.uid]);

  /* ---------------- PERSIST TARGETS (debounced) ---------------- */
  const persistTargets = (list) => {
    if (!user?.uid) return;
    setSaving(true);
    setStatus(null);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        const ref = doc(db, "user_squads", user.uid);
        await setDoc(
          ref,
          { players: list, updatedAt: serverTimestamp() },
          { merge: true }
        );
        setLastSaved(new Date());
        setStatus({ type: "success", msg: "Squad saved" });
      } catch (err) {
        console.error(err);
        setStatus({ type: "error", msg: "Save failed" });
      } finally {
        setSaving(false);
      }
    }, 600);
  };

  const addTarget = (player) => {
    if (targets.find((t) => t.playerId === player.id)) {
      setStatus({ type: "error", msg: "Already in targets" });
      return;
    }
    const next = [
      ...targets,
      {
        playerId: player.id,
        position: player.Position,
        name: player.Name,
        overall: player.Overall,
      },
    ];
    setTargets(next);
    persistTargets(next);
  };

  const removeTarget = (playerId) => {
    const next = targets.filter((t) => t.playerId !== playerId);
    setTargets(next);
    persistTargets(next);
  };

  const clearAll = () => {
    setTargets([]);
    persistTargets([]);
  };

  /* ---------------- FILTER PLAYERS ---------------- */
  const filteredPlayers = useMemo(() => {
    let list = allPlayers;
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((p) => (p.Name || "").toLowerCase().includes(q));
    }
    if (positionFilter) {
      list = list.filter((p) => p.Position === positionFilter);
    }
    return list.sort((a, b) => (b.Overall || 0) - (a.Overall || 0));
  }, [allPlayers, search, positionFilter]);

  /* ---------------- GROUP TARGETS BY EXACT POSITION ---------------- */
  const groupedTargets = useMemo(() => {
    const map = {};
    targets.forEach((t) => {
      const pos = t.position || "UNKNOWN";
      if (!map[pos]) map[pos] = [];
      map[pos].push(t);
    });
    return POSITION_ORDER.reduce((acc, pos) => {
      if (map[pos]) acc[pos] = map[pos];
      return acc;
    }, {});
  }, [targets]);

  const totalTargets = targets.length;

  /* ---------------- AUTH GUARD ---------------- */
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fifa-bg">
        <Text className="text-fifa-text-secondary">Please log in to build your squad.</Text>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-fifa-bg text-fifa-text overflow-hidden">
      <div className="pointer-events-none fixed -top-40 -left-40 w-[520px] h-[520px] bg-fifa-accent/10 rounded-full blur-[130px] animate-drift" />
      <div className="pointer-events-none fixed bottom-0 right-0 w-[460px] h-[460px] bg-fifa-info/10 rounded-full blur-[130px] animate-drift-slow" />

      <div className="relative w-full max-w-6xl mx-auto px-3 md:px-6 py-8 md:py-10">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-fifa-accent animate-pulse-soft" />
          <Text className="font-[rajdhani] font-medium text-[11px] uppercase tracking-[0.2em] text-fifa-accent">
            Planner
          </Text>
        </div>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
          <Text variant="heading" className="font-[orbitron] text-white text-3xl md:text-4xl">
            Squad Builder
          </Text>

          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="bg-fifa-surface border border-fifa-border text-white text-sm rounded-xl px-3 py-2 outline-none focus:border-fifa-accent transition"
            >
              <option value="market">Browse Market</option>
              <option value="targets">My Targets</option>
            </select>

            <Text className="font-inter text-[11px] text-fifa-text-muted">
              {totalTargets} target{totalTargets === 1 ? "" : "s"}
              {lastSaved && (
                <span className="ml-2 text-fifa-text-muted/70">
                  · Saved {lastSaved.toLocaleTimeString()}
                </span>
              )}
            </Text>
            {status && (
              <span
                className={`text-xs px-3 py-1.5 rounded-lg border ${
                  status.type === "success"
                    ? "bg-fifa-success/10 text-fifa-success border-fifa-success/30"
                    : "bg-fifa-danger/10 text-fifa-danger border-fifa-danger/30"
                }`}
              >
                {status.msg}
              </span>
            )}
            {viewMode === "targets" && (
              <Button
                size="sm"
                onClick={clearAll}
                disabled={saving || !totalTargets}
                className="rounded-xl border border-fifa-danger/30 bg-fifa-danger/10 text-fifa-danger hover:bg-fifa-danger/20 disabled:opacity-60"
              >
                Clear All
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* LEFT — target list */}
          <div
            className={
              viewMode === "market"
                ? "lg:col-span-1"
                : "lg:col-span-3"
            }
          >
            <div className="bg-gradient-to-b from-fifa-elevated to-fifa-card border border-fifa-border rounded-3xl p-5 md:p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]">
              <Text className="font-[orbitron] text-white text-lg mb-4">
                Targets ({totalTargets})
              </Text>

              {totalTargets === 0 && viewMode === "targets" && (
                <Text className="font-inter text-fifa-text-muted text-sm">
                  You haven’t targeted anyone yet. Browse the market and add players.
                </Text>
              )}

              <div className="flex flex-col gap-4">
                {Object.entries(groupedTargets).map(([pos, list]) => (
                  <div key={pos}>
                    <Text className="font-inter text-[10px] uppercase tracking-[0.2em] text-fifa-text-muted mb-2 block">
                      {pos}
                    </Text>
                    <div className="flex flex-col gap-2">
                       {list.map((t) => (
                         <div
                           key={t.playerId}
                           className="flex items-center justify-between gap-2 bg-fifa-surface/70 border border-fifa-border rounded-xl px-3 py-2"
                         >
                           <div className="flex items-center gap-2 min-w-0">
                             <PlayerPhoto playerId={t.playerId} name={t.name} size="w-8 h-8" />
                             <div className="min-w-0">
                               <Text className="font-[rajdhani] font-semibold text-white text-sm truncate block">
                                 {t.name}
                               </Text>
                               <Text className="font-inter text-[10px] text-fifa-text-muted">
                                 OVR {t.overall}
                               </Text>
                             </div>
                           </div>
                           <button
                             onClick={() => removeTarget(t.playerId)}
                             className="shrink-0 w-8 h-8 rounded-lg bg-fifa-card border border-fifa-border flex items-center justify-center text-fifa-text-muted hover:text-fifa-danger hover:border-fifa-danger/40 transition"
                             aria-label={`Remove ${t.name}`}
                           >
                             <X size={14} />
                           </button>
                         </div>
                       ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — player market */}
          {viewMode === "market" && (
            <div className="lg:col-span-2 bg-gradient-to-b from-fifa-elevated to-fifa-card border border-fifa-border rounded-3xl p-5 md:p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]">
              <Text className="font-[orbitron] text-white text-lg mb-4">Player Market</Text>

              <div className="flex flex-col gap-3 mb-4">
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-fifa-text-muted"
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search players..."
                    className="w-full bg-fifa-surface border border-fifa-border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-fifa-text-muted outline-none focus:border-fifa-accent transition"
                  />
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                  <select
                    value={positionFilter}
                    onChange={(e) => setPositionFilter(e.target.value)}
                    className="bg-fifa-surface border border-fifa-border text-white text-sm rounded-xl px-3 py-2 outline-none focus:border-fifa-accent transition"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-fifa-card">
                        {cat || "All Positions"}
                      </option>
                    ))}
                  </select>
                  <span className="text-xs text-fifa-text-muted">
                    {filteredPlayers.length} player{filteredPlayers.length === 1 ? "" : "s"}
                  </span>
                </div>
              </div>

              {loadingPlayers && (
                <div className="py-10 text-center text-fifa-text-muted text-sm">
                  Loading players...
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto pr-1">
                {filteredPlayers.map((p) => {
                  const added = targets.some((t) => t.playerId === p.id);
                  return (
                     <div
                       key={p.id}
                       className="flex items-center justify-between gap-3 bg-fifa-surface/60 border border-fifa-border rounded-xl px-3 py-3 hover:border-fifa-accent/40 transition"
                     >
                       <div className="flex items-center gap-3 min-w-0">
                         <PlayerPhoto playerId={p.id} name={p.Name} size="w-10 h-10" />
                         <div className="min-w-0">
                           <Text className="font-[rajdhani] font-semibold text-white text-sm truncate block">
                             {p.Name}
                           </Text>
                           <Text className="font-inter text-[10px] text-fifa-text-muted">
                             {p.Position} · OVR {p.Overall}
                           </Text>
                         </div>
                       </div>
                       <button
                         onClick={() => addTarget(p)}
                         disabled={added}
                         className={`shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                           added
                             ? "bg-fifa-surface border-fifa-border text-fifa-text-muted cursor-not-allowed"
                             : "bg-fifa-accent text-fifa-bg border-fifa-accent hover:bg-fifa-accent-hover"
                         }`}
                       >
                         {added ? <X size={12} /> : <Plus size={12} />}
                         {added ? "Added" : "Target"}
                       </button>
                     </div>
                  );
                })}
              </div>

              {!loadingPlayers && filteredPlayers.length === 0 && (
                <p className="text-sm text-fifa-text-muted text-center py-8">
                  No players match your filters.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SquadBuilder;
