import React, { useState, useEffect } from "react";
import { Mail, LockKeyhole } from "lucide-react";
import { Text } from "../components/ui/Text";
import { Input } from "../components/ui/Input";
import { PasswordInput } from "../components/ui/Password";
import { Button } from "../components/ui/Button";
import { Anchor } from "../components/ui/Anchor";

import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../lib/firebase/config";
import { useAuth } from "../context/AuthContext";
import Loadin from "../components/ui/loadin";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { user, userData, loading } = useAuth();

  useEffect(() => {
    if (!loading && user && userData) {
      if (userData.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/user", { replace: true });
      }
    }
  }, [user, userData, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      switch (err.code) {
        case "auth/user-not-found":
          setError("No account found with this email");
          break;
        case "auth/wrong-password":
          setError("Incorrect password");
          break;
        case "auth/too-many-requests":
          setError("Too many attempts. Try again later");
          break;
        default:
          setError("Something went wrong. Try again");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-fifa-bg text-white">
        <Loadin>Loading is fun</Loadin>
      </div>
    );
  }

  return (
    <div className="p-2 min-h-screen flex justify-center items-center bg-fifa-bg relative overflow-hidden">
      {/* ambient glow */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 w-[420px] h-[420px] bg-fifa-accent/10 rounded-full blur-[120px]" />

      <div
        className="relative w-full max-w-md flex flex-col gap-6 justify-center items-center
        bg-fifa-card border border-fifa-border shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)]
        rounded-2xl px-6 py-10"
      >
        {/* accent top bar */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-fifa-accent rounded-b-full" />

        {/* Title */}
        <div className="text-center">
          <Text className="font-inter text-[10px] uppercase tracking-[0.2em] text-fifa-accent block mb-2">
            Auction22
          </Text>
          <Text variant="heading" className="font-[orbitron] text-white text-2xl md:text-3xl">
            Welcome Back
          </Text>
          <Text className="mt-2 font-inter text-fifa-text-secondary text-sm">
            Sign in to place your bids
          </Text>
        </div>

        {error && (
          <Text className="font-inter text-fifa-danger text-sm text-center">{error}</Text>
        )}

        {/* Form */}
        <form className="w-[80%] flex flex-col gap-5" onSubmit={handleSubmit}>
          <Input
            type="email"
            placeholder="Enter your email"
            icon={<Mail size={18} className="text-fifa-text-muted" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <PasswordInput
            placeholder="Enter your password"
            icon={<LockKeyhole size={18} className="text-fifa-text-muted" />}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />

          <div className="flex items-center justify-between text-sm font-inter text-fifa-text-secondary">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="h-4 w-4 rounded accent-fifa-accent" />
              Remember me
            </label>
            <Anchor to="#" className="text-fifa-accent hover:text-fifa-accent-hover">
              Forgot password?
            </Anchor>
          </div>

          <Button
            type="submit"
            className="w-full bg-fifa-accent hover:bg-fifa-accent-hover active:bg-fifa-accent-active text-fifa-bg font-inter font-medium rounded-xl py-3"
          >
            Sign In
          </Button>

          <Text className="mt-2 font-inter text-fifa-text-secondary text-sm text-center">
            Don't have an account?{" "}
            <Anchor to="/signup">
              <span className="font-inter font-medium text-fifa-accent hover:text-fifa-accent-hover">
                Sign Up
              </span>
            </Anchor>
          </Text>
        </form>
      </div>
    </div>
  );
};

export default Login;