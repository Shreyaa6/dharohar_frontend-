import React, { useState, useEffect } from 'react';
import './Landing.css';
import landingImage from '../assets/landing.png';
import Heritage from './Heritage';
import Discuss from './Discuss';
import About from './About';
import Explore from './Explore';
import Settings from './Settings';
import Navbar from '../components/NavBar';

const Landing = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [exploreCategory, setExploreCategory] = useState(null);


  // Prevent scrolling on mount (only for home view)
  useEffect(() => {
    if (activeTab === 'home') {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [activeTab]);

  // Render Settings component when settings is active
  if (activeTab === 'settings') {
    return <Settings activeTab={activeTab} setActiveTab={setActiveTab} />;
  }

  // Render Explore component when explore is active
  if (activeTab === 'explore') {
    return <Explore activeTab={activeTab} setActiveTab={setActiveTab} selectedCategory={exploreCategory} />;
  }

  // Render Heritage component when heritage tab is active
  if (activeTab === 'heritage') {
    return (
      <Heritage 
        onBack={() => setActiveTab('home')} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        onExplore={(category) => {
          setExploreCategory(category);
          setActiveTab('explore');
        }}
      />
    );
  }

  // Render Discuss component when discuss tab is active
  if (activeTab === 'discuss') {
    return <Discuss activeTab={activeTab} setActiveTab={setActiveTab} />;
  }

  if (activeTab === 'about') {
    return <About setActiveTab={setActiveTab} />;
  }

  return (
    <div className="landing-container">
      <div 
        className="landing-background"
        style={{
          backgroundImage: `url(${landingImage})`,
        }}
      />
      <div className="landing-content">
        <div className="landing-header">
          <h1 className="landing-title">धरोहर</h1>
        </div>
        
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
};

export default Landing;
