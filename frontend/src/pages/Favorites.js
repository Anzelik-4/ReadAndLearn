import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import MaterialCard from '../components/MaterialCard';
import { getFavorites, toggleFavorite } from '../services/api';
import './Favorites.css';

// ВРЕМЕННЫЕ ДАННЫЕ
const MOCK_FAVORITES = [
  {
    id: 2,
    title: 'Программирование на Python',
    author: 'Иванов И.И.',
    category: { id: 2, name: 'Информатика' },
    type: { id: 1, name: 'Книга' },
    cover: null,
    in_favorite: true,
  },
];

function Favorites() {
  const [favorites, setFavorites] = useState(MOCK_FAVORITES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFavorites = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      // Если нет токена, показываем пустое состояние
      setFavorites([]);
      return;
    }
    
    setLoading(true);
      try {
        const response = await getFavorites();
        // Избранное возвращает объекты с вложенным material
        const favoriteMaterials = response.data.map(item => ({
          ...item.material,
          in_favorite: true
        }));
        setFavorites(favoriteMaterials);
      } catch (error) {
        console.error('Ошибка загрузки избранного:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, []);

  const handleRemoveFavorite = async (materialId) => {
    try {
      await toggleFavorite(materialId);
      setFavorites(prev => prev.filter(m => m.id !== materialId));
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  return (
    <div className="favorites-page">
      <Header />
      
      <div className="favorites-container">
        <div className="favorites-header">
          <h1>Моё избранное</h1>
          <span className="favorites-count">{favorites.length} материалов</span>
        </div>

        {loading ? (
          <div className="loading">Загрузка...</div>
        ) : favorites.length > 0 ? (
          <div className="materials-grid-container">
            {favorites.map(material => (
              <MaterialCard
                key={material.id}
                material={material}
                onToggleFavorite={handleRemoveFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="empty-favorites">
            <div className="empty-icon">📚</div>
            <h2>Здесь пока ничего нет</h2>
            <p>Добавьте материалы в избранное, чтобы не потерять их</p>
            <a href="/" className="browse-btn">Перейти в каталог</a>
          </div>
        )}
      </div>
    </div>
  );
}

export default Favorites;
