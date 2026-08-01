import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";

import { db } from "../../lib/firebase/config";
import { useAuth } from "../../context/AuthContext";

import { Text } from "../ui/Text";
import Loadin from "../ui/loadin";
import Reveal from "../ui/Reveal";
import FieldView from "./FieldView";
import { Button } from "../ui/Button";

const BUDGET = 2200;
const POSITION_GROUPS = {
  GK: ["GK"],
  DEF: ["CB", "LB", "RB", "LWB", "RWB"],
  MID: ["CDM", "CM", "CAM", "LM", "RM"],
  FWD: ["LW", "RW", "CF", "ST"],
};

const getGroup = (pos) => {
  if (POSITION_GROUPS.GK.includes(pos)) return "GK";
  if (POSITION_GROUPS.DEF.includes(pos)) return "DEF";
  if (POSITION_GROUPS.MID.includes(pos)) return "MID";
  if (POSITION_GROUPS.FWD.includes(pos)) return "FWD";
  return "OTH";
};

const GROUP_LABELS = {
  GK: "Goalkeepers",
  DEF: "Defenders",
  MID: "Midfielders",
  FWD: "Forwards",
  OTH: "Others",
};

const POSITIONS = [
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

const OTHER_TEAMS = [
  { id: "wolves01", name: "Wolves" },
  { id: "bayern05", name: "Bayern Munich" },
  { id: "city04", name: "Manchester City" },
  { id: "paris03", name: "Paris Saint-Germain" },
  { id: "liverpool01", name: "Liverpool" },
];

const squadCache = new Map();
let squadUnsub = null;

const sumValue = (list) =>
  list.reduce((acc, p) => acc + (Number(p.soldPrice) || 0), 0);

function PlayerPhoto({ playerId, name, size = "w-12 h-12" }) {
  const [failed, setFailed] = useState(false);
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
    <div
      className={`${size} rounded-xl bg-fifa-surface border border-fifa-border flex items-center justify-center shrink-0`}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-fifa-text-muted">
        <circle cx="12" cy="8" r="4" fill="currentColor" opacity="0.4" />
        <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" fill="currentColor" opacity="0.4" />
      </svg>
    </div>
  );
}

