"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, UserPlus, ShieldAlert } from "lucide-react";
import { MelonBackground } from "@/components/ui/MelonBackground";
import { Footer } from "@/components/ui/Footer";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { api, ApiError } from "@/lib/api";
import type { AuthUser } from "@/lib/types";

type AuthTab = "login" | "register";

export function AuthScreen({ onAuthenticated }: { onAuthenticated: (user: AuthUser) => void }) {
  const [tab, setTab] = useState<AuthTab>("login");
  const [ip, setIp] = useState<string | null>(null);
  const [banned, setBanned] = useState(false);
  const [banInfo, setBanInfo] = useState<{ bannedAt: string; reason: string } | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [maxAttempts, setMaxAttempts] = useState(5);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  useEffect(() => {
    api.auth
      .banStatus()
      .then((status) => {
        setIp(status.ip);
        setBanned(status.banned);
        setAttempts(status.attempts);
        setMaxAttempts(status.maxAttempts);
        setBanInfo(status.banInfo);
      })
      .catch(() => {});
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (banned) return;
    setError("");
    setLoading(true);
    try {
      const { user } = await api.auth.login(email, password);
      onAuthenticated(user);
    } catch (err) {
      if (err instanceof ApiError) {
        const data = err.data ?? {};
        if (data.banned) {
          setBanned(true);
          const status = await api.auth.banStatus();
          setBanInfo(status.banInfo);
          setIp(status.ip);
        }
        if (typeof data.attempts === "number") setAttempts(data.attempts);
        if (typeof data.remaining === "number") {
          setError(`${err.message}. ${data.remaining} attempt(s) left.`);
        } else {
          setError(err.message);
        }
      } else {
        setError("Login failed");
      }
      setShake(true);
      setTimeout(() => setShake(false), 400);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (banned) return;
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }

    setLoading(true);
    try {
      const res = await api.auth.register({
        name,
        email,
        password,
        organizationName: organizationName.trim() || undefined,
        inviteCode: inviteCode.trim() || undefined,
      });
      if (res.needsEmailConfirmation) {
        setError(res.message ?? "Check your email to confirm, then sign in.");
        setTab("login");
        return;
      }
      onAuthenticated(res.user);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Registration failed");
      setShake(true);
      setTimeout(() => setShake(false), 400);
    } finally {
      setLoading(false);
    }
  };

  if (banned && ip) {
    return (
      <MelonBackground>
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
          <Card className="max-w-md w-full text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <ShieldAlert className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-xl font-bold text-ink">Access Blocked</h1>
            <p className="mt-2 text-sm text-ink/60">
              Your IP has been banned after {maxAttempts} failed login attempts.
            </p>
            <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 font-mono text-xs text-red-700">
              {ip}
            </p>
            {banInfo && (
              <p className="mt-3 text-xs text-ink/45">
                Banned on {new Date(banInfo.bannedAt).toLocaleString()}
              </p>
            )}
            <Button
              type="button"
              variant="secondary"
              size="md"
              className="mt-6 w-full"
              onClick={async () => {
                await api.auth.clearBan();
                setBanned(false);
                setBanInfo(null);
                setAttempts(0);
                setError("");
              }}
            >
              Clear ban
            </Button>
          </Card>
          <Footer />
        </div>
      </MelonBackground>
    );
  }

  return (
    <MelonBackground>
      <div className="flex flex-1 flex-col px-5 py-8 sm:mx-auto sm:max-w-md sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-melon-600 text-2xl shadow-soft">
            🍈
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Melon Business</h1>
          <p className="mt-1 text-sm text-ink/55">Manage sales, customers & debt</p>
        </motion.div>

        <Card className={shake ? "animate-shake" : ""}>
          <div className="mb-6 flex rounded-xl bg-ink/5 p-1">
            {(["login", "register"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setTab(t);
                  setError("");
                }}
                className={`relative flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-colors ${
                  tab === t ? "text-ink" : "text-ink/45"
                }`}
              >
                {tab === t && (
                  <motion.div
                    layoutId="auth-tab"
                    className="absolute inset-0 rounded-lg bg-white shadow-sm"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  {t === "login" ? <LogIn className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                  {t === "login" ? "Login" : "Register"}
                </span>
              </button>
            ))}
          </div>

          {attempts > 0 && tab === "login" && (
            <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Failed attempts: {attempts}/{maxAttempts}
            </p>
          )}

          <AnimatePresence mode="wait">
            {tab === "login" ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                onSubmit={handleLogin}
                className="space-y-4"
              >
                <Input
                  label="Email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  label="Password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {error && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
                )}
                <Button type="submit" size="lg" disabled={loading}>
                  {loading ? "Signing in…" : "Sign In"}
                </Button>
              </motion.form>
            ) : (
              <motion.form
                key="register"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                onSubmit={handleRegister}
                className="space-y-4"
              >
                <Input
                  label="Full name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Input
                  label="Email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  label="Password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  hint="Min. 6 characters"
                />
                <Input
                  label="Confirm password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Input
                  label="Business name (first owner only)"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="Melon Business"
                />
                <Input
                  label="Team invite code (workers)"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="From your owner"
                  hint="Leave empty if you are creating the first account"
                />
                {error && (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
                )}
                <Button type="submit" size="lg" disabled={loading}>
                  {loading ? "Creating…" : "Create Account"}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </Card>

        <Footer />
      </div>
    </MelonBackground>
  );
}
