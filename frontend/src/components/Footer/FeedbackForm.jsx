import React, { useState } from 'react';
import axios from 'axios';
import styles from '../../style';

const FeedbackForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [status, setStatus] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3002/api/feedback', formData);
            setStatus('Feedback submitted successfully!');
            setFormData({ name: '', email: '', message: '' });
            setTimeout(() => setStatus(''), 3000);
        } catch (error) {
            setStatus('Error submitting feedback. Please try again.');
            setTimeout(() => setStatus(''), 3000);
        }
    };

    return (
        <div className="bg-primary text-white p-6 rounded-lg">
            <h3 className={`${styles.heading3} mb-4`}>Share Your Feedback</h3>
            {status && (
                <div className={`mb-4 p-2 rounded ${status.includes('Error') ? 'bg-red-900/50' : 'bg-green-900/50'}`}>
                    {status}
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className={`block ${styles.paragraph}`}>Name (Optional)</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-[10px] bg-dimBlue border-none text-white shadow-sm focus:border-secondary focus:ring-secondary"
                    />
                </div>
                <div>
                    <label htmlFor="email" className={`block ${styles.paragraph}`}>Email (Optional)</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-[10px] bg-dimBlue border-none text-white shadow-sm focus:border-secondary focus:ring-secondary"
                    />
                </div>
                <div>
                    <label htmlFor="message" className={`block ${styles.paragraph}`}>Feedback *</label>
                    <textarea
                        id="message"
                        name="message"
                        rows="4"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        className="mt-1 block w-full rounded-[10px] bg-dimBlue border-none text-white shadow-sm focus:border-secondary focus:ring-secondary"
                        placeholder="Share your thoughts, suggestions, or report issues..."
                    />
                </div>
                <button
                    type="submit"
                    className={`${styles.paragraph} py-4 px-6 w-full sm:w-auto rounded-[10px] font-medium text-[18px] text-white bg-blue-gradient hover:bg-gradient-to-r from-secondary to-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                >
                    Submit Feedback
                </button>
            </form>
        </div>
    );
};

export default FeedbackForm;