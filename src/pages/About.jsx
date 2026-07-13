import React, { useEffect, useRef, useState } from "react";
import { Text } from "../components/ui/Text";
import { Button } from "../components/ui/Button";
import { Anchor } from "../components/ui/Anchor";
import {
  Trophy,
  Radio,
  Users,
  Hammer,
  BarChart3,
  Shield,
  Wallet,
  Gavel,
  Zap,
  Target,
  Crown,
  Sparkles,
  ArrowRight,
  ChevronDown,
  Search,
  Flag,
} from "lucide-react";
import Reveal from "../components/ui/Reveal";
import CountUp from "../components/ui/CountUp";

/* ─────────────────────────────────────────
   Small section eyebrow label (matches Home)
───────────────────────────────────────── */
function Eyebrow({ children }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-fifa-accent animate-pulse-soft" />
      <Text className="font-[rajdhani] font-medium text-[11px] uppercase tracking-[0.2em] text-fifa-accent">
        {children}
      </Text>
    </div>
  );
}

const FEATURES = [
  {
    Icon: Radio,
    title: "Live Auctions",
    desc: "Real-time bidding rooms powered by Firebase — every bid lands the instant a manager calls it.",
  },
  {
    Icon: Search,
    title: "Player Market",
    desc: "Scout 240+ players with full FIFA-style stat cards across pace, shooting, defending and more.",
  },
  {
    Icon: Hammer,
    title: "Squad Building",
    desc: "Lay out your formation, lock your XI, and shape the roster nobody saw coming.",
  },
  {
    Icon: BarChart3,
    title: "Tournament Stats",
    desc: "A live league table of points, ranks and titles as the season unfolds.",
  },
  {
    Icon: Shield,
    title: "Club Rivalry",
    desc: "Five iconic clubs battle for bragging rights, players and the top of the table.",
  },
  {
    Icon: Wallet,
    title: "Zero Platform Fee",
    desc: "Every credit you win is yours. No cuts, no hidden costs — pure auction.",
  },
];

const STEPS = [
  {
    Icon: Users,
    title: "Create your manager",
    desc: "Sign up and claim your seat at the table.",
  },
  {
    Icon: Flag,
    title: "Join a club",
    desc: "Pledge to one of five competing teams.",
  },
  {
    Icon: Gavel,
    title: "Enter the auction",
    desc: "Step into the live room as players go under the hammer.",
  },
  {
    Icon: Zap,
    title: "Bid in real time",
    desc: "Outbid rivals before the clock runs out.",
  },
  {
    Icon: Crown,
    title: "Build & win",
    desc: "Assemble your squad and climb the leaderboard.",
  },
];

const TEAMS = [
  { name: "Wolves", color: "#FDB913", code: "WOL", logo: "/logos/Wolves.png" },
  {
    name: "Bayern Munich",
    color: "#DC052D",
    code: "BAY",
    logo: "/logos/Bayern.png",
  },
  {
    name: "Manchester City",
    color: "#6CABDD",
    code: "MCI",
    logo: "/logos/City.png",
  },
  {
    name: "Manchester United",
    color: "#DA291C",
    code: "MUN",
    logo: "/logos/United.png",
  },
  {
    name: "Liverpool",
    color: "#C8102E",
    code: "LIV",
    logo: "/logos/Liverpool.png",
  },
];

/* ─────────────────────────────────────────
   TeamBadge — logo image, falls back to
   monogram if the image is missing/broken
───────────────────────────────────────── */
function TeamBadge({ team }) {
  const [failed, setFailed] = useState(false);

  if (team.logo && !failed) {
    return (
      <img
        src={team.logo}
        alt={team.name}
        onError={() => setFailed(true)}
        className="w-12 h-12 rounded-full object-cover ring-2 ring-white/10 transition-transform duration-300 group-hover:scale-110"
      />
    );
  }

  return (
    <span
      className="w-12 h-12 rounded-full flex items-center justify-center font-[orbitron] font-bold text-sm shrink-0 ring-2 ring-white/10 transition-transform duration-300 group-hover:scale-110"
      style={{
        backgroundColor: `${team.color}22`,
        border: `2px solid ${team.color}`,
        color: team.color,
      }}
    >
      {team.code}
    </span>
  );
}

