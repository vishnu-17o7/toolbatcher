import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-primary text-gray-300">
            <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                <div className="xl:grid xl:grid-cols-3 xl:gap-8">
                    {/* Company Info */}
                    <div className="space-y-8 xl:col-span-1">
                        <h3 className="text-sm font-semibold tracking-wider uppercase text-yellow-300">
                            ToolBatcher
                        </h3>
                        <p className="text-base text-gray-400">
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
                                    <a href="/" className="text-base text-gray-400 hover:text-yellow-300">
                                        Home
                                    </a>
                                </li>
                                <li>
                                    <a href="/documentation" className="text-base text-gray-400 hover:text-yellow-300">
                                        Documentation
                                    </a>
                                </li>
                                <li>
                                    <a href="/how-to-use" className="text-base text-gray-400 hover:text-yellow-300">
                                        How to Use
                                    </a>
                                </li>
                                <li>
                                    <a href="/features" className="text-base text-gray-400 hover:text-yellow-300">
                                        Features
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                                Company
                            </h3>
                            <ul className="mt-4 space-y-4">
                                <li>
                                    <a href="/about" className="text-base text-gray-400 hover:text-yellow-300">
                                        About
                                    </a>
                                </li>
                                <li>
                                    <a href="/feedback" className="text-base text-gray-400 hover:text-yellow-300">
                                        Feedback
                                    </a>
                                </li>
                                <li>
                                    <a href="/admin" className="text-base text-gray-400 hover:text-yellow-300">
                                        Admin
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
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
