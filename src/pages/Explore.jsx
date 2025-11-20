import React, { useState, useEffect, useMemo } from 'react';
import './Explore.css';
import Navbar from '../components/NavBar';
import indianHeritageData from '../services/heri';

const Explore = ({ activeTab, setActiveTab, selectedCategory = null }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState(selectedCategory ? [selectedCategory] : ['all']);
  const [selectedItem, setSelectedItem] = useState(null);
  const [imageStatusFilter, setImageStatusFilter] = useState('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [itemsToShow, setItemsToShow] = useState(10);

  // Get all items from all categories
  const allItems = useMemo(() => {
    const items = [];
    Object.keys(indianHeritageData).forEach(category => {
      indianHeritageData[category].forEach(item => {
        items.push(item);
      });
    });
    return items;
  }, []);

  // Filter items based on search, category, and image status
  const filteredItems = useMemo(() => {
    let filtered = allItems;

    // Category filter
    if (!selectedCategories.includes('all')) {
      filtered = filtered.filter(item => selectedCategories.includes(item.category));
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query)
      );
    }

    // Image status filter
    if (imageStatusFilter !== 'all') {
      filtered = filtered.filter(item => {
        if (imageStatusFilter === 'irl') {
          return item.image_status.includes('IRL');
        } else if (imageStatusFilter === 'digital') {
          return item.image_status.includes('Digital');
        }
        return true;
      });
    }

    return filtered;
  }, [allItems, selectedCategories, searchQuery, imageStatusFilter]);

  // Get items to display (limited by itemsToShow)
  const displayedItems = useMemo(() => {
    return filteredItems.slice(0, itemsToShow);
  }, [filteredItems, itemsToShow]);

  const hasMoreItems = filteredItems.length > itemsToShow;

  const handleLoadMore = () => {
    setItemsToShow(prev => prev + 10);
  };

  // Set initial category when component mounts with selectedCategory
  useEffect(() => {
    if (selectedCategory) {
      setSelectedCategories([selectedCategory]);
    }
  }, [selectedCategory]);

  // Reset items to show when filters change
  useEffect(() => {
    setItemsToShow(10);
  }, [selectedCategories, searchQuery, imageStatusFilter]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showFilterDropdown && !event.target.closest('.explore-filter-dropdown-wrapper')) {
        setShowFilterDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFilterDropdown]);

  const categories = [
    { id: 'all', label: 'All', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="2" x2="12" y2="22" />
        <line x1="2" y1="12" x2="22" y2="12" />
      </svg>
    )},
    { id: 'Arts', label: 'Arts', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    )},
    { id: 'Culture', label: 'Culture', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0-6 0z" />
        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z" />
        <path d="M15 11a3 3 0 1 1-6 0" />
      </svg>
    )},
    { id: 'Monuments', label: 'Monuments', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 21h18" />
        <path d="M5 21V7l8-4v18" />
        <path d="M19 21V11l-6-4" />
        <path d="M9 9v0" />
        <path d="M9 12v0" />
        <path d="M9 15v0" />
        <path d="M9 18v0" />
      </svg>
    )},
    { id: 'Landscape', label: 'Landscape', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 18l5-5 5 5 5-5h3" />
        <path d="M3 12l5-5 5 5 5-5h3" />
        <path d="M3 6l5-5 5 5 5-5h3" />
      </svg>
    )}
  ];

  const handleCategoryToggle = (categoryId) => {
    if (categoryId === 'all') {
      setSelectedCategories(['all']);
    } else {
      if (selectedCategories.includes('all')) {
        setSelectedCategories([categoryId]);
      } else if (selectedCategories.includes(categoryId)) {
        const newCategories = selectedCategories.filter(c => c !== categoryId);
        setSelectedCategories(newCategories.length === 0 ? ['all'] : newCategories);
      } else {
        setSelectedCategories([...selectedCategories.filter(c => c !== 'all'), categoryId]);
      }
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Arts': '#d4a574',
      'Culture': '#c9a876',
      'Monuments': '#b89d7a',
      'Landscape': '#a8927e'
    };
    return colors[category] || '#f7d9a3';
  };

  return (
    <div className="explore-page">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="explore-container">
        {/* Header */}
        <div className="explore-header">
          <h1 className="explore-title">Explore Heritage</h1>
          <p className="explore-subtitle">Discover India's rich cultural heritage through art, monuments, culture, and landscapes</p>
        </div>

        {/* Search and Filters */}
        <div className="explore-controls">
          <div className="explore-search-container">
            <div className="explore-search-wrapper">
              <svg className="explore-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                className="explore-search"
                placeholder="Search by title, description, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="explore-filter-dropdown-wrapper">
              <button
                className="explore-filter-dropdown-btn"
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
                <span>Filters</span>
                <svg 
                  className={`explore-filter-arrow ${showFilterDropdown ? 'open' : ''}`}
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {showFilterDropdown && (
                <div className="explore-filter-dropdown" onClick={(e) => e.stopPropagation()}>
                  {/* Category Filters */}
                  <div className="explore-filter-section">
                    <label className="explore-filter-section-label">Category</label>
                    <div className="explore-categories-filter">
                      {categories.map(category => (
                        <button
                          key={category.id}
                          className={`explore-category-filter ${selectedCategories.includes(category.id) ? 'active' : ''}`}
                          onClick={() => handleCategoryToggle(category.id)}
                          style={selectedCategories.includes(category.id) ? {
                            backgroundColor: category.id === 'all' ? '#f7d9a3' : getCategoryColor(category.id),
                            color: '#1b1916'
                          } : {}}
                        >
                          <span className="explore-category-icon">{category.icon}</span>
                          <span>{category.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Image Status Filter */}
                  <div className="explore-filter-section">
                    <label className="explore-filter-section-label">Image Status</label>
                    <div className="explore-status-options">
                      <button
                        className={`explore-status-option ${imageStatusFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setImageStatusFilter('all')}
                      >
                        All
                      </button>
                      <button
                        className={`explore-status-option ${imageStatusFilter === 'irl' ? 'active' : ''}`}
                        onClick={() => setImageStatusFilter('irl')}
                      >
                        IRL Only
                      </button>
                      <button
                        className={`explore-status-option ${imageStatusFilter === 'digital' ? 'active' : ''}`}
                        onClick={() => setImageStatusFilter('digital')}
                      >
                        Digital Only
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="explore-results-count">
          <span>{filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} found</span>
        </div>

        {/* Items Grid */}
        <div className="explore-grid">
          {displayedItems.map((item) => (
            <article
              key={item.id}
              className="explore-card"
              onClick={() => setSelectedItem(item)}
            >
              <div className="explore-card-image">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} />
                ) : (
                  <div className="explore-image-placeholder">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                )}
                <div className="explore-card-category" style={{ backgroundColor: getCategoryColor(item.category) }}>
                  {item.category}
                </div>
              </div>
              <div className="explore-card-content">
                <h3 className="explore-card-title">{item.title}</h3>
                <p className="explore-card-location">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {item.location}
                </p>
                <p className="explore-card-description">{item.description.substring(0, 150)}...</p>
                <div className="explore-card-footer">
                  <span className="explore-card-status">{item.image_status}</span>
                  <button className="explore-card-read-more">Read More →</button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="explore-empty">
            <p>No items found. Try adjusting your search or filters.</p>
          </div>
        )}

        {/* Load More Button */}
        {hasMoreItems && (
          <div className="explore-load-more-container">
            <button className="explore-load-more-btn" onClick={handleLoadMore}>
              <span>Load More</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="explore-modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="explore-modal" onClick={(e) => e.stopPropagation()}>
            <button className="explore-modal-close" onClick={() => setSelectedItem(null)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className="explore-modal-image">
              {selectedItem.image_url ? (
                <img src={selectedItem.image_url} alt={selectedItem.title} />
              ) : (
                <div className="explore-image-placeholder-large">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
              )}
            </div>

            <div className="explore-modal-content">
              <div className="explore-modal-header">
                <div className="explore-modal-category" style={{ backgroundColor: getCategoryColor(selectedItem.category) }}>
                  {selectedItem.category}
                </div>
                <h2 className="explore-modal-title">{selectedItem.title}</h2>
              </div>

              <div className="explore-modal-meta">
                <div className="explore-modal-location">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>{selectedItem.location}</span>
                </div>
                <div className="explore-modal-status">
                  <span className="explore-status-badge">{selectedItem.image_status}</span>
                </div>
              </div>

              <div className="explore-modal-description">
                <p>{selectedItem.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Explore;

