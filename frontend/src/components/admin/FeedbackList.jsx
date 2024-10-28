import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../../style';

const FeedbackList = () => {
    const [feedback, setFeedback] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [filter, setFilter] = useState('all'); // 'all', 'pending', 'reviewed'

    useEffect(() => {
        fetchFeedback();
    }, []);

    const fetchFeedback = async () => {
        try {
            const response = await axios.get('http://localhost:3002/api/feedback');
            setFeedback(response.data.data);
            setLoading(false);
        } catch (err) {
            setError('Error fetching feedback');
            setLoading(false);
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            await axios.patch(`http://localhost:3002/api/feedback/${id}`, {
                status: newStatus
            });
            fetchFeedback();
            if (selectedFeedback && selectedFeedback._id === id) {
                setSelectedFeedback({ ...selectedFeedback, status: newStatus });
            }
        } catch (err) {
            setError('Error updating feedback status');
        }
    };

    const filteredFeedback = feedback.filter(item => {
        if (filter === 'all') return true;
        return item.status === filter;
    });

    if (loading) return <div className={`${styles.heading2} text-center text-white`}>Loading...</div>;
    if (error) return <div className={`${styles.paragraph} text-center text-red-500`}>{error}</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className={`${styles.heading2} text-white`}>Feedback Management</h2>
                <div className="flex items-center space-x-4">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-dimBlue text-white border-none rounded-[10px] py-2 px-4 focus:ring-2 focus:ring-secondary"
                    >
                        <option value="all">All Feedback</option>
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                    </select>
                    <span className={`${styles.paragraph} text-dimWhite`}>
                        Total: {filteredFeedback.length}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Feedback List */}
                <div className="space-y-4">
                    {filteredFeedback.map((item) => (
                        <div 
                            key={item._id} 
                            className={`bg-black-gradient-2 p-6 rounded-[20px] cursor-pointer transition-all duration-200 ${
                                selectedFeedback?._id === item._id ? 'ring-2 ring-secondary' : ''
                            }`}
                            onClick={() => setSelectedFeedback(item)}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className={`${styles.paragraph} text-dimWhite`}>
                                        {new Date(item.createdAt).toLocaleDateString()} - {item.name || 'Anonymous'}
                                    </p>
                                    <p className={`${styles.paragraph} mt-2`}>
                                        {item.message.length > 100 ? item.message.substring(0, 100) + '...' : item.message}
                                    </p>
                                </div>
                                <span className={`px-4 py-2 rounded-[10px] ${styles.paragraph} ${
                                    item.status === 'pending' 
                                        ? 'bg-yellow-900/50 text-yellow-200' 
                                        : 'bg-green-900/50 text-green-200'
                                }`}>
                                    {item.status}
                                </span>
                            </div>
                        </div>
                    ))}
                    {filteredFeedback.length === 0 && (
                        <p className={`${styles.paragraph} text-center text-dimWhite`}>No feedback found</p>
                    )}
                </div>

                {/* Feedback Detail View */}
                <div className="bg-black-gradient-2 p-6 rounded-[20px] h-fit">
                    {selectedFeedback ? (
                        <div>
                            <div className="mb-6">
                                <h3 className={`${styles.heading3} text-white mb-2`}>Feedback Details</h3>
                                <p className={`${styles.paragraph} text-dimWhite`}>
                                    Submitted on {new Date(selectedFeedback.createdAt).toLocaleString()}
                                </p>
                            </div>
                            
                            <div className="mb-6">
                                <h4 className={`${styles.paragraph} font-semibold text-white mb-2`}>Submitted by</h4>
                                <p className={`${styles.paragraph} text-dimWhite`}>
                                    {selectedFeedback.name || 'Anonymous'}
                                    {selectedFeedback.email && (
                                        <span className="block">{selectedFeedback.email}</span>
                                    )}
                                </p>
                            </div>

                            <div className="mb-6">
                                <h4 className={`${styles.paragraph} font-semibold text-white mb-2`}>Message</h4>
                                <p className={`${styles.paragraph} text-dimWhite whitespace-pre-wrap`}>
                                    {selectedFeedback.message}
                                </p>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className={`${styles.paragraph} font-semibold text-white mb-2`}>Status</h4>
                                    <select
                                        value={selectedFeedback.status}
                                        onChange={(e) => updateStatus(selectedFeedback._id, e.target.value)}
                                        className="bg-dimBlue text-white border-none rounded-[10px] py-2 px-4 focus:ring-2 focus:ring-secondary"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="reviewed">Reviewed</option>
                                    </select>
                                </div>
                                <button
                                    onClick={() => setSelectedFeedback(null)}
                                    className={`${styles.paragraph} px-4 py-2 bg-blue-gradient rounded-[10px] text-white hover:opacity-80`}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className={`${styles.paragraph} text-dimWhite`}>
                                Select a feedback item to view details
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FeedbackList;