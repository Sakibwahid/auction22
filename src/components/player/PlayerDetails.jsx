import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Text } from "../ui/Text";
import Stats from "../ui/Stats";
import {
  Zap,
  Target,
  Send,
  Sparkles,
  ShieldHalf,
  Dumbbell,
  Hand,
} from "lucide-react";

const STAT_GROUPS = [
  {
    label: "Pace",
    icon: Zap,
    stats: [
      { key: "SprintSpeed", label: "Sprint Speed" },
      { key: "Stamina", label: "Stamina" },
    ],
  },
  {
    label: "Shooting",
    icon: Target,
    stats: [
      { key: "Finishing", label: "Finishing" },
      { key: "ShotPower", label: "Shot Power" },
      { key: "LongShots", label: "Long Shots" },
      { key: "HeadingAccuracy", label: "Heading Accuracy" },
    ],
  },
  {
    label: "Passing",
    icon: Send,
    stats: [
      { key: "ShortPassing", label: "Short Passing" },
      { key: "Crossing", label: "Crossing" },
    ],
  },
  {
    label: "Skill",
    icon: Sparkles,
    stats: [
      { key: "Dribbling", label: "Dribbling" },
      { key: "BallControl", label: "Ball Control" },
    ],
  },
  {
    label: "Defending",
    icon: ShieldHalf,
    stats: [
      { key: "Marking", label: "Marking" },
      { key: "StandingTackle", label: "Standing Tackle" },
      { key: "SlidingTackle", label: "Sliding Tackle" },
    ],
  },
  {
    label: "Physical",
    icon: Dumbbell,
    stats: [{ key: "Strength", label: "Strength" }],
  },
  {
    label: "Goalkeeping",
    icon: Hand,
    stats: [
      { key: "GKDiving", label: "Diving" },
      { key: "GKHandling", label: "Handling" },
      { key: "GKKicking", label: "Kicking" },
      { key: "GKPositioning", label: "Positioning" },
      { key: "GKReflexes", label: "Reflexes" },
    ],
  },
];

const PlayerDetails = () => {
  const location = useLocation();
  const [player, setPlayer] = useState(
    () =>
      JSON.parse(localStorage.getItem("player")) ||
      location.state?.player ||
      null
  );
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    if (location.state?.player) {
      localStorage.setItem("player", JSON.stringify(location.state.player));
      setPlayer(location.state.player);
    }
  }, [location.state]);

  if (!player) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fifa-bg px-6">
        <Text className="font-inter text-fifa-text-muted text-sm">
          Player not found.
        </Text>
      </div>
    );
  }

  const infoFields = [
    { label: "Nationality", value: player.Nationality },
    { label: "Club", value: player.Club },
    { label: "Age", value: player.Age },
    { label: "Height", value: player.Height },
  ];

  return (
    <div className="min-h-screen w-full bg-fifa-bg relative overflow-hidden">
      {/* ambient glow */}
      <div className="pointer-events-none  fixed -top-32 left-1/2 -translate-x-1/2 min-w-full h-[420px] bg-fifa-accent/40 rounded-full blur-[120px]" />

      <div className="relative w-full max-w-3xl mx-auto px-3 py-6 md:py-12 pb-16">
        {/* IDENTITY CARD */}
        <div className="bg-fifa-card border border-fifa-border rounded-2xl overflow-hidden">
          {/* photo + name */}
          <div className=" flex w-full justify-between items-center pt-8 pb-6 px-6 bg-linear-to-b from-fifa-elevated to-fifa-card">

          <div className="flex flex-col items- flex-1">
             <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden border border-fifa-border bg-fifa-surface shrink-0">
              {!imgFailed ? (
                <img
                  src={`/player_photos/${player.ID}.png`}
                  alt={player.Name}
                  className="w-full h-full object-cover object-top"
                  onError={() => setImgFailed(true)}
                />
              ) : (
                <div className="w-full h-full flex justify-center">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className="text-fifa-text-muted">
                    <circle cx="12" cy="8" r="4" fill="currentColor" opacity="0.3" />
                    <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" fill="currentColor" opacity="0.3" />
                  </svg>
                </div>
              )}
            </div>
            <Text
              variant="subheading"
              className="font-[rajdhani] font-semibold text-white text-2xl md:text-3xl  mt-4 leading-tight"
            >
              {player.Name}
            </Text>
          </div>
            
          <div className="flex flex-col items-center gap-2">
            <div className="flex flex-col items-center bg-fifa-surface border border-fifa-border rounded-xl px-3 py-1.5">
              <Text className="font-[orbitron] text-fifa-accent text-lg font-bold leading-none">
                {player.Overall}
              </Text>
              <Text className="font-inter text-[8px] uppercase tracking-wider text-fifa-text-muted mt-0.5">
                OVR
              </Text>
            </div>
         
            <span className="mt-2 font-inter text-[11px] font-medium uppercase tracking-wider text-fifa-text-secondary border border-fifa-border rounded-full px-3 py-1">
              {player.Position}
            </span>
            </div>
          </div>

          {/* info grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-fifa-border">
            {infoFields.map(({ label, value }) => (
              <div key={label} className="bg-fifa-card px-2 py-3.5 text-center">
                <Text className="font-inter text-[9px] uppercase tracking-wider text-fifa-text-muted block">
                  {label}
                </Text>
                <Text className="font-[rajdhani] font-medium text-white text-sm mt-1 block truncate">
                  {value ?? "—"}
                </Text>
              </div>
            ))}
          </div>
        </div>

        {/* STAT GROUPS */}
        <div className="mt-5 grid grid-cols-1 gap-3">
          {STAT_GROUPS.map((group) => {
            const visibleStats = group.stats.filter(
              ({ key }) => player[key] !== undefined && !isNaN(player[key])
            );

            if (!visibleStats.length) return null;

            const Icon = group.icon;

            return (
              <div
                key={group.label}
                className="bg-fifa-card border border-fifa-border rounded-2xl p-4 md:p-5 flex flex-col gap-2"
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg bg-fifa-surface border border-fifa-border flex items-center justify-center shrink-0">
                    <Icon size={14} className="text-fifa-accent" />
                  </div>
                  <Text className="font-inter text-[11px] font-medium uppercase tracking-wider text-fifa-text-secondary">
                    {group.label}
                  </Text>
                </div>

                <div className="flex flex-col gap-3">
                  {visibleStats.map(({ key, label }) => (
                    <Stats key={key} width={player[key]} label={label} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PlayerDetails;