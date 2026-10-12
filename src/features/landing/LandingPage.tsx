import React from 'react';
import {
  Sparkles,
  Layers,
  Kanban,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Shield,
  Zap,
} from 'lucide-react';
import { SpatialCard } from '../../components/effects/SpatialCard';
import { ProgressRing } from '../../components/effects/ProgressRing';

interface LandingPageProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
  onLaunchDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth, onLaunchDemo }) => {
  return (
    <div className="min-h-screen bg-[#0B1020] text-slate-100 flex flex-col selection:bg-violet-500/30 selection:text-violet-200">
      {/* Top Bar Contract: Brand (one line) — 4 nav links — 1 primary action */}
      <header className="sticky top-0 z-40 h-16 border-b border-slate-800/80 bg-[#0B1020]/90 backdrop-blur-md px-6 lg:px-12 flex items-center justify-between gap-8">
        {/* Zone 1: Wordmark */}
        <a href="/" className="flex items-center gap-2.5 whitespace-nowrap shrink-0 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center shadow-md shadow-violet-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold tracking-tight text-slate-100">Work Planner</span>
        </a>

        {/* Zone 2: 4 single-line nav links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-400">
          <a href="#features" className="hover:text-slate-200 transition-colors whitespace-nowrap shrink-0">
            Capabilities
          </a>
          <a href="#kanban" className="hover:text-slate-200 transition-colors whitespace-nowrap shrink-0">
            Kanban Board
          </a>
          <a href="#analytics" className="hover:text-slate-200 transition-colors whitespace-nowrap shrink-0">
            Analytics
          </a>
          <a href="#security" className="hover:text-slate-200 transition-colors whitespace-nowrap shrink-0">
            Architecture
          </a>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onOpenAuth('login')}
            className="text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 transition-colors whitespace-nowrap shrink-0 hidden sm:block"
          >
            Sign In
          </button>
          <button
            onClick={() => onOpenAuth('register')}
            className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-xl shadow-md shadow-violet-500/20 active:scale-95 transition-all whitespace-nowrap shrink-0"
          >
            Get Started Free
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 lg:px-12 pt-20 pb-24 max-w-7xl mx-auto w-full flex flex-col items-center text-center">
        {/* Subtle Ambient Background Gradient */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-violet-600/15 via-cyan-500/10 to-transparent blur-3xl pointer-events-none rounded-full" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-950/40 border border-violet-500/30 text-violet-300 text-xs font-medium mb-6">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span>Spatial Productivity Workspace 2.0</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-100 max-w-4xl text-balance">
          Plan Better. <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-300 to-cyan-400">Work Smarter.</span>
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
          The high-velocity project management platform combining 3D spatial depth, dynamic Kanban boards, live task analytics, and unified agenda planning.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => onOpenAuth('register')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-violet-500/25 active:scale-95 transition-all"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onLaunchDemo}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-medium text-sm rounded-xl shadow-sm hover:border-slate-600 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Explore Demo Workspace</span>
          </button>
        </div>

        {/* 3D Dashboard Interactive Preview Showcase */}
        <div className="mt-16 w-full max-w-5xl perspective-1000">
          <div className="relative rounded-2xl p-4 sm:p-6 bg-[#141B2D]/80 border border-slate-700/60 shadow-2xl backdrop-blur-xl card-3d-spatial">
            {/* Top preview control bar */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-3 text-xs text-slate-400 font-mono">workplanner.io/workspace</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Active Sprint</span>
                <span>·</span>
                <span className="text-emerald-400 font-medium">92% on schedule</span>
              </div>
            </div>

            {/* Simulated Live Spatial Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
              <SpatialCard className="p-4" tiltIntensity={6}>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Total Tasks</span>
                  <CheckCircle2 className="w-4 h-4 text-violet-400" />
                </div>
                <div className="mt-3 text-2xl font-bold tabular-nums text-slate-100">28</div>
                <div className="mt-1 text-[11px] text-emerald-400">↑ 14% this week</div>
              </SpatialCard>

              <SpatialCard className="p-4" tiltIntensity={6}>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Completed</span>
                  <ProgressRing percentage={85} size={32} strokeWidth={4} showText={false} />
                </div>
                <div className="mt-3 text-2xl font-bold tabular-nums text-emerald-400">24</div>
                <div className="mt-1 text-[11px] text-slate-400">85% velocity rate</div>
              </SpatialCard>

              <SpatialCard className="p-4" tiltIntensity={6}>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">In Progress</span>
                  <Clock className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="mt-3 text-2xl font-bold tabular-nums text-cyan-400">3</div>
                <div className="mt-1 text-[11px] text-slate-400">On active review</div>
              </SpatialCard>

              <SpatialCard className="p-4" tiltIntensity={6}>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Overdue</span>
                  <span className="text-xs text-rose-400 font-semibold">1 item</span>
                </div>
                <div className="mt-3 text-2xl font-bold tabular-nums text-amber-400">1</div>
                <div className="mt-1 text-[11px] text-amber-400">Requires triage</div>
              </SpatialCard>
            </div>

            {/* Kanban preview strip */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="rounded-xl border border-slate-800 bg-[#0E1424]/90 p-4">
                <div className="flex items-center justify-between mb-3 text-xs font-semibold text-slate-300">
                  <span>To Do</span>
                  <span className="text-slate-400">1</span>
                </div>
                <div className="p-3 rounded-lg bg-[#141B2D] border border-slate-800 text-xs">
                  <p className="font-medium text-slate-200">Refactor database indexing</p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="text-cyan-400">Database</span>
                    <span>Due Oct 15</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-[#0E1424]/90 p-4">
                <div className="flex items-center justify-between mb-3 text-xs font-semibold text-cyan-300">
                  <span>In Progress</span>
                  <span className="text-slate-400">2</span>
                </div>
                <div className="p-3 rounded-lg bg-[#141B2D] border border-slate-800 text-xs">
                  <p className="font-medium text-slate-200">Kanban fluid drag and drop</p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="text-violet-400">Frontend</span>
                    <span>Due Today</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-[#0E1424]/90 p-4">
                <div className="flex items-center justify-between mb-3 text-xs font-semibold text-emerald-300">
                  <span>Completed</span>
                  <span className="text-slate-400">4</span>
                </div>
                <div className="p-3 rounded-lg bg-[#141B2D] border border-slate-800 text-xs">
                  <p className="font-medium text-slate-200 line-through opacity-80">3D spatial card elevation system</p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="text-emerald-400">Done</span>
                    <span>Yesterday</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section id="features" className="px-6 lg:px-12 py-20 max-w-7xl mx-auto w-full border-t border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
            Engineered for Uncompromised Focus
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            Every screen is structured with mathematical spacing, zero fluff, and instantaneous state feedback.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SpatialCard className="p-6 flex flex-col justify-between" tiltIntensity={5}>
            <div>
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-100">Spatial Depth & 3D Cards</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Perspective transforms and subtle ambient illumination bring your project canvas to life without draining CPU cycles.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] text-violet-400 font-medium">
              Hardware accelerated CSS3
            </div>
          </SpatialCard>

          <SpatialCard className="p-6 flex flex-col justify-between" tiltIntensity={5}>
            <div>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
                <Kanban className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-100">Fluid Kanban Workflow</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Drag tasks seamlessly across four project columns with immediate backend synchronization and keyboard shortcuts.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] text-cyan-400 font-medium">
              Instant optimistic sync
            </div>
          </SpatialCard>

          <SpatialCard className="p-6 flex flex-col justify-between" tiltIntensity={5}>
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-100">True Production Analytics</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Charts generated purely from your real database history. Track completion velocity, priority loads, and project margins.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] text-emerald-400 font-medium">
              Tabular figure accuracy
            </div>
          </SpatialCard>
        </div>
      </section>

      {/* Security & Reliability */}
      <section id="security" className="px-6 lg:px-12 py-16 max-w-7xl mx-auto w-full border-t border-slate-800/80">
        <div className="rounded-2xl border border-slate-800 bg-[#141B2D]/60 p-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-100">Isolated & Secure Architecture</h3>
              <p className="mt-1 text-xs text-slate-400 max-w-xl leading-relaxed">
                Every task, project, and session is strictly scoped to your user ID with password hashing, secure JWT tokens, and strict ownership validation on all REST endpoints.
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenAuth('register')}
            className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all whitespace-nowrap shrink-0"
          >
            Create Your Account
          </button>
        </div>
      </section>

      {/* Responsive Footer */}
      <footer className="mt-auto border-t border-slate-800/80 py-8 px-6 lg:px-12 bg-[#080C18] text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="font-semibold text-slate-200">Work Planner</span>
            <span>— Spatial Productivity Workspace</span>
          </div>
          <div className="flex items-center gap-6 text-slate-400">
            <span>Inter / Plus Jakarta Sans</span>
            <span>·</span>
            <span>REST API v1</span>
            <span>·</span>
            <button onClick={onLaunchDemo} className="hover:text-violet-400 transition-colors">
              Launch Demo
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
