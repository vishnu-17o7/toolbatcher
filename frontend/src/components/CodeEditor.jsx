import React, { useState } from 'react';
import styles from '../style';

const CodeEditor = ({ initialCode, onSave }) => {
  const [code, setCode] = useState(initialCode);

  const handleCodeChange = (event) => {
    setCode(event.target.value);
  };

  const handleSave = () => {
    onSave(code);
  };

  return (
    <div className="mt-5">
      <textarea
        className="w-full h-64 p-2 bg-discount-gradient text-white font-mono text-sm rounded"
        value={code}
        onChange={handleCodeChange}
      />
      <button
        onClick={handleSave}
        className={`${styles.flexCenter} mt-2 w-[100px] h-[40px] rounded-[10px] bg-blue-gradient p-1 cursor-pointer`}
      >
        <span className={`font-poppins font-medium text-[16px] text-primary`}>
          Save
        </span>
      </button>
    </div>
  );
};

export default CodeEditor;