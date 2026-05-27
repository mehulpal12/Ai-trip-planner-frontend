"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Map, Mail, Lock, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/lib/authStore";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { ApiResponse } from "@/types/api.types";

interface LoginPayload {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
}

export default function LoginPage() {
  const router = useRouter();
  
  // Access state triggers from your authentication engine
  const setAuth = useAuthStore((state) => state.setAuth);
  const token = useAuthStore((state) => state.accessToken);

  // Form Field Tracking Status States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Guard routing: If token already exists in state hydration, bypass credentials login
  useEffect(() => {
    if (token) {
      router.push("/dashboard");
    }
  }, [token, router]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      // NOTE: Ensure port 4000 points cleanly to your User Auth Microservice cluster node
      const response = await fetch("http://localhost:4000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = (await response.json()) as ApiResponse<LoginPayload>;

      if (!response.ok) {
        throw new Error(result.message || "Invalid credentials configuration profile.");
      }

      const { user, accessToken, refreshToken } = result.data;

      if (!accessToken) {
        throw new Error("Ecosystem Auth Handshake failed: Empty token payload returned.");
      }

      // Sync data directly inside local state engine context
      setAuth(user, accessToken, refreshToken);
      
      // Route smoothly into dashboard orchestration viewports
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = (err as Error).message || "An unexpected networking socket drop occurred.";
      console.error("❌ Authentication Layer Fault:", msg);
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06080c] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Shared Layout visual theme engine component matching dashboard */}
      <AuroraBackground />

      <div className="w-full max-w-md relative z-10">
        {/* Core Card Shield Container */}
        <div className="p-8 bg-[#080a10]/60 backdrop-blur-2xl border border-white/[0.06] rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] space-y-6">
          
          {/* Workspace Branding Cluster */}
          <div className="text-center space-y-2">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-sky-600 flex items-center justify-center shadow-[0_0_25px_rgba(34,211,238,0.25)] mx-auto mb-3">
              <Map size={22} className="text-[#06080c]" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              Access <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-400">Aether System</span>
            </h1>
            <p className="text-slate-400 text-xs">
              Synchronize profile credentials to map trip workspace environments.
            </p>
          </div>

          {/* Real-time Validation Error Banner */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Forms Execution Core */}
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1">Email Endpoint</label>
              <div className="relative">
                <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/[0.08] focus:border-cyan-500/40 rounded-xl pl-11 pr-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none transition-all focus:shadow-[0_0_15px_rgba(34,211,238,0.03)]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1">Security Signature</label>
              <div className="relative">
                <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/[0.02] border border-white/[0.08] focus:border-cyan-500/40 rounded-xl pl-11 pr-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none transition-all focus:shadow-[0_0_15px_rgba(34,211,238,0.03)]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 disabled:from-slate-800 disabled:to-slate-800 text-[#06080c] disabled:text-slate-500 font-bold text-xs rounded-xl transition-all cursor-pointer border-none shadow-[0_4px_20px_rgba(34,211,238,0.15)] disabled:shadow-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={14} />
                  <span>Authorizing Handshake Node...</span>
                </>
              ) : (
                <>
                  <span>Initialize Security Link</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Outer Minimalist Footer Metadata */}
        <div className="mt-6 text-center">
          <p className="text-[11px] text-slate-600">
            Aether Space Core Routing Layer v2.6.0-prod
          </p>
        </div>
      </div>
    </div>
  );
}
