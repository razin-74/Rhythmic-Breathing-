/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, ChevronRight } from 'lucide-react';

type Screen = 'settings' | 'prep' | 'session' | 'complete';

interface Settings {
  sets: number;
  inhale: number;
  exhale: number;
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('settings');
  const [settings, setSettings] = useState<Settings>({
    sets: 5,
    inhale: 4,
    exhale: 6,
  });

  const startPrep = (newSettings: Settings) => {
    setSettings(newSettings);
    setScreen('prep');
  };

  const startSession = () => {
    setScreen('session');
  };

  const stopSession = () => {
    setScreen('settings');
  };

  const completeSession = () => {
    setScreen('complete');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col items-center justify-center p-6 overflow-hidden">
      <AnimatePresence mode="wait">
        {screen === 'settings' && (
          <SettingsScreen key="settings" onStart={startPrep} initialSettings={settings} />
        )}
        {screen === 'prep' && (
          <PrepScreen key="prep" onComplete={startSession} />
        )}
        {screen === 'session' && (
          <BreathingSessionScreen
            key="session"
            settings={settings}
            onStop={stopSession}
            onComplete={completeSession}
          />
        )}
        {screen === 'complete' && (
          <CompletionScreen key="complete" onBack={stopSession} />
        )}
      </AnimatePresence>
    </div>
  );
}

function SettingsScreen({ onStart, initialSettings }: { onStart: (s: Settings) => void, initialSettings: Settings, key?: string }) {
  const [sets, setSets] = useState(initialSettings.sets);
  const [inhale, setInhale] = useState(initialSettings.inhale);
  const [exhale, setExhale] = useState(initialSettings.exhale);

  const updateValue = (type: 'sets' | 'inhale' | 'exhale', delta: number) => {
    if (type === 'sets') setSets(Math.max(1, Math.min(100, sets + delta)));
    if (type === 'inhale') setInhale(Math.max(1, Math.min(20, inhale + delta)));
    if (type === 'exhale') setExhale(Math.max(1, Math.min(20, exhale + delta)));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-md space-y-16"
    >
      <div className="space-y-3 text-center">
        <h1 className="text-5xl font-light tracking-tight">Breathe</h1>
        <p className="text-zinc-500 text-sm font-light tracking-widest">Minimal Rhythmic Breathing</p>
      </div>

      <div className="space-y-12">
        {/* Session Length */}
        <div className="space-y-6">
          <div className="flex flex-col text-center">
            <label className="text-sm font-medium text-zinc-300">Session Length</label>
            <span className="text-xs text-zinc-500">Number of breathing cycles (Inhale + Exhale)</span>
          </div>
          <div className="flex items-center justify-center gap-8">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => updateValue('sets', -1)}
              className="w-12 h-12 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-400 hover:border-zinc-600 hover:text-white transition-colors"
            >
              -
            </motion.button>
            <div className="text-4xl font-light w-16 text-center">{sets}</div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => updateValue('sets', 1)}
              className="w-12 h-12 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-400 hover:border-zinc-600 hover:text-white transition-colors"
            >
              +
            </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Inhale Duration */}
          <div className="space-y-6">
            <div className="flex flex-col text-center">
              <label className="text-sm font-medium text-zinc-300">Inhale</label>
              <span className="text-xs text-zinc-500">seconds</span>
            </div>
            <div className="flex items-center justify-center gap-4">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => updateValue('inhale', -1)}
                className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-400 hover:border-zinc-600 hover:text-white transition-colors"
              >
                -
              </motion.button>
              <div className="text-2xl font-light w-8 text-center">{inhale}</div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => updateValue('inhale', 1)}
                className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-400 hover:border-zinc-600 hover:text-white transition-colors"
              >
                +
              </motion.button>
            </div>
          </div>

          {/* Exhale Duration */}
          <div className="space-y-6">
            <div className="flex flex-col text-center">
              <label className="text-sm font-medium text-zinc-300">Exhale</label>
              <span className="text-xs text-zinc-500">seconds</span>
            </div>
            <div className="flex items-center justify-center gap-4">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => updateValue('exhale', -1)}
                className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-400 hover:border-zinc-600 hover:text-white transition-colors"
              >
                -
              </motion.button>
              <div className="text-2xl font-light w-8 text-center">{exhale}</div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => updateValue('exhale', 1)}
                className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-400 hover:border-zinc-600 hover:text-white transition-colors"
              >
                +
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => onStart({ sets, inhale, exhale })}
        className="w-full py-6 bg-white text-black rounded-3xl font-semibold text-lg hover:bg-zinc-100 transition-colors shadow-[0_10px_30px_rgba(255,255,255,0.1)]"
      >
        Start Breathing
      </motion.button>
    </motion.div>
  );
}

