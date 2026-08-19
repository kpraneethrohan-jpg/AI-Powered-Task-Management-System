import React from 'react';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <header style={styles.header}>
        <div style={styles.logo}>TaskPro</div>
        <button style={styles.loginBtn} onClick={handleLogin}>
          Login
        </button>
      </header>

      {/* HERO */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Streamline Your Work, Together</h1>
          <p style={styles.heroSubtitle}>
            The ultimate task management platform to plan, assign, and track
            work with ease — from solo projects to large teams.
          </p>
          <button style={styles.ctaBtn}>Get Started</button>
        </div>
      </section>

      {/* FEATURES */}
      <section style={styles.features}>
        <h2 style={styles.featuresTitle}>Why Choose TaskPro?</h2>
        <div style={styles.cards}>
          <div style={styles.card}>
            <div style={styles.cardIcon}>📌</div>
            <h3 style={styles.cardTitle}>Easy Task Assignment</h3>
            <p style={styles.cardText}>
              Create and assign tasks to your team in seconds.
            </p>
          </div>

          <div style={styles.card}>
            <div style={styles.cardIcon}>⏰</div>
            <h3 style={styles.cardTitle}>Stay On Deadline</h3>
            <p style={styles.cardText}>
              Visual deadlines keep everyone aligned and projects on track.
            </p>
          </div>

          <div style={styles.card}>
            <div style={styles.cardIcon}>💬</div>
            <h3 style={styles.cardTitle}>Collaborate Instantly</h3>
            <p style={styles.cardText}>
              Chat and comment directly on tasks for smooth communication.
            </p>
          </div>

          <div style={styles.card}>
            <div style={styles.cardIcon}>📈</div>
            <h3 style={styles.cardTitle}>Track Progress</h3>
            <p style={styles.cardText}>
              Monitor status and get real-time updates with clear visuals.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <p>© 2025 TaskPro. Built to make teamwork effortless.</p>
      </footer>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif`,
    backgroundColor: '#f7f9fb',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },
  header: {
    backgroundColor: '#001529',
    color: '#fff',
    padding: '20px 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    letterSpacing: '1px',
  },
  loginBtn: {
    backgroundColor: '#1890ff',
    color: '#fff',
    border: 'none',
    padding: '10px 24px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  hero: {
    backgroundImage:
      'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(https://images.unsplash.com/photo-1521737604893-d14cc237f11d)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    color: '#fff',
    padding: '120px 20px',
    textAlign: 'center',
  },
  heroContent: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  heroTitle: {
    fontSize: '3rem',
    marginBottom: '20px',
    lineHeight: '1.2',
    animation: 'fadeInDown 1s ease',
  },
  heroSubtitle: {
    fontSize: '1.2rem',
    marginBottom: '30px',
    lineHeight: '1.6',
    color: '#f0f0f0',
  },
  ctaBtn: {
    backgroundColor: '#1890ff',
    color: '#fff',
    border: 'none',
    padding: '14px 36px',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  features: {
    padding: '60px 20px',
    backgroundColor: '#fff',
    textAlign: 'center',
  },
  featuresTitle: {
    fontSize: '2.2rem',
    marginBottom: '40px',
    color: '#333',
  },
  cards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '30px',
    maxWidth: '1000px',
    margin: '0 auto',
  },
  card: {
    backgroundColor: '#f7f9fb',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    transition: 'transform 0.2s',
  },
  cardIcon: {
    fontSize: '2rem',
    marginBottom: '15px',
  },
  cardTitle: {
    fontSize: '1.2rem',
    marginBottom: '10px',
    color: '#333',
  },
  cardText: {
    fontSize: '0.95rem',
    color: '#555',
    lineHeight: '1.5',
  },
  footer: {
    backgroundColor: '#001529',
    color: '#fff',
    textAlign: 'center',
    padding: '20px 0',
    marginTop: 'auto',
  },
};

export default LandingPage;
