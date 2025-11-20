import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import backgroundImage from './assets/i2.png';
import Login from './pages/Login';
import Landing from './pages/Landing';
import reportWebVitals from './reportWebVitals.jsx';

function App() {
  // Check if user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // Check if token exists in localStorage
    return !!localStorage.getItem('token');
  });

  // Check login status on mount and when storage changes
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
    };

    // Check on mount - if token exists, user is already logged in
    checkAuth();

    // Listen for storage changes (when login happens in another tab/window)
    window.addEventListener('storage', checkAuth);

    // Custom event for same-tab login
    window.addEventListener('auth-change', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('auth-change', checkAuth);
    };
  }, []);
  const [scrollY, setScrollY] = useState(0);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialView, setAuthInitialView] = useState('signup'); // 'signup' | 'signin'
  const prevScrollYRef = useRef(0);
  const modalOpenedAtScrollYRef = useRef(0);
  const [modalOpacity, setModalOpacity] = useState(1);
  const isModalAnchorSetRef = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.pageYOffset || document.documentElement.scrollTop);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Open auth modal when crossing 1714px from below to above
  useEffect(() => {
    const prev = prevScrollYRef.current;
    if (prev < 1714 && scrollY >= 1714 && !isAuthOpen) {
      setAuthInitialView('signup');
      setIsAuthOpen(true);
      modalOpenedAtScrollYRef.current = scrollY;
      setModalOpacity(1);
      isModalAnchorSetRef.current = true;
    }
    prevScrollYRef.current = scrollY;
  }, [scrollY, isAuthOpen]);

  // Reduce/increase opacity as user scrolls away/towards the anchor position; auto open/close
  useEffect(() => {
    if (!isModalAnchorSetRef.current) return;
    const start = modalOpenedAtScrollYRef.current;
    const distance = Math.abs(scrollY - start);
    const fadeDistance = 400; // px to fully fade
    const nextOpacity = Math.max(0, Math.min(1, 1 - distance / fadeDistance));
    setModalOpacity(nextOpacity);
    if (nextOpacity === 0 && isAuthOpen) setIsAuthOpen(false);
    if (nextOpacity > 0 && !isAuthOpen) setIsAuthOpen(true);
  }, [scrollY, isAuthOpen]);

  // Calculate zoom based on scroll position
  const zoomScale = Math.min(1 + (scrollY * 0.001), 2.5); // Simple linear zoom
  
  // Calculate text opacity - appears when zoom is at maximum (2.5x)
  const textOpacity = zoomScale >= 2.5 ? 1 : 0;
  
  // Temporary: Always show text for testing
  const testTextOpacity = 1;

  // If logged in, show Landing page
  if (isLoggedIn) {
    return <Landing />;
  }

  // Otherwise show home page with login
  return (
    <div className="App">
      <div className="home-container">
        <div 
          className="background-image"
          style={{
            transform: `scale(${zoomScale})`,
            backgroundImage: `url(${backgroundImage})`,
          }}
        />
        
        <div className="content">
          <div 
            className="shree-text"
            style={{
              opacity: testTextOpacity,
            }}
          >
            धरोहर
          </div>
          
          {/* Login/Signup Button - appears when fully zoomed */}
          <div 
            className="auth-buttons"
            style={{
              opacity: zoomScale >= 2.4 ? 1 : 0, // Only visible at max zoom
            }}
          >
            <button className="login-btn" onClick={() => { setAuthInitialView('signin'); setIsAuthOpen(true); modalOpenedAtScrollYRef.current = scrollY; setModalOpacity(1); isModalAnchorSetRef.current = true; }}>Login</button>
            <button className="signup-btn" onClick={() => { setAuthInitialView('signup'); setIsAuthOpen(true); modalOpenedAtScrollYRef.current = scrollY; setModalOpacity(1); isModalAnchorSetRef.current = true; }}>Sign Up</button>
          </div>
        </div>
        
        {/* Debug info */}
        <div className="scroll-debug">
          Scroll: {Math.round(scrollY)}px<br/>
          Zoom: {zoomScale.toFixed(2)}x<br/>
          Max Zoom: {zoomScale >= 2.4 ? 'YES' : 'NO'}<br/>
          Buttons Visible: {zoomScale >= 2.4 ? 'YES' : 'NO'}<br/>
          Opacity: {textOpacity.toFixed(2)}
        </div>
        
        {/* Spacer to enable scrolling */}
        <div className="scroll-spacer" />

        <Login isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} initialView={authInitialView} opacity={modalOpacity} />
      </div>
    </div>
  );
}

export default App;

// Render the app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
