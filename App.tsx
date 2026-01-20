
import React, { useState, useEffect } from 'react';
import { analyzeGrammarStream } from './services/geminiService';
import { GrammarAnalysis } from './types';
import InputPanel from './components/InputPanel';
import ResultPanel from './components/ResultPanel';

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [correctedText, setCorrectedText] = useState('');
  const [diffText, setDiffText] = useState('');
  const [analysis, setAnalysis] = useState<GrammarAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
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

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleCheck = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setCorrectedText('');
    setDiffText('');
    setAnalysis(null);

    try {
      await analyzeGrammarStream(
        inputText,
        (type, content) => {
          if (type === 'corrected') setCorrectedText(content);
          if (type === 'diff') setDiffText(content);
        },
        (finalAnalysis) => {
          setAnalysis(finalAnalysis);
          setIsLoading(false);
        }
      );
    } catch (err: any) {
      console.error(err);
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (correctedText) {
      navigator.clipboard.writeText(correctedText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const clearAll = () => {
    setInputText('');
    setCorrectedText('');
    setDiffText('');
    setAnalysis(null);
  };

  return (
    <div className="min-h-screen transition-colors duration-300 dark:bg-slate-950 bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 transition-colors shadow-sm shrink-0">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-900 dark:bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-slate-900/10 dark:shadow-indigo-500/30 ring-2 ring-slate-800 dark:ring-indigo-500/20">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Grammaria</h1>
          </div>
          
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
      </header>

      <main className="max-w-7xl mx-auto w-full px-6 py-8 flex flex-col gap-12 overflow-visible">
        {/* Main Work Area - Strictly Fixed Height */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[600px] max-h-[600px] shrink-0 overflow-hidden">
          <div className="h-full min-h-0">
            <InputPanel 
              inputText={inputText}
              setInputText={setInputText}
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
            />
          </div>
        </div>

        {/* Bottom Section */}
        {analysis && (
          <section className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-20">
            <div className="flex items-center gap-4">
              <div className="h-px flex-grow bg-slate-200 dark:bg-slate-800"></div>
              <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-4">Improvement Details</h2>
              <div className="h-px flex-grow bg-slate-200 dark:bg-slate-800"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {analysis.explanations.map((item, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:border-indigo-500/30 transition-all group">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-indigo-950 flex items-center justify-center text-slate-500 dark:text-indigo-500 font-bold text-xs border border-slate-100 dark:border-indigo-900/30">
                      {idx + 1}
                    </div>
                    <span className="text-sm font-black text-slate-800 dark:text-slate-200 group-hover:text-indigo-500 transition-colors break-words">{item.corrected}</span>
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
