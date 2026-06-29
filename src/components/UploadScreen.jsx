import React, { useState, useEffect } from 'react';
import { Upload, Shuffle, Grid, Trash2 } from 'lucide-react';
import * as storage from '../lib/storage';

export default function UploadScreen() {
  const [tops, setTops] = useState([]);
  const [bottoms, setBottoms] = useState([]);

  const loadData = async () => {
    const loadedTops = await storage.getTops();
    const loadedBottoms = await storage.getBottoms();
    setTops(loadedTops.sort((a, b) => b.timestamp - a.timestamp));
    setBottoms(loadedBottoms.sort((a, b) => b.timestamp - a.timestamp));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFileUpload = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const base64 = await storage.fileToBase64(file);
      const id = crypto.randomUUID();
      if (type === 'top') {
        await storage.addTop(id, base64);
      } else {
        await storage.addBottom(id, base64);
      }
      loadData();
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("이미지 업로드에 실패했습니다.");
    }
    
    // Reset file input
    event.target.value = '';
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm("정말로 삭제하시겠습니까?")) return;
    
    if (type === 'top') {
      await storage.removeTop(id);
    } else {
      await storage.removeBottom(id);
    }
    loadData();
  };

  const renderColorBlock = (color) => {
    if (!color) return null;
    return (
      <div style={{
        width: '20px', height: '20px', borderRadius: '50%',
        backgroundColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})`,
        border: '1px solid var(--surface-border)',
        position: 'absolute', bottom: '0.5rem', left: '0.5rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.5)'
      }} title="추출된 색상" />
    );
  };

  const renderGallery = (items, type) => (
    <div className="grid-gallery">
      {items.map(item => (
        <div key={item.id} className="image-card" style={{position: 'relative'}}>
          <img src={item.image} alt={`${type} image`} />
          {renderColorBlock(item.color)}
          <div className="image-card-actions">
            <button 
              className="btn-icon btn-danger" 
              onClick={() => handleDelete(item.id, type)}
              title="삭제"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
      {items.length === 0 && (
        <div style={{ color: 'var(--text-secondary)', padding: '2rem', textAlign: 'center', gridColumn: '1 / -1' }}>
          등록된 옷이 없습니다.
        </div>
      )}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      <section className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2>상의 (Tops) <span style={{fontSize:'1rem', color:'var(--text-secondary)'}}>{tops.length}벌</span></h2>
          <div>
            <input 
              type="file" 
              id="upload-top" 
              accept="image/*" 
              style={{ display: 'none' }}
              onChange={(e) => handleFileUpload(e, 'top')}
            />
            <label htmlFor="upload-top" className="btn btn-primary">
              <Upload size={18} /> 상의 등록하기
            </label>
          </div>
        </div>
        {renderGallery(tops, 'top')}
      </section>

      <section className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2>하의 (Bottoms) <span style={{fontSize:'1rem', color:'var(--text-secondary)'}}>{bottoms.length}벌</span></h2>
          <div>
            <input 
              type="file" 
              id="upload-bottom" 
              accept="image/*" 
              style={{ display: 'none' }}
              onChange={(e) => handleFileUpload(e, 'bottom')}
            />
            <label htmlFor="upload-bottom" className="btn btn-primary" style={{ backgroundColor: '#8b5cf6' }}>
              <Upload size={18} /> 하의 등록하기
            </label>
          </div>
        </div>
        {renderGallery(bottoms, 'bottom')}
      </section>
    </div>
  );
}
