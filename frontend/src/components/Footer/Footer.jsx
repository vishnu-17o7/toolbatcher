import React from 'react';
import FeedbackForm from './FeedbackForm';

const Footer = () => {
    return (
        <footer className="bg-white">
            <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                <div className="xl:grid xl:grid-cols-3 xl:gap-8">
                    {/* Company Info */}
                    <div className="space-y-8 xl:col-span-1">
                        <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                            ToolBatcher
                        </h3>
                        <p className="text-base text-gray-500">
                            Making development workflows easier and more efficient.
                        </p>
                    </div>

                    {/* Navigation Links */}
                    <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                                Resources
                            </h3>
                            <ul className="mt-4 space-y-4">
                                <li>
                                    <a href="/docs" className="text-base text-gray-500 hover:text-gray-900">
                                        Documentation
                                    </a>
                                </li>
                                <li>
                                    <a href="/guides" className="text-base text-gray-500 hover:text-gray-900">
                                        Guides
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                                Support
                            </h3>
                            <ul className="mt-4 space-y-4">
                                <li>
                                    <a href="/faq" className="text-base text-gray-500 hover:text-gray-900">
                                        FAQ
                                    </a>
                                </li>
                                <li>
                                    <a href="/contact" className="text-base text-gray-500 hover:text-gray-900">
                                        Contact
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Feedback Form Section */}
                <div className="mt-12 border-t border-gray-200 pt-8">
                    <FeedbackForm />
                </div>

                {/* Copyright */}
                <div className="mt-12 border-t border-gray-200 pt-8">
                    <p className="text-base text-gray-400 text-center">
                        &copy; {new Date().getFullYear()} ToolBatcher. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;