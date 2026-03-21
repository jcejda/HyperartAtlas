import { Link } from 'react-router-dom';
import categories from '../utils/categories';
import { getCategoryByValue } from '../utils/categories';
import './AboutPage.css';

const categoryDescriptions = {
  staircase:
    'Staircases that lead to nowhere, ending abruptly at a wall or ceiling. Once functional pathways between floors, they became purposeless after renovations sealed off their destinations. Among the most iconic and frequently documented types of Thomasson.',
  door:
    'Doors that have been bricked up, sealed shut, or open onto blank walls or sheer drops. They retain the full architectural form of a doorway -- frame, handle, sometimes even a mail slot -- yet serve no function whatsoever.',
  bridge:
    'Bridges, walkways, or overpasses that no longer connect two points. One or both ends may terminate in mid-air, blocked by construction, or lead to demolished structures. The bridge persists as a maintained but useless span.',
  wall:
    'Freestanding walls, partitions, or remnants of demolished buildings that serve no structural or boundary purpose. They may show traces of former rooms, paint, or fixtures, standing as lone artifacts of vanished architecture.',
  pipe:
    'Pipes, conduits, or vents that emerge from walls or ground and connect to nothing. They may have once carried water, gas, or electrical wiring, but the systems they served have been removed while the pipes remain.',
  window:
    'Windows that have been permanently sealed, bricked over from the inside, or look out onto nothing. Some retain glass, curtains, or shutters, maintaining the appearance of a functioning window despite being entirely non-functional.',
  platform:
    'Raised platforms, loading docks, steps, or ledges that no longer serve their original purpose. They may have once facilitated boarding, loading, or access to structures that no longer exist.',
  other:
    'Thomassons that defy easy classification. This catch-all category includes unusual architectural vestiges such as phantom signage, vestigial railings, purposeless bollards, and other maintained but functionless urban relics.',
};

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
          appearing on the public map.
        </p>
      </section>

      <h2>Categories</h2>
      <p className="categories-intro">
        Thomassons are organized into the following categories, loosely based on the typology
        established by Akasegawa.
      </p>

      <div className="category-sections">
        {categories.map((cat) => {
          const desc = categoryDescriptions[cat.value];
          return (
            <section key={cat.value} className="category-section" id={cat.value}>
              <h3>
                <span
                  className="category-badge"
                  style={{ backgroundColor: cat.color }}
                >
                  {cat.label}
                </span>
              </h3>
              <div className="category-content">
                <div className="category-text">
                  <p>{desc}</p>
                </div>
                <div className="category-image-placeholder">
                  <div className="placeholder-box">
                    <span className="placeholder-label">{cat.label} example</span>
                    <span className="placeholder-subtext">Image placeholder</span>
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>

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
