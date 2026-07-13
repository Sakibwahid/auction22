// TournamentStats.jsx

import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";

import { db } from "../../lib/firebase/config";
import { Text } from "../ui/Text";
import Loadin from "../ui/loadin";
import Reveal from "../ui/Reveal";
import CountUp from "../ui/CountUp";
import { Crown, Trophy, Medal, Percent } from "lucide-react";

const TEAM_SHORT_NAMES = {
  "Wolverhampton Wanderers F.C.": "Wolves",
  "FC Bayern Munich": "Bayern",
  "Manchester City F.C.": "Man City",
  "Paris Saint-Germain F.C.": "PSG",
  "Liverpool F.C.": "Liverpool",
};

const teamShort = (name) => TEAM_SHORT_NAMES[name] || name;

const sortTeams = (a, b) => {
  if ((b.totalPoints || 0) !== (a.totalPoints || 0))
    return (b.totalPoints || 0) - (a.totalPoints || 0);
  if ((b.firstCount || 0) !== (a.firstCount || 0))
    return (b.firstCount || 0) - (a.firstCount || 0);
  if ((b.secondCounts || 0) !== (a.secondCounts || 0))
    return (b.secondCounts || 0) - (a.secondCounts || 0);
  if ((b.thirdCount || 0) !== (a.thirdCount || 0))
    return (b.thirdCount || 0) - (a.thirdCount || 0);
  return (a.zeroCounts || 0) - (b.zeroCounts || 0);
};

const ACCENT = "linear-gradient(90deg, #B7FF2A, #95E600)";

/* Small club logo with monogram fallback */
function ClubLogo({ name, size = "w-11 h-11" }) {
  const short = teamShort(name);
  const [failed, setFailed] = useState(false);

  if (!name) {
    return (
      <span className={`${size} rounded-full bg-fifa-surface border border-fifa-border flex items-center justify-center font-[orbitron] font-bold text-fifa-accent text-xs shrink-0`}>
        —
      </span>
    );
  }

  if (!failed) {
    return (
      <img
        src={`/logos/${short}.png`}
        alt={short}
        onError={() => setFailed(true)}
        className={`${size} rounded-full object-cover ring-2 ring-white/10 shrink-0`}
      />
    );
  }

  return (
    <span className={`${size} rounded-full bg-fifa-surface border border-fifa-border flex items-center justify-center font-[orbitron] font-bold text-fifa-accent text-xs shrink-0`}>
      {short.slice(0, 3).toUpperCase()}
    </span>
  );
}

