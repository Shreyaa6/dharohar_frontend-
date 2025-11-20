import React, { useEffect, useState } from 'react';
import './Login.css';
import { authAPI } from '../services/api';

const Login = ({ isOpen, onClose, initialView = 'signup', opacity = 1 }) => {
  const [view, setView] = useState(initialView); // 'signup' | 'signin'
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Reset form when modal opens or view changes from parent
  useEffect(() => {
    if (isOpen) {
      setView(initialView);
      setUsername('');
      setEmail('');
      setPassword('');
      setError('');
    }
  }, [isOpen, initialView]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (view === 'signup') {
        if (!username || !email || !password) {
          setError('Please fill in username, email, and password.');
          setIsLoading(false);
          return;
        }

        const response = await authAPI.signup(username, email, password);
        // Trigger auth change event to update App.jsx state
        window.dispatchEvent(new Event('auth-change'));
        onClose();
      } else {
        // signin
        if (!email || !password) {
          setError('Please enter your email and password.');
          setIsLoading(false);
          return;
        }

        const response = await authAPI.login(email, password);
        // Trigger auth change event to update App.jsx state
        window.dispatchEvent(new Event('auth-change'));
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
      
      // If email exists during signup, switch to signin view
      if (view === 'signup' && err.message.includes('already exists')) {
        setView('signin');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" role="dialog" aria-modal="true" style={{ opacity }}>
      <div className="auth-modal" style={{ opacity }}>
        {view === 'signup' ? (
          <>
            {error ? <div className="auth-error">{error}</div> : null}
            <form className="auth-form" onSubmit={handleSubmit}>
              <input
                className="auth-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email"
                autoFocus
              />
              <input
                className="auth-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
              />
              <input
                className="auth-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
              />
              <button type="submit" className="auth-primary" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Sign Up'}
              </button>
            </form>
            <div className="auth-footer">
              Already Have an Account?{' '}
              <button className="auth-link" onClick={() => { setView('signin'); setError(''); }}>
                Log In
              </button>
            </div>
          </>
        ) : (
          <>
            {error ? <div className="auth-error">{error}</div> : null}
            <form className="auth-form" onSubmit={handleSubmit}>
              <input
                className="auth-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email"
                autoFocus
              />
              <input
                className="auth-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
              />
              <button type="submit" className="auth-primary" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Log In'}
              </button>
            </form>
            <div className="auth-footer">
              Don't Have an Account?{' '}
              <button className="auth-link" onClick={() => { setView('signup'); setError(''); }}>
                Sign Up
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;

