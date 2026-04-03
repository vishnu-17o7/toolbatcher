import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-primary text-gray-300 relative z-10">
            <div className="max-w-7xl mx-auto px-4 py-14 sm:px-6 lg:px-8 border-t border-white/10">
                <div className="xl:grid xl:grid-cols-3 xl:gap-8 gap-8">
                    <div className="space-y-6 xl:col-span-1">
                        <p className='tb-kicker'>toolbatcher</p>
                        <p className="tb-lede text-[1rem] max-w-[40ch]">
                            Cross-platform install planning for teams that care about speed, consistency, and execution trust.
                        </p>
                    </div>

                    <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
                        <div>
                            <h3 className="text-sm font-semibold text-dimWhite tracking-[0.12em] uppercase">
                                Product
                            </h3>
                            <ul className="mt-4 space-y-4">
                                <li>
                                    <a href="/" className="focus-ring text-base text-dimWhite hover:text-secondary transition-colors">
                                        Home
                                    </a>
                                </li>
                                <li>
                                    <a href="/documentation" className="focus-ring text-base text-dimWhite hover:text-secondary transition-colors">
                                        Documentation
                                    </a>
                                </li>
                                <li>
                                    <a href="/how-to-use" className="focus-ring text-base text-dimWhite hover:text-secondary transition-colors">
                                        How to Use
                                    </a>
                                </li>
                                <li>
                                    <a href="/features" className="focus-ring text-base text-dimWhite hover:text-secondary transition-colors">
                                        Features
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-dimWhite tracking-[0.12em] uppercase">
                                Explore
                            </h3>
                            <ul className="mt-4 space-y-4">
                                <li>
                                    <a href="/about" className="focus-ring text-base text-dimWhite hover:text-secondary transition-colors">
                                        About
                                    </a>
                                </li>
                                <li>
                                    <a href="/feedback" className="focus-ring text-base text-dimWhite hover:text-secondary transition-colors">
                                        Feedback
                                    </a>
                                </li>
                                <li>
                                    <a href="/admin" className="focus-ring text-base text-dimWhite hover:text-secondary transition-colors">
                                        Admin
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="mt-12 border-t border-white/10 pt-8">
                    <p className="text-sm text-dimWhite text-center tracking-[0.06em] uppercase">
                        &copy; {new Date().getFullYear()} ToolBatcher. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
