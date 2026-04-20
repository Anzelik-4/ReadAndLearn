import React from 'react';
import { Link } from 'react-router-dom';
import './MaterialCard.css';

function MaterialCard({ material, onToggleFavorite }) {
  return (
    <div className="material-card">
      <Link to={`/material/${material.id}`}>
        <div className="card-cover">
          {material.cover ? (
            <img src={material.cover} alt={material.title} />
          ) : (
            <div className="cover-placeholder">📖</div>
          )}
        </div>
      </Link>
      
      <div className="card-content">
        <Link to={`/material/${material.id}`} className="card-title">
          {material.title}
        </Link>
        <p className="card-author">{material.author}</p>
        <div className="card-meta">
          <span className="category">{material.category?.name || 'Без категории'}</span>
          <span className="type">{material.material_type?.name || 'Книга'}</span>
        </div>
        <button 
          className={`favorite-btn ${material.in_favorite ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleFavorite(material.id);
          }}
        >
          {material.in_favorite ? '❤️' : '🤍'}
        </button>
      </div>
    </div>
  );
}

export default MaterialCard;
