import React, { useState } from 'react';
import './Heritage.css';
import monumentsImage from '../assets/monuments.png';
import h2Image from '../assets/h2.png';
import h3Image from '../assets/h3.png';
import h4Image from '../assets/h4.png';
import Navbar from '../components/NavBar';

const Heritage = ({ onBack, activeTab, setActiveTab, onExplore }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const carouselImages = [monumentsImage, h2Image, h3Image, h4Image];
  const categories = ['Monuments', 'Culture', 'Arts', 'Landscape'];

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % carouselImages.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + carouselImages.length) % carouselImages.length);
  };

  return (
    <div className="heritage-container">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Image Carousel */}
      <div className="heritage-carousel-container">
        <div 
          className="heritage-carousel-wrapper"
          style={{ transform: `translateX(-${currentImageIndex * 25}%)` }}
        >
          {carouselImages.map((image, index) => (
            <div key={index} className="heritage-carousel-slide">
              <img src={image} alt={`Heritage ${index + 1}`} className="heritage-carousel-image" />
              {index === 0 && (
                <div className="heritage-carousel-text-overlay heritage-carousel-text-overlay-monuments">
                  <span className="heritage-carousel-text heritage-carousel-text-monuments">Monuments</span>
                </div>
              )}
              {index === 1 && (
                <div className="heritage-carousel-text-overlay heritage-carousel-text-overlay-culture">
                  <span className="heritage-carousel-text heritage-carousel-text-culture">Culture</span>
                </div>
              )}
              {index === 2 && (
                <div className="heritage-carousel-text-overlay heritage-carousel-text-overlay-arts">
                  <span className="heritage-carousel-text heritage-carousel-text-arts">Arts</span>
                </div>
              )}
              {index === 3 && (
                <div className="heritage-carousel-text-overlay heritage-carousel-text-overlay-landscape">
                  <span className="heritage-carousel-text heritage-carousel-text-landscape">Landscape</span>
                </div>
              )}
              <div className="heritage-carousel-explore-button">
                <button
                  className="heritage-explore-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onExplore) {
                      onExplore(categories[index]);
                    }
                  }}
                >
                  <span>Explore</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
        {currentImageIndex > 0 && (
          <button className="heritage-carousel-prev" onClick={handlePrevImage}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}
        <button className="heritage-carousel-next" onClick={handleNextImage}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Heritage;
