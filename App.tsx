/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  PRESENTE_QUESTIONS,
  PRETERITO_QUESTIONS,
  ANIMAL_RIDDLES,
  MATH_PROBLEMS,
  ROSCO_LETTERS,
  type QuizQuestion,
} from './data';
import { soundFx } from './sound';
import {
  Check,
  X,
  Volume2,
  VolumeX,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Calculator,
  Smile,
  Trophy,
  Eye,
  EyeOff,
  HelpCircle,
  Play,
  Languages,
} from 'lucide-react';

type SectionMode = 'rosco' | 'preterito' | 'riddles' | 'math';

type LetterStatus = 'unanswered' | 'correct' | 'incorrect' | 'passed';

export default function App() {
  const [activeSection, setActiveSection] = useState<SectionMode>('rosco');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // --- ROSCO STATE (Presente 1-25) ---
  const [roscoIndex, setRoscoIndex] = useState<number>(0);
  const [roscoStatus, setRoscoStatus] = useState<Record<number, LetterStatus>>({});
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [revealedArmenian, setRevealedArmenian] = useState<Record<number, boolean>>({});
  const [showRoscoSummary, setShowRoscoSummary] = useState<boolean>(false);

  // --- PRETERITO PERFECTO STATE (26+) ---
  const [preteritoIndex, setPreteritoIndex] = useState<number>(0);
  const [preteritoAnswers, setPreteritoAnswers] = useState<Record<number, string>>({});
  const [preteritoRevealedArm, setPreteritoRevealedArm] = useState<Record<number, boolean>>({});
  const [preteritoRevealedAnswer, setPreteritoRevealedAnswer] = useState<Record<number, { es: boolean; am: boolean }>>({});

  // --- RIDDLES STATE (10 Animales) ---
  const [riddleIndex, setRiddleIndex] = useState<number>(0);
  const [riddleRevealedArm, setRiddleRevealedArm] = useState<Record<number, boolean>>({});
  const [riddleRevealedAnsEs, setRiddleRevealedAnsEs] = useState<Record<number, boolean>>({});
  const [riddleRevealedAnsAm, setRiddleRevealedAnsAm] = useState<Record<number, boolean>>({});

  // --- MATH PROBLEMS STATE (10 Problemas) ---
  const [mathIndex, setMathIndex] = useState<number>(0);
  const [mathRevealedArm, setMathRevealedArm] = useState<Record<number, boolean>>({});
  const [mathRevealedAnsEs, setMathRevealedAnsEs] = useState<Record<number, boolean>>({});
  const [mathRevealedAnsAm, setMathRevealedAnsAm] = useState<Record<number, boolean>>({});

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundFx.enabled = next;
  };

  // --- ROSCO HELPERS ---
  const currentRoscoQuestion = PRESENTE_QUESTIONS[roscoIndex];
  const totalRosco = PRESENTE_QUESTIONS.length;

  const correctCount = useMemo(() => {
    return Object.values(roscoStatus).filter((s) => s === 'correct').length;
  }, [roscoStatus]);

  const incorrectCount = useMemo(() => {
    return Object.values(roscoStatus).filter((s) => s === 'incorrect').length;
  }, [roscoStatus]);

  const passedCount = useMemo(() => {
    return Object.values(roscoStatus).filter((s) => s === 'passed').length;
  }, [roscoStatus]);

  const remainingCount = totalRosco - (correctCount + incorrectCount);

  const handleSelectRoscoOption = (key: string) => {
    if (roscoStatus[currentRoscoQuestion.id] === 'correct' || roscoStatus[currentRoscoQuestion.id] === 'incorrect') {
      return; // already finalized for this question
    }

    const isCorrect = key === currentRoscoQuestion.correct;
    setSelectedAnswers((prev) => ({ ...prev, [currentRoscoQuestion.id]: key }));

    if (isCorrect) {
      soundFx.playCorrect();
      setRoscoStatus((prev) => ({ ...prev, [currentRoscoQuestion.id]: 'correct' }));
    } else {
      soundFx.playIncorrect();
      // Even if incorrect, game continues seamlessly!
      setRoscoStatus((prev) => ({ ...prev, [currentRoscoQuestion.id]: 'incorrect' }));
    }
  };

  const handlePasapalabra = () => {
    soundFx.playPasapalabra();
    // Mark as passed if not already answered
    if (!roscoStatus[currentRoscoQuestion.id]) {
      setRoscoStatus((prev) => ({ ...prev, [currentRoscoQuestion.id]: 'passed' }));
    }
    moveToNextRoscoQuestion();
  };

  const moveToNextRoscoQuestion = () => {
    // Find next unanswered or passed question
    let nextIdx = (roscoIndex + 1) % totalRosco;
    let found = false;
    for (let i = 0; i < totalRosco; i++) {
      const q = PRESENTE_QUESTIONS[nextIdx];
      const status = roscoStatus[q.id];
      if (status !== 'correct' && status !== 'incorrect') {
        setRoscoIndex(nextIdx);
        found = true;
        break;
      }
      nextIdx = (nextIdx + 1) % totalRosco;
    }

    if (!found) {
      // All questions have been answered!
      setShowRoscoSummary(true);
    }
  };

  const resetRosco = () => {
    setRoscoIndex(0);
    setRoscoStatus({});
    setSelectedAnswers({});
    setRevealedArmenian({});
    setShowRoscoSummary(false);
  };

  // Pretérito Perfecto helpers
  const currentPreterito = PRETERITO_QUESTIONS[preteritoIndex];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-400 selection:text-slate-950">
      {/* HEADER / NAVIGATION BAR */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-blue-500/25 border border-blue-400/30">
              P
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold tracking-tight text-white">
                  PASAPALABRA
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-medium border border-amber-400/30">
                  🇪🇸 Español ⇄ 🇦🇲 Հայերեն
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Ուսուցողական խաղ՝ առանց ժամանակի սահմանափակման
              </p>
            </div>
          </div>

          {/* Sound & Controls */}
          <div className="flex items-center gap-2">
            <button
              id="sound-toggle-btn"
              onClick={toggleSound}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title={soundEnabled ? 'Ձայնն ակտիվ է' : 'Ձայնն անջատված է'}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5 text-emerald-400" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
            </button>
          </div>
        </div>

        {/* SECTION TABS */}
        <div className="max-w-6xl mx-auto px-4 flex overflow-x-auto no-scrollbar gap-1 border-t border-slate-800/80 pt-1">
          <button
            id="tab-rosco"
            onClick={() => setActiveSection('rosco')}
            className={`px-4 py-2.5 text-sm font-semibold rounded-t-lg transition flex items-center gap-2 whitespace-nowrap border-b-2 ${
              activeSection === 'rosco'
                ? 'text-amber-400 border-amber-400 bg-slate-800/50'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-blue-400/40" />
            1–25. El Rosco (Presente)
          </button>

          <button
            id="tab-preterito"
            onClick={() => setActiveSection('preterito')}
            className={`px-4 py-2.5 text-sm font-semibold rounded-t-lg transition flex items-center gap-2 whitespace-nowrap border-b-2 ${
              activeSection === 'preterito'
                ? 'text-amber-400 border-amber-400 bg-slate-800/50'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            26–50. Pretérito Perfecto
          </button>

          <button
            id="tab-riddles"
            onClick={() => setActiveSection('riddles')}
            className={`px-4 py-2.5 text-sm font-semibold rounded-t-lg transition flex items-center gap-2 whitespace-nowrap border-b-2 ${
              activeSection === 'riddles'
                ? 'text-amber-400 border-amber-400 bg-slate-800/50'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Smile className="w-4 h-4 text-emerald-400" />
            🐾 10 Adivinanzas (Կենդանիներ)
          </button>

          <button
            id="tab-math"
            onClick={() => setActiveSection('math')}
            className={`px-4 py-2.5 text-sm font-semibold rounded-t-lg transition flex items-center gap-2 whitespace-nowrap border-b-2 ${
              activeSection === 'math'
                ? 'text-amber-400 border-amber-400 bg-slate-800/50'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Calculator className="w-4 h-4 text-rose-400" />
            ➕ 10 Problemas Matemáticos
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6">
        {/* ========================================================= */}
        {/* MODE 1: EL ROSCO - PRESENTE (QUESTIONS 1 - 25) */}
        {/* ========================================================= */}
        {activeSection === 'rosco' && (
          <div className="space-y-6">
            {/* Top Info Banner */}
            <div className="bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border border-blue-800/30 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
                  <Languages className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    1–25. Presente — Ներկա ժամանակ
                  </h2>
                  <p className="text-xs text-slate-300">
                    💡 <span className="font-semibold text-amber-300">Սեղմեք իսպաներեն տեքստի վրա</span>՝ հայերեն թարգմանությունը բացելու համար: Սխալ պատասխանի դեպքում խաղը չի ավարտվում, կարող եք շարունակել:
                  </p>
                </div>
              </div>

              {/* Score Pills */}
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block shadow-sm shadow-emerald-500/80"></span>
                  Ճիշտ: {correctCount}
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block shadow-sm shadow-rose-500/80"></span>
                  Սխալ: {incorrectCount}
                </div>
                {passedCount > 0 && (
                  <div className="px-3 py-1.5 rounded-xl bg-amber-950/70 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                    Պաս: {passedCount}
                  </div>
                )}
                <button
                  id="reset-rosco-btn"
                  onClick={resetRosco}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 flex items-center gap-1 transition"
                  title="Սկսել նորից"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Վերսկսել
                </button>
              </div>
            </div>

            {/* ROSCO MAIN ARENA */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* THE CIRCULAR ROSCO WHEEL (5 cols on lg) */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center">
                <div className="relative w-72 h-72 sm:w-88 sm:h-88 md:w-96 md:h-96 flex items-center justify-center p-4">
                  {/* Rosco Center Orb */}
                  <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-blue-900/90 via-slate-900 to-indigo-950 border-2 border-blue-500/30 flex flex-col items-center justify-center shadow-2xl shadow-blue-500/20 text-center p-2 z-10">
                    <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
                      Տառ / Հարց
                    </span>
                    <span className="text-4xl sm:text-5xl font-black text-amber-400 drop-shadow">
                      {currentRoscoQuestion.letter}
                    </span>
                    <span className="text-xs text-blue-300/90 font-medium">
                      #{currentRoscoQuestion.id} / 25
                    </span>
                  </div>

                  {/* Circular Letter Discs */}
                  {PRESENTE_QUESTIONS.map((q, idx) => {
                    const total = PRESENTE_QUESTIONS.length;
                    const angle = (idx / total) * 2 * Math.PI - Math.PI / 2;
                    // Radius as percentage
                    const radius = 42; // percent from center
                    const left = 50 + radius * Math.cos(angle);
                    const top = 50 + radius * Math.sin(angle);

                    const status = roscoStatus[q.id] || 'unanswered';
                    const isCurrent = idx === roscoIndex;

                    let bgClass = 'bg-blue-600 text-white hover:bg-blue-500 border-blue-400/40';
                    let ringClass = '';

                    if (status === 'correct') {
                      bgClass = 'bg-emerald-500 text-white shadow-emerald-500/50 border-emerald-300';
                    } else if (status === 'incorrect') {
                      bgClass = 'bg-rose-600 text-white shadow-rose-600/50 border-rose-300';
                    } else if (status === 'passed') {
                      bgClass = 'bg-amber-500 text-slate-950 font-black shadow-amber-500/50 border-amber-300';
                    }

                    if (isCurrent) {
                      ringClass = 'ring-4 ring-amber-300 ring-offset-2 ring-offset-slate-950 scale-125 z-20 animate-pulse';
                    }

                    return (
                      <button
                        key={q.id}
                        id={`rosco-letter-${q.letter}`}
                        onClick={() => setRoscoIndex(idx)}
                        style={{
                          left: `${left}%`,
                          top: `${top}%`,
                          transform: 'translate(-50%, -50%)',
                        }}
                        className={`absolute w-8 h-8 sm:w-9 sm:h-9 rounded-full font-black text-xs sm:text-sm flex items-center justify-center border shadow-md transition-all duration-200 cursor-pointer ${bgClass} ${ringClass}`}
                        title={`Հարց ${q.id} (${q.letter})`}
                      >
                        {q.letter}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400 mt-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span>Ճիշտ</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-600" />
                    <span>Սխալ</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span>Պասապալաբրա</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-blue-600" />
                    <span>Չլրացված</span>
                  </div>
                </div>
              </div>

              {/* CURRENT QUESTION PANEL (7 cols on lg) */}
              <div className="lg:col-span-7">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-black/40 relative overflow-hidden">
                  {/* Glowing header badge */}
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-500/30">
                        {currentRoscoQuestion.letter}
                      </div>
                      <div>
                        <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                          Հարց #{currentRoscoQuestion.id} / 25
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-blue-300">
                            Presente (Ներկա ժամանակ)
                          </span>
                          {roscoStatus[currentRoscoQuestion.id] === 'correct' && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1">
                              <Check className="w-3 h-3" /> Ճիշտ
                            </span>
                          )}
                          {roscoStatus[currentRoscoQuestion.id] === 'incorrect' && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-500/40 font-bold flex items-center gap-1">
                              <X className="w-3 h-3" /> Սխալ (Շարունակեք)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
                      Առանց ժամանակի ⏱️
                    </div>
                  </div>

                  {/* CLICKABLE SPANISH SENTENCE WITH REVEALABLE ARMENIAN */}
                  <div className="my-6 space-y-3">
                    <div
                      id="spanish-question-card"
                      onClick={() =>
                        setRevealedArmenian((prev) => ({
                          ...prev,
                          [currentRoscoQuestion.id]: !prev[currentRoscoQuestion.id],
                        }))
                      }
                      role="button"
                      tabIndex={0}
                      className="group p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-950/70 via-slate-800/80 to-indigo-950/70 border-2 border-blue-500/40 hover:border-amber-400/80 transition duration-200 cursor-pointer shadow-lg hover:shadow-amber-400/10"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mb-1.5">
                            <span>🇪🇸 Español</span>
                            <span className="text-[11px] text-slate-400 font-normal">
                              (Սեղմեք՝ հայերեն թարգմանությունը տեսնելու համար 👆)
                            </span>
                          </span>
                          <p className="text-xl sm:text-2xl font-bold text-white leading-relaxed">
                            {currentRoscoQuestion.spanish}
                          </p>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-800 group-hover:bg-amber-400/20 group-hover:text-amber-300 text-slate-400 transition">
                          {revealedArmenian[currentRoscoQuestion.id] ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* ARMENIAN TRANSLATION CONTAINER */}
                    {revealedArmenian[currentRoscoQuestion.id] && (
                      <div
                        id="armenian-translation-box"
                        className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 animate-fadeIn"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                            🇦🇲 Հայերեն թարգմանություն:
                          </span>
                        </div>
                        <p className="text-lg font-semibold text-amber-100">
                          {currentRoscoQuestion.armenian}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* OPTIONS GRID (A, B, C, D) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    {currentRoscoQuestion.options.map((opt) => {
                      const isSelected = selectedAnswers[currentRoscoQuestion.id] === opt.key;
                      const isCorrect = opt.key === currentRoscoQuestion.correct;
                      const isAnswered =
                        roscoStatus[currentRoscoQuestion.id] === 'correct' ||
                        roscoStatus[currentRoscoQuestion.id] === 'incorrect';

                      let btnStyle = 'bg-slate-800/90 border-slate-700 hover:border-blue-400 hover:bg-slate-750 text-slate-100';

                      if (isAnswered) {
                        if (isCorrect) {
                          btnStyle = 'bg-emerald-900/60 border-emerald-500 text-emerald-100 shadow-md shadow-emerald-500/20 ring-2 ring-emerald-500/50';
                        } else if (isSelected && !isCorrect) {
                          btnStyle = 'bg-rose-900/60 border-rose-500 text-rose-100 shadow-md shadow-rose-500/20';
                        } else {
                          btnStyle = 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-60';
                        }
                      }

                      return (
                        <button
                          key={opt.key}
                          id={`option-${currentRoscoQuestion.id}-${opt.key}`}
                          onClick={() => handleSelectRoscoOption(opt.key)}
                          disabled={isAnswered}
                          className={`p-4 rounded-2xl border-2 text-left font-medium text-base transition duration-150 flex items-center justify-between gap-3 ${btnStyle}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-xl bg-slate-900/80 border border-slate-700 flex items-center justify-center font-bold text-sm text-amber-400">
                              {opt.key}
                            </span>
                            <span className="font-semibold text-lg">{opt.text}</span>
                          </div>

                          {isAnswered && isCorrect && (
                            <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                          )}
                          {isAnswered && isSelected && !isCorrect && (
                            <X className="w-5 h-5 text-rose-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* EXPLANATION IF ANSWERED */}
                  {(roscoStatus[currentRoscoQuestion.id] === 'correct' ||
                    roscoStatus[currentRoscoQuestion.id] === 'incorrect') && (
                    <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-700/40 text-sm space-y-1 mb-6">
                      <div className="font-bold text-blue-300 flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4" /> Քերականական պարզաբանում:
                      </div>
                      <p className="text-slate-300">
                        🇪🇸 <span className="font-medium text-white">{currentRoscoQuestion.explanationEs}</span>
                      </p>
                      <p className="text-slate-300">
                        🇦🇲 <span>{currentRoscoQuestion.explanationAm}</span>
                      </p>
                    </div>
                  )}

                  {/* ACTION CONTROLS */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
                    <button
                      id="prev-btn"
                      onClick={() => setRoscoIndex((prev) => (prev > 0 ? prev - 1 : totalRosco - 1))}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold border border-slate-700 flex items-center gap-1.5 transition"
                    >
                      <ChevronLeft className="w-4 h-4" /> Նախորդը
                    </button>

                    <div className="flex items-center gap-3">
                      {/* PASAPALABRA BUTTON */}
                      <button
                        id="pasapalabra-btn"
                        onClick={handlePasapalabra}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm tracking-wider uppercase shadow-lg shadow-amber-500/20 transition active:scale-95"
                      >
                        Pasapalabra ↷
                      </button>

                      {/* NEXT QUESTION BUTTON */}
                      <button
                        id="next-btn"
                        onClick={() => setRoscoIndex((prev) => (prev + 1) % totalRosco)}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 flex items-center gap-1.5 transition active:scale-95"
                      >
                        Հաջորդը <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rosco completion banner */}
            {showRoscoSummary && (
              <div className="bg-slate-900 border-2 border-amber-400/50 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-2xl">
                <div className="w-16 h-16 rounded-full bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center mx-auto text-amber-400">
                  <Trophy className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-white">
                  ¡Rosco Completado! / Ռոսկոն ավարտվեց:
                </h3>
                <p className="text-slate-300 max-w-md mx-auto">
                  Դուք պատասխանել եք բոլոր 25 հարցերին: Կարող եք ցանկացած պահի ստուգել ձեր պատասխանները կամ սկսել նորից:
                </p>
                <div className="flex items-center justify-center gap-6 text-lg font-bold">
                  <span className="text-emerald-400">✓ Ճիշտ: {correctCount}</span>
                  <span className="text-rose-400">✗ Սխալ: {incorrectCount}</span>
                </div>
                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={resetRosco}
                    className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold transition flex items-center gap-2"
                  >
                    <RotateCcw className="w-5 h-5" /> Խաղալ նորից
                  </button>
                  <button
                    onClick={() => setActiveSection('preterito')}
                    className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition flex items-center gap-2"
                  >
                    Անցնել Pretérito Perfecto-ին <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* MODE 2: PRETERITO PERFECTO (QUESTIONS 26+) */}
        {/* ========================================================= */}
        {activeSection === 'preterito' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header info */}
            <div className="bg-slate-900 border border-indigo-800/40 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  26–50. Pretérito Perfecto — Անցյալ կատարյալ ժամանակ
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  Սեղմեք իսպաներեն հարցի վրա՝ հայերեն թարգմանությունը բացելու համար: Նաև կան պատասխանը բացող առանձին կոճակներ:
                </p>
              </div>

              {/* Counter */}
              <div className="text-sm font-semibold bg-indigo-950 text-indigo-300 px-3 py-1.5 rounded-xl border border-indigo-500/30">
                Հարց {preteritoIndex + 1} / {PRETERITO_QUESTIONS.length}
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-indigo-400 font-bold">
                  Հարց #{currentPreterito.id}
                </span>
                <span className="text-xs bg-slate-800 px-2.5 py-1 rounded-lg text-slate-400">
                  Pretérito Perfecto
                </span>
              </div>

              {/* Clickable Spanish Question */}
              <div
                id={`preterito-card-${currentPreterito.id}`}
                onClick={() =>
                  setPreteritoRevealedArm((prev) => ({
                    ...prev,
                    [currentPreterito.id]: !prev[currentPreterito.id],
                  }))
                }
                role="button"
                tabIndex={0}
                className="group p-5 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-800/80 to-blue-950/60 border-2 border-indigo-500/40 hover:border-amber-400 transition cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1 mb-1">
                      🇪🇸 Español (Սեղմեք թարգմանության համար 👆)
                    </span>
                    <p className="text-2xl font-bold text-white">
                      {currentPreterito.spanish}
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-800 group-hover:bg-amber-400/20 text-slate-400 group-hover:text-amber-300">
                    {preteritoRevealedArm[currentPreterito.id] ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </div>
                </div>
              </div>

              {/* Armenian translation */}
              {preteritoRevealedArm[currentPreterito.id] && (
                <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 animate-fadeIn">
                  <span className="text-xs font-bold uppercase text-amber-300 block mb-1">
                    🇦🇲 Հայերեն թարգմանություն:
                  </span>
                  <p className="text-lg font-semibold text-amber-100">
                    {currentPreterito.armenian}
                  </p>
                </div>
              )}

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentPreterito.options.map((opt) => {
                  const isSelected = preteritoAnswers[currentPreterito.id] === opt.key;
                  const isCorrect = opt.key === currentPreterito.correct;
                  const answered = !!preteritoAnswers[currentPreterito.id];

                  let style = 'bg-slate-800/90 border-slate-700 hover:border-indigo-400 text-slate-100';
                  if (answered) {
                    if (isCorrect) {
                      style = 'bg-emerald-900/60 border-emerald-500 text-emerald-100 ring-2 ring-emerald-500/40';
                    } else if (isSelected) {
                      style = 'bg-rose-900/60 border-rose-500 text-rose-100';
                    } else {
                      style = 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={opt.key}
                      onClick={() => {
                        setPreteritoAnswers((prev) => ({ ...prev, [currentPreterito.id]: opt.key }));
                        if (opt.key === currentPreterito.correct) {
                          soundFx.playCorrect();
                        } else {
                          soundFx.playIncorrect();
                        }
                      }}
                      className={`p-4 rounded-2xl border-2 text-left font-medium text-base transition flex items-center justify-between gap-3 ${style}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center font-bold text-sm text-indigo-400">
                          {opt.key}
                        </span>
                        <span className="font-semibold text-lg">{opt.text}</span>
                      </div>
                      {answered && isCorrect && <Check className="w-5 h-5 text-emerald-400" />}
                      {answered && isSelected && !isCorrect && <X className="w-5 h-5 text-rose-400" />}
                    </button>
                  );
                })}
              </div>

              {/* Separate Answer Buttons: Armenian and Spanish as explicitly requested by user */}
              <div className="pt-2 border-t border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Առանձին պատասխանների կոճակներ (Respuestas):
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() =>
                      setPreteritoRevealedAnswer((prev) => {
                        const cur = prev[currentPreterito.id] || { es: false, am: false };
                        return { ...prev, [currentPreterito.id]: { ...cur, am: !cur.am } };
                      })
                    }
                    className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-sm font-semibold flex items-center gap-2 transition"
                  >
                    🇦🇲 Պատասխան (Հայերեն)
                  </button>

                  <button
                    onClick={() =>
                      setPreteritoRevealedAnswer((prev) => {
                        const cur = prev[currentPreterito.id] || { es: false, am: false };
                        return { ...prev, [currentPreterito.id]: { ...cur, es: !cur.es } };
                      })
                    }
                    className="px-4 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-sm font-semibold flex items-center gap-2 transition"
                  >
                    🇪🇸 Respuesta (Español)
                  </button>
                </div>

                {/* Armenian Answer Reveal */}
                {preteritoRevealedAnswer[currentPreterito.id]?.am && (
                  <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-600/30 text-amber-200 text-sm">
                    <strong>Ճիշտ տարբերակ:</strong> {currentPreterito.correct}){' '}
                    {currentPreterito.options.find((o) => o.key === currentPreterito.correct)?.text}
                    {currentPreterito.explanationAm && (
                      <p className="text-xs mt-1 text-slate-300">{currentPreterito.explanationAm}</p>
                    )}
                  </div>
                )}

                {/* Spanish Answer Reveal */}
                {preteritoRevealedAnswer[currentPreterito.id]?.es && (
                  <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-600/30 text-blue-200 text-sm">
                    <strong>Respuesta correcta:</strong> {currentPreterito.correct}){' '}
                    {currentPreterito.options.find((o) => o.key === currentPreterito.correct)?.text}
                    {currentPreterito.explanationEs && (
                      <p className="text-xs mt-1 text-slate-300">{currentPreterito.explanationEs}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  disabled={preteritoIndex === 0}
                  onClick={() => setPreteritoIndex((prev) => Math.max(0, prev - 1))}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 text-sm font-semibold border border-slate-700 flex items-center gap-1.5 transition"
                >
                  <ChevronLeft className="w-4 h-4" /> Նախորդը
                </button>

                <div className="flex gap-1.5 overflow-x-auto max-w-xs px-2">
                  {PRETERITO_QUESTIONS.map((q, idx) => (
                    <button
                      key={q.id}
                      onClick={() => setPreteritoIndex(idx)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                        idx === preteritoIndex
                          ? 'bg-indigo-600 text-white'
                          : preteritoAnswers[q.id]
                          ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>

                <button
                  disabled={preteritoIndex === PRETERITO_QUESTIONS.length - 1}
                  onClick={() => setPreteritoIndex((prev) => Math.min(PRETERITO_QUESTIONS.length - 1, prev + 1))}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold flex items-center gap-1.5 transition"
                >
                  Հաջորդը <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODE 3: 10 ADIVINANZAS (ANIMAL RIDDLES) */}
        {/* ========================================================= */}
        {activeSection === 'riddles' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Intro */}
            <div className="bg-slate-900 border border-emerald-800/40 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Smile className="w-5 h-5 text-emerald-400" />
                  🐾 10 Загадок — Adivina el animal (Կենդանիներ)
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  Սեղմեք իսպաներեն հանելուկի վրա՝ հայերեն թարգմանությունը տեսնելու համար: Օգտվեք առանձին պատասխանի կոճակներից:
                </p>
              </div>

              <div className="text-sm font-semibold bg-emerald-950 text-emerald-300 px-3 py-1.5 rounded-xl border border-emerald-500/30">
                Հանելուկ {riddleIndex + 1} / {ANIMAL_RIDDLES.length}
              </div>
            </div>

            {/* Riddle Active Card */}
            {(() => {
              const currentRiddle = ANIMAL_RIDDLES[riddleIndex];
              const isArmRevealed = riddleRevealedArm[currentRiddle.id];
              const isAnsEsRevealed = riddleRevealedAnsEs[currentRiddle.id];
              const isAnsAmRevealed = riddleRevealedAnsAm[currentRiddle.id];

              return (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                      Հանելուկ #{currentRiddle.id}
                    </span>
                    <span className="text-xs bg-slate-800 px-3 py-1 rounded-full text-slate-400">
                      Adivinanza
                    </span>
                  </div>

                  {/* Clickable Spanish Riddle Text */}
                  <div
                    id={`riddle-card-${currentRiddle.id}`}
                    onClick={() =>
                      setRiddleRevealedArm((prev) => ({
                        ...prev,
                        [currentRiddle.id]: !prev[currentRiddle.id],
                      }))
                    }
                    role="button"
                    tabIndex={0}
                    className="group p-5 rounded-2xl bg-gradient-to-r from-emerald-950/50 via-slate-800/80 to-teal-950/50 border-2 border-emerald-500/40 hover:border-amber-400 transition cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold text-amber-400 flex items-center gap-1 mb-1.5">
                          🇪🇸 Español (Սեղմեք հայերեն թարգմանության համար 👆)
                        </span>
                        <p className="text-xl sm:text-2xl font-bold text-white leading-relaxed">
                          {currentRiddle.spanish}
                        </p>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-800 group-hover:bg-amber-400/20 text-slate-400 group-hover:text-amber-300">
                        {isArmRevealed ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Armenian Translation */}
                  {isArmRevealed && (
                    <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 animate-fadeIn">
                      <span className="text-xs font-bold uppercase text-amber-300 block mb-1">
                        🇦🇲 Հայերեն թարգմանություն:
                      </span>
                      <p className="text-lg font-semibold text-amber-100">
                        {currentRiddle.armenian}
                      </p>
                    </div>
                  )}

                  {/* SEPARATE BUTTONS: Ответ арм и исп (առանց գուշակելու դաշտի) */}
                  <div className="pt-2 border-t border-slate-800 space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        id="btn-riddle-ans-am"
                        onClick={() =>
                          setRiddleRevealedAnsAm((prev) => ({
                            ...prev,
                            [currentRiddle.id]: !prev[currentRiddle.id],
                          }))
                        }
                        className="px-5 py-3 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-base font-bold flex items-center gap-2 transition active:scale-95 shadow-lg shadow-amber-950/20"
                      >
                        🇦🇲 Պատասխան (Հայերեն)
                      </button>

                      <button
                        id="btn-riddle-ans-es"
                        onClick={() =>
                          setRiddleRevealedAnsEs((prev) => ({
                            ...prev,
                            [currentRiddle.id]: !prev[currentRiddle.id],
                          }))
                        }
                        className="px-5 py-3 rounded-2xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-base font-bold flex items-center gap-2 transition active:scale-95 shadow-lg shadow-blue-950/20"
                      >
                        🇪🇸 Respuesta (Español)
                      </button>

                      {(isAnsEsRevealed || isAnsAmRevealed) && (
                        <button
                          onClick={() => {
                            setRiddleRevealedAnsEs((prev) => ({ ...prev, [currentRiddle.id]: false }));
                            setRiddleRevealedAnsAm((prev) => ({ ...prev, [currentRiddle.id]: false }));
                          }}
                          className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition"
                        >
                          Թաքցնել պատասխանը
                        </button>
                      )}
                    </div>

                    {/* Answer reveals */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {isAnsAmRevealed && (
                        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 animate-fadeIn">
                          <span className="text-xs font-bold uppercase text-amber-300 block mb-1">
                            🇦🇲 Պատասխանը հայերենով:
                          </span>
                          <p className="text-2xl font-black text-amber-100">
                            {currentRiddle.answerAm}
                          </p>
                        </div>
                      )}

                      {isAnsEsRevealed && (
                        <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-500/40 animate-fadeIn">
                          <span className="text-xs font-bold uppercase text-blue-300 block mb-1">
                            🇪🇸 Respuesta en español:
                          </span>
                          <p className="text-2xl font-black text-blue-100">
                            {currentRiddle.answerEs}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Navigation Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    <button
                      disabled={riddleIndex === 0}
                      onClick={() => setRiddleIndex((prev) => Math.max(0, prev - 1))}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 text-sm font-semibold border border-slate-700 flex items-center gap-1.5 transition"
                    >
                      <ChevronLeft className="w-4 h-4" /> Նախորդը
                    </button>

                    <div className="flex gap-1.5 overflow-x-auto max-w-xs px-2">
                      {ANIMAL_RIDDLES.map((r, idx) => (
                        <button
                          key={r.id}
                          onClick={() => setRiddleIndex(idx)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                            idx === riddleIndex
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      disabled={riddleIndex === ANIMAL_RIDDLES.length - 1}
                      onClick={() => setRiddleIndex((prev) => Math.min(ANIMAL_RIDDLES.length - 1, prev + 1))}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold flex items-center gap-1.5 transition"
                    >
                      Հաջորդը <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ========================================================= */}
        {/* MODE 4: 10 MATHEMATICAL PROBLEMS (10 ՄԱԹԵՄԱՏԻԿԱԿԱՆ ԽՆԴԻՐ) */}
        {/* ========================================================= */}
        {activeSection === 'math' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header info */}
            <div className="bg-slate-900 border border-rose-800/40 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-rose-400" />
                  ➕ 10 Problemas matemáticos — 10 Մաթեմատիկական խնդիր
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  Սեղմեք իսպաներեն խնդրի վրա՝ հայերեն թարգմանությունը տեսնելու համար: Առանձին կոճակներով բացեք լուծումը հայերեն և իսպաներեն:
                </p>
              </div>

              <div className="text-sm font-semibold bg-rose-950 text-rose-300 px-3 py-1.5 rounded-xl border border-rose-500/30">
                Խնդիր {mathIndex + 1} / {MATH_PROBLEMS.length}
              </div>
            </div>

            {/* Active Math Problem */}
            {(() => {
              const currentMath = MATH_PROBLEMS[mathIndex];
              const isArmRevealed = mathRevealedArm[currentMath.id];
              const isAnsEsRevealed = mathRevealedAnsEs[currentMath.id];
              const isAnsAmRevealed = mathRevealedAnsAm[currentMath.id];

              return (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                      Խնդիր #{currentMath.id}
                    </span>
                    <span className="text-xs bg-slate-800 px-3 py-1 rounded-full text-slate-400">
                      Problema Matemático
                    </span>
                  </div>

                  {/* Clickable Spanish Math Problem Text */}
                  <div
                    id={`math-card-${currentMath.id}`}
                    onClick={() =>
                      setMathRevealedArm((prev) => ({
                        ...prev,
                        [currentMath.id]: !prev[currentMath.id],
                      }))
                    }
                    role="button"
                    tabIndex={0}
                    className="group p-5 rounded-2xl bg-gradient-to-r from-rose-950/40 via-slate-800/80 to-purple-950/40 border-2 border-rose-500/40 hover:border-amber-400 transition cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold text-amber-400 flex items-center gap-1 mb-1.5">
                          🇪🇸 Español (Սեղմեք հայերեն թարգմանության համար 👆)
                        </span>
                        <p className="text-xl sm:text-2xl font-bold text-white leading-relaxed">
                          {currentMath.spanish}
                        </p>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-800 group-hover:bg-amber-400/20 text-slate-400 group-hover:text-amber-300">
                        {isArmRevealed ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Armenian Translation */}
                  {isArmRevealed && (
                    <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-amber-200 animate-fadeIn">
                      <span className="text-xs font-bold uppercase text-amber-300 block mb-1">
                        🇦🇲 Հայերեն թարգմանություն:
                      </span>
                      <p className="text-lg font-semibold text-amber-100">
                        {currentMath.armenian}
                      </p>
                    </div>
                  )}

                  {/* SEPARATE BUTTONS: Ответ арм и исп (առանց գուշակելու/հաշվելու դաշտի) */}
                  <div className="pt-2 border-t border-slate-800 space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        id="btn-math-ans-am"
                        onClick={() =>
                          setMathRevealedAnsAm((prev) => ({
                            ...prev,
                            [currentMath.id]: !prev[currentMath.id],
                          }))
                        }
                        className="px-5 py-3 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-base font-bold flex items-center gap-2 transition active:scale-95 shadow-lg shadow-amber-950/20"
                      >
                        🇦🇲 Պատասխան (Հայերեն)
                      </button>

                      <button
                        id="btn-math-ans-es"
                        onClick={() =>
                          setMathRevealedAnsEs((prev) => ({
                            ...prev,
                            [currentMath.id]: !prev[currentMath.id],
                          }))
                        }
                        className="px-5 py-3 rounded-2xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-base font-bold flex items-center gap-2 transition active:scale-95 shadow-lg shadow-blue-950/20"
                      >
                        🇪🇸 Respuesta (Español)
                      </button>

                      {(isAnsEsRevealed || isAnsAmRevealed) && (
                        <button
                          onClick={() => {
                            setMathRevealedAnsEs((prev) => ({ ...prev, [currentMath.id]: false }));
                            setMathRevealedAnsAm((prev) => ({ ...prev, [currentMath.id]: false }));
                          }}
                          className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition"
                        >
                          Թաքցնել պատասխանը
                        </button>
                      )}
                    </div>

                    {/* Math Solution and Answers */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {isAnsAmRevealed && (
                        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 space-y-2 animate-fadeIn">
                          <span className="text-xs font-bold uppercase text-amber-300 block">
                            🇦🇲 Պատասխանը հայերենով:
                          </span>
                          <p className="text-2xl font-black text-amber-100">
                            {currentMath.answerAm}
                          </p>
                          <p className="text-xs text-amber-300/80 font-mono bg-black/30 p-2 rounded-lg inline-block">
                            Լուծում՝ {currentMath.solution}
                          </p>
                        </div>
                      )}

                      {isAnsEsRevealed && (
                        <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-500/40 space-y-2 animate-fadeIn">
                          <span className="text-xs font-bold uppercase text-blue-300 block">
                            🇪🇸 Respuesta en español:
                          </span>
                          <p className="text-2xl font-black text-blue-100">
                            {currentMath.answerEs}
                          </p>
                          <p className="text-xs text-blue-300/80 font-mono bg-black/30 p-2 rounded-lg inline-block">
                            Operación: {currentMath.solution}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    <button
                      disabled={mathIndex === 0}
                      onClick={() => setMathIndex((prev) => Math.max(0, prev - 1))}
                      className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 text-sm font-semibold border border-slate-700 flex items-center gap-1.5 transition"
                    >
                      <ChevronLeft className="w-4 h-4" /> Նախորդը
                    </button>

                    <div className="flex gap-1.5 overflow-x-auto max-w-xs px-2">
                      {MATH_PROBLEMS.map((m, idx) => (
                        <button
                          key={m.id}
                          onClick={() => setMathIndex(idx)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition ${
                            idx === mathIndex
                              ? 'bg-rose-600 text-white'
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      disabled={mathIndex === MATH_PROBLEMS.length - 1}
                      onClick={() => setMathIndex((prev) => Math.min(MATH_PROBLEMS.length - 1, prev + 1))}
                      className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold flex items-center gap-1.5 transition"
                    >
                      Հաջորդը <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 py-4 text-center text-xs text-slate-500 mt-12 bg-slate-950">
        <p>
          Pasapalabra Español - Հայերեն • Խաղ առանց ժամանակի • Սխալ պատասխանի դեպքում խաղը շարունակվում է
        </p>
      </footer>
    </div>
  );
}
