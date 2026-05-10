/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import { PHRASAL_VERBS_DATA, PhrasalVerb, enrichPhrasalVerb, Category } from './services/dataService';
import { IDIOMS_DATA } from './services/idioms';
import { UNIT_WORDS_DATA } from './services/unit_words';
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { 
  auth, 
  loginWithGoogle, 
  logout, 
  db, 
  syncMasteredWords, 
  saveCustomWord,
  handleFirestoreError,
  OperationType,
  upsertMemoCard,
  getMemoCards,
  removeMemoCard,
  googleProvider
} from './services/firebaseService';
import { doc, getDoc, collection, onSnapshot, query, setDoc, serverTimestamp } from 'firebase/firestore';
import FlashCard from './components/FlashCard';
import { createMemoCard, reviewMemoCard, getIntervalString, MemoCard, getNextIntervals } from './services/fsrsService';
import { Rating, State } from 'ts-fsrs';
import { 
  BookOpen, 
  Library, 
  Plus, 
  Search, 
  ArrowLeft, 
  ArrowRight,
  Loader2,
  Sparkles,
  LogOut,
  ChevronRight,
  ChevronDown,
  User as UserIcon,
  BrainCircuit,
  History,
  Calendar,
  Layers,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { isAfter, startOfDay } from 'date-fns';

// Shuffle helper
const shuffle = <T,>(array: T[]): T[] => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

const isInIframe = typeof window !== 'undefined' && window.self !== window.top;
const authMode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('mode') === 'auth';

export default function App() {
  const [activeCategory, setActiveCategory] = useState<Category | 'words'>('phrasal');
  const [selectedUnit, setSelectedUnit] = useState<'unit0' | 'unit2' | 'unit4' | 'unit6' | 'unit8' | 'unit10' | 'unit12' | 'unit14' | 'unit16' | 'unit18' | 'unit20' | 'unit22' | 'unit24' | 'unit26'>('unit2');
  const [addCategory, setAddCategory] = useState<'phrasal' | 'idiom' | 'unit0'>('phrasal');
  const [user, setUser] = useState<User | null>(null);
  const [memoCards, setMemoCards] = useState<Map<string, MemoCard>>(new Map());
  const [isSyncingMemo, setIsSyncingMemo] = useState(false);
  
  useEffect(() => {
    setCurrentIndex(0);
  }, [activeCategory, selectedUnit]);
  const [view, setView] = useState<'study' | 'library' | 'add' | 'memoflow'>('study');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [customVerbs, setCustomVerbs] = useState<PhrasalVerb[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [popupBlocked, setPopupBlocked] = useState(false);
  const [inputText, setInputText] = useState('');
  const [masteredWords, setMasteredWords] = useState<Set<string>>(new Set());
  const [showOnlyUnmastered, setShowOnlyUnmastered] = useState(true); // Default to true as requested
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [deckToAdd, setDeckToAdd] = useState<string>('Default');
  const [showDeckSelector, setShowDeckSelector] = useState<{word: PhrasalVerb} | null>(null);

  // Mastered List Sync
  useEffect(() => {
    if (!user) {
      setMasteredWords(new Set());
      setCustomVerbs([]);
      return;
    }

    // Fetch mastered list (Initial)
    const userDoc = doc(db, 'users', user.uid);
    getDoc(userDoc)
      .then(snap => {
        if (snap.exists()) {
          setMasteredWords(new Set(snap.data().masteredWords || []));
        }
      })
      .catch(error => handleFirestoreError(error, OperationType.GET, `users/${user.uid}`));

    // Keep custom verbs in sync (Listener)
    const q = query(collection(db, 'users', user.uid, 'customVerbs'));
    const unsubVerbs = onSnapshot(q, (snapshot) => {
      const verbs: PhrasalVerb[] = [];
      snapshot.forEach((doc) => {
        verbs.push({ id: doc.id, ...doc.data() } as PhrasalVerb);
      });
      setCustomVerbs(verbs);
    }, (error) => {
      // Only report error if we still have a user (prevents logout noise)
      if (auth.currentUser) {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}/customVerbs`);
      }
    });

    return () => unsubVerbs();
  }, [user]);

  // Sync Memo Cards
  useEffect(() => {
    if (!user) {
      setMemoCards(new Map());
      return;
    }

    const loadMemoCards = async () => {
      setIsSyncingMemo(true);
      try {
        const cards = await getMemoCards(user.uid);
        const cardMap = new Map<string, MemoCard>();
        cards.forEach(c => cardMap.set(c.wordId, c));
        setMemoCards(cardMap);
      } catch (error) {
        console.error("Failed to load memo cards:", error);
      } finally {
        setIsSyncingMemo(false);
      }
    };

    loadMemoCards();
  }, [user]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      console.log("Auth state changed:", u?.email);
      setUser(u);
      setIsInitialLoad(false);
    });
    return () => unsubscribe();
  }, []);

  // Handle auth popup mode - auto-trigger login and close
  useEffect(() => {
    if (!authMode) return;
    
    const triggerLogin = async () => {
      try {
        await signInWithPopup(auth, googleProvider);
        if (window.opener) {
          window.opener.postMessage({ type: 'FIREBASE_AUTH_SUCCESS' }, window.location.origin);
        }
        window.close();
      } catch (error) {
        console.error("Popup auth error:", error);
        window.close();
      }
    };

    triggerLogin();
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setPopupBlocked(false);

    // Open popup synchronously from click handler (prevents browser blocking)
    const authWindow = window.open(
      `${window.location.origin}?mode=auth`,
      'firebaseAuth',
      'width=500,height=600,toolbar=no,scrollbars=yes,resizable=yes'
    );

    if (!authWindow) {
      // Popup was blocked
      setIsLoggingIn(false);
      setPopupBlocked(true);
      return;
    }

    // Listen for success message from the popup
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'FIREBASE_AUTH_SUCCESS') {
        window.removeEventListener('message', handleMessage);
        setIsLoggingIn(false);
      }
    };
    window.addEventListener('message', handleMessage);

    // Cleanup if popup is closed without logging in
    const pollClosed = setInterval(() => {
      if (authWindow.closed) {
        clearInterval(pollClosed);
        window.removeEventListener('message', handleMessage);
        setIsLoggingIn(false);
      }
    }, 500);
  };

  const allVerbs = useMemo(() => {
    const combined = [
      ...PHRASAL_VERBS_DATA.map(v => ({...v, category: v.category || 'phrasal' as Category})), 
      ...IDIOMS_DATA,
      ...UNIT_WORDS_DATA,
      ...customVerbs
    ];
    return shuffle(combined);
  }, [customVerbs, isInitialLoad]); 

  const studyVerbs = useMemo(() => {
    let filtered = allVerbs;
    if (activeCategory === 'words') {
      filtered = filtered.filter(v => v.category === selectedUnit);
    } else if (activeCategory) {
      filtered = filtered.filter(v => v.category === activeCategory);
    }
    if (showOnlyUnmastered) {
      filtered = filtered.filter(v => !masteredWords.has(v.word));
    }
    // Exclude words that are in MemoFlow
    filtered = filtered.filter(v => !memoCards.has(v.word));
    
    return filtered;
  }, [allVerbs, masteredWords, showOnlyUnmastered, activeCategory, selectedUnit, memoCards]);

  const filteredVerbs = useMemo(() => {
    let filtered = allVerbs;
    if (activeCategory === 'words') {
      filtered = filtered.filter(v => v.category === selectedUnit);
    } else if (activeCategory) {
      filtered = filtered.filter(v => v.category === activeCategory);
    }
    return filtered.filter(v => 
      v.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.definition.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allVerbs, searchQuery, activeCategory, selectedUnit]);

  const handleNext = () => {
    if (studyVerbs.length === 0) return;
    if (currentIndex < studyVerbs.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const toggleMastered = useCallback(async (word: string) => {
    const nextMastered = new Set<string>(masteredWords);
    if (nextMastered.has(word)) nextMastered.delete(word);
    else nextMastered.add(word);
    
    setMasteredWords(nextMastered);
    
    if (user) {
      await syncMasteredWords(user.uid, Array.from(nextMastered));
    }
  }, [masteredWords, user]);

  const handleAddToMemoFlow = async (verb: PhrasalVerb, deckName: string = 'Default') => {
    if (!user) {
      alert("Please login to use MemoFlow (Spaced Repetition).");
      return;
    }

    const newCard = createMemoCard(verb.word, verb.category, deckName);
    const nextMemoCards = new Map(memoCards);
    nextMemoCards.set(verb.word, newCard);
    setMemoCards(nextMemoCards);

    await upsertMemoCard(user.uid, newCard);
    setShowDeckSelector(null);
  };

  const handleAddVerbs = async () => {
    if (!inputText.trim()) return;
    setIsProcessing(true);
    try {
      const targetCat = addCategory;
      const newVerbs = await enrichPhrasalVerb(inputText, targetCat as Category);
      if (user) {
        for (const v of newVerbs) {
          await saveCustomWord(user.uid, v);
        }
      } else {
        setCustomVerbs(prev => [...prev, ...newVerbs]);
      }
      setInputText('');
      setView('library');
    } catch (error) {
      alert("Failed to process text. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (authMode) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white font-sans">
        <div className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-100 animate-pulse">
            <BookOpen size={32} className="text-white" />
          </div>
          <Loader2 size={32} className="animate-spin text-indigo-600 mt-4" />
          <p className="text-sm font-bold text-gray-900 mt-2">Signing in with Google...</p>
          <p className="text-xs text-gray-500">This window will close automatically after login.</p>
        </div>
      </div>
    );
  }

  if (isInitialLoad) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center overflow-hidden shadow-xl shadow-indigo-100 animate-pulse mb-4">
          <img src="/logo.png" alt="Lexis Logo" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
          <BookOpen size={32} className="absolute text-white" />
        </div>
        <Loader2 className="animate-spin text-indigo-600" size={24} />
        <p className="mt-4 text-xs font-black uppercase tracking-widest text-indigo-500">Initializing Lexis...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center overflow-hidden shadow-lg shadow-indigo-100 ring-4 ring-indigo-50 relative">
              <img src="/logo.png" alt="Lexis Logo" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
              <BookOpen size={20} className="sm:w-6 sm:h-6 absolute text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-gray-900 leading-none">Lexis</h1>
              <p className="text-[8px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.2em] text-indigo-500 font-black">Vocabulary System</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 bg-gray-100 p-1.5 rounded-2xl shadow-inner">
            <button
              onClick={() => setView('study')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                view === 'study' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Study
            </button>
            <button
              onClick={() => setView('library')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                view === 'library' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Library
            </button>
            <button
              onClick={() => setView('memoflow')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                view === 'memoflow' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <BrainCircuit size={16} />
              MemoFlow
            </button>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <button 
                onClick={logout}
                className="flex items-center gap-2 p-2.5 bg-gray-50 text-gray-500 hover:text-red-500 rounded-xl transition-all border border-gray-100"
                title="Logout"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline text-xs font-bold">Logout</span>
              </button>
            ) : (
              <div className="flex flex-col items-end gap-1">
                <button 
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all shadow-md disabled:opacity-50 ${
                    popupBlocked ? 'bg-orange-500 hover:bg-orange-600' : 'bg-indigo-600 hover:bg-indigo-700'
                  } text-white`}
                >
                  {isLoggingIn ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <UserIcon size={14} />
                  )}
                  {popupBlocked ? 'Retry Login' : (isLoggingIn ? 'Connecting...' : 'Login with Google')}
                </button>
                {popupBlocked && (
                  <div className="flex flex-col items-end gap-1 mt-1 bg-orange-50 p-2 rounded-lg border border-orange-200">
                    <p className="text-[9px] text-orange-700 font-bold flex items-center gap-1">
                      <AlertCircle size={10} /> Popup Blocked
                    </p>
                    <button 
                      onClick={() => window.open(window.location.href, '_blank')}
                      className="flex items-center gap-1 text-[9px] bg-white border border-orange-300 px-2 py-1 rounded text-orange-700 hover:bg-orange-100 font-bold shadow-sm"
                    >
                      <ExternalLink size={10} />
                      Open in New Tab
                    </button>
                  </div>
                )}
              </div>
            )}
            
            <button
              onClick={() => setView('add')}
              className={`hidden sm:flex w-12 h-12 rounded-2xl items-center justify-center transition-all shadow-md group ${
                view === 'add' ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-white text-gray-400 hover:text-indigo-600 border border-gray-100'
              }`}
            >
              <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-8 pb-4 sm:pb-2">
        {showDeckSelector && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border border-indigo-50"
            >
              <div className="flex items-center gap-3 mb-6">
                 <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Layers size={20} />
                 </div>
                 <div>
                    <h3 className="text-lg font-black text-gray-900">Add to Deck</h3>
                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Choose or create a deck</p>
                 </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                   <p className="text-[10px] font-black uppercase text-gray-400 ml-1">Existing Decks</p>
                   <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                      {(Array.from(memoCards.values()) as MemoCard[]).reduce((acc: string[], c) => {
                        const d = c.deck || 'Default';
                        if (!acc.includes(d)) acc.push(d);
                        return acc;
                      }, []).map(deck => (
                        <button
                          key={deck}
                          onClick={() => handleAddToMemoFlow(showDeckSelector.word, deck)}
                          className="px-3 py-1.5 bg-gray-50 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 rounded-lg text-xs font-bold transition-all border border-gray-100 hover:border-indigo-200"
                        >
                          {deck}
                        </button>
                      ))}
                   </div>
                </div>

                <div className="space-y-2 pt-2">
                   <p className="text-[10px] font-black uppercase text-gray-400 ml-1">Create New Deck</p>
                   <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Deck name..."
                        className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-sm outline-none focus:border-indigo-300 transition-all font-bold"
                        value={deckToAdd}
                        onChange={(e) => setDeckToAdd(e.target.value)}
                      />
                      <button
                        onClick={() => {
                          if (deckToAdd.trim()) {
                            handleAddToMemoFlow(showDeckSelector.word, deckToAdd.trim());
                            setDeckToAdd('Default');
                          }
                        }}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-indigo-100"
                      >
                        Add
                      </button>
                   </div>
                </div>
              </div>

              <button
                onClick={() => setShowDeckSelector(null)}
                className="w-full mt-6 py-3 text-gray-400 hover:text-gray-600 font-bold text-xs uppercase tracking-widest transition-all"
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}

        <div className="w-full max-w-lg mb-2 sm:mb-4 flex flex-col items-center gap-4 px-2 sm:px-4 mx-auto">
             <div className="flex bg-gray-100 p-1 rounded-full shadow-inner overflow-x-auto max-w-full">
               <button 
                 onClick={() => setActiveCategory('phrasal')}
                 className={`whitespace-nowrap px-4 sm:px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
                   activeCategory === 'phrasal' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                 }`}
               >
                 Phrasals
               </button>
               <button 
                 onClick={() => setActiveCategory('idiom')}
                 className={`whitespace-nowrap px-4 sm:px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
                   activeCategory === 'idiom' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                 }`}
               >
                 Idioms
               </button>
               <button 
                 onClick={() => setActiveCategory('words')}
                 className={`whitespace-nowrap px-4 sm:px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
                   activeCategory === 'words' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                 }`}
               >
                 Words
               </button>
             </div>

             {activeCategory === 'words' && (
                <div className="relative">
                  <select 
                    value={selectedUnit}
                    onChange={(e) => setSelectedUnit(e.target.value as any)}
                    className="appearance-none bg-white border border-gray-200 text-gray-700 text-[10px] font-black uppercase tracking-widest px-8 py-2.5 rounded-full pr-10 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-sm transition-all hover:bg-gray-50"
                  >
                    <option value="unit0">Unit 0: Others</option>
                    <option value="unit2">Unit 2: Thinking & Learning</option>
                    <option value="unit4">Unit 4: Change & Tech</option>
                    <option value="unit6">Unit 6: Time & Work</option>
                    <option value="unit8">Unit 8: Movement</option>
                    <option value="unit10">Unit 10: Communication & Media</option>
                    <option value="unit12">Unit 12: Chance & Nature</option>
                    <option value="unit14">Unit 14: Quantity & Money</option>
                    <option value="unit16">Unit 16: Materials & Places</option>
                    <option value="unit18">Unit 18: Behavior & Health</option>
                    <option value="unit20">Unit 20: Power & Social Issues</option>
                    <option value="unit22">Unit 22: Quality & The Arts</option>
                    <option value="unit24">Unit 24: Connections & People</option>
                    <option value="unit26">Unit 26: Preference & Leisure</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-500">
                    <ChevronDown size={14} strokeWidth={3} />
                  </div>
                </div>
             )}

        </div>

        <AnimatePresence mode="wait">
          {view === 'study' && (
            <motion.div
              key="study"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center"
            >

              {studyVerbs.length > 0 ? (
                <div className="w-full max-w-2xl mx-auto space-y-8">
                  <FlashCard 
                    verb={studyVerbs[currentIndex] || studyVerbs[0]} 
                    onNext={handleNext}
                    index={currentIndex}
                    total={studyVerbs.length}
                    isMastered={masteredWords.has(studyVerbs[currentIndex]?.word)}
                    onToggleMastered={toggleMastered}
                    onAddToMemoFlow={(v) => setShowDeckSelector({ word: v })}
                  />

                  {/* Navigation Controls - Flow Layout */}
                  <div className="flex items-center justify-center gap-4 px-4 pb-4">
                    <button
                      onClick={() => {
                        if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
                        else setCurrentIndex(studyVerbs.length - 1);
                      }}
                      className="w-16 h-16 sm:w-16 sm:h-16 bg-white border border-gray-100 text-gray-400 rounded-2xl shadow-sm hover:text-indigo-600 transition-all flex items-center justify-center active:scale-95 group"
                      title="Previous Word"
                    >
                      <ArrowLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    
                    <button
                      onClick={handleNext}
                      className="w-16 h-16 sm:w-16 sm:h-16 bg-white border border-gray-100 text-gray-400 rounded-2xl shadow-sm hover:text-indigo-600 transition-all flex items-center justify-center active:scale-95 group"
                      title="Next Word"
                    >
                      <ArrowRight size={28} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>

                  <div className="flex justify-center pb-4">
                    <button 
                      onClick={() => setShowOnlyUnmastered(!showOnlyUnmastered)}
                      className={`text-[9px] uppercase tracking-wider font-extrabold px-6 py-2 rounded-full border transition-all ${
                        showOnlyUnmastered ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-gray-200 text-gray-400'
                      }`}
                    >
                      {showOnlyUnmastered ? 'Target: New Items' : 'Target: All Items'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-32">
                   <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500 mx-auto mb-6">
                      <Sparkles size={40} />
                   </div>
                   <h3 className="text-2xl font-black text-gray-900 mb-2">You've mastered everything!</h3>
                   <p className="text-gray-500 mb-8">Add more words or reset your progress to study again.</p>
                   <button 
                    onClick={() => setShowOnlyUnmastered(false)}
                    className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100"
                   >
                     Review All Cards
                   </button>
                </div>
              )}
            </motion.div>
          )}

          {view === 'library' && (
            <motion.div
              key="library"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search your vocabulary..."
                  className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-12 pr-6 outline-none focus:border-indigo-500 transition-colors shadow-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredVerbs.map((v, i) => (
                  <motion.div
                    layout
                    key={v.word + i}
                    className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {v.word}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] uppercase font-black px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-500">
                          {v.category}
                        </span>
                        <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded">
                          {v.phonetic}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{v.definition}</p>
                    <p className="text-xs text-gray-400 italic mb-4">"{v.example}"</p>
                    <div className="pt-3 border-t border-gray-50 flex justify-between items-center">
                       <span className="text-sm font-medium text-indigo-500 font-farsi" dir="rtl">{v.translation}</span>
                       <button 
                        onClick={() => {
                          setCurrentIndex(allVerbs.indexOf(v));
                          setView('study');
                        }}
                        className="text-[10px] uppercase tracking-tighter font-bold text-gray-300 hover:text-indigo-400 transition-colors"
                       >
                        Practice Now
                       </button>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {filteredVerbs.length === 0 && (
                <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                  <Library className="mx-auto text-gray-300 mb-4" size={48} />
                  <p className="text-gray-500 font-medium">No words found matching your search.</p>
                </div>
              )}
            </motion.div>
          )}

          {view === 'memoflow' && (
            <motion.div
              key="memoflow"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full max-w-4xl mx-auto"
            >
              <MemoFlowContent 
                allVerbs={allVerbs}
                memoCards={memoCards}
                user={user}
                onSetView={setView}
                onUpdateCard={async (updatedCard) => {
                  const nextCards = new Map(memoCards);
                  nextCards.set(updatedCard.wordId, updatedCard);
                  setMemoCards(nextCards);
                  if (user) await upsertMemoCard(user.uid, updatedCard);
                }}
              />
            </motion.div>
          )}

          {view === 'add' && (
            <motion.div
              key="add"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-2xl mx-auto space-y-8"
            >
              <div className="text-center">
                <Sparkles className="mx-auto text-indigo-500 mb-4" size={40} />
                <h2 className="text-2xl font-bold text-gray-900">Add New Vocabulary</h2>
                <p className="text-gray-500 mt-2">Paste raw text from a book or list. Our AI will automatically extract items, definitions, phonetics, and translations.</p>
              </div>

              <div className="flex justify-center bg-gray-100 p-1.5 rounded-2xl shadow-inner max-w-sm mx-auto">
                <button 
                  onClick={() => setAddCategory('phrasal')}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    addCategory === 'phrasal' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Phrasals
                </button>
                <button 
                  onClick={() => setAddCategory('idiom')}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    addCategory === 'idiom' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Idioms
                </button>
                <button 
                  onClick={() => setAddCategory('unit0')}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    addCategory === 'unit0' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Words
                </button>
              </div>

              <div className="space-y-4">
                <textarea
                  className="w-full h-64 bg-white border border-gray-200 rounded-3xl p-6 outline-none focus:border-indigo-500 transition-colors shadow-sm resize-none"
                  placeholder={addCategory === 'phrasal' ? "Example: add up to combine to produce a particular result or effect: These new measures do not add up to genuine reform..." : addCategory === 'idiom' ? "Example: a drop in the ocean A very small amount that will not have much effect..." : "Example: assess to judge or evaluate someone or something carefully..."}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
                
                <div className="flex gap-4">
                  <button
                    onClick={() => setView('library')}
                    className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                  >
                    <ArrowLeft size={20} />
                    Cancel
                  </button>
                  <button
                    onClick={handleAddVerbs}
                    disabled={isProcessing || !inputText.trim()}
                    className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-indigo-200"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Processing with AI...
                      </>
                    ) : (
                      <>
                        Process and Add to Library
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/90 backdrop-blur-lg border-t border-gray-100 p-2 pb-safe">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          <button
            onClick={() => setView('study')}
            className={`flex flex-col items-center gap-1 p-2 transition-all ${
              view === 'study' ? 'text-indigo-600' : 'text-gray-400'
            }`}
          >
            <div className={`p-1 rounded-lg ${view === 'study' ? 'bg-indigo-50' : ''}`}>
              <BookOpen size={22} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-tighter">Study</span>
          </button>
          
          <button
            onClick={() => setView('add')}
            className={`-translate-y-4 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
              view === 'add' ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600 border border-indigo-100'
            }`}
          >
            <Plus size={28} />
          </button>

          <button
            onClick={() => setView('library')}
            className={`flex flex-col items-center gap-1 p-2 transition-all ${
              view === 'library' ? 'text-indigo-600' : 'text-gray-400'
            }`}
          >
            <div className={`p-1 rounded-lg ${view === 'library' ? 'bg-indigo-50' : ''}`}>
              <Library size={22} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-tighter">Library</span>
          </button>

          <button
            onClick={() => setView('memoflow')}
            className={`flex flex-col items-center gap-1 p-2 transition-all ${
              view === 'memoflow' ? 'text-indigo-600' : 'text-gray-400'
            }`}
          >
            <div className={`p-1 rounded-lg ${view === 'memoflow' ? 'bg-indigo-50' : ''}`}>
              <BrainCircuit size={22} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-tighter">Memo</span>
          </button>
        </div>
      </nav>

      {/* Footer Decoration */}
      <footer className="max-w-5xl mx-auto px-6 py-2 text-center pb-20 md:pb-6">
        <p className="text-gray-300 text-[10px] uppercase tracking-[0.2em] font-bold">
          Knowledge is Power • Build your Vocabulary
        </p>
      </footer>
    </div>
  );
}

// --- MemoFlow Sub-components ---

interface MemoFlowContentProps {
  allVerbs: PhrasalVerb[];
  memoCards: Map<string, MemoCard>;
  user: User | null;
  onSetView: (view: 'study' | 'library' | 'add' | 'memoflow') => void;
  onUpdateCard: (card: MemoCard) => Promise<void>;
}

function MemoFlowContent({ allVerbs, memoCards, user, onSetView, onUpdateCard }: MemoFlowContentProps) {
  const [sessionDeck, setSessionDeck] = useState<string | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);

  // Group cards into decks (categories)
  const decks = useMemo(() => {
    const d: Record<string, { all: number; due: number; new: number; cards: MemoCard[] }> = {};
    const now = new Date();

    memoCards.forEach(card => {
      const deckName = card.deck || 'Default';
      if (!d[deckName]) d[deckName] = { all: 0, due: 0, new: 0, cards: [] };
      
      d[deckName].all++;
      d[deckName].cards.push(card);
      if (card.reps === 0) d[deckName].new++;
      else if (isAfter(now, (card.due as Date))) d[deckName].due++;
    });

    return d;
  }, [memoCards]);

  const activeDeckCards = useMemo(() => {
    if (!sessionDeck || !decks[sessionDeck]) return [];
    // Sort cards: Due first, then New
    const now = new Date();
    return decks[sessionDeck].cards
      .filter(c => isAfter(now, (c.due as Date)) || c.reps === 0)
      .sort((a,b) => (a.due as Date).getTime() - (b.due as Date).getTime());
  }, [sessionDeck, decks]);

  if (!user) {
    return (
      <div className="text-center py-20">
        <BrainCircuit size={48} className="mx-auto text-gray-200 mb-6" />
        <h3 className="text-xl font-bold text-gray-900">Login Required</h3>
        <p className="text-gray-500 mt-2">Sign in to track your progress with Spaced Repetition.</p>
      </div>
    );
  }

  if (sessionDeck && activeDeckCards.length > 0) {
    const currentCard = activeDeckCards[currentIdx];
    const verb = allVerbs.find(v => v.word === currentCard.wordId);

    if (!verb) return null;

    const handleReview = async (rating: Rating) => {
      const { card: updatedCard } = reviewMemoCard(currentCard, rating);
      await onUpdateCard(updatedCard);
      
      if (currentIdx < activeDeckCards.length - 1) {
        setCurrentIdx(currentIdx + 1);
      } else {
        setSessionDeck(null);
        setCurrentIdx(0);
      }
    };

    const nextIntervals = getNextIntervals(currentCard);

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between px-4">
          <button 
            onClick={() => setSessionDeck(null)}
            className="flex items-center gap-2 text-indigo-600 font-bold text-sm hover:translate-x-1 transition-transform"
          >
            <ArrowLeft size={18} />
            Back to Decks
          </button>
          <div className="text-right">
            <span className="text-[10px] uppercase font-black text-gray-400 tracking-widest">
              Reviewing: {sessionDeck}
            </span>
            <p className="text-sm font-bold text-indigo-600">
              {currentIdx + 1} / {activeDeckCards.length}
            </p>
          </div>
        </div>

        <FlashCard 
          verb={verb}
          index={currentIdx}
          total={activeDeckCards.length}
          onNext={() => {}} // Not used here as we have review buttons
          isMastered={false}
          onToggleMastered={() => {}}
          isInMemoFlow={true}
        />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-4 max-w-2xl mx-auto">
          {[
            { label: 'Again', color: 'bg-red-50 text-red-600 border-red-100', rating: Rating.Again },
            { label: 'Hard', color: 'bg-orange-50 text-orange-600 border-orange-100', rating: Rating.Hard },
            { label: 'Good', color: 'bg-green-50 text-green-600 border-green-100', rating: Rating.Good },
            { label: 'Easy', color: 'bg-blue-50 text-blue-600 border-blue-100', rating: Rating.Easy },
          ].map((btn) => (
            <button
              key={btn.label}
              onClick={() => handleReview(btn.rating)}
              className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all active:scale-95 hover:shadow-md ${btn.color}`}
            >
              <span className="text-sm font-black uppercase tracking-wider">{btn.label}</span>
              <span className="text-[10px] font-medium opacity-60 mt-1">
                {getIntervalString(nextIntervals[btn.rating])}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-indigo-600 rounded-[2.5rem] p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
             <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl">
                <BrainCircuit size={24} />
             </div>
             <span className="text-[10px] uppercase font-black tracking-[0.3em] opacity-70">Learning Engine</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">Your Memory Flow</h2>
          <p className="text-indigo-100 text-sm sm:text-lg max-w-xl font-medium leading-relaxed">
            Words in MemoFlow use a spaced-repetition algorithm to ensure you never forget what you've learned. Review your decks daily.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full -ml-32 -mb-32 blur-3xl animate-pulse" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(decks).length > 0 ? (
          (Object.entries(decks) as [string, { all: number; due: number; new: number; cards: MemoCard[] }][]).map(([cat, stats]) => (
            <button
              key={cat}
              onClick={() => {
                if (stats.due + stats.new > 0) {
                  setSessionDeck(cat);
                  setCurrentIdx(0);
                }
              }}
              className="p-8 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left flex flex-col group relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-gray-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                  <Layers size={24} />
                </div>
                <div className="flex flex-col items-end">
                   <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">{cat}</span>
                   <div className="flex gap-1 mt-2">
                      <div className={`w-2 h-2 rounded-full ${stats.due > 0 ? 'bg-orange-500 animate-pulse' : 'bg-gray-200'}`} />
                      <div className={`w-2 h-2 rounded-full ${stats.new > 0 ? 'bg-indigo-500' : 'bg-gray-200'}`} />
                   </div>
                </div>
              </div>
              
              <h3 className="text-2xl font-black text-gray-900 mb-6 capitalize">{cat}s</h3>
              
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-50">
                <div>
                  <p className="text-lg font-black text-indigo-600">{stats.due}</p>
                  <p className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Due</p>
                </div>
                <div>
                  <p className="text-lg font-black text-indigo-600">{stats.new}</p>
                  <p className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">New</p>
                </div>
                <div>
                  <p className="text-lg font-black text-gray-300">{stats.all}</p>
                  <p className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Total</p>
                </div>
              </div>

              {stats.due + stats.new === 0 && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="px-4 py-2 bg-white shadow-xl rounded-full text-xs font-bold text-indigo-600 border border-indigo-50">
                    Done for today!
                  </span>
                </div>
              )}
            </button>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
            <History size={48} className="mx-auto text-gray-300 mb-6" />
            <h3 className="text-xl font-bold text-gray-900">Your Decks are Empty</h3>
            <p className="text-gray-500 mt-2 mb-8">Go to Study or Library and add some words to start your MemoFlow!</p>
            <button 
              onClick={() => onSetView('study')}
              className="px-8 py-3 bg-white border border-gray-200 text-indigo-600 rounded-2xl font-bold shadow-sm hover:border-indigo-600 transition-all"
            >
              Start Studying
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
         <div className="p-8 bg-indigo-50 rounded-[2.5rem] flex items-start gap-6 border border-indigo-100/50">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm shrink-0">
               <Calendar size={24} />
            </div>
            <div>
               <h4 className="font-black text-gray-900 mb-1">Consistency is Key</h4>
               <p className="text-sm text-indigo-900/60 leading-relaxed font-medium">FSRS optimizes for your long-term memory. Reviewing just 5-10 minutes every day is 10x more effective than cramming once a week.</p>
            </div>
         </div>
         <div className="p-8 bg-emerald-50 rounded-[2.5rem] flex items-start gap-6 border border-emerald-100/50">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
               <Sparkles size={24} />
            </div>
            <div>
               <h4 className="font-black text-gray-900 mb-1">How it Works</h4>
               <p className="text-sm text-emerald-900/60 leading-relaxed font-medium">Based on your feedback (Again-Easy), the system calculates exactly when you're about to forget a word and brings it back to you.</p>
            </div>
         </div>
      </div>
    </div>
  );
}