const TournamentStats = ({ selectedSeason = "S3" }) => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);

        const standingsRef = collection(
          db,
          "seasons",
          selectedSeason,
          "standings"
        );

        const snapshot = await getDocs(standingsRef);

        const data = snapshot.docs.map((doc) => ({
          name: doc.id,
          ...doc.data(),
        }));

        data.sort(sortTeams);

        setTeams(data);
      } catch (error) {
        console.error("Failed to fetch standings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [selectedSeason]);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 120);
    return () => clearTimeout(t);
  }, []);

  const stats = useMemo(() => {
    const count = teams.length;
    const totalPoints = teams.reduce(
      (s, t) => s + (t.totalPoints || 0),
      0
    );
    const mostFirst = Math.max(...teams.map((t) => t.firstCount || 0), 0);
    const mostZero = Math.max(...teams.map((t) => t.zeroCounts || 0), 0);
    const maxPoints = Math.max(...teams.map((t) => t.totalPoints || 0), 1);
    const totalTournaments = Math.round(totalPoints / 6);
    const finalsWonTeam = count
      ? teams.reduce(
          (b, t) => ((t.firstCount || 0) > (b.firstCount || 0) ? t : b),
          teams[0]
        ).name
      : null;
    const finalsPlayedTeam = count
      ? teams.reduce(
          (b, t) =>
            (t.firstCount || 0) + (t.secondCounts || 0) >
            (b.firstCount || 0) + (b.secondCounts || 0)
              ? t
              : b,
          teams[0]
        ).name
      : null;
    const bestRateTeam = count
      ? teams.reduce(
          (b, t) => {
            const ba = (b.firstCount || 0) + (b.secondCounts || 0);
            const bb = (t.firstCount || 0) + (t.secondCounts || 0);
            const rb = ba ? (b.firstCount || 0) / ba : -1;
            const rt = bb ? (t.firstCount || 0) / bb : -1;
            return rt > rb ? t : b;
          },
          teams[0]
        ).name
      : null;
    const bestRate = (() => {
      if (!bestRateTeam) return 0;
      const t = teams.find((x) => x.name === bestRateTeam);
      const denom = (t.firstCount || 0) + (t.secondCounts || 0);
      return denom ? Math.round(((t.firstCount || 0) / denom) * 100) : 0;
    })();
    const finalsWon = count
      ? Math.max(...teams.map((t) => t.firstCount || 0), 0)
      : 0;
    const finalsPlayed = count
      ? Math.max(
          ...teams.map((t) => (t.firstCount || 0) + (t.secondCounts || 0)),
          0
        )
      : 0;
    return {
      count,
      totalPoints,
      mostFirst,
      mostZero,
      maxPoints,
      totalTournaments,
      finalsWonTeam,
      finalsPlayedTeam,
      bestRateTeam,
      bestRate,
      finalsWon,
      finalsPlayed,
    };
  }, [teams]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loadin>Where you at!</Loadin>
      </div>
    );
  }

  return (
    <div className="relative w-full border border-fifa-border bg-gradient-to-b from-fifa-elevated/50 to-fifa-card/40 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] p-5 md:p-8 overflow-hidden">
      {/* ambient glows */}
      <div className="pointer-events-none fixed -top-40 -left-40 w-[500px] h-[500px] bg-fifa-accent/40 rounded-full blur-[130px] animate-drift" />
      <div className="pointer-events-none fixed bottom-0 right-0 w-[460px] h-[460px] bg-fifa-info/10 rounded-full blur-[130px] animate-drift-slow" />

      {/* HEADER */}
      <Reveal>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-fifa-accent animate-pulse-soft" />
          <Text className="font-[rajdhani] font-medium text-[11px] uppercase tracking-[0.2em] text-fifa-accent">
            League Table · {selectedSeason}
          </Text>
        </div>
        <Text
          variant="heading"
          className="font-[orbitron] text-white text-3xl md:text-5xl mt-3"
        >
          Tournament Standings
        </Text>
      </Reveal>

      {/* SUMMARY — full-width horizontal cards */}
      <div className="flex flex-col gap-3 mt-7">
        {[
          {
            label: "Total Tournaments Played",
            value: stats.totalTournaments,
            icon: Trophy,
          },
          {
            label: "Most Finals Won",
            value: stats.finalsWon,
            team: stats.finalsWonTeam,
            icon: Crown,
          },
          {
            label: "Most Finals Played",
            value: stats.finalsPlayed,
            team: stats.finalsPlayedTeam,
            icon: Medal,
          },
          {
            label: "Final Win Rate",
            value: stats.bestRate,
            suffix: "%",
            team: stats.bestRateTeam,
            icon: Percent,
          },
        ].map((s, i) => (
          <Reveal key={s.label} delay={i * 80}>
            <div className="h-20 flex flex-row items-center gap-3 bg-fifa-surface/60 border border-fifa-border rounded-2xl px-4">
              <div className="w-9 h-9 rounded-lg bg-fifa-card border border-fifa-border flex items-center justify-center shrink-0">
                <s.icon size={16} className="text-fifa-accent" />
              </div>
              <div className="min-w-full grid grid-cols-2 gap-2 justify-between items-center">

                <div className="flex flex-col gap-0.5">
                {s.team && (
                  <Text className="font-[rajdhani] font-semibold text-fifa-text text-[18px] mt-0.5 truncate">
                    {teamShort(s.team)}
                  </Text>
                )}
                <Text className="font-inter text-[10px] uppercase tracking-wider text-fifa-text-muted mt-1 block">
                  {s.label}
                </Text>
                </div>

                <Text className="text-center font-[orbitron] font-bold text-fifa-accent text-2xl">
                  <CountUp end={s.value} suffix={s.suffix || ""} />
                </Text>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* FULL STANDINGS */}
      <Reveal delay={120}>
        <Text
          variant="subheading"
          className="font-[rajdhani] font-semibold text-white text-lg mt-9 mb-3"
        >
          Full Standings
        </Text>

        <div className="flex flex-col gap-2">
          {teams.map((team, i) => {
            const pct = Math.max(
              ((team.totalPoints || 0) / stats.maxPoints) * 100,
              4
            );
            return (
              <Reveal key={team.name} delay={Math.min(i, 10) * 50}>
                <div className="group flex items-center gap-4 bg-fifa-surface/50 border border-fifa-border rounded-xl px-4 py-4 hover:border-fifa-accent/40 transition-all duration-300">
                  <ClubLogo name={team.name} />

                  <div className="flex-1 min-w-0">
                    <Text className="font-[rajdhani] font-bold text-white text-[24px] md:text-xl truncate">
                      {teamShort(team.name)}
                    </Text>
                    <div className="flex gap-x-4 gap-y-1 text-xs uppercase tracking-wider text-fifa-text-muted">
                      <span className="text-center">
                        1st <b className="text-white">{team.firstCount || 0}</b>
                      </span>
                      <span className="text-center">
                        2nd <b className="text-white">{team.secondCounts || 0}</b>
                      </span>
                      <span className="text-center">
                        3rd <b className="text-white">{team.thirdCount || 0}</b>
                      </span>
                      <span className="text-center">
                        0 <b className="text-white">{team.zeroCounts || 0}</b>
                      </span>
                    </div>
                  </div>

                  {/* points bar — accent color */}
                  <div className="hidden sm:block w-32 shrink-0">
                    <div className="h-2 rounded-full bg-fifa-surface overflow-hidden">
                      <div
                        className="h-full rounded-full transition-[width] duration-700 ease-out"
                        style={{
                          width: mounted ? `${pct}%` : "0%",
                          background: ACCENT,
                          transitionDelay: `${Math.min(i, 10) * 40}ms`,
                        }}
                      />
                    </div>
                  </div>

                  <Text className="w-16 text-right font-[orbitron] font-bold text-fifa-accent text-xl shrink-0">
                    <CountUp end={team.totalPoints || 0} />
                  </Text>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Reveal>

      {/* BAR CHART — accent color, fits mobile */}
      <Reveal delay={120}>
        <Text
          variant="subheading"
          className="font-[rajdhani] font-semibold text-white text-lg mt-9 mb-4"
        >
          Points Distribution
        </Text>

        <div className="relative w-full">
          <div className="flex items-end gap-2 sm:gap-4 min-h-[220px] px-1 pb-2">
            {teams.map((team, i) => {
              const height = mounted
                ? ((team.totalPoints || 0) / stats.maxPoints) * 100
                : 0;
              return (
                <div
                  key={team.name}
                  className="flex flex-1 min-w-0 flex-col items-center justify-end gap-2"
                >
                  <span className="font-[orbitron] font-bold text-white/90 text-sm">
                    <CountUp end={team.totalPoints || 0} />
                  </span>
                  <div className="relative w-full h-48 bg-fifa-surface/60 rounded-t-lg overflow-hidden border border-fifa-border">
                    <div
                      className="absolute bottom-0 w-full transition-[height] duration-700 ease-out"
                      style={{
                        height: `${height}%`,
                        background:
                          "linear-gradient(180deg, #B7FF2A, #95E600)",
                        boxShadow: "0 0 18px #B7FF2A66",
                        transitionDelay: `${i * 50}ms`,
                      }}
                    />
                  </div>
                  <span
                    className="text-xs text-white/80 truncate max-w-full text-center"
                    title={team.name}
                  >
                    {teamShort(team.name)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Reveal>
    </div>
  );
};

export default TournamentStats;