const About = () => {
  return (
    <div className="relative min-h-screen w-full bg-fifa-bg text-fifa-text overflow-hidden">
      {/* ambient glows */}
      <div className="pointer-events-none fixed -top-40 -left-40 w-[520px] h-[520px] bg-fifa-accent/10 rounded-full blur-[130px] animate-drift" />
      <div className="pointer-events-none fixed bottom-0 right-0 w-[460px] h-[460px] bg-fifa-info/10 rounded-full blur-[130px] animate-drift-slow" />

      {/* ── HERO ── */}
      <section className="relative max-w-6xl mx-auto px-6 pt-24 md:pt-32 pb-20">
        <Reveal>
          <Eyebrow>Auction22 · FIFA22 Platform</Eyebrow>
        </Reveal>

        <Reveal delay={80}>
          <Text
            variant="heading"
            className="font-[orbitron] text-white text-5xl md:text-7xl leading-[1.05] tracking-tight mt-5"
          >
            Build your squad.
            <br />
            <span className="text-shimmer">Win the bid.</span>
          </Text>
        </Reveal>

        <Reveal delay={160}>
          <Text
            variant="subheading"
            className="font-[rajdhani] font-normal text-fifa-text-secondary text-lg md:text-xl max-w-2xl mt-6"
          >
            Auction22 is a live, team-based football auction where managers
            scout the market, call their bids in real time, and walk away with
            the squad nobody expected. Every player is up for grabs — set your
            budget and make history.
          </Text>
        </Reveal>

        <Reveal delay={240}>
          <div className="flex flex-wrap gap-3 mt-9">
            <Anchor to="/signup">
              <Button size="md" className="rounded-xl">
                Get started
              </Button>
            </Anchor>
            <Anchor to="/auction">
              <Button
                size="md"
                variant="outline"
                className="rounded-xl border-fifa-border text-white bg-transparent hover:bg-fifa-surface"
              >
                Watch a live auction
              </Button>
            </Anchor>
          </div>
        </Reveal>

        {/* scroll cue */}
        <Reveal delay={360}>
          <div className="mt-20 flex flex-col items-center gap-2 text-fifa-text-muted">
            <span className="font-inter text-[10px] uppercase tracking-[0.3em]">
              Scroll to explore
            </span>
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </div>
        </Reveal>
      </section>

      {/* ── STATS ── */}
      <section className="relative max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-fifa-border rounded-2xl overflow-hidden border border-fifa-border">
          {[
            { end: 240, suffix: "+", label: "Players Listed" },
            { end: 5, label: "Competing Clubs" },
            { end: 15, label: "Positions" },
            { end: 0, suffix: "%", label: "Platform Fee" },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 90}>
              <div className="bg-fifa-card px-6 py-10 text-center">
                <Text className="font-[orbitron] font-bold text-fifa-accent text-4xl md:text-5xl">
                  <CountUp end={s.end} suffix={s.suffix} />
                </Text>
                <Text className="font-inter text-[10px] uppercase tracking-wider text-fifa-text-muted mt-3 block">
                  {s.label}
                </Text>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── WHAT IT IS ── */}
      <section className="relative max-w-6xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-14 items-center">
          <Reveal>
            <div>
              <Eyebrow>The Arena</Eyebrow>
              <Text
                variant="heading"
                className="font-[orbitron] text-white text-3xl md:text-5xl mt-4"
              >
                One stage. Every star.
              </Text>
              <Text
                variant="para"
                className="font-[rajdhani] text-fifa-text-secondary text-lg mt-6 leading-relaxed"
              >
                Auction22 turns player trading into a live spectacle. An admin
                sends a player under the hammer, managers across five clubs
                place their bids, and the highest bidder walks away with the
                signing. Points, ranks and rivalries update in real time as the
                season plays out.
              </Text>
              <div className="flex gap-8 mt-8">
                <div>
                  <Text className="font-[rajdhani] font-semibold text-white text-2xl">
                    <Target className="inline w-5 h-5 text-fifa-accent mr-2" />
                    Skill
                  </Text>
                  <Text className="font-inter text-[10px] uppercase tracking-wider text-fifa-text-muted mt-1 block">
                    Read the market
                  </Text>
                </div>
                <div>
                  <Text className="font-[rajdhani] font-semibold text-white text-2xl">
                    <Sparkles className="inline w-5 h-5 text-fifa-accent mr-2" />
                    Surprise
                  </Text>
                  <Text className="font-inter text-[10px] uppercase tracking-wider text-fifa-text-muted mt-1 block">
                    Steal the bid
                  </Text>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="relative">
              <div className="absolute inset-0 bg-fifa-accent/20 blur-2xl rounded-3xl scale-95 animate-float-y" />
              <div className="relative bg-gradient-to-b from-fifa-elevated to-fifa-card border border-fifa-border rounded-2xl p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]">
                <div className="flex items-start justify-between">
                  <div>
                    <Text className="font-[orbitron] text-fifa-accent text-3xl leading-none">
                      91
                    </Text>
                    <Text className="font-[rajdhani] font-medium text-fifa-text-secondary text-xs mt-1">
                      ST
                    </Text>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-fifa-danger animate-pulse" />
                </div>
                <div className="mt-4 h-36 rounded-xl bg-fifa-surface border border-fifa-border/60 flex items-center justify-center">
                  <Trophy className="w-12 h-12 text-fifa-accent/70 animate-float-y" />
                </div>
                <Text className="font-[rajdhani] font-semibold text-white text-lg mt-3">
                  Star Player
                </Text>
                <Text className="font-inter text-[10px] uppercase tracking-wider text-fifa-text-muted">
                  Reserve · 500 credits
                </Text>
                <div className="mt-4 flex items-center justify-between bg-fifa-surface border border-fifa-border rounded-xl px-3 py-2">
                  <div>
                    <Text className="font-inter text-[9px] uppercase tracking-wider text-fifa-text-muted">
                      Current Bid
                    </Text>
                    <Text className="font-[rajdhani] font-semibold text-fifa-accent text-lg leading-none">
                      1,240
                    </Text>
                  </div>
                  <Text className="font-[rajdhani] text-xs text-fifa-text-secondary">
                    04:12 left
                  </Text>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="relative max-w-6xl mx-auto px-6 py-20">
        <Reveal>
          <Eyebrow>What you get</Eyebrow>
          <Text
            variant="heading"
            className="font-[orbitron] text-white text-3xl md:text-5xl mt-4"
          >
            Everything to run the room
          </Text>
        </Reveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
          {FEATURES.map(({ Icon, title, desc }, i) => (
            <Reveal key={title} delay={(i % 3) * 100}>
              <div className="group h-full bg-gradient-to-b from-fifa-elevated to-fifa-card border border-fifa-border rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-fifa-accent/40 hover:shadow-[0_20px_50px_-20px_rgba(183,255,42,0.25)]">
                <div className="w-12 h-12 rounded-xl bg-fifa-surface border border-fifa-border flex items-center justify-center mb-5 transition-colors group-hover:border-fifa-accent/50">
                  <Icon
                    size={22}
                    className="text-fifa-accent transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <Text className="font-[rajdhani] font-semibold text-white text-xl">
                  {title}
                </Text>
                <Text
                  variant="para"
                  className="font-[rajdhani] text-fifa-text-secondary text-base mt-2 leading-relaxed"
                >
                  {desc}
                </Text>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="relative max-w-6xl mx-auto px-6 py-20">
        <Reveal>
          <Eyebrow>The Playbook</Eyebrow>
          <Text
            variant="heading"
            className="font-[orbitron] text-white text-3xl md:text-5xl mt-4"
          >
            How a season flows
          </Text>
        </Reveal>

        <div className="grid md:grid-cols-5 gap-5 mt-12">
          {STEPS.map(({ Icon, title, desc }, i) => (
            <Reveal key={title} delay={i * 90}>
              <div className="relative h-full bg-fifa-card border border-fifa-border rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-fifa-surface border border-fifa-border flex items-center justify-center">
                    <Icon size={20} className="text-fifa-accent" />
                  </div>
                  <span className="font-[orbitron] text-fifa-text-muted text-lg">
                    0{i + 1}
                  </span>
                </div>
                <Text className="font-[rajdhani] font-semibold text-white text-lg">
                  {title}
                </Text>
                <Text
                  variant="para"
                  className="font-[rajdhani] text-fifa-text-secondary text-sm mt-2"
                >
                  {desc}
                </Text>
                {i < STEPS.length - 1 && (
                  <ArrowRight className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-fifa-border" />
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── TEAMS ── */}
      <section className="relative max-w-6xl mx-auto px-6 py-10">
        <Reveal>
          <Eyebrow>The Rivals</Eyebrow>
          <Text
            variant="heading"
            className="font-[orbitron] text-white text-3xl md:text-5xl mt-4"
          >
            Five clubs. One crown.
          </Text>
        </Reveal>

        <div className="bg-fifa-card border border-fifa-border rounded-2xl px-6 py-6 mt-12">
          {/* ROW OF LOGOS */}
          <div className="flex items-center justify-center gap-4 sm:gap-6">
            {TEAMS.map((team, i) => (
              <Reveal key={team.name} delay={i * 70}>
                <div className="group">
                  <TeamBadge team={team} />
                </div>
              </Reveal>
            ))}
          </div>

          {/* DIVIDER */}
         
          
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative max-w-6xl mx-auto px-6 pt-16 pb-28">
        <Reveal>
          <div className="relative overflow-hidden bg-gradient-to-b from-fifa-elevated to-fifa-card border border-fifa-border rounded-3xl px-8 py-16 md:py-20 text-center">
            <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[420px] h-[420px] bg-fifa-accent/20 rounded-full blur-[120px] animate-pulse-soft" />
            <Text
              variant="heading"
              className="relative font-[orbitron] text-white text-3xl md:text-5xl"
            >
              Ready to build your squad?
            </Text>
            <Text
              variant="subheading"
              className="relative font-[rajdhani] text-fifa-text-secondary text-lg mt-4 max-w-xl mx-auto"
            >
              Join the auction, outbid your rivals, and write your club's name
              across the leaderboard.
            </Text>
            <div className="relative flex flex-wrap justify-center gap-3 mt-9">
              <Anchor to="/signup">
                <Button size="md" className="rounded-xl">
                  Create account
                </Button>
              </Anchor>
              <Anchor to="/login">
                <Button
                  size="md"
                  variant="outline"
                  className="rounded-xl border-fifa-border text-white bg-transparent hover:bg-fifa-surface"
                >
                  I already have one
                </Button>
              </Anchor>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
};

export default About;
