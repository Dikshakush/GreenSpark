import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HomeScreen = () => {
  const navigate = useNavigate();

  const styles = {
    container: {
      backgroundColor: '#08082f',
      color: '#ffffff',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '40px 20px',
      fontFamily: 'Arial, sans-serif',
    },
    title: {
      fontSize: '48px',
      fontWeight: 'bold',
      marginBottom: '20px',
      animation: 'fadeIn 1.5s ease-in-out',
    },
    tagline: {
      fontSize: '20px',
      maxWidth: '600px',
      marginBottom: '30px',
      lineHeight: '1.6',
      animation: 'fadeIn 2s ease-in-out',
    },
    subheading: {
      fontSize: '22px',
      fontWeight: 'bold',
      marginTop: '10px',
      marginBottom: '20px',
      color: '#00c46b',
      animation: 'fadeIn 2.5s ease-in-out',
    },
    featureList: {
      fontSize: '18px',
      maxWidth: '650px',
      marginBottom: '40px',
      lineHeight: '1.6',
      textAlign: 'left',
    },
    featureItem: {
      opacity: 0,
      transform: 'translateY(20px)',
      transition: 'opacity 0.6s ease, transform 0.6s ease',
    },
    featureItemVisible: {
      opacity: 1,
      transform: 'translateY(0)',
    },
    buttonContainer: {
      display: 'flex',
      gap: '20px',
      flexWrap: 'wrap',
      justifyContent: 'center',
    },
    button: {
      backgroundColor: '#00c46b',
      color: '#fff',
      padding: '12px 24px',
      fontSize: '16px',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    },
    buttonHover: {
      transform: 'scale(1.05)',
      boxShadow: '0 0 10px #00c46b',
    },
  };

  const [hoveredBtn, setHoveredBtn] = useState(null);
  const [visibleItems, setVisibleItems] = useState([]);

  // Animate feature points one by one
  useEffect(() => {
    const timeouts = [
      setTimeout(() => setVisibleItems((prev) => [...prev, 0]), 300),
      setTimeout(() => setVisibleItems((prev) => [...prev, 1]), 600),
      setTimeout(() => setVisibleItems((prev) => [...prev, 2]), 900),
      setTimeout(() => setVisibleItems((prev) => [...prev, 3]), 1200),
    ];
    return () => timeouts.forEach(clearTimeout);
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Welcome to GreenSpark 🌿</h1>
      <p style={styles.tagline}>
        Track your eco-friendly journey, earn rewards, and help the planet thrive — one action at a time.
      </p>

      {/* New pitch section */}
      <h2 style={styles.subheading}>Your daily actions matter.</h2>
      <div style={styles.featureList}>
        <p
          style={{
            ...styles.featureItem,
            ...(visibleItems.includes(0) ? styles.featureItemVisible : {}),
          }}
        >
          📊 <strong>Track & visualize</strong> your eco-friendly actions.
        </p>
        <p
          style={{
            ...styles.featureItem,
            ...(visibleItems.includes(1) ? styles.featureItemVisible : {}),
          }}
        >
          📚 <strong>Learn</strong> simple, effective tips for sustainable living.
        </p>
        <p
          style={{
            ...styles.featureItem,
            ...(visibleItems.includes(2) ? styles.featureItemVisible : {}),
          }}
        >
          🤝 <strong>Connect</strong> with a supportive community for inspiration.
        </p>
        <p
          style={{
            ...styles.featureItem,
            ...(visibleItems.includes(3) ? styles.featureItemVisible : {}),
          }}
        >
          Whether you’re just starting or already an eco-warrior, we make sustainability fun, social, and rewarding.
        </p>
      </div>

      {/* Buttons */}
      <div style={styles.buttonContainer}>
        <button
          style={{
            ...styles.button,
            ...(hoveredBtn === 'login' ? styles.buttonHover : {}),
          }}
          onMouseEnter={() => setHoveredBtn('login')}
          onMouseLeave={() => setHoveredBtn(null)}
          onClick={() => navigate('/login')}
        >
          Get Started
        </button>

        <button
          style={{
            ...styles.button,
            ...(hoveredBtn === 'about' ? styles.buttonHover : {}),
          }}
          onMouseEnter={() => setHoveredBtn('about')}
          onMouseLeave={() => setHoveredBtn(null)}
          onClick={() => navigate('/about')}
        >
          Learn More
        </button>
      </div>
    </div>
  );
};

export default HomeScreen;
