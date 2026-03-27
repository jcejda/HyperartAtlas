import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import yotsuyaImg from '../assets/yotsuya.jpg';
import garyImg from '../assets/gary.jpg';
import './AboutPage.css';

export default function AboutPage() {
  const { user } = useAuth();
  const [lightboxImg, setLightboxImg] = useState(null);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape' && lightboxImg) {
      setLightboxImg(null);
    }
  }, [lightboxImg]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="about-page content-container">
      <h1>About Hyperart Thomassons</h1>

      <section className="about-intro">
        <blockquote className="about-quote">
          <p>
            "Art is something the artist sets out to make. But hyperart is something a hyperartist
            makes unconsciously — without any idea they are doing so. A work of hyperart can have
            an assistant, but not a creator.{' '}
            <strong>In the end, all hyperart has is the person who discovers it.</strong>"
          </p>
        </blockquote>

        <p>
          The term "Hyperart Thomasson" was coined by Japanese artist Genpei Akasegawa (
          <span className="japanese">赤瀬川原平</span>), in the January 1983 edition of the{' '}
          <em>Shashin Jidai</em> (<span className="japanese">写真時代</span>, or "Super Photo Age")
          magazine.
        </p>

        <p>
          In 1972, Akasegawa and his coworkers were on a lunch break in Yotsuya, Tokyo, when they
          came across a staircase.
        </p>

        <div className="about-photo">
          <img src={yotsuyaImg} alt="The Yotsuya staircase" className="about-photo-img" onClick={() => setLightboxImg(yotsuyaImg)} style={{ cursor: 'pointer' }} />
        </div>

        <p>
          A handful of stairs, a landing, but no discernible destination. The stairs had once
          connected to a doorway, long since removed, leaving behind a structure stripped of its
          original purpose. What struck Akasegawa most was not the absence, but the care. The
          handrail had been recently repaired, maintained despite serving no function at all.
        </p>

        <p>
          At the same time, elsewhere in Tokyo, an American baseball player named Gary Thomasson was
          riding the bench for the Yomiuri Giants. He was a star in America, and had moved to Tokyo
          on an enormous contract for the Giants. However, on arriving to the Nippon Professional
          Baseball League, he struggled to hit Japanese pitchers and his debut season was, by most
          metrics, a dud.
        </p>

        <div className="about-photo">
          <img src={garyImg} alt="Gary Thomasson" className="about-photo-img" onClick={() => setLightboxImg(garyImg)} style={{ cursor: 'pointer' }} />
        </div>

        <p>
          Akasegawa, a fan of the Yomiuri Giants, began noticing more of these architectural relics
          in his walks around Tokyo. He eventually came to describe them as "Thomassons." Relics of
          a city's past that were completely purposeless, but still regularly maintained or cared
          for. Just like Gary Thomasson, who was fiscally maintained by the Giants but wasn't a
          useful contributor during his lackluster seasons in Japan.
        </p>

        <p>
          Akasegawa recognized that these architectural relics, while being entirely purposeless,
          carried a particular beauty. They stand in opposition to the strict mandate of capitalism
          that everything must be optimized to maximize its use. In Akasegawa's eyes, the only
          option for these vestiges was to consider them art in the purest form — or Hyperart.
        </p>
      </section>

      <hr className="about-divider" />

      <section className="about-mission">
        <p>
          This project exists to document these completely, beautifully, purposeless details
          of our cities.
        </p>

        <p>
          To hunt for hyperart is to engage in a kind of quiet therapy of anthropology,
          architecture, photography, and appreciation of the built world.
        </p>

        <p>
          Cities are organic creatures with evolutionary holdovers just like animals. Our goal is
          to find and catalog those holdovers before they are lost to time.
        </p>
      </section>

      <section className="about-cta">
        <h2>Contribute</h2>
        <p>
          Spotted a Thomasson in the wild?{' '}
          {user ? (
            <><Link to="/submit">Submit your sighting</Link>. Every</>
          ) : (
            <><Link to="/signup">Create an account</Link> and{' '}
            <Link to="/submit">submit your sighting</Link>. Every</>
          )}{' '}
          contribution helps build the most comprehensive atlas of Thomassons on the planet.
        </p>
      </section>

      <section className="about-further-reading">
        <h2>Further Reading</h2>
        <ul>
          <li><a href="https://kaya.com/books/hyperart-thomasson/" target="_blank" rel="noopener noreferrer"><em>Hyperart: Thomasson</em></a> — the original book by Genpei Akasegawa, published by Kaya Press and translated to English by Matt Fargo</li>
          <li><a href="https://99percentinvisible.org/episode/thomassons/" target="_blank" rel="noopener noreferrer">Thomassons</a> — an episode of the <em>99% Invisible</em> podcast about Hyperart</li>
        </ul>
      </section>

      {lightboxImg && (
        <div className="lightbox-overlay" onClick={() => setLightboxImg(null)}>
          <button className="lightbox-close" onClick={() => setLightboxImg(null)}>&times;</button>
          <img className="lightbox-img" src={lightboxImg} alt="" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
