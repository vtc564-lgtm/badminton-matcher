import React, { useState } from 'react';
import UploadScreen from './components/UploadScreen';
import MatchScreen from './components/MatchScreen';
import { Shirt, Shuffle } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'match'

  return (
    <>
      <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'var(--accent-color)', padding: '0.75rem', borderRadius: 'var(--radius-md)', display: 'inline-flex' }}>
            <Shirt color="white" size={32} />
          </div>
          <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-1px' }}>
            Badminton <span style={{ color: 'var(--accent-color)' }}>Matcher</span>
          </h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          매일 새로운 조합으로 코디를 완성하세요
        </p>
      </header>

      <nav style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '3rem' }}>
        <button 
          className={`btn ${activeTab === 'upload' ? 'btn-primary' : 'glass-panel'}`}
          onClick={() => setActiveTab('upload')}
          style={{ width: '150px' }}
        >
          <Shirt size={18} /> 옷장 관리
        </button>
        <button 
          className={`btn ${activeTab === 'match' ? 'btn-primary' : 'glass-panel'}`}
          onClick={() => setActiveTab('match')}
          style={{ width: '150px' }}
        >
          <Shuffle size={18} /> 코디 매칭
        </button>
      </nav>

      <main>
        {activeTab === 'upload' ? <UploadScreen /> : <MatchScreen />}
      </main>
      
      <footer style={{ marginTop: '5rem', textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0', borderTop: '1px solid var(--surface-border)' }}>
        <p>© 2026 Badminton Matcher. Developed for GitHub Pages.</p>
      </footer>
    </>
  );
}

export default App;
