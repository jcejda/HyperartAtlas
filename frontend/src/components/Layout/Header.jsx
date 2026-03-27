import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

export default function Header() {
  const { user, logout, isModerator } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-inner container">
        <Link to="/" className="header-logo" onClick={closeMenu}>
          <span className="logo-text">Hyperart Atlas</span>
        </Link>

        <button
          className="menu-toggle"
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          <span className="menu-bar" />
          <span className="menu-bar" />
          <span className="menu-bar" />
        </button>

        <nav className={`header-nav ${menuOpen ? 'header-nav--open' : ''}`}>
          <div className="nav-links">
            <NavLink to="/" end onClick={closeMenu}>
              Map
            </NavLink>
            <NavLink to="/submit" onClick={closeMenu}>
              Submit a Thomasson
            </NavLink>
            {user && (
              <NavLink to="/my-submissions" onClick={closeMenu}>
                My Submissions
              </NavLink>
            )}
            {isModerator && (
              <NavLink to="/admin" onClick={closeMenu}>
                Admin
              </NavLink>
            )}
          </div>

          <div className="nav-auth">
            <NavLink to="/about" className="nav-link-right" onClick={closeMenu}>
              About Thomassons
            </NavLink>
            <NavLink to="/categories" className="nav-link-right" onClick={closeMenu}>
              Thomasson Categories
            </NavLink>
            {user ? (
              <>
                <span className="nav-username">{user.username}</span>
                <button className="btn btn-logout" onClick={handleLogout}>
                  Log out
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="btn" onClick={closeMenu}>
                  Log in
                </NavLink>
                <NavLink to="/signup" className="btn btn-primary" onClick={closeMenu}>
                  Sign up
                </NavLink>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
