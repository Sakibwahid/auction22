import React, { useState } from "react";
import { Text } from "../ui/Text";

const PlayerCardDemo = ({ player, onClick }) => {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div
      onClick={() => onClick?.(player)}
      className={`
        w-full max-w-full
        rounded-xl
        border border-fifa-accent/20
        bg-fifa-card
        overflow-hidden
        transition-colors duration-200
        ${onClick ? "cursor-pointer hover:bg-fifa-elevated" : ""}
      `}
    >
      <div className="flex items-stretch w-full min-w-0">
        {/* ZONE 1 — IDENTITY */}
        <div className="flex flex-col gap-3 items-center px-2 py-3 min-w-0 flex-[1.3]">
          <div className="w-20 h-20 rounded-xl bg-fifa-surface border border-fifa-accent overflow-hidden shrink-0">
            {!imgFailed ? (
              <img
                src={`/player_photos/${player.ID}.png`}
                alt={player.Name}
                className="w-full h-full object-cover object-top"
                loading="lazy"
                decoding="async"
                onError={() => setImgFailed(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" className="text-fifa-text-muted">
                  <circle cx="12" cy="8" r="4" fill="currentColor" opacity="0.3" />
                  <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" fill="currentColor" opacity="0.3" />
                </svg>
              </div>
            )}
          </div>

          <Text
            variant="subheading"
            className="font-[rajdhani] font-semibold text-white text-xl leading-[1.1] tracking-tight truncate min-w-0"
          >
            {player.Name}
          </Text>
        </div>

        {/* DIVIDER */}
        <div className="w-px shrink-0 bg-fifa-border" />

        {/* ZONE 2 — OVR STUB */}
        <div className="flex flex-col items-center justify-center gap-1 px-3 py-4 shrink-0 bg-fifa-surface/40">
          <Text className="font-[orbitron] text-lg font-bold text-fifa-accent leading-none">
            {player.Overall}
          </Text>
          <Text className="font-inter text-[10px] font-medium uppercase tracking-wider text-fifa-text-secondary leading-none">
            {player.Position}
          </Text>
        </div>

        {/* DIVIDER */}
        <div className="w-px shrink-0 bg-fifa-border" />

        {/* ZONE 3 — STATS, 2 rows x 3 cols */}
        <div className="flex-[1.2] min-w-0 grid grid-cols-3 grid-rows-3 gap-x-2 gap-y-0 items-center py-4">
          <Stat label="PAC" value={player.Acceleration} />
          <Stat label="SHO" value={player.ShotPower} />
          <Stat label="PAS" value={player.ShortPassing} />
          <Stat label="DRI" value={player.Dribbling} />
          <Stat label="DEF" value={player.StandingTackle} />
          <Stat label="PHY" value={player.Strength} />
          <Stat label="GKH" value={player.GKHandling} />
          <Stat label="GKP" value={player.GKPositioning} />
          <Stat label="GKR" value={player.GKReflexes} />
        </div>
      </div>
    </div>
  );
};

const Stat = ({ label, value }) => (
  <div className="flex flex-col items-center justify-center min-w-0">
    <Text className="font-inter text-[9px] uppercase tracking-wider text-fifa-text-muted leading-none">
      {label}
    </Text>
    <Text className="mt-1 font-[rajdhani] font-bold text-sm text-fifa-text-secondary leading-none">
      {value ?? "-"}
    </Text>
  </div>
);

export default React.memo(PlayerCardDemo);