import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import { getMaterial, toggleFavorite } from '../services/api';
import './MaterialDetail.css';

function MaterialDetail() {
  const { id } = useParams();
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMaterial = async () => {
      setLoading(true);
      try {
        const response = await getMaterial(id);
        console.log('Детали материала:', response.data);
        setMaterial(response.data);
        setError(null);
      } catch (err) {
        console.error('Ошибка загрузки материала:', err);
        setError('Не удалось загрузить материал');
      } finally {
        setLoading(false);
      }
    };
    fetchMaterial();
  }, [id]);

  const handleToggleFavorite = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Войдите в систему, чтобы добавлять в избранное');
      return;
    }

    try {
      await toggleFavorite(id);
      setMaterial(prev => ({
        ...prev,
        in_favorite: !prev.in_favorite
      }));
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  const handleRead = () => {
    if (material?.file_url) {
      // Открываем PDF в новой вкладке
      window.open(material.file_url, '_blank');
    } else {
      alert('Ссылка на материал отсутствует');
    }
  };

  if (loading) {
    return (
      <div className="material-detail-page">
        <Header />
        <div className="detail-container">
          <div className="loading">Загрузка...</div>
        </div>
      </div>
    );
  }

  if (error || !material) {
    return (
      <div className="material-detail-page">
        <Header />
        <div className="detail-container">
          <div className="error-state">
            <h2>😕 Материал не найден</h2>
            <p>{error || 'Проверьте правильность ссылки'}</p>
            <Link to="/" className="back-btn">← Вернуться в каталог</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="material-detail-page">
      <Header />
      
      <div className="detail-container">
        {/* Хлебные крошки */}
        <div className="breadcrumbs">
          <Link to="/">Главная</Link>
          <span> / </span>
          <Link to={`/?category=${material.category?.id}`}>
            {material.category?.name || 'Категория'}
          </Link>
          <span> / </span>
          <span className="current">{material.title}</span>
        </div>

        <div className="detail-content">
          {/* Левая колонка - обложка и предпросмотр */}
          <div className="detail-left">
            <div className="detail-cover">
              {material.cover ? (
                <img src={material.cover} alt={material.title} />
              ) : (
                <div className="cover-placeholder">
                  {material.material_type?.name === 'Книга' ? '📖' : '📄'}
                </div>
              )}
            </div>
          </div>

          {/* Правая колонка - информация */}
          <div className="detail-right">
            <h1 className="detail-title">{material.title}</h1>
            
            <div className="detail-meta">
              <p className="detail-author">
                <strong>Автор:</strong> {material.author}
              </p>
              <p className="detail-date">
                <strong>Добавлено:</strong> {new Date(material.created_at).toLocaleDateString('ru-RU')}
              </p>
              <p className="detail-type">
                <strong>Тип:</strong> {material.material_type?.name || 'Книга'}
              </p>
              <p className="detail-views">
                <strong>Просмотров:</strong> {material.views_count || 0}
              </p>
            </div>

            <div className="detail-description">
              <h3>Описание</h3>
              <p>{material.description || 'Описание отсутствует'}</p>
              {material.full_description && (
                <p className="full-description">{material.full_description}</p>
              )}
            </div>

            <div className="detail-actions">
              <button 
                className={`favorite-btn-detail ${material.in_favorite ? 'active' : ''}`}
                onClick={handleToggleFavorite}
              >
                {material.in_favorite ? '❤️ В избранном' : '🤍 Добавить в избранное'}
              </button>
              
              <button className="read-btn" onClick={handleRead}>
                📖 Читать / Смотреть
              </button>
            </div>

            {/* Прямая ссылка на PDF (если есть) */}
            {material.file_url && (
              <div className="direct-link">
                <p>Или откройте по прямой ссылке:</p>
                <a href={material.file_url} target="_blank" rel="noopener noreferrer">
                  {material.file_url.substring(0, 50)}...
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MaterialDetail;