function PrepScreen({ onComplete }: { onComplete: () => void, key?: string }) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count === 0) {
      onComplete();
      return;
    }
    const timer = setTimeout(() => setCount(count - 1), 1000);
    return () => clearTimeout(timer);
  }, [count, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="text-center space-y-8"
    >
      <h2 className="text-2xl font-light text-zinc-400 tracking-widest uppercase">Get Ready</h2>
      <motion.div
        key={count}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-8xl font-light tabular-nums"
      >
        {count}
      </motion.div>
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
  onComplete: () => void;
  key?: string;
}) {
  const [phase, setPhase] = useState<'inhale' | 'exhale'>('inhale');
  const [currentSet, setCurrentSet] = useState(1);
  const [timeLeft, setTimeLeft] = useState(settings.inhale);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (timeLeft === 0) {
      if (phase === 'inhale') {
        setPhase('exhale');
        setTimeLeft(settings.exhale);
      } else {
        if (currentSet >= settings.sets) {
          onComplete();
        } else {
          setPhase('inhale');
          setCurrentSet((prev) => prev + 1);
          setTimeLeft(settings.inhale);
        }
      }
    }
  }, [timeLeft, phase, currentSet, settings, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-between h-full w-full py-16"
    >
      <div className="text-center">
        <p className="text-zinc-500 text-sm font-light tracking-widest">
          {settings.sets - currentSet + 1} {settings.sets - currentSet + 1 === 1 ? 'cycle' : 'cycles'} remaining
        </p>
      </div>

      <div className="relative flex items-center justify-center w-full max-w-xs aspect-square">
        {/* Outer Glow Ring - Soft Calming Blue */}
        <motion.div
          animate={{
            scale: phase === 'inhale' ? 1.9 : 0.85,
            opacity: phase === 'inhale' ? 0.2 : 0.05,
          }}
          transition={{
            duration: phase === 'inhale' ? settings.inhale : settings.exhale,
            ease: "easeInOut",
          }}
          className="absolute w-48 h-48 rounded-full bg-sky-400/30 blur-[64px]"
        />

        {/* Breathing Circle */}
        <motion.div
          animate={{
            scale: phase === 'inhale' ? 1.6 : 0.8,
            opacity: phase === 'inhale' ? 1 : 0.4,
            boxShadow: phase === 'inhale' 
              ? '0 0 140px 40px rgba(125, 211, 252, 0.25)' 
              : '0 0 40px 10px rgba(125, 211, 252, 0.1)',
          }}
          transition={{
            duration: phase === 'inhale' ? settings.inhale : settings.exhale,
            ease: "easeInOut",
          }}
          className="absolute w-48 h-48 rounded-full bg-white"
        />

        {/* Countdown */}
        <div className="z-10 text-7xl font-light tabular-nums tracking-tighter mix-blend-difference">
          {timeLeft}
        </div>
      </div>

      <div className="text-center space-y-16 w-full">
        <motion.h2
          key={phase}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-light tracking-[0.3em] text-zinc-300"
        >
          {phase === 'inhale' ? 'inhale' : 'exhale'}
        </motion.h2>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onStop}
          className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-zinc-900/50 border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600 transition-colors"
        >
          <X size={24} />
        </motion.button>
      </div>
    </motion.div>
  );
}

function CompletionScreen({ onBack }: { onBack: () => void, key?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-10"
    >
      <div className="flex justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 15, stiffness: 200 }}
          className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500"
        >
          <CheckCircle2 size={48} strokeWidth={1.5} />
        </motion.div>
      </div>
      
      <div className="space-y-3">
        <h2 className="text-4xl font-light tracking-tight">Session Complete</h2>
        <p className="text-zinc-500 font-light">You've finished your breathing exercise.</p>
      </div>

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onBack}
        className="px-10 py-4 bg-zinc-900 text-white rounded-2xl font-medium flex items-center justify-center gap-2 mx-auto hover:bg-zinc-800 transition-colors border border-zinc-800"
      >
        Back to Home
        <ChevronRight size={18} />
      </motion.button>
    </motion.div>
  );
}
