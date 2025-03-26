import React, { useState } from 'react';
import styles from '../style';
import CodeEditor from './CodeEditor';

const Documentation = () => {
  const [showCode, setShowCode] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');
  const [showOverlay, setShowOverlay] = useState(false);
  const [sampleCode, setSampleCode] = useState(`
import toolbatcher

# Initialize toolbatcher
tb = toolbatcher.ToolBatcher()

# Add tools
tb.add_tool('git', '2.30.0')
tb.add_tool('node', '14.15.4')

# Generate script
script = tb.generate_script()

# Save or execute the script
tb.save_script(script, 'my_setup_script.sh')
# or
# tb.execute_script(script)
  `);

  const toggleViewCode = () => {
    setShowCode(!showCode);
    setShowEditor(false);
    setShowOverlay(false);
  };

  const toggleEditor = () => {
    setShowEditor(!showEditor);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sampleCode);
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      setCopySuccess('Failed to copy');
    }
  };

  const downloadCode = () => {
    const element = document.createElement("a");
    const file = new Blob([sampleCode], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "sample_toolbatcher_code.py";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleSaveCode = (newCode) => {
    setSampleCode(newCode);
    setShowEditor(false);
  };

  return (
    <section className={`${styles.flexCenter} ${styles.marginY} ${styles.padding} sm:flex-row flex-col bg-black-gradient-2 rounded-[20px] box-shadow`}>
      <div className="flex-1 flex flex-col">
        <h2 className={styles.heading2}>Documentation</h2>
        <p className={`${styles.paragraph} max-w-[470px] mt-5`}>
          Learn how to use toolBatcher effectively with our comprehensive documentation.
        </p>
        <ul className={`${styles.paragraph} mt-5 list-disc pl-5`}>
          <li>Getting Started Guide</li>
          <li>Tool Selection</li>
          <li>Script Generation</li>
          <li>Customization Options</li>
          <li>Troubleshooting</li>
        </ul>
        <div className="flex mt-5">
          <button className={`${styles.flexCenter} w-[140px] h-[50px] rounded-[10px] bg-blue-gradient p-1 cursor-pointer mr-4`}>
            <span className={`font-poppins font-medium text-[18px] text-primary`}>
              Full Docs
            </span>
          </button>
          <button onClick={toggleViewCode} className={`${styles.flexCenter} w-[140px] h-[50px] rounded-[10px] bg-green-gradient p-1 cursor-pointer`}>
            <span className={`font-poppins font-medium text-[18px] text-zinc-50     `}>
              {showCode ? 'Hide Code' : 'View Source'}
            </span>
          </button>
        </div>
        {showCode && (  
          <div className="mt-5 relative">
            <div 
              className="absolute top-0 right-0 left-0 bottom-0 bg-black bg-opacity-50 flex items-center justify-center"
              onMouseEnter={() => setShowOverlay(true)}
              onMouseLeave={() => setShowOverlay(false)}
            >
              {showOverlay && (
                <div className="flex">
                  <button 
                    onClick={copyToClipboard}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm mr-2"
                  >
                    {copySuccess || 'Copy'}
                  </button>
                  <button 
                    onClick={toggleEditor}
                    className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded text-sm"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
            <button 
              onClick={downloadCode}
              className="absolute top-2 right-2 bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-sm"
            >
              Download
            </button>
            {showEditor ? (
              <CodeEditor initialCode={sampleCode} onSave={handleSaveCode} />
            ) : (
              <pre className="bg-discount-gradient p-4 rounded mt-2 overflow-x-auto">
                <code>{sampleCode}</code>
              </pre>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default Documentation;