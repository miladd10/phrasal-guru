/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import { PHRASAL_VERBS_DATA, PhrasalVerb, enrichPhrasalVerb } from './services/dataService';
import { 
  auth, 
  loginWithGoogle, 
  logout, 
  db, 
  syncMasteredVerbs, 
  saveCustomVerb,
  handleFirestoreError,
  OperationType 
} from './services/firebaseService';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, collection, onSnapshot, query } from 'firebase/firestore';
import FlashCard from './components/FlashCard';
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
  User as UserIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Shuffle helper
const shuffle = <T,>(array: T[]): T[] => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'study' | 'library' | 'add'>('study');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [customVerbs, setCustomVerbs] = useState<PhrasalVerb[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [inputText, setInputText] = useState('');
  const [masteredVerbs, setMasteredVerbs] = useState<Set<string>>(new Set());
  const [showOnlyUnmastered, setShowOnlyUnmastered] = useState(true); // Default to true as requested
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Mastered List Sync
  useEffect(() => {
    if (!user) {
      setMasteredVerbs(new Set());
      setCustomVerbs([]);
      return;
    }

    // Fetch mastered list (Initial)
    const userDoc = doc(db, 'users', user.uid);
    getDoc(userDoc)
      .then(snap => {
        if (snap.exists()) {
          setMasteredVerbs(new Set(snap.data().masteredVerbs || []));
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

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      console.log("Auth state changed:", u?.email);
      setUser(u);
      setIsInitialLoad(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await loginWithGoogle();
      if (result) {
        setUser(result.user);
      }
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const allVerbs = useMemo(() => {
    const combined = [...PHRASAL_VERBS_DATA, ...customVerbs];
    return shuffle(combined);
  }, [customVerbs, isInitialLoad]); // Reshuffle when app loads or data changes

  const studyVerbs = useMemo(() => {
    if (showOnlyUnmastered) {
      return allVerbs.filter(v => !masteredVerbs.has(v.verb));
    }
    return allVerbs;
  }, [allVerbs, masteredVerbs, showOnlyUnmastered]);

  const filteredVerbs = useMemo(() => {
    return allVerbs.filter(v => 
      v.verb.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.definition.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allVerbs, searchQuery]);

  const handleNext = () => {
    if (studyVerbs.length === 0) return;
    if (currentIndex < studyVerbs.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const toggleMastered = useCallback(async (verb: string) => {
    const nextMastered = new Set<string>(masteredVerbs);
    if (nextMastered.has(verb)) nextMastered.delete(verb);
    else nextMastered.add(verb);
    
    setMasteredVerbs(nextMastered);
    
    if (user) {
      await syncMasteredVerbs(user.uid, Array.from(nextMastered));
    }
  }, [masteredVerbs, user]);

  const handleAddVerbs = async () => {
    if (!inputText.trim()) return;
    setIsProcessing(true);
    try {
      const newVerbs = await enrichPhrasalVerb(inputText);
      if (user) {
        for (const v of newVerbs) {
          await saveCustomVerb(user.uid, v);
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

  if (isInitialLoad) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 animate-pulse mb-4">
          <BookOpen size={32} />
        </div>
        <Loader2 className="animate-spin text-indigo-600" size={24} />
        <p className="mt-4 text-xs font-black uppercase tracking-widest text-indigo-500">Initializing Guru...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 ring-4 ring-indigo-50">
              <BookOpen size={20} className="sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-gray-900 leading-none">Phrasal Guru</h1>
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
              <button 
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-gray-200 rounded-xl text-[10px] sm:text-xs font-bold hover:border-indigo-500 transition-all shadow-sm disabled:opacity-50"
              >
                {isLoggingIn ? (
                  <Loader2 size={14} className="animate-spin text-indigo-600" />
                ) : (
                  <UserIcon size={14} className="text-indigo-600" />
                )}
                {isLoggingIn ? 'Connecting...' : 'Login'}
              </button>
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

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-12 pb-24 sm:pb-12">
        <AnimatePresence mode="wait">
          {view === 'study' && (
            <motion.div
              key="study"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center"
            >
              <div className="w-full max-w-lg mb-6 sm:mb-8 flex justify-center px-2 sm:px-4">
                 <button 
                  onClick={() => setShowOnlyUnmastered(!showOnlyUnmastered)}
                  className={`text-[9px] sm:text-[10px] uppercase tracking-wider font-black px-4 sm:px-5 py-2.5 sm:py-2 rounded-full border transition-all ${
                    showOnlyUnmastered ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-gray-200 text-gray-400'
                  }`}
                 >
                   {showOnlyUnmastered ? 'Mode: Target New' : 'Mode: Master Review'}
                 </button>
              </div>

              {studyVerbs.length > 0 ? (
                <div className="w-full max-w-2xl mx-auto space-y-8">
                  <FlashCard 
                    verb={studyVerbs[currentIndex] || studyVerbs[0]} 
                    onNext={handleNext}
                    index={currentIndex}
                    total={studyVerbs.length}
                    isMastered={masteredVerbs.has(studyVerbs[currentIndex]?.verb)}
                    onToggleMastered={toggleMastered}
                  />

                  {/* Navigation Controls - Flow Layout */}
                  <div className="flex items-center justify-center gap-4 px-4 pb-8">
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
                    key={v.verb + i}
                    className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow group"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {v.verb}
                      </h3>
                      <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded">
                        {v.phonetic}
                      </span>
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
                <p className="text-gray-500 mt-2">Paste raw text from a book or list. Our AI will automatically extract verbs, definitions, phonetics, and translations.</p>
              </div>

              <div className="space-y-4">
                <textarea
                  className="w-full h-64 bg-white border border-gray-200 rounded-3xl p-6 outline-none focus:border-indigo-500 transition-colors shadow-sm resize-none"
                  placeholder="Example: add up to combine to produce a particular result or effect: These new measures do not add up to genuine reform..."
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
        </div>
      </nav>

      {/* Footer Decoration */}
      <footer className="max-w-5xl mx-auto px-6 py-12 text-center pb-32 md:pb-12">
        <p className="text-gray-300 text-[10px] uppercase tracking-[0.2em] font-bold">
          Knowledge is Power • Build your Vocabulary
        </p>
      </footer>
    </div>
  );
}
