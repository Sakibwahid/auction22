// TournamentResults.jsx

import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import { db } from "../../lib/firebase/config";
import { Text } from "../ui/Text";
import { Button } from "../ui/Button";
import Loadin from "../ui/loadin";
import Reveal from "../ui/Reveal";
import CountUp from "../ui/CountUp";
import { Trophy, Clock } from "lucide-react";

const TEAM_SHORT_NAMES = {
  "Wolverhampton Wanderers F.C.": "Wolves",
  "FC Bayern Munich": "Bayern",
  "Manchester City F.C.": "Man City",
  "Paris Saint-Germain F.C.": "PSG",
  "Liverpool F.C.": "Liverpool",
};

const teamShort = (name) => TEAM_SHORT_NAMES[name] || name;

const POSITIONS = ["1st", "2nd", "3rd", "4th", "5th"];
const POINTS_FOR = { "1st": 3, "2nd": 2, "3rd": 1, "4th": 0, "5th": 0 };
const SEASONS = ["S3", "S4", "S5"];

const ACCENT = "linear-gradient(90deg, #B7FF2A, #95E600)";

function ClubLogo({ name, size = "w-10 h-10" }) {
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

const toDate = (createdAt) => {
  if (!createdAt) return null;
  return createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
};

const formatDate = (createdAt) => {
  const d = toDate(createdAt);
  if (!d) return "—";
  return d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const TournamentResults = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  const selectedSeason = useMemo(
    () => (SEASONS.includes(searchParams.get("season") || "") ? searchParams.get("season") : "S3"),
    [searchParams]
  );

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setLoading(true);

        const tournamentsRef = collection(
          db,
          "seasons",
          selectedSeason,
          "tournaments"
        );

        const snapshot = await getDocs(tournamentsRef);

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        data.sort((a, b) => {
          const da = toDate(a.createdAt)?.getTime() || 0;
          const db_ = toDate(b.createdAt)?.getTime() || 0;
          return db_ - da;
        });

        setTournaments(data);
      } catch (error) {
        console.error("Failed to fetch tournaments:", error);
      } finally {
        setLoading(false);
      }
    };
    console.log("Fetching tournaments for season:", tournaments);
    fetchTournaments();
  }, [selectedSeason]);

  const handleSeasonChange = (season) => {
    navigate(`/tournamentresults?season=${season}`);
  };

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
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-fifa-accent animate-pulse-soft" />
          <Text className="font-[rajdhani] font-medium text-[11px] uppercase tracking-[0.2em] text-fifa-accent">
            Tournament Results · {selectedSeason}
          </Text>
        </div>
        <Text
          variant="heading"
          className="font-[orbitron] text-white text-3xl md:text-5xl mt-3"
        >
          Per Tournament Results
        </Text>
      </Reveal>

      {/* SEASON SELECT + BACK */}
      <Reveal delay={80}>
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <label className="font-inter text-[10px] uppercase tracking-wider text-fifa-text-muted">
              Season
            </label>
            <select
              value={selectedSeason}
              onChange={(e) => handleSeasonChange(e.target.value)}
              className="bg-fifa-surface text-white px-3 py-3 rounded-xl border border-fifa-border focus:border-fifa-accent outline-none transition"
            >
              {SEASONS.map((season) => (
                <option key={season} value={season} className="bg-fifa-card">
                  {season}
                </option>
              ))}
            </select>
          </div>

          <Button
            size="md"
            onClick={() => navigate(location.pathname.replace("/tournamentresults", "/tournamentstats"))}
            className="w-auto"
          >
            ← Back to Standings
          </Button>
        </div>
      </Reveal>

      {/* SUMMARY */}
      <Reveal delay={160}>
        <div className="h-16 flex items-center gap-3 bg-fifa-surface/60 border border-fifa-border rounded-2xl px-4">
          <div className="w-9 h-9 rounded-lg bg-fifa-card border border-fifa-border flex items-center justify-center shrink-0">
            <Trophy size={16} className="text-fifa-accent" />
          </div>
          <div className="min-w-full grid grid-cols-2 gap-2 justify-between items-center">
            <div className="flex flex-col gap-0.5">
              <Text className="font-inter text-[10px] uppercase tracking-wider text-fifa-text-muted mt-1 block">
                Tournaments Logged
              </Text>
            </div>
            <Text className="text-center font-[orbitron] font-bold text-fifa-accent text-2xl">
              <CountUp end={tournaments.length} />
            </Text>
          </div>
        </div>
      </Reveal>

      {/* TOURNAMENTS */}
      <Reveal delay={240}>
        <Text
          variant="subheading"
          className="font-[rajdhani] font-semibold text-white text-lg mt-10 mb-4"
        >
          Results
        </Text>

        {tournaments.length === 0 ? (
          <div className="bg-fifa-surface/50 border border-fifa-border rounded-2xl p-12 text-center">
            <Clock size={32} className="mx-auto mb-3 text-fifa-text-muted" />
            <Text className="font-[rajdhani] font-semibold text-white text-lg">
              No tournaments yet
            </Text>
            <Text className="font-inter text-[11px] text-fifa-text-muted mt-1 block">
              Log a tournament from Update Tournament to see results here.
            </Text>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tournaments.map((t, i) => {
              const results = t.results || {};
              return (
                <Reveal key={t.id || i} delay={Math.min(i, 10) * 60}>
                  <div className="group border border-fifa-border bg-fifa-surface/50 rounded-2xl p-5 hover:border-fifa-accent/40 transition-all duration-300">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-fifa-card border border-fifa-border flex items-center justify-center shrink-0">
                          <Trophy size={14} className="text-fifa-accent" />
                        </div>
                        <Text className="font-[rajdhani] font-semibold text-white text-sm md:text-base">
                          Tournament {i + 1}
                        </Text>
                      </div>
                      <Text
                        className="font-inter text-[10px] uppercase tracking-wider text-fifa-text-muted text-right md:text-left"
                      >
                        {formatDate(t.createdAt)}
                      </Text>
                    </div>

                    <div className="grid grid-cols-5 gap-2.5">
                      {POSITIONS.map((pos) => {
                        const teamName =
                          Object.entries(results).find(([, p]) => p === pos)?.at(0) ||
                          "";
                        const short = teamName ? teamShort(teamName) : "—";
                        const hasTeam = Boolean(teamName);
                        return (
                          <div
                            key={pos}
                            className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border border-fifa-border/50 bg-fifa-card/40 group-hover:bg-fifa-surface group-hover:border-fifa-accent/30 transition-all text-center ${
                              pos === "1st"
                                ? "border-fifa-accent/30 bg-fifa-accent/5"
                                : pos === "2nd"
                                ? "border-white/10"
                                : pos === "3rd"
                                ? "border-fifa-warning/20"
                                : ""
                            }`}
                          >
                            <div className="w-9 h-9 rounded-full bg-fifa-surface border border-fifa-border flex items-center justify-center shrink-0 mb-0.5">
                              {hasTeam ? (
                                <ClubLogo name={teamName} size="w-7 h-7" />
                              ) : (
                                <span className="text-fifa-text-muted text-[9px]">—</span>
                              )}
                            </div>
                            <Text
                              className="font-[rajdhani] font-bold text-white text-xs truncate"
                              title={teamName || ""}
                            >
                              {short}
                            </Text>
                            <Text
                              className={`font-inter text-[9px] uppercase tracking-wider ${
                                pos === "1st"
                                  ? "text-fifa-accent font-bold"
                                  : pos === "2nd"
                                  ? "text-white/80"
                                  : pos === "3rd"
                                  ? "text-fifa-warning/90"
                                  : "text-fifa-text-muted"
                              }`}
                            >
                              {pos}
                            </Text>
                            {hasTeam && (
                              <Text className="font-[orbitron] text-[9px] text-fifa-text-muted">
                                {POINTS_FOR[pos]}pt
                              </Text>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        )}
      </Reveal>
    </div>
  );
};

export default TournamentResults;
