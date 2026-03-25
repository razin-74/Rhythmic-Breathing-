/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, ChevronRight, Pause, Play, RotateCcw, X } from 'lucide-react';

type Screen = 'settings' | 'prep' | 'session' | 'complete';
type Phase = 'inhale' | 'exhale';

interface Settings {
  sets: number;
  inhale: number;
  exhale: number;
}

interface SessionSummary {
  completedCycles: number;
  totalSeconds: number;
}

const DEFAULT_SETTINGS: Settings = {
  sets: 5,
  inhale: 4,
  exhale: 6,
};

const PRESETS: Array<{ label: string; settings: Settings }> = [
  { label: 'Calm', settings: { sets: 4, inhale: 4, exhale: 6 } },
  { label: 'Focus', settings: { sets: 6, inhale: 4, exhale: 4 } },
  { label: 'Long Exhale', settings: { sets: 8, inhale: 4, exhale: 7 } },
];

const STORAGE_KEY = 'rhythmic-breathing-settings';

function getEstimatedMinutes(settings: Settings) {
  const totalSeconds = settings.sets * (settings.inhale + settings.exhale);
  if (totalSeconds < 60) {
    return `${totalSeconds}s`;
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return seconds === 0 ? `${minutes} min` : `${minutes}m ${seconds}s`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('settings');
  const [settings, setSettings] = useState<Settings>(() => {
    if (typeof window === 'undefined') {
      return DEFAULT_SETTINGS;
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return DEFAULT_SETTINGS;
      }

      const parsed = JSON.parse(raw) as Partial<Settings>;
      return {
        sets: clamp(parsed.sets ?? DEFAULT_SETTINGS.sets, 1, 100),
        inhale: clamp(parsed.inhale ?? DEFAULT_SETTINGS.inhale, 1, 20),
        exhale: clamp(parsed.exhale ?? DEFAULT_SETTINGS.exhale, 1, 20),
      };
    } catch {
      return DEFAULT_SETTINGS;
    }
  });
  const [summary, setSummary] = useState<SessionSummary>({
    completedCycles: 0,
    totalSeconds: 0,
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const startPrep = (nextSettings: Settings) => {
    setSettings(nextSettings);
    setScreen('prep');
  };

  const startSession = () => {
    setScreen('session');
  };

  const stopSession = () => {
    setScreen('settings');
  };

  const completeSession = (nextSummary: SessionSummary) => {
    setSummary(nextSummary);
    setScreen('complete');
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#0f172a_0%,_#111827_100%)] text-slate-50">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center p-4 sm:p-6">
        <AnimatePresence mode="wait">
          {screen === 'settings' && (
            <SettingsScreen key="settings" onStart={startPrep} initialSettings={settings} />
          )}
          {screen === 'prep' && <PrepScreen key="prep" onBack={stopSession} onComplete={startSession} />}
          {screen === 'session' && (
            <BreathingSessionScreen
              key="session"
              settings={settings}
              onStop={stopSession}
              onComplete={completeSession}
            />
          )}
          {screen === 'complete' && (
            <CompletionScreen
              key="complete"
              onBack={stopSession}
              onRestart={() => setScreen('prep')}
              settings={settings}
              summary={summary}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function SettingsScreen({
  onStart,
  initialSettings,
}: {
  onStart: (s: Settings) => void;
  initialSettings: Settings;
  key?: string;
}) {
  const [sets, setSets] = useState(initialSettings.sets);
  const [inhale, setInhale] = useState(initialSettings.inhale);
  const [exhale, setExhale] = useState(initialSettings.exhale);

  useEffect(() => {
    setSets(initialSettings.sets);
    setInhale(initialSettings.inhale);
    setExhale(initialSettings.exhale);
  }, [initialSettings]);

  const currentSettings = { sets, inhale, exhale };
  const estimatedTime = useMemo(() => getEstimatedMinutes(currentSettings), [currentSettings]);

  const updateValue = (type: keyof Settings, delta: number) => {
    if (type === 'sets') setSets((value) => clamp(value + delta, 1, 100));
    if (type === 'inhale') setInhale((value) => clamp(value + delta, 1, 20));
    if (type === 'exhale') setExhale((value) => clamp(value + delta, 1, 20));
  };

  const applyPreset = (preset: Settings) => {
    setSets(preset.sets);
    setInhale(preset.inhale);
    setExhale(preset.exhale);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.25)] backdrop-blur sm:p-8"
    >
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-400">Rhythmic breathing</p>
        <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Simple breathing timer</h1>
        <p className="max-w-xl text-sm leading-6 text-slate-300">
          Choose your pace, then follow one clear cue at a time.
        </p>
      </div>

      <div className="mt-8">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">Quick presets</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPreset(preset.settings)}
              className="rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-4 text-left transition hover:border-slate-300/30 hover:bg-slate-900/70"
            >
              <div className="text-sm font-semibold text-white">{preset.label}</div>
              <div className="mt-2 text-xs leading-5 text-slate-400">
                {preset.settings.sets} cycles • {preset.settings.inhale}s in • {preset.settings.exhale}s out
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StepperCard
          label="Cycles"
          value={sets}
          onDecrease={() => updateValue('sets', -1)}
          onIncrease={() => updateValue('sets', 1)}
        />
        <StepperCard
          label="Inhale"
          value={inhale}
          suffix="s"
          onDecrease={() => updateValue('inhale', -1)}
          onIncrease={() => updateValue('inhale', 1)}
        />
        <StepperCard
          label="Exhale"
          value={exhale}
          suffix="s"
          onDecrease={() => updateValue('exhale', -1)}
          onIncrease={() => updateValue('exhale', 1)}
        />
      </div>

      <div className="mt-8 rounded-2xl border border-white/10 bg-slate-950/40 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Session</div>
            <div className="text-lg font-semibold text-white">{estimatedTime}</div>
            <div className="text-sm text-slate-300">
              {sets} cycles, {inhale}s inhale, {exhale}s exhale
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => onStart(currentSettings)}
            className="inline-flex items-center justify-center rounded-2xl bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white"
          >
            Start session
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

function StepperCard({
  label,
  value,
  onDecrease,
  onIncrease,
  suffix = '',
}: {
  label: string;
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
  suffix?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
      <div className="text-sm font-medium text-white">{label}</div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <IconButton label={`Decrease ${label}`} onClick={onDecrease}>
          -
        </IconButton>
        <div className="text-center text-3xl font-semibold tabular-nums text-white">
          {value}
          {suffix}
        </div>
        <IconButton label={`Increase ${label}`} onClick={onIncrease}>
          +
        </IconButton>
      </div>
    </div>
  );
}

function PrepScreen({
  onComplete,
  onBack,
}: {
  onComplete: () => void;
  onBack: () => void;
  key?: string;
}) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count === 0) {
      onComplete();
      return;
    }

    const timer = window.setTimeout(() => setCount((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [count, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full max-w-xl rounded-[28px] border border-white/10 bg-white/5 p-8 text-center shadow-[0_18px_60px_rgba(0,0,0,0.25)] backdrop-blur sm:p-10"
    >
      <div className="space-y-4">
        <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Get ready</div>
        <h2 className="text-3xl font-semibold text-white">We start in a moment</h2>
        <p className="text-sm leading-6 text-slate-300">Sit comfortably and let your breath stay natural.</p>
        <motion.div
          key={count}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="pt-2 text-7xl font-semibold tabular-nums text-white"
        >
          {count}
        </motion.div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center rounded-2xl border border-white/10 px-4 py-3 text-sm text-slate-300 transition hover:border-white/20 hover:text-white"
        >
          Back
        </button>
      </div>
    </motion.div>
  );
}

function BreathingSessionScreen({
  settings,
  onStop,
  onComplete,
}: {
  settings: Settings;
  onStop: () => void;
  onComplete: (summary: SessionSummary) => void;
  key?: string;
}) {
  const [phase, setPhase] = useState<Phase>('inhale');
  const [currentCycle, setCurrentCycle] = useState(1);
  const [timeLeft, setTimeLeft] = useState(settings.inhale);
  const [isPaused, setIsPaused] = useState(false);
  const totalSessionSeconds = settings.sets * (settings.inhale + settings.exhale);
  const elapsedSeconds =
    (currentCycle - 1) * (settings.inhale + settings.exhale) +
    (phase === 'inhale' ? settings.inhale - timeLeft : settings.inhale + (settings.exhale - timeLeft));
  const progress = Math.min(100, Math.round((elapsedSeconds / totalSessionSeconds) * 100));

  const resetSession = () => {
    setPhase('inhale');
    setCurrentCycle(1);
    setTimeLeft(settings.inhale);
    setIsPaused(false);
  };

  useEffect(() => {
    if (isPaused) {
      return;
    }

    const timer = window.setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isPaused]);

  useEffect(() => {
    if (timeLeft !== 0 || isPaused) {
      return;
    }

    if (phase === 'inhale') {
      setPhase('exhale');
      setTimeLeft(settings.exhale);
      return;
    }

    if (currentCycle >= settings.sets) {
      onComplete({
        completedCycles: settings.sets,
        totalSeconds: totalSessionSeconds,
      });
      return;
    }

    setPhase('inhale');
    setCurrentCycle((prev) => prev + 1);
    setTimeLeft(settings.inhale);
  }, [currentCycle, isPaused, onComplete, phase, settings.exhale, settings.inhale, settings.sets, timeLeft, totalSessionSeconds]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.25)] backdrop-blur sm:p-8"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Session</div>
          <h2 className="mt-2 text-3xl font-semibold text-white">
            {isPaused ? 'Paused' : phase === 'inhale' ? 'Breathe in' : 'Breathe out'}
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            Cycle {currentCycle} of {settings.sets}
          </p>
        </div>
        <div className="text-sm font-medium text-slate-200">{progress}% complete</div>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
        <motion.div
          animate={{ width: `${progress}%` }}
          className="h-full rounded-full bg-slate-100"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_240px]">
        <div className="flex min-h-[320px] items-center justify-center">
          <div className="relative flex aspect-square w-full max-w-[260px] items-center justify-center">
            <motion.div
              animate={{
                scale: phase === 'inhale' ? 1.22 : 0.92,
                backgroundColor: phase === 'inhale' ? '#f8fafc' : '#cbd5e1',
              }}
              transition={{
                duration: phase === 'inhale' ? settings.inhale : settings.exhale,
                ease: 'easeInOut',
              }}
              className="flex h-56 w-56 items-center justify-center rounded-full"
            >
              <div className="text-center text-slate-900">
                <div className="text-6xl font-semibold tabular-nums">{timeLeft}</div>
                <div className="mt-2 text-xs uppercase tracking-[0.24em] text-slate-600">seconds</div>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Current cue</div>
            <div className="mt-2 text-xl font-semibold text-white">
              {isPaused ? 'Take your time' : phase === 'inhale' ? 'Slow inhale' : 'Gentle exhale'}
            </div>
          </div>

          <ActionButton
            label={isPaused ? 'Resume' : 'Pause'}
            onClick={() => setIsPaused((value) => !value)}
            icon={isPaused ? <Play size={18} /> : <Pause size={18} />}
          />
          <ActionButton label="Restart" onClick={resetSession} icon={<RotateCcw size={18} />} />

          <button
            type="button"
            onClick={onStop}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm text-slate-300 transition hover:border-white/20 hover:text-white"
          >
            <X size={18} />
            End session
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function CompletionScreen({
  onBack,
  onRestart,
  settings,
  summary,
}: {
  onBack: () => void;
  onRestart: () => void;
  settings: Settings;
  summary: SessionSummary;
  key?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-2xl rounded-[28px] border border-white/10 bg-white/5 p-8 text-center shadow-[0_18px_60px_rgba(0,0,0,0.25)] backdrop-blur sm:p-10"
    >
      <div className="flex justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300">
          <CheckCircle2 size={40} strokeWidth={1.5} />
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <h2 className="text-3xl font-semibold text-white">Session complete</h2>
        <p className="text-sm leading-6 text-slate-300">
          You finished {summary.completedCycles} cycles in about {getEstimatedMinutes(settings)}.
        </p>
      </div>

      <div className="mt-8 grid gap-4 rounded-2xl border border-white/10 bg-slate-950/40 p-4 sm:grid-cols-3">
        <StatCard label="Cycles" value={summary.completedCycles} />
        <StatCard label="Inhale" value={`${settings.inhale}s`} />
        <StatCard label="Exhale" value={`${settings.exhale}s`} />
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onRestart}
          className="inline-flex items-center justify-center rounded-2xl bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white"
        >
          Repeat
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onBack}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 px-6 py-3 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/5"
        >
          Settings
          <ChevronRight size={18} />
        </motion.button>
      </div>
    </motion.div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-white">{value}</div>
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  icon,
}: {
  label: string;
  onClick: () => void;
  icon: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/10"
    >
      {icon}
      {label}
    </button>
  );
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-lg text-white transition hover:border-white/20 hover:bg-white/10"
    >
      {children}
    </button>
  );
}
