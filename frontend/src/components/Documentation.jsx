import React, { useState } from 'react';
import styles from '../style';
import CodeEditor from './CodeEditor';

const Documentation = () => {
  const [showCode, setShowCode] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');
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
          <button type="button" className={`focus-ring ${styles.flexCenter} min-h-[50px] rounded-[10px] bg-blue-gradient px-6 cursor-pointer mr-4`}>
            <span className={`font-poppins font-medium text-[18px] text-primary`}>
              Full Docs
            </span>
          </button>
          <button type="button" onClick={toggleViewCode} className={`focus-ring ${styles.flexCenter} min-h-[50px] rounded-[10px] bg-discount-gradient px-6 cursor-pointer`}>
            <span className={`font-poppins font-medium text-[18px] text-zinc-50     `}>
              {showCode ? 'Hide Code' : 'View Source'}
            </span>
          </button>
        </div>
        {showCode && (  
          <div className="mt-5 relative">
            <div className="flex flex-wrap gap-2 mb-3">
              <button
                type="button"
                onClick={copyToClipboard}
                className="focus-ring bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
              >
                {copySuccess || 'Copy'}
              </button>
              <button
                type="button"
                onClick={toggleEditor}
                className="focus-ring bg-yellow-500 hover:bg-yellow-700 text-black font-bold py-2 px-4 rounded text-sm"
              >
                {showEditor ? 'Preview' : 'Edit'}
              </button>
              <button
                type="button"
                onClick={downloadCode}
                className="focus-ring bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded text-sm"
              >
                Download
              </button>
            </div>
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