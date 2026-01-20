
import React, { useEffect } from 'react';
import Button from './Button';
import { WritingTone } from '../types';

interface InputPanelProps {
  inputText: string;
  setInputText: (text: string) => void;
  selectedTone: WritingTone;
  setSelectedTone: (tone: WritingTone) => void;
  onClear: () => void;
  onCheck: () => void;
  isLoading: boolean;
}

const InputPanel: React.FC<InputPanelProps> = ({
  inputText,
  setInputText,
  selectedTone,
  setSelectedTone,
  onClear,
  onCheck,
  isLoading,
}) => {
  const tones: WritingTone[] = ['Standard', 'Professional', 'Casual', 'Academic'];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        onCheck();
      }
      if (e.key === 'Escape') {
        onClear();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCheck, onClear]);

  return (
    <div className="flex flex-col h-full max-h-full space-y-4 overflow-hidden">
      <div className="flex flex-col space-y-3 shrink-0">
        <div className="flex items-center justify-between px-1">
          <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Writing Tone</label>
        </div>
        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          {tones.map((tone) => (
            <button
              key={tone}
              onClick={() => setSelectedTone(tone)}
              className={`flex-1 py-1.5 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                selectedTone === tone 
                ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {tone}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col flex-grow min-h-0 space-y-3 overflow-hidden">
        <div className="flex items-center justify-between px-1 shrink-0">
          <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">User Input</label>
          {inputText && (
            <button 
              onClick={onClear} 
              className="text-[10px] text-indigo-500 font-black uppercase hover:underline transition-all"
            >
              Clear (Esc)
            </button>
          )}
        </div>
        <div className="bg-white dark:bg-slate-900/60 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 transition-all flex flex-col flex-grow min-h-0 overflow-hidden focus-within:ring-4 focus-within:ring-indigo-500/10">
          <textarea
            className="w-full flex-grow p-8 text-xl text-slate-800 dark:text-slate-100 placeholder-slate-300 dark:placeholder-slate-700 bg-transparent resize-none outline-none border-none leading-relaxed overflow-y-auto whitespace-pre-wrap break-words no-scrollbar"
            placeholder="Paste or type a sentence to check..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <div className="px-7 py-5 bg-slate-50/50 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between shrink-0">
            <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">
              {inputText.length} chars <span className="mx-2 opacity-30">|</span> 
              <span className="opacity-60">⌘ + Enter to check</span>
            </span>
            <Button 
              onClick={onCheck} 
              isLoading={isLoading} 
              disabled={!inputText.trim()} 
              className="!rounded-2xl"
            >
              Check Grammar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InputPanel;
