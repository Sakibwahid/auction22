// UpdateTournament.jsx

import { useState } from "react";
import {
  doc,
  increment,
  writeBatch,
  collection,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../../lib/firebase/config";

import { Text } from "../ui/Text";
import { Button } from "../ui/Button";
import Reveal from "../ui/Reveal";

import TournamentStats from "./TournamentStats";

const TEAM_META = {
  "Wolverhampton Wanderers F.C.": { short: "Wolves", logo: "/logos/Wolves.png" },
  "FC Bayern Munich": { short: "Bayern", logo: "/logos/Bayern.png" },
  "Manchester City F.C.": { short: "Man City", logo: "/logos/City.png" },
  "Paris Saint-Germain F.C.": { short: "PSG", logo: "/logos/PSG.png" },
  "Liverpool F.C.": { short: "Liverpool", logo: "/logos/Liverpool.png" },
};

const TEAMS = Object.keys(TEAM_META);

const POSITIONS = ["1st", "2nd", "3rd", "4th", "5th"];

const SEASONS = ["S3", "S4", "S5"];

const UpdateTournament = () => {
  const [placements, setPlacements] = useState({});
  const [selectedSeason, setSelectedSeason] = useState("S3");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // { type: "success" | "error", msg }
  const [refreshKey, setRefreshKey] = useState(0);

  const getStatsUpdate = (position) => {
    switch (position) {
      case "1st":
        return { totalPoints: increment(3), firstCount: increment(1) };
      case "2nd":
        return { totalPoints: increment(2), secondCounts: increment(1) };
      case "3rd":
        return { totalPoints: increment(1), thirdCount: increment(1) };
      case "4th":
      case "5th":
        return { zeroCounts: increment(1) };
      default:
        return {};
    }
  };

  const handleChange = (team, position) => {
    setPlacements((prev) => ({ ...prev, [team]: position }));
    setStatus(null);
  };

  const handleSeasonChange = (season) => {
    setSelectedSeason(season);
    setPlacements({}); // placements are season-specific
    setStatus(null);
  };

  const usedPositions = new Set(Object.values(placements));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Object.keys(placements).length !== TEAMS.length) {
      setStatus({ type: "error", msg: "Please assign a position to all teams." });
      return;
    }

    // Duplicate prevention is enforced in the UI, but guard anyway.
    if (usedPositions.size !== POSITIONS.length) {
      setStatus({ type: "error", msg: "Each position must be unique." });
      return;
    }

    setSubmitting(true);
    setStatus(null);

    try {
      const batch = writeBatch(db);

      TEAMS.forEach((team) => {
        const updates = getStatsUpdate(placements[team]);
        const standingsRef = doc(
          db,
          "seasons",
          selectedSeason,
          "standings",
          team
        );
        batch.set(standingsRef, updates, { merge: true });
      });

      const tournamentRef = doc(
        collection(db, "seasons", selectedSeason, "tournaments")
      );
      batch.set(tournamentRef, {
        season: selectedSeason,
        results: placements,
        createdAt: serverTimestamp(),
      });

      await batch.commit();

      setStatus({
        type: "success",
        msg: `${selectedSeason} tournament submitted successfully.`,
      });
      setPlacements({});
      setRefreshKey((k) => k + 1); // refresh stats on the right
    } catch (error) {
      console.error(error);
      setStatus({
        type: "error",
        msg: error?.message || "Failed to submit tournament.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetSeason = async () => {
    const confirmReset = window.confirm(
      `Reset all standings for ${selectedSeason}?`
    );
    if (!confirmReset) return;

    setSubmitting(true);
    setStatus(null);

    try {
      const batch = writeBatch(db);
      TEAMS.forEach((team) => {
        const standingsRef = doc(
          db,
          "seasons",
          selectedSeason,
          "standings",
          team
        );
        batch.set(
          standingsRef,
          {
            totalPoints: 0,
            firstCount: 0,
            secondCounts: 0,
            thirdCount: 0,
            zeroCounts: 0,
          },
          { merge: true }
        );
      });
      await batch.commit();
      setStatus({ type: "success", msg: `${selectedSeason} standings reset.` });
      setRefreshKey((k) => k + 1);
    } catch (error) {
      console.error(error);
      setStatus({ type: "error", msg: "Failed to reset standings." });
    } finally {
      setSubmitting(false);
    }
  };

  const assignedCount = Object.keys(placements).length;

  return (
    <div className="relative min-h-screen w-full bg-fifa-bg text-fifa-text overflow-hidden">
      {/* ambient glows */}
      <div className="pointer-events-none fixed -top-40 -left-40 w-[520px] h-[520px] bg-fifa-accent/10 rounded-full blur-[130px] animate-drift" />
      <div className="pointer-events-none fixed bottom-0 right-0 w-[460px] h-[460px] bg-fifa-info/10 rounded-full blur-[130px] animate-drift-slow" />

      <div className="relative w-full max-w-5xl mx-auto px-3 md:px-6 py-10 md:py-14 grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* LEFT — form */}
        <Reveal className="lg:col-span-1">
          <div className="bg-gradient-to-b from-fifa-elevated to-fifa-card border border-fifa-border rounded-3xl p-5 md:p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-fifa-accent animate-pulse-soft" />
              <Text className="font-[rajdhani] font-medium text-[11px] uppercase tracking-[0.2em] text-fifa-accent">
                Admin · Season
              </Text>
            </div>
            <Text
              variant="heading"
              className="font-[orbitron] text-white text-2xl md:text-3xl"
            >
              Update Tournament
            </Text>

            {/* SEASON SELECT */}
            <div className="mt-5">
              <label className="font-inter text-[10px] uppercase tracking-wider text-fifa-text-muted block mb-2">
                Season
              </label>
              <select
                value={selectedSeason}
                onChange={(e) => handleSeasonChange(e.target.value)}
                className="w-full bg-fifa-surface text-white px-3 py-3 rounded-xl border border-fifa-border focus:border-fifa-accent outline-none transition"
              >
                {SEASONS.map((season) => (
                  <option key={season} value={season} className="bg-fifa-card">
                    {season}
                  </option>
                ))}
              </select>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 mt-5">
              {TEAMS.map((team) => {
                const meta = TEAM_META[team];
                const current = placements[team] || "";
                return (
                  <div
                    key={team}
                    className="flex items-center justify-between gap-3 bg-fifa-surface/60 border border-fifa-border rounded-xl px-3 py-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={meta.logo}
                        alt={meta.short}
                        onError={(e) => (e.currentTarget.style.display = "none")}
                        className="w-7 h-7 rounded-full object-cover ring-2 ring-white/10 shrink-0"
                      />
                      <Text className="font-[rajdhani] font-semibold text-white text-sm truncate">
                        {meta.short}
                      </Text>
                    </div>

                    <select
                      value={current}
                      onChange={(e) => handleChange(team, e.target.value)}
                      className="min-w-[92px] bg-fifa-surface text-white px-3 py-2 rounded-lg border border-fifa-border focus:border-fifa-accent outline-none transition"
                      required
                    >
                      <option value="" disabled>
                        Position
                      </option>
                      {POSITIONS.map((pos) => {
                        const taken = usedPositions.has(pos) && pos !== current;
                        return (
                          <option
                            key={pos}
                            value={pos}
                            disabled={taken}
                            className="bg-fifa-card"
                          >
                            {pos}
                            {taken ? " (used)" : ""}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                );
              })}

              <div className="flex items-center justify-between pt-1">
                <Text className="font-inter text-[11px] text-fifa-text-muted">
                  Assigned{" "}
                  <span className="text-fifa-accent font-semibold">
                    {assignedCount}/{TEAMS.length}
                  </span>
                </Text>
              </div>

              {status && (
                <div
                  className={`text-sm rounded-xl px-4 py-3 border ${
                    status.type === "success"
                      ? "bg-fifa-success/10 text-fifa-success border-fifa-success/30"
                      : "bg-fifa-danger/10 text-fifa-danger border-fifa-danger/30"
                  }`}
                >
                  {status.msg}
                </div>
              )}

              <Button
                type="submit"
                size="md"
                disabled={submitting}
                className="w-full rounded-xl disabled:opacity-60"
              >
                {submitting ? "Submitting…" : "Submit Tournament"}
              </Button>

              <Button
                type="button"
                onClick={handleResetSeason}
                disabled={submitting}
                className="w-full rounded-xl border border-fifa-danger/30 bg-fifa-danger/10 text-fifa-danger hover:bg-fifa-danger/20 disabled:opacity-60"
              >
                Clear Season Records
              </Button>
            </form>
          </div>
        </Reveal>

        {/* RIGHT — stats */}
        <Reveal delay={120} className="lg:col-span-2">
          <TournamentStats
            key={refreshKey}
            selectedSeason={selectedSeason}
          />
        </Reveal>
      </div>
    </div>
  );
};

export default UpdateTournament;
