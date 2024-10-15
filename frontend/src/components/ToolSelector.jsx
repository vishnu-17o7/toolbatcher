import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../style';

const ToolSelector = () => {
    const [tools, setTools] = useState([]);
    const [selectedTools, setSelectedTools] = useState([]);
    const [script, setScript] = useState('');
    const [targetOS, setTargetOS] = useState('');
    const [error, setError] = useState('');
    const [copySuccess, setCopySuccess] = useState('');
    const [showScript, setShowScript] = useState(false);

    useEffect(() => {
        console.log('Fetching tools...');
        axios.get('http://localhost:3001/tools')
            .then(response => {
                console.log('Tools fetched:', response.data);
                if (Array.isArray(response.data) && response.data.every(tool => tool.name && Array.isArray(tool.versions))) {
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
            prev.includes(tool.name) ? prev.filter(t => t !== tool.name) : [...prev, tool.name]
        );
    };

    const handleVersionChange = (toolName, version) => {
        setTools(prev => prev.map(tool => 
            tool.name === toolName ? { ...tool, selectedVersion: version } : tool
        ));
    };

    const handleOSChange = (event) => {
        setTargetOS(event.target.value);
    };

    const generateScript = () => {
        const selectedToolsWithVersions = tools
            .filter(tool => selectedTools.includes(tool.name))
            .map(tool => ({ name: tool.name, version: tool.selectedVersion }));

        axios.post('http://localhost:3001/generate-script', { selectedTools: selectedToolsWithVersions, targetOS })
            .then(response => {
                console.log('Script generated:', response.data);
                setScript(response.data.script);
                setError('');
                setShowScript(false);
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

    const toggleViewScript = () => {
        setShowScript(!showScript);
    };

    return (
        <section className={`${styles.flexCenter} ${styles.marginY} ${styles.padding} sm:flex-row flex-col bg-black-gradient-2 rounded-[20px] box-shadow`}>
            <div className="flex-1 flex flex-col">
                <h2 className={styles.heading2}>Command-Line Tool Selector</h2>
                {error && <p className="text-red-500 mt-2">{error}</p>}
                <div className={`${styles.paragraph} max-w-[470px] mt-5`}>
                    <h3 className={styles.heading3}>Select Tools and Versions</h3>
                    {tools.length === 0 ? (
                        <p>Loading tools...</p>
                    ) : (
                        tools.map(tool => (
                            <div key={tool.name} className="flex items-center mt-2">
                                <input
                                    type="checkbox"
                                    id={tool.name}
                                    value={tool.name}
                                    onChange={() => handleToolChange(tool)}
                                    className="mr-2"
                                />
                                <label htmlFor={tool.name} className={`${styles.paragraph} mr-2 capitalize`}>{tool.name}</label>
                                <select 
                                    value={tool.selectedVersion}
                                    onChange={(e) => handleVersionChange(tool.name, e.target.value)}
                                    className="p-1 rounded bg-white text-black"
                                    disabled={!selectedTools.includes(tool.name)}
                                >
                                    {tool.versions.map(version => (
                                        <option key={version} value={version}>{version}</option>
                                    ))}
                                </select>
                            </div>
                        ))
                    )}
                </div>
                <div className={`${styles.paragraph} max-w-[470px] mt-5`}>
                    <h3 className={styles.heading3}>Select Target OS</h3>
                    <select onChange={handleOSChange} value={targetOS} className="mt-2 p-2 rounded bg-white text-black">
                        <option value="">Select OS</option>
                        <option value="linux">Linux</option>
                        <option value="macos">macOS</option>
                        <option value="windows">Windows</option>
                    </select>
                </div>
                <button onClick={generateScript} className={`${styles.flexCenter} w-[140px] h-[140px] rounded-full bg-blue-gradient p-[2px] cursor-pointer mt-5`}>
                    <div className={`${styles.flexCenter} flex-col bg-primary w-[100%] h-[100%] rounded-full`}>
                        <div className={`${styles.flexStart} flex-row`}>
                            <p className="font-poppins font-medium text-[18px] leading-[23px] mr-2">
                                <span className="text-gradient">Generate</span>
                            </p>
                        </div>
                        <p className="font-poppins font-medium text-[18px] leading-[23px]">
                            <span className="text-gradient">Script</span>
                        </p>
                    </div>
                </button>
                {script && (
                    <div className="mt-5 flex flex-col items-center">
                        <div className="flex mb-5">
                            <button 
                                onClick={downloadScript}
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
                            >
                                Download Script
                            </button>
                            <button 
                                onClick={toggleViewScript}
                                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                            >
                                {showScript ? 'Hide Script' : 'View Script'}
                            </button>
                        </div>
                    </div>
                )}
            </div>  
            {showScript && script && (
                <div className={`${styles.paragraph} max-w-[470px] mt-5 mx-auto flex flex-col items-center`}>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className={styles.heading3}>Generated Script</h3>
                        <button 
                            onClick={copyToClipboard}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                            {copySuccess || 'Copy'}
                        </button>
                    </div>
                    <pre className="bg-discount-gradient p-4 rounded mt-2 overflow-x-auto max-w-[90%] text-white text-sm leading-relaxed">
                        {script}
                    </pre>
                </div>
            )}
        </section>
    );
};

export default ToolSelector;