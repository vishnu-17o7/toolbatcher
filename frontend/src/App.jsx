import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
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
  About,
  AdminPage
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

const AppContent = () => {
  const location = useLocation();
  const isAdminPage = location.pathname === '/admin';

  return (
    <div className='bg-primary w-full overflow-hidden'>
      {!isAdminPage && (
        <div className={`${styles.paddingX} ${styles.flexCenter}`}>
          <div className={`${styles.boxWidth}`}>
            <Navbar/>
          </div>
        </div>
      )}
      <div className={`bg-primary ${styles.paddingX} ${styles.flexStart}`}>
        <div className={`${styles.boxWidth}`}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/codeeditor" element={<CodeEditor />} />
            <Route path="/documentation" element={<Documentation />} />
            <Route path="/how-to-use" element={<HowToUse />} />
            <Route path="/features" element={<Features />} />
            <Route path="/about" element={<About />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </div>
      </div>
      {!isAdminPage && <Footer/>}
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
