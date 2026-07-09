import React from "react";
import PlayerCardDemo from "./PlayerCardDemo";

const PlayerList = ({ players = [], onPlayerClick, loading }) => {
  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-16">
        <p className="text-sm text-white/40 tracking-wide">
          Loading players...
        </p>
      </div>
    );
  }

  if (!players.length) {
    return (
      <div className="w-full flex items-center justify-center py-16">
        <p className="text-sm text-white/30 tracking-wide text-center">
          No players found. Select a category.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* FIXED CENTER GLOW */}
      <div
        className="
          fixed
          top-1/2 left-1/2
          -translate-x-1/2 -translate-y-1/2
          w-[600px] h-[600px]
          bg-fifa-accent/10
          rounded-full
          blur-[140px]
          pointer-events-none
          z-0
        "
      />

      <div
        className="
          relative z-10
          w-full
          grid grid-cols-1
          xl:grid-cols-2
          gap-3
          items-start
        "
      >
        {players.map((player) => (
          <div key={player.ID} className="w-full min-w-0">
            <PlayerCardDemo
              player={player}
              onClick={onPlayerClick}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerList;