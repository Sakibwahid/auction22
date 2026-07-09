import React, { useState } from "react";
import { Text } from "../components/ui/Text";
import { Search } from "lucide-react";
import PlayerFilter from "../components/player/PlayerFilter";

const Players = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="min-h-screen bg-fifa-bg relative overflow-hidden">
      {/* ambient glow */}
      <div className="pointer-events-none fixed -top-40 left-1/4 w-[500px] h-[500px] bg-fifa-accent/20 rounded-full blur-[120px]" />


      <div className="relative max-w-6xl mx-auto px-4 py-14 md:py-20">
        {/* HERO */}
        <div className="flex flex-col items-center text-center gap-6 mb-12">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-fifa-accent animate-pulse" />
            <Text className="font-[rajdhani] font-medium text-[11px] uppercase tracking-[0.2em] text-fifa-accent">
              Player Market
            </Text>
          </div>

          <Text
            variant="heading"
            className="font-[orbitron] text-white text-4xl md:text-6xl leading-[1.05] tracking-tight"
          >
            Scout the <span className="text-fifa-accent">market.</span>
          </Text>

          <Text
            variant="subheading"
            className="font-[rajdhani] font-normal text-fifa-text-secondary text-lg md:text-xl max-w-lg"
          >
            Search by name, filter by position and rating, and lock in the player who completes your squad.
          </Text>

          {/* SEARCH BAR */}
          <div className="relative w-full max-w-lg mt-2">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-fifa-text-muted"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search players by name..."
              className="w-full font-inter text-sm text-white bg-fifa-card border border-fifa-border rounded-xl pl-11 pr-4 py-3.5 placeholder:text-fifa-text-muted focus:outline-none focus:border-fifa-accent/50 transition-colors"
            />
          </div>

          {/* STAT ROW */}
          <div className="flex gap-8 pt-2">
            <div className="flex flex-col gap-2">
              <Text className="font-[rajdhani] font-semibold text-white text-2xl">240+</Text>
              <Text className="font-inter text-[10px] uppercase tracking-wider text-fifa-text-muted">Players Listed</Text>
            </div>
            <div className="w-px bg-fifa-border" />
            <div className="flex flex-col gap-2">
              <Text className="font-[rajdhani] font-semibold text-white text-2xl">15</Text>
              <Text className="font-inter text-[10px] uppercase tracking-wider text-fifa-text-muted">Positions</Text>
            </div>
            <div className="w-px bg-fifa-border" />
            <div className="flex flex-col gap-2" >
              <Text className="font-[rajdhani] font-semibold text-white text-2xl">93</Text>
              <Text className="font-inter text-[10px] uppercase tracking-wider text-fifa-text-muted">Top Rating</Text>
            </div>
          </div>
        </div>

        {/* CONTENT PANEL */}
        <div className="bg-fifa-card/50 border border-fifa-border rounded-2xl p-4 md:p-6 min-h-[500px]">
          <PlayerFilter searchTerm={searchTerm} />
        </div>
      </div>
    </div>
  );
};

export default Players;