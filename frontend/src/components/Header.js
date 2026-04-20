import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

function Header() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');
  const isLoggedIn = localStorage.getItem('token');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${searchQuery}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  return (
    <header className="header">
      <div className="header-left">
        <Link to="/" className="logo">
          📚 ReadAndLearn
        </Link>
      </div>

      <form className="header-search" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Поиск по названию..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit">🔍</button>
      </form>

      <div className="header-right">
        <Link to="/favorites" className="header-icon">
          ❤️ Избранное
        </Link>
        {isLoggedIn ? (
          <>
            <Link to="/admin" className="header-icon">
              ⚙️ Админка
            </Link>
            <button onClick={handleLogout} className="header-icon logout-btn">
              🚪 Выйти
            </button>
          </>
        ) : (
          <button className="header-icon login-btn" onClick={() => alert('Вход пока в разработке')}>
            👤 Войти
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;