const DisplaySquad = () => {
  const navigate = useNavigate();
  const { userData } = useAuth();

  const userTeamId = userData?.teamId || null;
  const [players, setPlayers] = useState([]);
  const [seasonId, setSeasonId] = useState("S3");
  const [selectedTeamId, setSelectedTeamId] = useState(userTeamId || null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState("list");
  
  useEffect(() => {
    if (userTeamId && !selectedTeamId) {
      setSelectedTeamId(userTeamId);
    }
  }, [userTeamId, selectedTeamId]);

  /* ---------------- FETCH SQUAD ---------------- */
  useEffect(() => {
    if (!selectedTeamId || !seasonId) return;

    const key = `${selectedTeamId}_${seasonId}`;

    const loadSquad = async () => {
      if (squadCache.has(key)) {
        setPlayers(squadCache.get(key));
      }

      const seasonQuery = query(
        collection(db, "season_players"),
        where("teamId", "==", selectedTeamId),
        where("seasonId", "==", seasonId)
      );

      const seasonSnap = await getDocs(seasonQuery);
      const seasonData = seasonSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      if (!seasonData.length) {
        squadCache.set(key, []);
        setPlayers([]);
        return;
      }

      const playerSnaps = await Promise.all(
        seasonData.map((sp) => getDoc(doc(db, "players", sp.playerId)))
      );

      const playerMap = {};
      playerSnaps.forEach((snap) => {
        if (snap.exists()) playerMap[snap.id] = snap.data();
      });

      let merged = seasonData
        .map((sp) => ({ ...playerMap[sp.playerId], ...sp }))
        .filter((p) => p.Name);

      merged.sort((a, b) => (b.Overall || 0) - (a.Overall || 0));

      squadCache.set(key, merged);
      setPlayers(merged);
    };

    loadSquad();

    if (squadUnsub) squadUnsub();
    const liveQuery = query(
      collection(db, "season_players"),
      where("teamId", "==", selectedTeamId),
      where("seasonId", "==", seasonId)
    );
    squadUnsub = onSnapshot(liveQuery, async (snap) => {
      const seasonData = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const playerSnaps = await Promise.all(
        seasonData.map((sp) => getDoc(doc(db, "players", sp.playerId)))
      );
      const playerMap = {};
      playerSnaps.forEach((snap) => {
        if (snap.exists()) playerMap[snap.id] = snap.data();
      });
      let merged = seasonData
        .map((sp) => ({ ...playerMap[sp.playerId], ...sp }))
        .filter((p) => p.Name);
      merged.sort((a, b) => (b.Overall || 0) - (a.Overall || 0));
      squadCache.set(key, merged);
      setPlayers(merged);
    });

    return () => {
      if (squadUnsub) squadUnsub();
    };
  }, [selectedTeamId, seasonId]);

  /* ---------------- DERIVED ---------------- */
  const totalValue = useMemo(() => sumValue(players), [players]);
  const remaining = BUDGET - totalValue;

  const grouped = useMemo(() => {
    const map = {};
    players.forEach((p) => {
      const pos = p.Position || "UNKNOWN";
      if (!map[pos]) map[pos] = [];
      map[pos].push(p);
    });
    return POSITIONS.reduce((acc, pos) => {
      if (map[pos]) acc[pos] = map[pos];
      return acc;
    }, {});
  }, [players]);

  const groupedValues = useMemo(() => {
    const vals = {};
    Object.entries(grouped).forEach(([pos, list]) => {
      vals[pos] = sumValue(list);
    });
    return vals;
  }, [grouped]);

  const positionGroupStats = useMemo(() => {
    const stats = { GK: { count: 0, value: 0 }, DEF: { count: 0, value: 0 }, MID: { count: 0, value: 0 }, FWD: { count: 0, value: 0 } };
    players.forEach((p) => {
      const g = getGroup(p.Position);
      if (!stats[g]) stats[g] = { count: 0, value: 0 };
      stats[g].count += 1;
      stats[g].value += Number(p.soldPrice) || 0;
    });
    return stats;
  }, [players]);

  /* ---------------- AUTH GUARD ---------------- */
  if (!userData && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fifa-bg">
        <Loadin>Loading dashboard...</Loadin>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-fifa-bg text-fifa-text overflow-hidden">
      <div className="pointer-events-none fixed -top-40 -right-40 w-[520px] h-[520px] bg-fifa-accent/10 rounded-full blur-[130px] animate-drift" />
      <div className="pointer-events-none fixed bottom-0 left-0 w-[460px] h-[460px] bg-fifa-info/10 rounded-full blur-[130px] animate-drift-slow" />

      <div className="relative w-full max-w-6xl mx-auto px-3 md:px-6 py-8 md:py-10">
        {/* Header */}
        <Reveal>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-fifa-accent animate-pulse-soft" />
            <Text className="font-[rajdhani] font-medium text-[11px] uppercase tracking-[0.2em] text-fifa-accent">
              Your Club
            </Text>
          </div>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
            <Text variant="heading" className="font-[orbitron] text-white text-3xl md:text-4xl">
              Squad Roster
            </Text>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={seasonId}
                onChange={(e) => setSeasonId(e.target.value)}
                className="bg-fifa-surface border border-fifa-border text-white text-sm rounded-xl px-3 py-2 outline-none focus:border-fifa-accent transition"
              >
                <option value="S2">S2</option>
                <option value="S3">S3</option>
                <option value="S4">S4</option>
              </select>

              <select
                value={selectedTeamId || ""}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="bg-fifa-surface border border-fifa-border text-white text-sm rounded-xl px-3 py-2 outline-none focus:border-fifa-accent transition"
              >
                
                {userTeamId && (
                  <option value={userTeamId}>Your Squad</option>
                )}
                {OTHER_TEAMS.map((team) => (
                  <option key={team.id} value={team.id} className="bg-fifa-card">
                    {team.name}
                  </option>
                ))}
              </select>

              <Button
                size="sm"
                onClick={() => setViewMode(viewMode === "list" ? "squad" : "list")}
                className="rounded-xl"
              >
                {viewMode === "list" ? "Pitch View" : "List View"}
              </Button>
            </div>
          </div>
        </Reveal>

        {/* Summary */}
        <Reveal delay={80}>
          <div className="flex gap-3 justify-between mb-6 bg-linear-to-b  from-fifa-elevated to-fifa-card border border-fifa-border rounded-xl p-4">
            <div className="">
            <div className="flex gap-6 justify-between items-center mb-1">
              <Text className="font-rajdhani text-[10px] uppercase tracking-wider text-fifa-text-muted">
                Players
              </Text>
              <Text className="font-[rajdhani] font-bold text-fifa-text-secondary text-2xl leading-none mt-1">
                {players.length}
              </Text>
            </div>
            <div className="flex gap-6 justify-between items-center mb-1">
              <Text className="font-rajdhani text-[10px] uppercase tracking-wider text-fifa-text-muted">
                Squad Value
              </Text>
              <Text className="font-[rajdhani] font-bold text-fifa-text-secondary text-2xl leading-none mt-1">
                {totalValue}M
              </Text>
            </div>
            </div>
            <div className="flex flex-col justify-center items-center">
              <Text className="font-rajdhani text-[10px] uppercase tracking-wider text-fifa-text-muted">
                Budget Left
              </Text>
              <Text
                className={`font-[rajdhani] font-bold text-2xl leading-none mt-1 ${
                  remaining < 100 ? "text-fifa-danger" : "text-fifa-text-secondary"
                }`}
              >
                {remaining}M
              </Text>
            </div>
          </div>

          {/* Position group spending */}
          <div className="grid grid-cols-4 md:grid-cols-4 gap-3 mb-6 bg-linear-to-b  from-fifa-elevated to-fifa-card border border-fifa-border rounded-xl p-4">
            {Object.entries(POSITION_GROUPS).map(([group, positions]) => {
              const count = players.filter((p) => positions.includes(p.Position)).length;
              const value = players
                .filter((p) => positions.includes(p.Position))
                .reduce((a, p) => a + (Number(p.soldPrice) || 0), 0);
              return (
                <div
                  key={group}
                  className="flex flex-col justify-center items-center "
                >
                  <Text className="font-rajdhani text-[10px] uppercase tracking-wider text-fifa-text-muted">
                    {GROUP_LABELS[group]}
                  </Text>
                  <Text className="font-[rajdhani] font-bold text-fifa-text-secondary text-xl leading-none mt-1">
                    {value}M
                  </Text>
                  <Text className="font-rajdhani text-[10px] text-fifa-text-muted mt-1">
                    {count} player{count === 1 ? "" : "s"}
                  </Text>
                </div>
              );
            })}
          </div>
        </Reveal>

        {viewMode === "list" ? (
          <div className="space-y-6">
            {players.length === 0 && (
              <Reveal>
                <div className="text-center py-16 text-fifa-text-muted">
                  No players in this squad yet.
                </div>
              </Reveal>
            )}

            {Object.entries(grouped).map(([pos, list]) => (
              <Reveal key={pos} delay={Math.min(POSITIONS.indexOf(pos) * 50, 300)}>
                <div className="bg-gradient-to-b from-fifa-elevated to-fifa-card border border-fifa-border rounded-3xl p-5 md:p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-fifa-accent animate-pulse-soft" />
                      <Text className="font-[orbitron] text-white text-lg">{pos}</Text>
                    </div>
                    <div className="flex items-center gap-3">
                      <Text className="font-rajdhani text-[10px] uppercase tracking-wider text-fifa-text-muted">
                        {list.length} player{list.length === 1 ? "" : "s"}
                      </Text>
                      <Text className="font-[rajdhani] font-bold text-fifa-text-secondary text-sm">
                        {groupedValues[pos]}M
                      </Text>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {list.map((p) => (
                      <div
                        key={p.id}
                        onClick={() =>
                          navigate("/player-details", {
                            state: { player: p },
                          })
                        }
                        className="group flex items-center gap-3 bg-fifa-surface/70 border border-fifa-border rounded-xl px-3 py-3 cursor-porajdhani hover:border-fifa-accent/40 transition-all duration-300"
                      >
                        <PlayerPhoto
                          playerId={p.playerId || p.id}
                          name={p.Name}
                          size="w-10 h-10"
                        />

                        <div className="flex-1 min-w-0">
                          <Text className="font-[rajdhani] font-semibold text-white text-lg truncate block group-hover:text-fifa-accent transition-colors">
                            {p.Name}
                          </Text>
                          <Text className="font-rajdhani text-[14px] text-fifa-text-muted">
                            {p.Position} · OVR {p.Overall}
                          </Text>
                        </div>

                        <div className="shrink-0 text-right">
                          <Text className="font-[rajdhani] text-[24px] font-bold text-fifa-text-secondary leading-none">
                            {p.soldPrice ?? "—"}M
                          </Text>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        ) : (
          <FieldView
            players={players}
            onPlayerClick={(player) =>
              navigate("/player-details", { state: { player } })
            }
          />
        )}
      </div>
    </div>
  );
};

export default DisplaySquad;
