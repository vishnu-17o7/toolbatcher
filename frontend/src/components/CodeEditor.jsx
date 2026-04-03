import React, { useEffect, useState } from 'react';
import styles from '../style';

const CodeEditor = ({ initialCode, onSave }) => {
  const [code, setCode] = useState(initialCode);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);

  const handleCodeChange = (event) => {
    setCode(event.target.value);
  };

  const handleSave = () => {
    onSave(code);
    setIsEditing(false);
  };

  return (
    <div className={`mt-5 bg-black-gradient-2 rounded-xl p-4 ${styles.flexCenter} flex-col`}>
      <div className="w-full flex justify-between items-center mb-4 px-2">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--status-danger)' }}></div>
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--status-warning)' }}></div>
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--status-success)' }}></div>
        </div>
        <div className="text-dimWhite text-sm">bash</div>
      </div>

      {isEditing ? (
        <div className="w-full relative">
          <textarea
            className="focus-ring w-full h-64 p-6 bg-black-gradient text-white font-mono text-sm resize-none rounded-xl transition-all duration-300 ease-in-out"
            value={code}
            onChange={handleCodeChange}
            spellCheck="false"
            autoFocus
            style={{ caretColor: 'var(--status-success)' }}
          />
        </div>
      ) : (
        <div className="w-full h-64 rounded-xl overflow-hidden">
          <pre className="m-0 p-6 h-full bg-black-gradient text-white rounded-xl overflow-auto text-sm leading-relaxed whitespace-pre-wrap">
            <code>{code}</code>
          </pre>
        </div>
      )}

      <div className="w-full flex justify-end mt-4">
        {!isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="focus-ring flex items-center gap-2 bg-blue-gradient text-primary px-4 py-2 rounded-lg font-medium text-sm hover:opacity-90 transition-all duration-300 shadow-lg"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
            </svg>
            Edit Code
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSave}
            className="focus-ring flex items-center gap-2 bg-blue-gradient text-primary px-4 py-2 rounded-lg font-medium text-sm hover:opacity-90 transition-all duration-300 shadow-lg"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Save Changes
          </button>
        )}
      </div>
    </div>
  );
};

export default CodeEditor;