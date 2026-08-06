import React from "react";
import { Text } from "../components/ui/Text";
import PlayerFilter from "../components/player/PlayerFilter";

const PlayerTest = () => {
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
              Player Test
            </Text>
          </div>

          <Text
            variant="heading"
            className="font-[orbitron] text-white text-4xl md:text-6xl leading-[1.05] tracking-tight"
          >
            Test <span className="text-fifa-accent">roster.</span>
          </Text>

          <Text
            variant="subheading"
            className="font-[rajdhani] font-normal text-fifa-text-secondary text-lg md:text-xl max-w-lg"
          >
            Fetch and inspect players from the testing collection. Filter by position and rating.
          </Text>
        </div>

        {/* CONTENT PANEL */}
        <div className="bg-fifa-card/50 border border-fifa-border rounded-2xl p-4 md:p-6 min-h-[500px]">
          <PlayerFilter
            collectionName="players_test"
            cacheKey="player_test_filter_cache"
          />
        </div>
      </div>
    </div>
  );
};

export default PlayerTest;
