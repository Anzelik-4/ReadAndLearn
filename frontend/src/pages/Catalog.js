import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import MaterialCard from '../components/MaterialCard';
import { getMaterials, getCategories, getTypes, toggleFavorite } from '../services/api';
import './Catalog.css';

function Catalog() {
  const [searchParams] = useSearchParams();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState('');
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);

  // Загрузка категорий
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        console.log('Категории от API:', response.data);
        // DRF возвращает { count, next, previous, results }
        if (response.data.results) {
          setCategories(response.data.results);
        } else if (Array.isArray(response.data)) {
          setCategories(response.data);
        }
      } catch (error) {
        console.error('Ошибка загрузки категорий:', error);
        setCategories([
          { id: 1, name: 'Художественная литература' },
        ]);
      }
    };
    fetchCategories();
  }, []);

  // Загрузка типов
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const response = await getTypes();
        console.log('Типы от API:', response.data);
        if (response.data.results) {
          setTypes(response.data.results);
        } else if (Array.isArray(response.data)) {
          setTypes(response.data);
        }
      } catch (error) {
        console.error('Ошибка загрузки типов:', error);
        setTypes([
          { id: 1, name: 'Книга' },
        ]);
      }
    };
    fetchTypes();
  }, []);

  // Загрузка материалов
  useEffect(() => {
    const fetchMaterials = async () => {
      setLoading(true);
      try {
        const params = {};
        const search = searchParams.get('search');
        if (search) params.search = search;
        if (filterCategory) params.category = filterCategory;
        if (filterType) params.material_type = filterType;
        
        console.log('Запрос материалов с параметрами:', params);
        const response = await getMaterials(params);
        console.log('Материалы от API:', response.data);
        
        // DRF возвращает { count, next, previous, results }
        let materialsData = [];
        if (response.data.results) {
          materialsData = response.data.results;
        } else if (Array.isArray(response.data)) {
          materialsData = response.data;
        }
        
        // Преобразуем данные, если структура нестандартная
        const processedMaterials = materialsData.map(item => {
          // Проверяем, есть ли вложенные объекты
          return {
            id: item.id,
            title: item.title,
            author: item.author,
            description: item.description,
            cover: item.cover,
            created_at: item.created_at,
            views_count: item.views_count,
            in_favorite: item.in_favorite || false,
            // Категория может быть на одном уровне с id
            category: item.category || { 
              id: categories.find(c => c.id === filterCategory)?.id || 1,
              name: categories.find(c => c.id === filterCategory)?.name || 'Без категории'
            },
            // Тип материала
            material_type: item.material_type || { 
              id: 1, 
              name: 'Книга' 
            },
          };
        });
        
        setMaterials(processedMaterials);
      } catch (error) {
        console.error('Ошибка загрузки материалов:', error);
        setMaterials([
          {
            id: 1,
            title: 'Вишнёвый сад',
            author: 'Антон Чехов',
            category: { id: 1, name: 'Художественная литература' },
            material_type: { id: 1, name: 'Книга' },
            cover: null,
            in_favorite: false,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
  }, [searchParams, filterCategory, filterType]);

  const handleToggleFavorite = async (materialId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Войдите в систему, чтобы добавлять в избранное');
      return;
    }

    try {
      await toggleFavorite(materialId);
      setMaterials(prev =>
        prev.map(m =>
          m.id === materialId ? { ...m, in_favorite: !m.in_favorite } : m
        )
      );
    } catch (error) {
      console.error('Ошибка при добавлении в избранное:', error);
      alert('Не удалось добавить в избранное');
    }
  };

  const handleResetFilters = () => {
    setFilterCategory('');
    setFilterType('');
  };

  return (
    <div className="catalog-page">
      <Header />
      
      <div className="catalog-container">
        {/* Левая колонка - фильтры */}
        <aside className="filters-sidebar">
          <h3>Фильтры</h3>
          
          <div className="filter-group">
            <h4>Категории ({categories.length})</h4>
            <select 
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">Все категории</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <h4>Тип материала ({types.length})</h4>
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="">Все типы</option>
              {types.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>

          <button className="reset-filters-btn" onClick={handleResetFilters}>
            Сбросить фильтры
          </button>
        </aside>

        {/* Правая колонка - каталог */}
        <main className="materials-grid">
          <div className="catalog-header">
            <h2>Каталог материалов ({materials.length})</h2>
            <select className="sort-select">
              <option>По новизне</option>
              <option>По названию</option>
              <option>По популярности</option>
            </select>
          </div>

          {loading ? (
            <div className="loading">Загрузка данных из базы...</div>
          ) : (
            <>
              <div className="materials-grid-container">
                {materials.map(material => (
                  <MaterialCard
                    key={material.id}
                    material={material}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
              
              {materials.length === 0 && (
                <div className="empty-state">
                  <p>Материалы не найдены</p>
                  <button onClick={() => window.location.reload()}>Обновить</button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default Catalog;