import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { 
  CTA, 
  Footer, 
  Hero, 
  Navbar, 
  Stats, 
  ToolSelector
} from './components';
import styles from './style';

const Documentation = lazy(() => import('./components/Documentation'));
const HowToUse = lazy(() => import('./components/HowToUse'));
const Features = lazy(() => import('./components/Features'));
const About = lazy(() => import('./components/About'));
const FeedbackForm = lazy(() => import('./components/FeedbackForm'));
const AdminPage = lazy(() => import('./components/AdminPage'));

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
    <div className='tb-page bg-primary w-full min-h-screen overflow-hidden'>
      {!isAdminPage && (
        <div className={`${styles.paddingX} ${styles.flexCenter} relative z-10`}>
          <div className={`${styles.boxWidth}`}>
            <div className="flex justify-between items-center tb-nav">
              <Navbar/>
            </div>
          </div>
        </div>
      )}
      <main className={`bg-primary ${styles.paddingX} ${styles.flexStart} relative z-10`}>
        <div className={`${styles.boxWidth}`}>
          <Suspense fallback={<div className="tb-surface rounded-xl px-4 py-6 text-dimWhite">Loading page module...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/documentation" element={<Documentation />} />
              <Route path="/how-to-use" element={<HowToUse />} />
              <Route path="/features" element={<Features />} />
              <Route path="/about" element={<About />} />
              <Route path="/feedback" element={<FeedbackForm />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </Suspense>
        </div>
      </main>
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
