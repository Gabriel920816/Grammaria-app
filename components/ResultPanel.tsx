
import React, { useRef, useEffect } from 'react';
import DiffViewer from './DiffViewer';

interface ResultPanelProps {
  correctedText: string;
  diffText: string;
  isLoading: boolean;
  isCopied: boolean;
  onCopy: () => void;
  highlightText?: string;
}

const ResultPanel: React.FC<ResultPanelProps> = ({
  correctedText,
  diffText,
  isLoading,
  isCopied,
  onCopy,
  highlightText,
}) => {
  const correctedScrollRef = useRef<HTMLDivElement>(null);
  const diffScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (correctedScrollRef.current) {
      correctedScrollRef.current.scrollTop = correctedScrollRef.current.scrollHeight;
    }
  }, [correctedText]);

  useEffect(() => {
    if (diffScrollRef.current) {
      diffScrollRef.current.scrollTop = diffScrollRef.current.scrollHeight;
    }
  }, [diffText]);

  return (
    <div className="flex flex-col h-full max-h-full space-y-3 overflow-hidden">
      <div className="flex items-center justify-between px-1 shrink-0">
        <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Results</label>
        <div className="w-1 h-4"></div>
      </div>
      
      <div className="bg-white dark:bg-slate-900/60 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 transition-all flex flex-col flex-grow min-h-0 overflow-hidden">
        
        <div className="h-1/2 flex flex-col min-h-0 border-b border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="px-8 pt-6 pb-2 shrink-0 flex items-center justify-between">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">Corrected Phrase</span>
            {correctedText && (
              <button 
                onClick={onCopy}
                className={`flex items-center justify-center p-1.5 rounded-lg transition-all ${isCopied ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                title="Copy to clipboard"
              >
                {isCopied ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                )}
              </button>
            )}
          </div>
          <div 
            ref={correctedScrollRef}
            className="flex-grow px-8 pb-6 overflow-y-auto no-scrollbar scroll-smooth whitespace-pre-wrap break-words min-h-0"
          >
            <div className="text-xl text-slate-800 dark:text-slate-100 font-medium leading-relaxed">
              {correctedText || (isLoading ? <span className="text-slate-300 dark:text-slate-800 animate-pulse">Processing...</span> : <span className="text-slate-200 dark:text-slate-800/30 italic">No output yet</span>)}
            </div>
          </div>
        </div>

        <div className="h-1/2 flex flex-col min-h-0 overflow-hidden">
          <div className="px-8 pt-6 pb-2 shrink-0">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest">Annotated Changes</span>
          </div>
          <div 
            ref={diffScrollRef}
            className="flex-grow px-8 pb-6 overflow-y-auto no-scrollbar scroll-smooth whitespace-pre-wrap break-words min-h-0"
          >
            {diffText ? (
              <DiffViewer rawDiff={diffText} highlightText={highlightText} />
            ) : (
              <span className="text-slate-200 dark:text-slate-800/30 italic text-sm">Visual diff will appear here</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultPanel;
