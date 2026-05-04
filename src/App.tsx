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
  Loader2,
  Sparkles,
  LogOut,
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
  const [inputText, setInputText] = useState('');
  const [masteredVerbs, setMasteredVerbs] = useState<Set<string>>(new Set());
  const [showOnlyUnmastered, setShowOnlyUnmastered] = useState(true); // Default to true as requested
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Auth & Mastered List Sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Fetch mastered list
        const userDoc = doc(db, 'users', u.uid);
        try {
          const snap = await getDoc(userDoc);
          if (snap.exists()) {
            setMasteredVerbs(new Set(snap.data().masteredVerbs || []));
          }
        } catch (error) {
          console.error("Error fetching user data", error);
        }

        // Keep custom verbs in sync
        const q = query(collection(db, 'users', u.uid, 'customVerbs'));
        const unsubVerbs = onSnapshot(q, (snapshot) => {
          const verbs: PhrasalVerb[] = [];
          snapshot.forEach((doc) => {
            verbs.push(doc.data() as PhrasalVerb);
          });
          setCustomVerbs(verbs);
        }, (error) => handleFirestoreError(error, OperationType.GET, `users/${u.uid}/customVerbs`));

        return () => unsubVerbs();
      } else {
        setMasteredVerbs(new Set());
        setCustomVerbs([]);
      }
      setIsInitialLoad(false);
    });
    return () => unsubscribe();
  }, []);

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
    const nextMastered = new Set(masteredVerbs);
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

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-gray-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 ring-4 ring-indigo-50">
              <BookOpen size={24} />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-black tracking-tight text-gray-900">Phrasal Guru</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-indigo-500 font-black">Vocabulary System</p>
            </div>
          </div>

          <nav className="hidden sm:flex items-center gap-1 bg-gray-100 p-1.5 rounded-2xl shadow-inner">
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

          <div className="flex items-center gap-3">
            {user ? (
              <button 
                onClick={logout}
                className="flex items-center gap-2 p-2 bg-gray-50 text-gray-500 hover:text-red-500 rounded-xl transition-all border border-gray-100"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            ) : (
              <button 
                onClick={loginWithGoogle}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold hover:border-indigo-500 transition-all shadow-sm"
              >
                <UserIcon size={14} className="text-indigo-600" />
                Login
              </button>
            )}
            
            <button
              onClick={() => setView('add')}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-md group ${
                view === 'add' ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-white text-gray-400 hover:text-indigo-600 border border-gray-100'
              }`}
            >
              <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {view === 'study' && (
            <motion.div
              key="study"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center"
            >
              <div className="w-full max-w-lg mb-8 flex justify-between items-center px-4">
                 <button 
                  onClick={() => setShowOnlyUnmastered(!showOnlyUnmastered)}
                  className={`text-[10px] uppercase tracking-wider font-black px-4 py-2 rounded-full border transition-all ${
                    showOnlyUnmastered ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-gray-50 border-gray-200 text-gray-400'
                  }`}
                 >
                   {showOnlyUnmastered ? 'Showing: New Only' : 'Showing: All Cards'}
                 </button>
                 <div className="flex -space-x-2">
                    {studyVerbs.slice(0, 3).map((v, i) => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-indigo-50 flex items-center justify-center text-[10px] font-bold text-indigo-400">
                        {v.verb[0].toUpperCase()}
                      </div>
                    ))}
                    {studyVerbs.length > 3 && (
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400">
                        +{studyVerbs.length - 3}
                      </div>
                    )}
                 </div>
              </div>

              {studyVerbs.length > 0 ? (
                <FlashCard 
                  verb={studyVerbs[currentIndex] || studyVerbs[0]} 
                  onNext={handleNext}
                  index={currentIndex}
                  total={studyVerbs.length}
                  isMastered={masteredVerbs.has(studyVerbs[currentIndex]?.verb)}
                  onToggleMastered={toggleMastered}
                />
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

      {/* Footer Decoration */}
      <footer className="max-w-5xl mx-auto px-6 py-12 text-center">
        <p className="text-gray-300 text-[10px] uppercase tracking-[0.2em] font-bold">
          Knowledge is Power • Build your Vocabulary
        </p>
      </footer>
    </div>
  );
}
