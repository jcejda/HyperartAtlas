import { Link } from 'react-router-dom';
import './AboutPage.css';

export default function AboutPage() {
  return (
    <div className="about-page content-container">
      <h1>About Hyperart Thomassons</h1>

      <section className="about-intro">
        <p>
          A <a href="https://en.wikipedia.org/wiki/Hyperart_Thomasson" target="_blank" rel="noopener noreferrer"><strong>Thomasson</strong></a> is a type of useless architectural relic -- a structure or
          part of a structure that has been maintained but serves no purpose. The concept was
          identified and named by Japanese artist Genpei Akasegawa in the early 1980s.
        </p>
        <p>
          The name comes from Gary Thomasson, an American baseball player who was signed by the
          Yomiuri Giants in Japan for a large salary but performed so poorly that he became a symbol
          of something expensive and utterly useless. Akasegawa adopted the name for architectural
          features that are similarly maintained at cost despite having lost all function.
        </p>
        <p>
          Akasegawa and his collaborators began documenting these objects in Tokyo, publishing their
          findings in the magazine <em>Shashin Jidai</em> and later in the 1985 book{' '}
          <em>Hyperart: Thomasson</em>. What began as an art-world curiosity became an ongoing
          urban observation project. Thomassons are found worldwide wherever cities evolve and
          buildings are modified, leaving behind architectural vestiges.
        </p>
        <p>
          <strong>HyperartAtlas</strong> is a collaborative project to catalog Thomasson sightings
          from around the world on a single interactive map. Anyone can{' '}
          <Link to="/submit">submit a sighting</Link>, which is reviewed by moderators before
          appearing on the public map. See our <Link to="/categories">Categories</Link> page
          for the types of Thomassons you might encounter.
        </p>
      </section>

      <section className="about-cta">
        <h2>Contribute</h2>
        <p>
          Spotted a Thomasson in the wild? <Link to="/signup">Create an account</Link> and{' '}
          <Link to="/submit">submit your sighting</Link>. Every contribution helps build the
          most comprehensive atlas of useless architecture on the planet.
        </p>
      </section>
    </div>
  );
}
