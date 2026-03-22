import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner container">
        <div className="footer-left">
        </div>
        <div className="footer-links">
          <Link to="/contact">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
