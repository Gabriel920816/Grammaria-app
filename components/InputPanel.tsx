
import React from 'react';
import Button from './Button';

interface InputPanelProps {
  inputText: string;
  setInputText: (text: string) => void;
  onClear: () => void;
  onCheck: () => void;
  isLoading: boolean;
}

const InputPanel: React.FC<InputPanelProps> = ({
  inputText,
  setInputText,
  onClear,
  onCheck,
  isLoading,
}) => {
  return (
    <div className="flex flex-col h-full max-h-full space-y-3 overflow-hidden">
      <div className="flex items-center justify-between px-1 shrink-0">
        <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">User Input</label>
        {inputText && (
          <button 
            onClick={onClear} 
            className="text-[10px] text-indigo-500 font-black uppercase hover:underline transition-all"
          >
            Clear
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
          <span className="text-[10px] text-slate-400 font-bold tracking-widest">{inputText.length} CHARS</span>
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
  );
};

export default InputPanel;
