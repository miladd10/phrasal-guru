import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PhrasalVerb, getSpeech } from '../services/dataService';
import { Languages, Volume2, Info, ChevronRight, RotateCcw, ChevronDown, Loader2 } from 'lucide-react';

const playPCM = async (base64Audio: string) => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: 24000
    });
    
    const binaryString = window.atob(base64Audio);
    const len = binaryString.length;
    // The data is 16-bit PCM (2 bytes per sample)
    const bytes = new Int16Array(len / 2);
    for (let i = 0; i < len; i += 2) {
      // Little-endian
      bytes[i / 2] = binaryString.charCodeAt(i) | (binaryString.charCodeAt(i + 1) << 8);
    }
    
    const audioBuffer = audioContext.createBuffer(1, bytes.length, 24000);
    const channelData = audioBuffer.getChannelData(0);
    for (let i = 0; i < bytes.length; i++) {
      // Normalize to [-1.0, 1.0]
      channelData[i] = bytes[i] / 32768.0;
    }
    
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();
    
    // Close context when done
    source.onended = () => {
      audioContext.close();
    };
  } catch (err) {
    console.error("Audio playback failed:", err);
  }
};

interface FlashCardProps {
  verb: PhrasalVerb;
  onNext: () => void;
  index: number;
  total: number;
  isMastered: boolean;
  onToggleMastered: (word: string) => void;
}

export default function FlashCard({ verb, onNext, index, total, isMastered, onToggleMastered }: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    setIsFlipped(false);
    setShowTranslation(false);
  }, [verb]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (!isFlipped) setShowTranslation(false); // Reset translation view when flipping back to front
  };

  const handleSpeak = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSpeaking) return;
    
    setIsSpeaking(true);
    try {
      const audioData = await getSpeech(verb.word);
      if (audioData) {
        await playPCM(audioData);
      } else {
        // Fallback to basic tts if AI fails or quota exceeded
        const utterance = new SpeechSynthesisUtterance(verb.word);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.error("Speech error:", err);
    } finally {
      setIsSpeaking(false);
    }
  };

  if (!verb) return null;

  return (
    <div className="w-full max-w-3xl mx-auto overflow-visible">
      <div className="mb-4 sm:mb-6 flex justify-between items-center px-4 sm:px-6">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold mb-1">Learning Session</span>
          <span className="text-sm font-bold text-gray-400">Word {index + 1} of {total}</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggleMastered(verb.word);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-black transition-all border ${
              isMastered 
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm shadow-emerald-100' 
                : 'bg-white text-gray-400 border-gray-200 hover:border-indigo-300 hover:text-indigo-500'
            }`}
          >
            {isMastered ? (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Mastered
              </>
            ) : 'Mark Known'}
          </button>
        </div>
      </div>

      <div className="relative min-h-[340px] sm:min-h-[420px] w-full cursor-pointer group perspective-1000" onClick={handleFlip}>
        <AnimatePresence mode="wait">
          {!isFlipped ? (
            <motion.div
              key="front"
              initial={{ rotateY: -30, opacity: 0, scale: 0.95 }}
              animate={{ rotateY: 0, opacity: 1, scale: 1 }}
              exit={{ rotateY: 30, opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="w-full min-h-[340px] sm:min-h-[420px] bg-white border border-gray-100 rounded-[2.5rem] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] p-8 sm:p-12 flex flex-col justify-center items-center text-center group-hover:shadow-[0_25px_60px_-20px_rgba(79,70,229,0.15)] transition-shadow duration-500"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600/10 rounded-t-[2.5rem]" />
              
              <div className="relative z-10 w-full">
                <motion.h2 
                  layoutId={verb.word}
                  className="text-3xl sm:text-7xl font-black text-gray-900 mb-6 sm:mb-8 tracking-tighter leading-none break-words px-4"
                >
                  {verb.word}
                </motion.h2>
                <div 
                  onClick={handleSpeak}
                  className={`inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 py-2.5 px-6 rounded-2xl transition-all cursor-pointer group/audio ${isSpeaking ? 'opacity-70 scale-95' : 'hover:bg-indigo-100'}`}
                >
                  {isSpeaking ? (
                    <Loader2 size={18} className="animate-spin text-indigo-400" />
                  ) : (
                    <Volume2 size={18} className="opacity-50 group-hover/audio:opacity-100 transition-opacity" />
                  )}
                  <span className="text-base sm:text-lg font-mono font-medium tracking-wide">
                    {verb.phonetic}
                  </span>
                </div>
              </div>

              <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-3">
                <p className="text-gray-300 text-[10px] uppercase tracking-[0.3em] font-black">
                  Tap to flip
                </p>
                <div className="flex justify-center gap-1.5 opacity-20">
                   {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-900" />)}
                </div>
              </div>

              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -z-10 opacity-40 group-hover:scale-125 transition-transform duration-700" />
            </motion.div>
          ) : (
            <motion.div
              key="back"
              initial={{ rotateY: -30, opacity: 0, scale: 0.95 }}
              animate={{ rotateY: 0, opacity: 1, scale: 1 }}
              exit={{ rotateY: 30, opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              className="w-full min-h-[340px] sm:min-h-[420px] bg-indigo-600 border border-indigo-700 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(79,70,229,0.4)] p-8 sm:p-12 flex flex-col items-stretch text-white"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
              
              <div className="relative z-10 space-y-6 flex-1 flex flex-col justify-center py-4">
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 sm:p-8 space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-2 text-indigo-200">
                    <Info size={14} />
                    <span className="text-[9px] uppercase tracking-[0.2em] font-black">Definition</span>
                  </div>
                  <p className="text-lg sm:text-2xl font-medium leading-tight text-indigo-50">
                    {verb.definition}
                  </p>
                </div>

                <div className="px-2 space-y-3">
                   <div className="flex items-center gap-2 text-indigo-300">
                      <div className="w-1 h-3 bg-indigo-400 rounded-full" />
                      <span className="text-[9px] uppercase tracking-[0.2em] font-black">Example</span>
                   </div>
                   <p className="text-sm sm:text-lg text-indigo-100/80 italic leading-relaxed font-light">
                    "{verb.example}"
                   </p>
                </div>
                
                <div className="pt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowTranslation(!showTranslation);
                    }}
                    className="flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] font-black text-indigo-300 hover:text-white transition-colors group/btn"
                  >
                    <Languages size={14} className="group-hover/btn:rotate-12 transition-transform" />
                    {showTranslation ? 'Hide translation' : 'See translation'}
                    <ChevronDown size={14} className={`transition-transform duration-300 ${showTranslation ? 'rotate-180 text-white' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {showTranslation && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 p-5 bg-white/10 rounded-2xl border border-white/5 shadow-inner">
                          <p className="text-xl sm:text-3xl font-black text-white font-farsi leading-normal text-right tracking-tight" dir="rtl">
                            {verb.translation}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <span className="text-[9px] uppercase tracking-[0.3em] font-black text-white/30">
                  Tap to flip back
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

