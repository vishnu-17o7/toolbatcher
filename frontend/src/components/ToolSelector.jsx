import React, { useState, useEffect } from 'react';
import styles from '../style';
import CodeEditor from './CodeEditor';
import api from '../lib/api';

const ToolSelector = () => {
    const [tools, setTools] = useState([]);
    const [selectedTools, setSelectedTools] = useState([]);
    const [script, setScript] = useState('');
    const [outputMode, setOutputMode] = useState('script');
    const [installerSession, setInstallerSession] = useState(null);
    const [reviewManifest, setReviewManifest] = useState(null);
    const [reviewLoading, setReviewLoading] = useState(false);
    const [targetOS, setTargetOS] = useState('');
    const [error, setError] = useState('');
    const [copySuccess, setCopySuccess] = useState('');
    const [showScript, setShowScript] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        api.get('/tools')
            .then(response => {
                if (Array.isArray(response.data) && response.data.every(tool => tool.toolName && Array.isArray(tool.versions))) {
                    const normalizedTools = response.data.map(tool => {
                        const versions = Array.isArray(tool.versions) ? [...tool.versions] : [];
                        const latestVersion = typeof tool.latestVersion === 'string' ? tool.latestVersion : '';
                        const orderedVersions = latestVersion
                            ? [latestVersion, ...versions.filter(version => version !== latestVersion)]
                            : versions.includes('latest')
                                ? ['latest', ...versions.filter(version => version !== 'latest')]
                                : versions;

                        return {
                            ...tool,
                            versions: orderedVersions,
                            selectedVersion: orderedVersions[0] || 'latest',
                        };
                    });

                    setTools(normalizedTools);
                    setError('');
                } else {
                    console.error('Unexpected response format:', response.data);
                    setError('Unexpected response format from server.');
                }
            })
            .catch(() => {
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

    const getSelectedToolsWithVersions = () => {
        return tools
            .filter(tool => selectedTools.includes(tool.toolName))
            .map(tool => ({
                name: tool.toolName,
                version: tool.selectedVersion || tool.latestVersion || 'latest',
            }));
    };

    const generateScript = () => {
        const selectedToolsWithVersions = getSelectedToolsWithVersions();

        if (!targetOS) {
            setError('Please select a target OS.');
            return;
        }

        if (selectedToolsWithVersions.length === 0) {
            setError('Please select at least one tool.');
            return;
        }

        api.post('/tools/generate-script', { selectedTools: selectedToolsWithVersions, targetOS })
            .then(response => {
                setScript(response.data.script);
                setOutputMode('script');
                setInstallerSession(null);
                setError('');
                setShowScript(true);
                setIsEditing(false);
            })
            .catch(() => {
                setError('Failed to generate script. Please check the console for more details.');
            });
    };

    const generateInstallCommand = () => {
        const selectedToolsWithVersions = getSelectedToolsWithVersions();

        if (!targetOS) {
            setError('Please select a target OS.');
            return;
        }

        if (selectedToolsWithVersions.length === 0) {
            setError('Please select at least one tool.');
            return;
        }

        api.post('/tools/install-sessions', {
            selectedTools: selectedToolsWithVersions,
            targetOS,
        })
            .then(response => {
                const primaryCommand = targetOS === 'windows'
                    ? response.data?.commands?.powershell
                    : response.data?.commands?.shell;

                setInstallerSession(response.data);
                setReviewManifest(null);
                setScript(primaryCommand || 'No command generated.');
                setOutputMode('installer');
                setError('');
                setShowScript(true);
                setIsEditing(false);
            })
            .catch(error => {
                const apiError = error.response?.data?.error;
                setError(apiError || 'Failed to generate installer command. Please check the console for details.');
            });
    };

    const loadManifestFromApi = () => {
        if (!installerSession?.token) {
            return;
        }

        setReviewLoading(true);
        api.get(`/tools/install-sessions/${installerSession.token}/manifest`)
            .then((response) => {
                setReviewManifest(response.data?.manifest || null);
            })
            .catch(() => {
                setError('Failed to load install plan from API.');
            })
            .finally(() => {
                setReviewLoading(false);
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
        if (outputMode !== 'script') {
            return;
        }

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
        <section id="toolSelector" className={`${styles.flexCenter} ${styles.marginY} ${styles.padding} flex-col tb-surface rounded-[1.2rem] sm:rounded-[1.4rem]`}>
            <div className="w-full max-w-[920px]">
                <p className="tb-kicker">build your install plan</p>
                <h2 className="tb-panel-title mt-3">Command-Line Tool Selector</h2>
                <p className="text-dimWhite mt-3 max-w-[62ch]">
                    Choose tools, pin versions, and generate either a direct script or a signed one-liner installer session.
                </p>
                {error && (
                    <p className="text-red-300 mt-2" role="alert" aria-live="assertive">
                        {error}
                    </p>
                )}
                <div className={`${styles.paragraph} mt-5`}>
                    <h3 className="tb-panel-title text-[1.45rem] mt-8">Select Tools and Versions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                        {tools.length === 0 ? (
                            <p className='text-dimWhite'>Loading tools...</p>
                        ) : (
                            tools.map(tool => (
                                <div
                                    key={tool.toolName}
                                    className={`rounded-xl border p-3 transition-colors duration-200 ${selectedTools.includes(tool.toolName) ? 'border-[color:var(--color-stroke-strong)] bg-black/20' : 'border-white/10 bg-black/10'}`}
                                >
                                    <input
                                        type="checkbox"
                                        id={tool.toolName}
                                        value={tool.toolName}
                                        onChange={() => handleToolChange(tool)}
                                        className="mr-2 h-4 w-4"
                                    />
                                    <label htmlFor={tool.toolName} className="text-white mr-2 capitalize font-semibold tracking-[0.03em]">{tool.toolName}</label>
                                    <select 
                                        value={tool.selectedVersion}
                                        onChange={(e) => handleVersionChange(tool.toolName, e.target.value)}
                                        className="tb-button-subtle rounded-md px-2 py-1 text-sm"
                                        disabled={!selectedTools.includes(tool.toolName)}
                                    >
                                        {tool.versions.map(version => {
                                            // Determine if this is the latest version
                                            const isLatest = tool.latestVersion 
                                                ? version === tool.latestVersion 
                                                : version === tool.versions[0];
                                            return (
                                                <option 
                                                    key={version} 
                                                    value={version}
                                                    className={isLatest ? 'font-bold' : ''}
                                                >
                                                    {version}{isLatest ? ' (latest)' : ''}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                <div className={`${styles.paragraph} mt-7`}>
                    <h3 className="tb-panel-title text-[1.45rem]">Select Target OS</h3>
                    <select onChange={handleOSChange} value={targetOS} className="mt-3 p-3 rounded-lg tb-button-subtle w-full">
                        <option value="">Select OS</option>
                        <option value="linux">Linux</option>
                        <option value="macos">macOS</option>
                        <option value="windows">Windows</option>
                    </select>
                </div>

                <div className='grid sm:grid-cols-2 gap-3 mt-6'>
                <button onClick={generateScript} className={`focus-ring tb-button-main py-4 px-6 font-poppins font-medium text-[16px] ${styles.flexCenter} rounded-[10px] w-full`}>
                    Generate Script
                </button>
                <button onClick={generateInstallCommand} className={`focus-ring tb-button-subtle py-4 px-6 font-poppins font-medium text-[16px] ${styles.flexCenter} rounded-[10px] w-full`}>
                    Generate One-Liner Installer
                </button>
                </div>
            </div>
            
            {showScript && script && (
                <div className="w-full max-w-[920px] mt-10 border-t border-white/10 pt-8">
                    <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                        <h3 className="tb-panel-title text-[1.45rem]">{outputMode === 'installer' ? 'One-Liner Installer' : 'Generated Script'}</h3>
                        <div className="flex gap-2">
                            {outputMode === 'script' && (
                                <button 
                                    onClick={downloadScript}
                                    className={`focus-ring tb-button-subtle py-2 px-4 font-poppins font-medium text-[14px] ${styles.flexCenter} rounded-[10px]`}
                                >
                                    Download
                                </button>
                            )}
                            <button 
                                onClick={copyToClipboard}
                                className={`focus-ring tb-button-main py-2 px-4 font-poppins font-medium text-[14px] ${styles.flexCenter} rounded-[10px]`}
                            >
                                {copySuccess || 'Copy'}
                            </button>
                        </div>
                    </div>

                    {outputMode === 'script' && isEditing ? (
                        <CodeEditor initialCode={script} onSave={handleScriptSave} />
                    ) : (
                        <div className="relative">
                            <pre className="bg-discount-gradient p-6 rounded-[10px] overflow-x-auto w-full text-white text-sm leading-relaxed whitespace-pre-wrap border border-white/10">
                                {script}
                            </pre>
                            {outputMode === 'script' && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className={`focus-ring absolute top-4 right-4 py-2 px-4 tb-button-subtle font-poppins font-medium text-[14px] ${styles.flexCenter} rounded-[10px]`}
                                >
                                    Edit
                                </button>
                            )}
                        </div>
                    )}

                    {outputMode === 'installer' && installerSession?.commands && (
                        <div className="mt-4 tb-surface p-4 rounded-[10px] text-sm text-white">
                            <p className="mb-2 text-dimWhite">Session Token: <span className='text-white'>{installerSession.token}</span></p>
                            <p className="font-semibold mb-1 uppercase tracking-[0.08em] text-secondary">Shell</p>
                            <pre className="bg-black/30 border border-white/10 p-3 rounded-[10px] overflow-x-auto whitespace-pre-wrap">{installerSession.commands.shell}</pre>
                            <p className="font-semibold mt-3 mb-1 uppercase tracking-[0.08em] text-secondary">PowerShell</p>
                            <pre className="bg-black/30 border border-white/10 p-3 rounded-[10px] overflow-x-auto whitespace-pre-wrap">{installerSession.commands.powershell}</pre>

                            <div className="mt-4">
                                <button
                                    onClick={loadManifestFromApi}
                                    className={`focus-ring py-2 px-4 tb-button-main font-poppins font-medium text-[14px] ${styles.flexCenter} rounded-[10px]`}
                                >
                                    {reviewLoading ? 'Loading Plan...' : 'Review Install Plan'}
                                </button>
                            </div>

                            {reviewManifest?.steps && (
                                <div className="mt-4 bg-black/30 border border-white/10 p-3 rounded-[10px]">
                                    <p className="font-semibold mb-2 uppercase tracking-[0.08em] text-secondary">Install Plan ({reviewManifest.targetOS})</p>
                                    <ul className="list-decimal ml-5 space-y-2">
                                        {reviewManifest.steps.map((step, index) => (
                                            <li key={`${step.toolName}-${index}`}>
                                                <p className="font-semibold">{step.toolName} ({step.version})</p>
                                                <pre className="mt-1 bg-black/40 border border-white/10 p-2 rounded-[6px] whitespace-pre-wrap">{step.command}</pre>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </section>
    );
};

export default ToolSelector;
