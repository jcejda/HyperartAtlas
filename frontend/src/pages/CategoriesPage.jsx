import { useState } from 'react';
import { Link } from 'react-router-dom';
import categories from '../utils/categories';
import './AboutPage.css';

import pureImg from '../assets/categories/pure.jpeg';

const categoryImages = {
  pure: pureImg,
};

const categoryDescriptions = {
  pure:
    'An uncategorizable object whose use it is impossible to fathom. For example, the Pure Shutters, which open to reveal a blank wall, and the Pure Tunnel that exists without a surrounding hill.',
  pure_staircase:
    'A staircase that only goes up and down. Most used to have a door at the top. Some pure staircases exist that were useless right from completion, due to changes or mix-ups in the design.',
  useless_doorway:
    'Even though it has been blocked up, a Useless Doorway still maintains the majesty of its original purpose. In other cases, a Useless Doorway exists in a place that has no need for it, with no wall or fence around it.',
  hisashi:
    'Hisashi is the word for "eaves" in Japanese. This refers to useless eaves: ones that no longer have a window or door underneath them to protect from the rain.',
  useless_window:
    'A blocked up window: one which is still beautiful due to the care taken in blocking it up.',
  a_bomb:
    'A 2-D Thomasson. The outline of a building that remains in silhouette on a wall. This can be seen when a section of a tightly packed row of buildings is torn down. Cases that appear due to water are known as hydrogen bombs. Cases that appear when a hoarding or sign is torn down are known as neutron bombs.',
  elevated:
    'These objects are normal themselves, but exist in a higher than normal place, therefore seeming strange. For example, a door with a handle on the second floor of a wall. These often appear when staircases are torn down. They can also appear when a winch or crane is kept inside the building, but a standard door is used on the outside.',
  outie:
    'A protrudence from a sealed up wall, such as a door knob or tap.',
  castella:
    'A cuboid protuberance from a wall, named after Castella, a Japanese sponge cake. For example, a blocked up window which sticks out from the wall. The opposite of this, a sunken blocked up section, is known as a Reverse Castella.',
  atago:
    'An object sticking out at the side of the road, with no clear purpose, possibly used to stop cars parking. The first example of this was found by Akasegawa whilst walking from Shinbashi to Atago, hence the name.',
  live_burial:
    'A roadside object which is partly submerged in concrete.',
  abe_sada:
    'The remains of a telephone pole cut down. The name refers to the Abe Sada Incident; a famous case from 1930s Japan in which a woman strangled her lover and then severed his genitalia with a kitchen knife.',
  useless_bridge:
    'A bridge over a filled-in river, or a bridge that has become useless. In the case of some covered drains, a bridge is still necessary for cars or heavy vehicles to cross -- in this case they could not be called Useless Bridges, as they only appear useless.',
  uncategorized:
    'A Thomasson that has not yet been assigned a category, or one that the submitter is unsure how to classify. If you think you know what type it is, let us know!',
};

export default function CategoriesPage() {
  const [lightboxImg, setLightboxImg] = useState(null);

  return (
    <div className="about-page content-container">
      <h1>Categories</h1>
      <p className="categories-intro">
        Below are some of the most common categories of Thomasson, based on the typology
        established by Akasegawa. This is not a comprehensive list -- many more types exist and
        new ones continue to be identified.
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
              {cat.japanese && (
                <p className="category-japanese">{cat.japanese}</p>
              )}
              <div className="category-content">
                <div className="category-text">
                  <p>{desc}</p>
                </div>
                <div className="category-image-placeholder">
                  {categoryImages[cat.value] ? (
                    <img
                      className="category-example-img"
                      src={categoryImages[cat.value]}
                      alt={`${cat.label} example`}
                      onClick={() => setLightboxImg({ src: categoryImages[cat.value], alt: `${cat.label} example` })}
                    />
                  ) : (
                    <div className="placeholder-box">
                      <span className="placeholder-label">{cat.label} example</span>
                      <span className="placeholder-subtext">Image placeholder</span>
                    </div>
                  )}
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {lightboxImg && (
        <div className="lightbox-overlay" onClick={() => setLightboxImg(null)}>
          <button className="lightbox-close" onClick={() => setLightboxImg(null)}>&times;</button>
          <img
            className="lightbox-img"
            src={lightboxImg.src}
            alt={lightboxImg.alt}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
