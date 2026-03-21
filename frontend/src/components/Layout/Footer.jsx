import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner container">
        <div className="footer-left">
          <span className="footer-brand">HyperartAtlas</span>
          <span className="footer-sep">&middot;</span>
          <span className="footer-tagline">Cataloging useless architecture worldwide</span>
        </div>
        <div className="footer-links">
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
