import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../style';
import CodeEditor from './CodeEditor';

const ToolSelector = () => {
    const [tools, setTools] = useState([]);
    const [selectedTools, setSelectedTools] = useState([]);
    const [script, setScript] = useState('');
    const [targetOS, setTargetOS] = useState('');
    const [error, setError] = useState('');
    const [copySuccess, setCopySuccess] = useState('');
    const [showScript, setShowScript] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        console.log('Fetching tools...');
        axios.get('http://localhost:3002/api/tools')  // Updated port to 3002
            .then(response => {
                console.log('Tools fetched:', response.data);
                if (Array.isArray(response.data) && response.data.every(tool => tool.toolName && Array.isArray(tool.versions))) {
                    setTools(response.data.map(tool => ({
                        ...tool,
                        selectedVersion: tool.versions[0] // Default to first version
                    })));
                    setError('');
                } else {
                    console.error('Unexpected response format:', response.data);
                    setError('Unexpected response format from server.');
                }
            })
            .catch(error => {
                console.error('Error fetching tools:', error);
                setError('Failed to fetch tools. Please check the console for more details.');
            });
    }, []);

    const handleToolChange = (tool) => {
        setSelectedTools(prev =>
            prev.includes(tool.toolName) ? prev.filter(t => t !== tool.toolName) : [...prev, tool.toolName]
        );
    };

    const handleVersionChange = (toolName, version) => {
        setTools(prev => prev.map(tool => 
            tool.toolName === toolName ? { ...tool, selectedVersion: version } : tool
        ));
    };

    const handleOSChange = (event) => {
        setTargetOS(event.target.value);
    };

    const generateScript = () => {
        const selectedToolsWithVersions = tools
            .filter(tool => selectedTools.includes(tool.toolName))
            .map(tool => ({ name: tool.toolName, version: tool.selectedVersion }));

        axios.post('http://localhost:3002/api/tools/generate-script', { selectedTools: selectedToolsWithVersions, targetOS })  
            .then(response => {
                console.log('Script generated:', response.data);
                setScript(response.data.script);
                setError('');
                setShowScript(true);
            })
            .catch(error => {
                console.error('Error generating script:', error);
                setError('Failed to generate script. Please check the console for more details.');
            });
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(script);
            setCopySuccess('Copied!');
            setTimeout(() => setCopySuccess(''), 2000);
        } catch (err) {
            setCopySuccess('Failed to copy');
        }
    };

    const downloadScript = () => {
        const element = document.createElement("a");
        const file = new Blob([script], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        let extension;
        switch (targetOS) {
            case 'windows':
                extension = '.ps1';
                break;
            case 'linux':
            case 'macos':
                extension = '.sh';
                break;
            default:
                extension = '.txt';
        }
        element.download = `generated_script${extension}`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const handleScriptSave = (newScript) => {
        setScript(newScript);
        setIsEditing(false);
    };

    return (
        <section id="toolSelector" className={`${styles.flexCenter} ${styles.marginY} ${styles.padding} flex-col bg-black-gradient-2 rounded-[20px] box-shadow`}>
            <div className="w-full max-w-[800px]">
                <h2 className={styles.heading2}>Command-Line Tool Selector</h2>
                {error && <p className="text-red-500 mt-2">{error}</p>}
                <div className={`${styles.paragraph} mt-5`}>
                    <h3 className={styles.heading3}>Select Tools and Versions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        {tools.length === 0 ? (
                            <p>Loading tools...</p>
                        ) : (
                            tools.map(tool => (
                                <div key={tool.toolName} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id={tool.toolName}
                                        value={tool.toolName}
                                        onChange={() => handleToolChange(tool)}
                                        className="mr-2"
                                    />
                                    <label htmlFor={tool.toolName} className={`${styles.paragraph} mr-2 capitalize`}>{tool.toolName}</label>
                                    <select 
                                        value={tool.selectedVersion}
                                        onChange={(e) => handleVersionChange(tool.toolName, e.target.value)}
                                        className="p-1 rounded bg-white text-black"
                                        disabled={!selectedTools.includes(tool.toolName)}
                                    >
                                        {tool.versions.map(version => (
                                            <option key={version} value={version}>{version}</option>
                                        ))}
                                    </select>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                <div className={`${styles.paragraph} mt-5`}>
                    <h3 className={styles.heading3}>Select Target OS</h3>
                    <select onChange={handleOSChange} value={targetOS} className="mt-2 p-2 rounded bg-white text-black w-full">
                        <option value="">Select OS</option>
                        <option value="linux">Linux</option>
                        <option value="macos">macOS</option>
                        <option value="windows">Windows</option>
                    </select>
                </div>
                <button onClick={generateScript} className={`py-4 px-6 bg-blue-gradient font-poppins font-medium text-[18px] text-primary outline-none ${styles.flexCenter} mt-5 rounded-[10px] w-full`}>
                    Generate Script
                </button>
            </div>
            
            {showScript && script && (
                <div className="w-full max-w-[800px] mt-10">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className={styles.heading3}>Generated Script</h3>
                        <div className="flex">
                            <button 
                                onClick={downloadScript}
                                className={`py-2 px-4 bg-blue-gradient font-poppins font-medium text-[16px] text-primary outline-none ${styles.flexCenter} mr-2 rounded-[10px]`}
                            >
                                Download
                            </button>
                            <button 
                                onClick={copyToClipboard}
                                className={`py-2 px-4 bg-blue-gradient font-poppins font-medium text-[16px] text-primary outline-none ${styles.flexCenter} rounded-[10px]`}
                            >
                                {copySuccess || 'Copy'}
                            </button>
                        </div>
                    </div>
                    {isEditing ? (
                        <CodeEditor initialCode={script} onSave={handleScriptSave} />
                    ) : (
                        <div className="relative">
                            <pre className="bg-discount-gradient p-6 rounded-[10px] overflow-x-auto w-full text-white text-sm leading-relaxed">
                                {script}
                            </pre>
                            <button
                                onClick={() => setIsEditing(true)}
                                className={`absolute top-4 right-4 py-2 px-4 bg-blue-gradient font-poppins font-medium text-[16px] text-primary outline-none ${styles.flexCenter} rounded-[10px]`}
                            >
                                Edit
                            </button>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
};

export default ToolSelector;