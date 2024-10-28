import React, { useState } from 'react';
import styles from '../style';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CodeEditor = ({ initialCode, onSave }) => {
  const [code, setCode] = useState(initialCode);
  const [isEditing, setIsEditing] = useState(false);

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
          <div className="w-3 h-3 rounded-full bg-[#FF605C]"></div>
          <div className="w-3 h-3 rounded-full bg-[#FFBD44]"></div>
          <div className="w-3 h-3 rounded-full bg-[#00CA4E]"></div>
        </div>
        <div className="text-dimWhite text-sm">bash</div>
      </div>

      {isEditing ? (
        <div className="w-full relative">
          <textarea
            className="w-full h-64 p-6 bg-black-gradient text-white font-mono text-sm resize-none rounded-xl outline-none transition-all duration-300 ease-in-out focus:ring-2 focus:ring-blue-500"
            value={code}
            onChange={handleCodeChange}
            spellCheck="false"
            autoFocus
            style={{ caretColor: '#00CA4E' }}
          />
        </div>
      ) : (
        <div className="w-full h-64 rounded-xl overflow-hidden">
          <SyntaxHighlighter
            language="bash"
            style={materialDark}
            customStyle={{
              margin: 0,
              padding: '1.5rem',
              height: '100%',
              backgroundColor: 'rgba(18, 24, 38, 0.8)',
              borderRadius: '0.75rem',
            }}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      )}

      <div className="w-full flex justify-end mt-4">
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-[#33BBCF] to-[#9DEDF0] text-primary px-4 py-2 rounded-lg font-medium text-sm hover:opacity-90 transition-all duration-300 shadow-lg"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
            </svg>
            Edit Code
          </button>
        ) : (
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-gradient-to-r from-[#33BBCF] to-[#9DEDF0] text-primary px-4 py-2 rounded-lg font-medium text-sm hover:opacity-90 transition-all duration-300 shadow-lg"
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