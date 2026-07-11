import React, { useEffect, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import PlayerCardDemo from "./PlayerCardDemo";

const PlayerList = ({ players = [], onPlayerClick, loading, scrollRef }) => {
  const [columns, setColumns] = useState(1);

  useEffect(() => {
    const el = scrollRef?.current;
    if (!el) return;

    const update = () => setColumns(el.clientWidth >= 1024 ? 2 : 1);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [scrollRef]);

  const rowCount = Math.ceil(players.length / columns);

  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scrollRef?.current ?? null,
    estimateSize: () => 140,
    overscan: 8,
  });

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
        style={{
          height: rowVirtualizer.getTotalSize(),
          position: "relative",
          width: "100%",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const start = virtualRow.index * columns;
          const rowPlayers = players.slice(start, start + columns);

          return (
            <div
              key={virtualRow.key}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`,
              }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start p-0.5"
            >
              {rowPlayers.map((player) => (
                <div key={player.ID} className="w-full min-w-0">
                  <PlayerCardDemo player={player} onClick={onPlayerClick} />
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlayerList;
