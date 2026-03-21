import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

export default function Header() {
  const { user, logout, isModerator } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="header">
      <div className="header-inner container">
        <Link to="/" className="header-logo" onClick={closeMenu}>
          <span className="logo-text">HyperartAtlas</span>
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
            <NavLink to="/about" onClick={closeMenu}>
              About
            </NavLink>
            <NavLink to="/contact" onClick={closeMenu}>
              Contact
            </NavLink>
            {user && (
              <NavLink to="/submit" onClick={closeMenu}>
                Submit
              </NavLink>
            )}
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
            {user ? (
              <>
                <span className="nav-username">{user.username}</span>
                <button className="btn btn-logout" onClick={() => { logout(); closeMenu(); }}>
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
