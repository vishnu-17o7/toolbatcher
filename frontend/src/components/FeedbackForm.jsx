import React, { useState } from 'react';
import axios from 'axios';

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
        <section>
            <div className="bg-black text-white py-20">
                <div className="container mx-auto flex flex-col md:flex-row my-6 md:my-24">
                    <div className="flex flex-col w-full lg:w-1/2 p-8">
                        <p className="ml-6 text-yellow-300 text-lg uppercase tracking-loose">REVIEW</p>
                        <p className="text-3xl md:text-5xl my-4 leading-relaxed md:leading-snug">Leave us feedback!</p>
                        <p className="text-sm md:text-base leading-snug text-gray-50 text-opacity-100">
                            Please provide your valuable feedback and let us know your thoughts!
                        </p>
                    </div>
                    <div className="flex flex-col w-full lg:w-1/2 justify-center">
                        <div className="container w-full px-4">
                            <div className="flex flex-wrap justify-center">
                                <div className="w-full lg:w-8/12 px-4">
                                    <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-white w-96">
                                        <div className="flex-auto p-5 lg:p-10 ">
                                            <h4 className="text-2xl mb-4 text-black font-semibold">Have a suggestion?</h4>
                                            {status && (
                                                <div className={`mb-4 p-2 rounded ${status.includes('Error') ? 'bg-red-500' : 'bg-green-500'} text-white text-center`}>
                                                    {status}
                                                </div>
                                            )}
                                            <form onSubmit={handleSubmit} className="space-y-4">
                                                <div className="relative w-full mb-3">
                                                    <label htmlFor="name" className="block uppercase text-gray-700 text-xs font-bold mb-2">Name</label>
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        id="name"
                                                        value={formData.name}
                                                        onChange={handleChange}
                                                        className="border-0 px-3 py-3 rounded text-sm shadow w-full bg-gray-300 placeholder-black text-gray-800 outline-none focus:bg-gray-400"
                                                        placeholder="Your name"
                                                        required
                                                    />
                                                </div>
                                                <div className="relative w-full mb-3">
                                                    <label htmlFor="email" className="block uppercase text-gray-700 text-xs font-bold mb-2">Email</label>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        id="email"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        className="border-0 px-3 py-3 rounded text-sm shadow w-full bg-gray-300 placeholder-black text-gray-800 outline-none focus:bg-gray-400"
                                                        placeholder="Your email address"
                                                        required
                                                    />
                                                </div>
                                                <div className="relative w-full mb-3">
                                                    <label htmlFor="message" className="block uppercase text-gray-700 text-xs font-bold mb-2">Message</label>
                                                    <textarea
                                                        name="message"
                                                        id="message"
                                                        rows="4"
                                                        value={formData.message}
                                                        onChange={handleChange}
                                                        maxLength="300"
                                                        className="border-0 px-3 py-3 bg-gray-300 placeholder-black text-gray-800 rounded text-sm shadow focus:outline-none w-full"
                                                        placeholder="Share your thoughts, suggestions, or report issues..."
                                                        required
                                                    ></textarea>
                                                </div>
                                                <div className="text-center mt-6">
                                                    <button
                                                        type="submit"
                                                        className="bg-yellow-300 text-black text-center mx-auto active:bg-yellow-400 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none"
                                                        style={{ transition: "all 0.15s ease 0s" }}
                                                    >
                                                        Submit
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeedbackForm;
