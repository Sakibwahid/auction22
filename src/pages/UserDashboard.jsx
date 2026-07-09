import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  onSnapshot,
  collection,
} from "firebase/firestore";

import { db } from "../lib/firebase/config";
import { useAuth } from "../context/AuthContext";

import { Anchor } from "../components/ui/Anchor";
import { Text } from "../components/ui/Text";
import Loadin from "../components/ui/loadin";

import { Trophy, BarChart3, Users, Hammer, Crown,} from "lucide-react";

const TEAMS_CACHE_KEY = "teams_cache_v1";
const CACHE_MAX_AGE_MS = 1000 * 60 * 5;

const renameMap = {
  City: "Manchester City F.C.",
  ManU: "Manchester United F.C.",
  Bayern: "FC Bayern Munich",
  Liverpool: "Liverpool F.C.",
  Wolves: "Wolverhampton Wanderers F.C.",
};

const shortMap = Object.fromEntries(
  Object.entries(renameMap).map(([k, v]) => [v, k])
);

const UserDashboard = () => {
  const navigate = useNavigate();
  const { userData, loading: authLoading } = useAuth();

  const [teams, setTeams] = useState([]);
  const [initialLoad, setInitialLoad] = useState(true);

  /* ---------------- AUTH GUARD ---------------- */
  useEffect(() => {
    if (!authLoading && !userData) {
      navigate("/login");
    }
  }, [authLoading, userData, navigate]);

  /* ---------------- LOAD CACHE FIRST ---------------- */
  useEffect(() => {
    try {
      const cached = localStorage.getItem(TEAMS_CACHE_KEY);

      if (cached) {
        const parsed = JSON.parse(cached);

        if (
          parsed?.data &&
          Date.now() - parsed.savedAt < CACHE_MAX_AGE_MS
        ) {
          setTeams(parsed.data);
          setInitialLoad(false);
        }
      }
    } catch {
      localStorage.removeItem(TEAMS_CACHE_KEY);
    }
  }, []);

  /* ---------------- REALTIME FIRESTORE ---------------- */
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "teams"),
      async (snapshot) => {
        try {
          const resolvedTeams = await Promise.all(
            snapshot.docs.map(async (docSnap) => {
              let docId = docSnap.id;
              let data = docSnap.data();

              if (renameMap[docId]) {
                const fullName = renameMap[docId];

                const fullSnap = await getDoc(
                  doc(db, "teams", fullName)
                );

                if (fullSnap.exists()) {
                  docId = fullName;
                  data = fullSnap.data();
                }
              }

              return { name: docId, ...data };
            })
          );

          resolvedTeams.sort((a, b) => {
            if ((b.totalPoints || 0) !== (a.totalPoints || 0)) {
              return b.totalPoints - a.totalPoints;
            }

            if ((b.firstCount || 0) !== (a.firstCount || 0)) {
              return b.firstCount - a.firstCount;
            }

            return (b.secondCounts || 0) - (a.secondCounts || 0);
          });

          setTeams(resolvedTeams);

          localStorage.setItem(
            TEAMS_CACHE_KEY,
            JSON.stringify({
              data: resolvedTeams,
              savedAt: Date.now(),
            })
          );

          if (initialLoad) setInitialLoad(false);
        } catch (err) {
          console.error("Teams snapshot error:", err);
        }
      }
    );

    return () => unsubscribe();
  }, [initialLoad]);

  /* ---------------- DERIVED VALUES ---------------- */
  const teamNameShort = useMemo(() => {
    if (!userData) return "City";
    return shortMap[userData.teamName] || "City";
  }, [userData]);

  const userRank = useMemo(() => {
    return teams.findIndex((t) => t.name === teamNameShort) + 1;
  }, [teams, teamNameShort]);

  const userPoints = useMemo(() => {
    return (
      teams.find((t) => t.name === teamNameShort)?.totalPoints || 0
    );
  }, [teams, teamNameShort]);

  /* ---------------- LOADING LOGIC (FIXED) ---------------- */
  if (authLoading || (!userData && initialLoad)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fifa-bg">
        <Loadin>Loading dashboard...</Loadin>
      </div>
    );
  }

  const actionTiles = [
    { to: "/auction", label: "Enter Auction", sub: "Bid live", Icon: Trophy },
    { to: "/players", label: "Browse Players", sub: "Find your next star", Icon: Users },
    { to: "/tournamentstats", label: "Tournament Stats", sub: "League table", Icon: BarChart3 },
    { to: "/user/squad", label: "Your Squad", sub: "View roster", Icon: Users },
    { to: "/user/buildsquad", label: "Build Squad", sub: "Set formation", Icon: Hammer },
  ];

  return (
    <div className="min-h-screen w-full text-white flex justify-center px-4 py-10 bg-fifa-bg relative overflow-hidden">
      <div className="pointer-events-none fixed -top-40 right-0 w-[420px] h-[420px] bg-fifa-accent/30 rounded-full blur-[120px]" />
       
      <div className="relative w-full max-w-4xl space-y-6">
            <Text variant="heading" className="text-center">
              Welcome Back!
            </Text>
        {/* MANAGER CARD */}
        <div className="relative bg-fifa-card border border-fifa-border rounded-2xl p-6 md:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-fifa-accent" />

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-fifa-surface border border-fifa-border flex items-center justify-center shrink-0">
                <Text className="font-[orbitron] text-fifa-accent text-xl">
                  {userData.username?.[0]?.toUpperCase() || "?"}
                </Text>
              </div>

              <div className="flex flex-col">
                <Text
                  variant="heading"
                  className="font-[orbitron] text-2xl md:text-3xl tracking-tight text-white"
                >
                  {userData.username}
                </Text>

                <Text variant="para" className="font-inter text-fifa-text-secondary text-sm mt-1">
                  {userData.teamName}
                </Text>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1 md:flex-none bg-fifa-surface border border-fifa-border rounded-xl px-5 py-3 text-center min-w-[100px]">
                <Text className="font-[rajdhani] font-semibold text-fifa-accent text-2xl leading-none">
                  {userPoints}
                </Text>
                <Text className="font-inter text-[10px] uppercase tracking-wider text-fifa-text-muted mt-1 block">
                  Points
                </Text>
              </div>

              <div className="flex-1 md:flex-none bg-fifa-surface border border-fifa-border rounded-xl px-5 py-3 text-center min-w-[100px]">
                <div className="flex items-center justify-center gap-1">
                  {userRank === 1 && <Crown size={16} className="text-fifa-warning" />}
                  <Text className="font-[rajdhani] font-semibold text-white text-2xl leading-none">
                    #{userRank || "—"}
                  </Text>
                </div>
                <Text className="font-inter text-[10px] uppercase tracking-wider text-fifa-text-muted mt-1 block">
                  Rank
                </Text>
              </div>
            </div>
          </div>
        </div>

        {/* ACTION PANEL */}
        <div className="bg-fifa-card border border-fifa-border rounded-2xl p-6 md:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]">
          <Text className="font-inter text-[10px] uppercase tracking-[0.2em] text-fifa-text-muted mb-6 block text-center">
            What would you like to do?
          </Text>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {actionTiles.map(({ to, label, sub, Icon }) => (
              <Anchor to={to} key={to}>
                <div className="group cursor-pointer bg-fifa-surface border border-fifa-border rounded-xl px-5 py-4 flex items-center gap-4 transition-all hover:border-fifa-accent/50 hover:bg-fifa-elevated">
                  <div className="w-10 h-10 rounded-lg bg-fifa-card border border-fifa-border flex items-center justify-center shrink-0 group-hover:border-fifa-accent/60">
                    <Icon size={18} className="text-fifa-accent" />
                  </div>

                  <div className="flex flex-col">
                    <Text className="font-[rajdhani] font-semibold text-white text-base">
                      {label}
                    </Text>
                    <Text className="font-inter text-fifa-text-muted text-xs">
                      {sub}
                    </Text>
                  </div>
                </div>
              </Anchor>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserDashboard;