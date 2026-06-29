import React, { useState, useEffect } from 'react';
import { Shuffle, Grid } from 'lucide-react';
import * as storage from '../lib/storage';
import { calculateMatchScore } from '../lib/colorLogic';

export default function MatchScreen() {
  const [tops, setTops] = useState([]);
  const [bottoms, setBottoms] = useState([]);
  const [randomMatch, setRandomMatch] = useState(null);
  const [bestMatches, setBestMatches] = useState([]);
  const [viewMode, setViewMode] = useState('random');

  useEffect(() => {
    const loadData = async () => {
      const loadedTops = await storage.getTops();
      const loadedBottoms = await storage.getBottoms();
      setTops(loadedTops);
      setBottoms(loadedBottoms);
      
      if (loadedTops.length > 0 && loadedBottoms.length > 0) {
        generateRandomMatch(loadedTops, loadedBottoms);
        
        // Generate 1 best match per top using color scoring
        const matches = loadedTops.map(top => {
          let bestBottom = loadedBottoms[0];
          let highestScore = -Infinity;

          loadedBottoms.forEach(bottom => {
            const score = calculateMatchScore(top.color, bottom.color);
            if (score > highestScore) {
              highestScore = score;
              bestBottom = bottom;
            }
          });

          return { top, bottom: bestBottom, score: highestScore };
        });

        // Sort by highest score overall just for better presentation
        matches.sort((a, b) => b.score - a.score);
        setBestMatches(matches);
      }
    };
    loadData();
  }, []);

  const generateRandomMatch = (topsList = tops, bottomsList = bottoms) => {
    if (topsList.length === 0 || bottomsList.length === 0) return;
    
    // For random match, we can still just pick a random top, 
    // but maybe pair it with its BEST bottom for consistency, 
    // or just completely random. Let's pick a random top and its best bottom!
    const randomTop = topsList[Math.floor(Math.random() * topsList.length)];
    
    let bestBottom = bottomsList[0];
    let highestScore = -Infinity;
    bottomsList.forEach(bottom => {
      const score = calculateMatchScore(randomTop.color, bottom.color);
      if (score > highestScore) {
        highestScore = score;
        bestBottom = bottom;
      }
    });
    
    setRandomMatch({ top: randomTop, bottom: bestBottom });
  };

  const handleShuffle = () => {
    generateRandomMatch();
  };

  if (tops.length === 0 || bottoms.length === 0) {
    return (
      <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>옷이 부족합니다 😢</h2>
        <p style={{ color: 'var(--text-secondary)' }}>매칭을 위해 최소 1벌 이상의 상의와 하의를 등록해주세요.</p>
      </div>
    );
  }

  // To display color blocks (optional, for debugging or aesthetic)
  const renderColorBlock = (color) => {
    if (!color) return null;
    return (
      <div style={{
        width: '20px', height: '20px', borderRadius: '50%',
        backgroundColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})`,
        border: '1px solid var(--surface-border)',
        position: 'absolute', bottom: '0.5rem', right: '0.5rem'
      }} title="추출된 색상" />
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button 
          className={`btn ${viewMode === 'random' ? 'btn-primary' : 'glass-panel'}`}
          onClick={() => setViewMode('random')}
          style={{ padding: '0.75rem 2rem', borderRadius: '2rem' }}
        >
          <Shuffle size={18} /> 오늘의 추천
        </button>
        <button 
          className={`btn ${viewMode === 'all' ? 'btn-primary' : 'glass-panel'}`}
          onClick={() => setViewMode('all')}
          style={{ padding: '0.75rem 2rem', borderRadius: '2rem' }}
        >
          <Grid size={18} /> 내 옷장 코디
        </button>
      </div>

      {viewMode === 'random' && randomMatch && (
        <section className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '2rem', background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              오늘의 배드민턴 코디
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>인공지능이 분석한 최적의 색상 조합입니다!</p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '300px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', border: '2px solid var(--surface-border)' }}>
              <img src={randomMatch.top.image} alt="Top Match" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }} />
              {renderColorBlock(randomMatch.top.color)}
            </div>
            
            <div style={{ position: 'relative', width: '100%', maxWidth: '300px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', border: '2px solid var(--surface-border)' }}>
              <img src={randomMatch.bottom.image} alt="Bottom Match" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }} />
              {renderColorBlock(randomMatch.bottom.color)}
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem' }}>
            <button className="btn btn-primary" onClick={handleShuffle} style={{ padding: '1rem 3rem', fontSize: '1.2rem', borderRadius: '3rem', boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.5)' }}>
              <Shuffle size={20} /> 다른 코디 보기
            </button>
          </div>
        </section>
      )}

      {viewMode === 'all' && (
        <section className="glass-panel">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>최적의 코디 추천 ({bestMatches.length}가지)</h2>
            <p style={{ color: 'var(--text-secondary)' }}>가지고 계신 각 상의의 색상을 분석하여 가장 잘 어울리는 하의를 매칭했습니다.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '2rem' }}>
            {bestMatches.map((match, index) => (
              <div key={index} className="match-card">
                <div className="match-images">
                  <div style={{position: 'relative'}}>
                    <img src={match.top.image} alt="Top" />
                    {renderColorBlock(match.top.color)}
                  </div>
                  <div style={{position: 'relative'}}>
                    <img src={match.bottom.image} alt="Bottom" />
                    {renderColorBlock(match.bottom.color)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
