import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../style';

const AdminPage = () => {
    const [tools, setTools] = useState([]);
    const [newTool, setNewTool] = useState({ toolName: '', versions: '', commands: { linux: '', macos: '', windows: '' } });
    const [editingTool, setEditingTool] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchTools();
    }, []);

    const fetchTools = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/tools');
            setTools(response.data);
        } catch (error) {
            console.error('Error fetching tools:', error);
            setError('Failed to fetch tools');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setNewTool(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setNewTool(prev => ({ ...prev, [name]: name === 'versions' ? value.split(',') : value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingTool) {
                await axios.put(`http://localhost:3001/api/tools/${editingTool._id}`, newTool);
            } else {
                await axios.post('http://localhost:3001/api/tools', newTool);
            }
            fetchTools();
            setNewTool({ toolName: '', versions: '', commands: { linux: '', macos: '', windows: '' } });
            setEditingTool(null);
        } catch (error) {
            console.error('Error saving tool:', error);
            setError('Failed to save tool');
        }
    };

    const handleEdit = (tool) => {
        setEditingTool(tool);
        setNewTool({
            ...tool,
            versions: tool.versions.join(',')
        });
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:3001/api/tools/${id}`);
            fetchTools();
        } catch (error) {
            console.error('Error deleting tool:', error);
            setError('Failed to delete tool');
        }
    };

    return (
        <div className={`${styles.flexCenter} ${styles.marginY} ${styles.padding} flex-col bg-black-gradient-2 rounded-[20px] box-shadow`}>
            <h2 className={styles.heading2}>Admin Page</h2>
            {error && <p className="text-red-500 mt-2">{error}</p>}
            
            <form onSubmit={handleSubmit} className="w-full max-w-lg mt-5">
                <input
                    type="text"
                    name="toolName"
                    value={newTool.toolName}
                    onChange={handleInputChange}
                    placeholder="Tool Name"
                    className="w-full p-2 mb-4 rounded text-black"
                    required
                />
                <input
                    type="text"
                    name="versions"
                    value={newTool.versions}
                    onChange={handleInputChange}
                    placeholder="Versions (comma-separated)"
                    className="w-full p-2 mb-4 rounded text-black"
                        // required
                />
                <input
                    type="text"
                    name="commands.linux"
                    value={newTool.commands.linux}
                    onChange={handleInputChange}
                    placeholder="Linux Command"
                    className="w-full p-2 mb-4 rounded text-black"
                    required
                />
                <input
                    type="text"
                    name="commands.macos"
                    value={newTool.commands.macos}
                    onChange={handleInputChange}
                    placeholder="macOS Command"
                    className="w-full p-2 mb-4 rounded text-black"
                    required
                />
                <input
                    type="text"
                    name="commands.windows"
                    value={newTool.commands.windows}
                    onChange={handleInputChange}
                    placeholder="Windows Command"
                    className="w-full p-2 mb-4 rounded text-black"
                    required
                />
                <button type="submit" className={`py-4 px-6 bg-blue-gradient font-poppins font-medium text-[18px] text-primary outline-none ${styles.flexCenter} rounded-[10px] w-full`}>
                    {editingTool ? 'Update Tool' : 'Add Tool'}
                </button>
            </form>

            <div className="w-full mt-10">
                <h3 className={styles.heading3}>Existing Tools</h3>
                {tools.map(tool => (
                    <div key={tool._id} className="bg-discount-gradient p-4 rounded-[10px] mb-4 flex justify-between items-center">
                        <div>
                            <h4 className={styles.heading4}>{tool.toolName}</h4>
                            <p>Versions: {tool.versions.join(', ')}</p>
                        </div>
                        <div>
                            <button onClick={() => handleEdit(tool)} className="bg-blue-gradient px-4 py-2 rounded mr-2">Edit</button>
                            <button onClick={() => handleDelete(tool._id)} className="bg-red-500 px-4 py-2 rounded">Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminPage;