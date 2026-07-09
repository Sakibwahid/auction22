import { Button } from "../components/ui/Button";
import { Text } from "../components/ui/Text";
import { Anchor } from "../components/ui/Anchor";
import { useAuth } from "../context/AuthContext";
import Loadin from "../components/ui/loadin";

const Home = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fifa-bg">
        <Loadin>Loading...</Loadin>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fifa-bg relative overflow-hidden">
      {/* ambient glow */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-[500px] h-[500px] bg-fifa-accent/10 rounded-full blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-[400px] h-[400px] bg-fifa-info/10 rounded-full blur-[120px]" />

      <div className="relative max-w-6xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-16 items-center min-h-screen">
        {/* Left column */}
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-fifa-accent animate-pulse" />
            <Text className="font-rajdhani font-medium text-[11px] uppercase tracking-[0.2em] text-fifa-accent">
              FIFA22 auction platform
            </Text>
          </div>

          <Text
            variant="heading"
            className="font-[orbitron] text-white text-4xl md:text-6xl leading-[1.05] tracking-tight"
          >
            Build your squad.<br />
            <span className="text-fifa-accent">Win the bid.</span>
          </Text>

          <Text
            variant="subheading"
            className="font-[rajdhani] font-normal text-fifa-text-secondary text-lg md:text-xl max-w-md"
          >
            Every player up for grabs. Set your budget, call your bids, and walk away with the squad nobody saw coming.
          </Text>

          {/* stat row */}
          <div className="flex gap-8 py-2">
            <div>
              <Text className="font-[rajdhani] font-semibold text-white text-2xl">240+</Text>
              <Text className="font-inter text-[10px] uppercase tracking-wider text-fifa-text-muted">Players Listed</Text>
            </div>
            <div className="w-px bg-fifa-border" />
            <div>
              <Text className="font-[rajdhani] font-semibold text-white text-2xl">Live</Text>
              <Text className="font-inter text-[10px] uppercase tracking-wider text-fifa-text-muted">Auctions Running</Text>
            </div>
            <div className="w-px bg-fifa-border" />
            <div>
              <Text className="font-[rajdhani] font-semibold text-white text-2xl">0%</Text>
              <Text className="font-inter text-[10px] uppercase tracking-wider text-fifa-text-muted">Platform Fee</Text>
            </div>
          </div>

          <div className="flex gap-3 mt-2">
            {!user ? (
              <Anchor to="/login">
                <Button size="md" className="rounded-xl">Login to begin</Button>
              </Anchor>
            ) : (
              <Anchor to="/user">
                <Button size="md" className="rounded-xl">Go to Dashboard</Button>
              </Anchor>
            )}
          </div>
        </div>

        {/* Right column: signature auction card */}
        <div className="flex justify-center md:justify-end">
          <div className="relative w-[280px] rotate-[4deg] hover:rotate-0 transition-transform duration-500">
            <div className="absolute inset-0 bg-fifa-accent/20 blur-2xl rounded-3xl scale-95" />

            <div className="relative bg-gradient-to-b from-fifa-elevated to-fifa-card border border-fifa-border rounded-2xl p-5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]">
              <div className="flex items-start justify-between">
                <div>
                  <Text className="font-[orbitron] text-fifa-accent text-3xl leading-none">91</Text>
                  <Text className="font-[rajdhani] font-medium text-fifa-text-secondary text-xs mt-1">ST</Text>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-fifa-danger mt-1 animate-pulse" />
              </div>

              <div className="mt-4 h-32 rounded-xl bg-fifa-surface border border-fifa-border/60 flex items-center justify-center">
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" className="text-fifa-text-muted">
                  <circle cx="12" cy="8" r="4" fill="currentColor" opacity="0.4" />
                  <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" fill="currentColor" opacity="0.4" />
                </svg>
              </div>

              <Text className="font-[rajdhani] font-semibold text-white text-lg mt-3">Unlisted Player</Text>
              <Text className="font-inter text-[10px] uppercase tracking-wider text-fifa-text-muted">Reserve · 500 credits</Text>

              <div className="mt-4 flex items-center justify-between bg-fifa-surface border border-fifa-border rounded-xl px-3 py-2">
                <div>
                  <Text className="font-inter text-[9px] uppercase tracking-wider text-fifa-text-muted">Current Bid</Text>
                  <Text className="font-[rajdhani] font-semibold text-fifa-accent text-lg leading-none">1,240</Text>
                </div>
                <Text className="font-[rajdhani] text-xs text-fifa-text-secondary">04:12 left</Text>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;