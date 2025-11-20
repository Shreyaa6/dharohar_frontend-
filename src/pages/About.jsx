import React from 'react';
import './About.css';
import cultureImg from '../assets/culture.png';
import monumentsImg from '../assets/monuments.png';
import Navbar from '../components/NavBar';

const journeyMilestones = [
  { year: '2018', title: 'Archiving the first 100 artefacts', body: 'We began with scanned manuscripts and oral histories from three districts, proving that community-sourced preservation works.' },
  { year: '2020', title: 'Community research circles', body: 'Local historians, students, and travellers started hosting monthly circles to document shrines, crafts, and folk music.' },
  { year: '2023', title: 'Immersive field libraries', body: 'We paired satellite imagery with on-ground stories so members can virtually "walk" through heritage corridors.' },
  { year: 'Today', title: 'The Living Heritage Web', body: 'Thousands of contributors help map cultural layers—rituals, architecture, foodways, and languages—in one shared canvas.' },
];

const storytellerHighlights = [
  { label: 'Citizen storytellers', value: '8.3k+', detail: 'Members who post lived experiences and cultural notes every week.' },
  { label: 'Curated trails', value: '420', detail: 'Interactive journeys through forts, ghats, stepwells, and craft clusters.' },
  { label: 'Scholarly references', value: '1.8k', detail: 'Cross-verified citations contributed by universities and archives.' },
];

const About = ({ setActiveTab }) => {
  return (
    <div className="about-page">
      <Navbar activeTab="about" setActiveTab={setActiveTab} />

      <section className="about-hero">
        <div className="about-hero-header">
          <h1>Stories, spaces, and rituals preserved together.</h1>
          <p className="about-lede">
            धरोहर is a living archive where explorers log in to trace ancestral cities, document sacred art, and publish the stories that deserve a digital home. 
            Every scroll reveals field notes, century-old sketches, and today’s community voices—stitched into a single experience.
          </p>
        </div>
        <div className="about-hero-stats">
          <article className="about-stat-card">
            <span>1,200+</span>
            <p>digitized artefacts & rare manuscripts</p>
          </article>
          <article className="about-stat-card">
            <span>320</span>
            <p>heritage districts mapped with cultural layers</p>
          </article>
          <article className="about-stat-card">
            <span>95%</span>
            <p>stories validated by community historians</p>
          </article>
        </div>
      </section>

      <section className="about-story-grid">
        <div className="story-panel mission">
          <h3>Mission</h3>
          <p>
            To make India’s layered heritage searchable, shareable, and safe forever—whether it is temple iconography, Sufi music routes, or indigenous ecological wisdom.
          </p>
          <div className="story-panel-footer">
            <span>Open, inclusive, always evolving.</span>
          </div>
        </div>
        <div className="story-panel actions">
          <h3>What members do here</h3>
          <ul>
            <li><strong>Log in</strong> to curate personal collections and reading lists.</li>
            <li><strong>Read</strong> immersive essays, audio tours, and annotated maps.</li>
            <li><strong>Post</strong> discoveries—vernacular architecture, food rituals, micro-histories.</li>
            <li><strong>Collaborate</strong> with archivists and cultural labs in real time.</li>
          </ul>
          <div className="story-panel-tag">A digital sabha for heritage lovers</div>
        </div>
        <div className="story-panel media">
          <img src={cultureImg} alt="Culture collage" />
          <div className="media-overlay">
            <p>Field diaries, scans, drone footage & oral histories live side-by-side.</p>
          </div>
        </div>
        <div className="story-panel media secondary">
          <img src={monumentsImg} alt="Heritage monuments" />
          <div className="media-overlay">
            <p>Every post links places, people, timelines, and rituals.</p>
          </div>
        </div>
      </section>

      <section className="about-journey">
        <div className="journey-header">
          <p>Our Journey</p>
          <h2>From scanned notebooks to a living digital campus.</h2>
        </div>
        <div className="journey-timeline">
          {journeyMilestones.map((milestone) => (
            <article className="journey-card" key={milestone.year}>
              <div className="journey-year">{milestone.year}</div>
              <h4>{milestone.title}</h4>
              <p>{milestone.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-community">
        <div className="community-content">
          <p className="about-eyebrow">Community Data Trust</p>
          <h2>Lived experiences power every update.</h2>
          <p>
            We verify submissions through layered review—citizen storytellers, subject scholars, and local councils. 
            The goal is not perfection, but an accountable record that honors provenance and people.
          </p>
          <div className="community-tags">
            <span>#IntangibleHeritage</span>
            <span>#WomenArchivists</span>
            <span>#TribalKnowledge</span>
            <span>#CraftRoutes</span>
          </div>
        </div>
        <div className="community-stats">
          {storytellerHighlights.map((highlight) => (
            <article className="community-card" key={highlight.label}>
              <p className="community-label">{highlight.label}</p>
              <span className="community-value">{highlight.value}</span>
              <p className="community-detail">{highlight.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-cta">
        <div className="cta-content">
          <p>Next steps</p>
          <h2>Bring your corner of heritage online.</h2>
          <p>
            Log in, start a micro-archive, upload that postcard, or map your favourite ritual site. 
            Every contribution helps researchers, schools, and travellers see culture through the eyes of its keepers.
          </p>
        </div>
        <div className="cta-actions">
          <button className="cta-primary" onClick={() => setActiveTab('home')}>Return to library</button>
          <button className="cta-secondary" onClick={() => setActiveTab('heritage')}>Explore heritage</button>
        </div>
      </section>
    </div>
  );
};

export default About;





