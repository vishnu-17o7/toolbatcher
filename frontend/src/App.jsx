import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { 
  CTA, 
  Footer, 
  Hero, 
  Navbar, 
  Stats, 
  ToolSelector,
  CodeEditor,
  Documentation,
  HowToUse,
  Features,
  About
} from './components';

import styles from './style';

const Home = () => (
  <>
    <Hero />
    <ToolSelector />
    <Stats />
    <CTA />
  </>
);

const App = () => {
  return (
    <Router>
      <div className='bg-primary w-full overflow-hidden'>
        <div className={`${styles.paddingX} ${styles.flexCenter}`}>
          <div className={`${styles.boxWidth}`}>
            <Navbar/>
          </div>
        </div>
        <div className={`bg-primary ${styles.paddingX} ${styles.flexStart}`}>
          <div className={`${styles.boxWidth}`}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/codeeditor" element={<CodeEditor />} />
              <Route path="/documentation" element={<Documentation />} />
              <Route path="/how-to-use" element={<HowToUse />} />
              <Route path="/features" element={<Features />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </div>
        </div>
        <Footer/>
      </div>
    </Router>
  );
};

export default App;
