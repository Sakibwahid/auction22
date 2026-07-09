import React, { useState, useMemo } from "react";

import { Text } from "./Text";
import { NavItem } from "./NavItem";

import {
  Home,
  Info,
  Lock,
  Menu,
  X,
  Trophy,
  Users,
} from "lucide-react";

import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase/config";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

export function Navbar() {
  const [mobileMenu, setMobileMenu] = useState(false);

  const navigate = useNavigate();

  const { user, userData } = useAuth();

  const homeLink = useMemo(() => {
    if (userData?.role === "admin") {
      return "/admin";
    }

    if (userData?.role === "user") {
      return "/user";
    }

    return "/";
  }, [userData]);

  const toggleMenu = () => {
    setMobileMenu((prev) => !prev);
  };

  const handleLogout = async (e) => {
    e.preventDefault();

    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const closeMenu = () => {
    setMobileMenu(false);
  };

  return (
    <nav
      className="
        relative
        z-50
        flex
        md:min-h-screen
        md:w-24
        flex-row
        md:flex-col
        justify-between
        items-center
        px-4
        py-5
        text-white
        bg-transparent
        border-b
        md:border-b-0
        md:border-r
        border-fifa-border
      "
    >
      {/* Logo */}
      <div
        onClick={() => navigate(homeLink)}
        className="cursor-pointer flex md:flex-col items-center gap-2 md:gap-1"
      >
        <div className="w-9 h-9 rounded-xl bg-fifa-card border border-fifa-accent/40 flex items-center justify-center">
          <Text className="font-[orbitron] text-fifa-accent text-xs">22</Text>
        </div>
        <Text
          variant="subheading"
          className="
            font-[orbitron]
            text-[10px]
            tracking-[0.25em]
            uppercase
            text-fifa-text-secondary
            hidden
            md:block
          "
        >
          Auction
        </Text>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex flex-col items-center gap-2">
        <div className="flex flex-col items-center gap-2 p-1.5 rounded-2xl bg-fifa-card/50 border border-fifa-border/60">
          <NavItem label="Home" link={homeLink} Icon={Home} />
          <NavItem label="Auction" link="/auction" Icon={Trophy} />
          {user && (
            <NavItem label="Squad" link="/user/squad" Icon={Users} />
          )}
          <NavItem label="About" link="/about" Icon={Info} />
        </div>

        {user && (
          <div className="mt-4 pt-4 border-t border-fifa-border w-full flex justify-center">
            <NavItem
              label="Logout"
              link="#"
              Icon={Lock}
              onClick={handleLogout}
            />
          </div>
        )}
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <button
          onClick={toggleMenu}
          aria-label="Toggle Menu"
          className="relative z-50 w-9 h-9 rounded-xl bg-fifa-card border border-fifa-border flex items-center justify-center text-fifa-text-secondary"
        >
          {mobileMenu ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenu && (
        <div
          className="
            fixed
            inset-0
            bg-fifa-bg/70
            backdrop-blur-md
            z-40
          "
        >
          <div
            className="
              absolute
              top-0
              right-0
              h-full
              w-64
              bg-fifa-surface
              border-l
              border-fifa-border
              shadow-[0_0_60px_-15px_rgba(0,0,0,0.7)]
              p-6
            "
          >
            <Text className="font-[orbitron] text-[10px] tracking-[0.25em] uppercase text-fifa-text-muted mb-8 block">
              Menu
            </Text>

            <ul className="flex flex-col gap-1">
              <NavItem
                label="Home"
                link={homeLink}
                Icon={Home}
                onClick={closeMenu}
              />

              <NavItem
                label="Auction"
                link="/auction"
                Icon={Trophy}
                onClick={closeMenu}
              />

              {user && (
                <NavItem
                  label="Squad"
                  link="/user/squad"
                  Icon={Users}
                  onClick={closeMenu}
                />
              )}

              <NavItem
                label="About"
                link="/about"
                Icon={Info}
                onClick={closeMenu}
              />

              {user && (
                <li className="mt-6 pt-6 border-t border-fifa-border">
                  <NavItem
                    label="Logout"
                    link="#"
                    Icon={Lock}
                    onClick={handleLogout}
                  />
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </nav>
  );
}