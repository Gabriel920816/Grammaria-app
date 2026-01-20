
import React, { useState, useEffect, useCallback } from 'react';
import { analyzeGrammarStream } from './services/geminiService';
import { GrammarAnalysis, WritingTone, HistoryItem } from './types';
import InputPanel from './components/InputPanel';
import ResultPanel from './components/ResultPanel';

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [correctedText, setCorrectedText] = useState('');
  const [diffText, setDiffText] = useState('');
  const [analysis, setAnalysis] = useState<GrammarAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [selectedTone, setSelectedTone] = useState<WritingTone>('Standard');
  const [activeHighlight, setActiveHighlight] = useState<string | undefined>(undefined);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('grammar_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [showHistory, setShowHistory] = useState(false);
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
             (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('grammar_history', JSON.stringify(history.slice(0, 10)));
  }, [history]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleCheck = useCallback(async () => {
    if (!inputText.trim() || isLoading) return;

    setIsLoading(true);
    setCorrectedText('');
    setDiffText('');
    setAnalysis(null);

    try {
      await analyzeGrammarStream(
        inputText,
        selectedTone,
        (type, content) => {
          if (type === 'corrected') setCorrectedText(content);
          if (type === 'diff') setDiffText(content);
        },
        (finalAnalysis) => {
          setAnalysis(finalAnalysis);
          setIsLoading(false);
          
          const newItem: HistoryItem = {
            ...finalAnalysis,
            id: Math.random().toString(36).substr(2, 9),
            originalText: inputText,
            tone: selectedTone,
            timestamp: Date.now(),
          };
          setHistory(prev => [newItem, ...prev].slice(0, 10));
        }
      );
    } catch (err: any) {
      console.error(err);
      setIsLoading(false);
    }
  }, [inputText, selectedTone, isLoading]);

  const copyToClipboard = () => {
    if (correctedText) {
      navigator.clipboard.writeText(correctedText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const clearAll = useCallback(() => {
    setInputText('');
    setCorrectedText('');
    setDiffText('');
    setAnalysis(null);
  }, []);

  const restoreHistory = (item: HistoryItem) => {
    setInputText(item.originalText);
    setCorrectedText(item.correctedText);
    // Fix: Use item.rawDiff which exists on HistoryItem via GrammarAnalysis
    setDiffText(item.rawDiff || ''); 
    setAnalysis(item);
    setSelectedTone(item.tone);
    setShowHistory(false);
  };

  const categoryColors = {
    Tense: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    Vocabulary: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    Punctuation: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    Article: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    Other: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
  };

  return (
    <div className="min-h-screen transition-colors duration-300 dark:bg-slate-950 bg-slate-50 flex flex-col font-sans">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 transition-colors shadow-sm shrink-0">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-900 dark:bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-slate-900/10 dark:shadow-indigo-500/30 ring-2 ring-slate-800 dark:ring-indigo-500/20">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Grammaria</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${showHistory ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
              title="History"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </button>
            <button 
              onClick={toggleTheme}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:scale-105 transition-all"
            >
              {isDarkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full px-6 py-8 flex flex-col gap-12 overflow-visible relative">
        {/* History Sidebar/Overlay */}
        {showHistory && (
          <div className="absolute top-0 right-6 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-40 p-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Recent History</h3>
              <button onClick={() => setHistory([])} className="text-[10px] text-rose-500 font-bold uppercase hover:underline">Clear All</button>
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto no-scrollbar">
              {history.length > 0 ? history.map(item => (
                <button 
                  key={item.id}
                  onClick={() => restoreHistory(item)}
                  className="w-full text-left p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700 group"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tighter">
                      {item.tone}
                    </span>
                    <span className="text-[9px] text-slate-400">{new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-medium truncate">{item.originalText}</p>
                </button>
              )) : (
                <div className="py-8 text-center text-xs text-slate-400 italic">No history yet</div>
              )}
            </div>
          </div>
        )}

        {/* Main Work Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:h-[calc(100vh-280px)] min-h-[500px] shrink-0 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="h-full min-h-0">
            <InputPanel 
              inputText={inputText}
              setInputText={setInputText}
              selectedTone={selectedTone}
              setSelectedTone={setSelectedTone}
              onClear={clearAll}
              onCheck={handleCheck}
              isLoading={isLoading}
            />
          </div>
          <div className="h-full min-h-0">
            <ResultPanel 
              correctedText={correctedText}
              diffText={diffText}
              isLoading={isLoading}
              isCopied={isCopied}
              onCopy={copyToClipboard}
              highlightText={activeHighlight}
            />
          </div>
        </div>

        {/* Bottom Section */}
        {analysis && (
          <section className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
            <div className="flex items-center gap-4">
              <div className="h-px flex-grow bg-slate-200 dark:bg-slate-800"></div>
              <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-4">Improvement Details</h2>
              <div className="h-px flex-grow bg-slate-200 dark:bg-slate-800"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {analysis.explanations.map((item, idx) => (
                <div 
                  key={idx} 
                  onMouseEnter={() => setActiveHighlight(item.corrected)}
                  onMouseLeave={() => setActiveHighlight(undefined)}
                  className={`bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:border-indigo-500/50 hover:shadow-indigo-500/5 transition-all group cursor-default relative overflow-hidden ${activeHighlight === item.corrected ? 'ring-2 ring-indigo-500/20' : ''}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-indigo-950 flex items-center justify-center text-slate-500 dark:text-indigo-500 font-bold text-xs border border-slate-100 dark:border-indigo-900/30">
                        {idx + 1}
                      </div>
                      <span className="text-sm font-black text-slate-800 dark:text-slate-200 group-hover:text-indigo-500 transition-colors break-words">{item.corrected}</span>
                    </div>
                    {item.category && (
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${categoryColors[item.category as keyof typeof categoryColors] || categoryColors.Other}`}>
                        {item.category}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    {item.reason}
                  </p>
                </div>
              ))}
            </div>

            <div className="max-w-3xl mx-auto p-10 bg-slate-900 dark:bg-indigo-900/20 rounded-[3rem] shadow-2xl shadow-slate-900/10 dark:shadow-indigo-500/10 text-center relative overflow-hidden border border-slate-800 dark:border-indigo-500/20">
               <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none opacity-10"></div>
              <p className="text-slate-50 dark:text-indigo-400 text-xl font-bold leading-relaxed italic relative z-10">
                "{analysis.overallFeedback}"
              </p>
            </div>
          </section>
        )}
      </main>

      <footer className="py-12 px-6 flex flex-col items-center gap-4 text-slate-400 dark:text-slate-700 shrink-0">
        <div className="h-px w-24 bg-slate-200 dark:bg-slate-800/50"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em]">Grammaria ESL Companion</p>
      </footer>
    </div>
  );
};

export default App;