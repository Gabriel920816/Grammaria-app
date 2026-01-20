
import React from 'react';

interface DiffViewerProps {
  rawDiff: string;
  highlightText?: string;
}

const DiffViewer: React.FC<DiffViewerProps> = ({ rawDiff, highlightText }) => {
  const parseDiff = (text: string) => {
    const parts: { text: string; type: 'unchanged' | 'removed' | 'added' }[] = [];
    let remaining = text;

    while (remaining.length > 0) {
      const removeIndex = remaining.indexOf('[');
      const addIndex = remaining.indexOf('{');

      if (removeIndex === -1 && addIndex === -1) {
        parts.push({ text: remaining, type: 'unchanged' });
        break;
      }

      const first = (removeIndex !== -1 && (addIndex === -1 || removeIndex < addIndex)) ? 'remove' : 'add';

      if (first === 'remove') {
        if (removeIndex > 0) {
          parts.push({ text: remaining.substring(0, removeIndex), type: 'unchanged' });
        }
        const endRemove = remaining.indexOf(']', removeIndex);
        if (endRemove !== -1) {
          parts.push({ text: remaining.substring(removeIndex + 1, endRemove), type: 'removed' });
          remaining = remaining.substring(endRemove + 1);
        } else {
          parts.push({ text: remaining.substring(removeIndex + 1), type: 'removed' });
          break;
        }
      } else {
        if (addIndex > 0) {
          parts.push({ text: remaining.substring(0, addIndex), type: 'unchanged' });
        }
        const endAdd = remaining.indexOf('}', addIndex);
        if (endAdd !== -1) {
          parts.push({ text: remaining.substring(addIndex + 1, endAdd), type: 'added' });
          remaining = remaining.substring(endAdd + 1);
        } else {
          parts.push({ text: remaining.substring(addIndex + 1), type: 'added' });
          break;
        }
      }
    }
    return parts;
  };

  const segments = parseDiff(rawDiff);

  return (
    <div className="leading-relaxed text-xl whitespace-pre-wrap break-words">
      {segments.map((segment, index) => {
        const isHighlighted = highlightText && segment.text.trim().toLowerCase() === highlightText.trim().toLowerCase();
        
        if (segment.type === 'removed') {
          return (
            <span key={index} className="text-rose-500 line-through decoration-rose-400 dark:text-rose-400/60 bg-rose-50/50 dark:bg-rose-900/10 px-0.5 rounded transition-all">
              {segment.text}
            </span>
          );
        }
        if (segment.type === 'added') {
          return (
            <span 
              key={index} 
              className={`text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/20 px-1 rounded transition-all duration-300 ${isHighlighted ? 'ring-2 ring-indigo-500 scale-110 inline-block bg-indigo-50 dark:bg-indigo-500/20' : ''}`}
            >
              {segment.text}
            </span>
          );
        }
        return <span key={index} className="text-slate-600 dark:text-slate-400">{segment.text}</span>;
      })}
    </div>
  );
};

export default DiffViewer;
