import { useState, useEffect } from 'react';
import './AboutPage.css';

import pureImg from '../assets/categories/pure.jpeg';
import doorwayImg from '../assets/categories/doorway.jpg';
import staircaseImg from '../assets/categories/staircase.png';
import abombImg from '../assets/categories/abomb.jpg';
import outieImg from '../assets/categories/outie.jpg';
import eaveImg from '../assets/categories/eave.jpg';
import aerialImg from '../assets/categories/aerial.jpg';
import atagoImg from '../assets/categories/atago.jpg';
import abesadaImg from '../assets/categories/abesada.jpg';

const primaryCategories = [
  {
    id: 'pure',
    name: 'Pure Type',
    japanese: '純粋タイプ (Junsui taipu)',
    description:
      'An object whose use is impossible to fathom. The Pure Type is the broadest and most fundamental category of Thomasson. Some examples include',
    image: null,
    attribution: null,
    subtypes: [
      {
        id: 'pure_staircase',
        name: 'Pure Staircase',
        japanese: '無用階段 (Muyō kaidan)',
        description:
          'A staircase with no destination. The first recorded instance of Hyperart, the Yotsuya staircase, was this type.',
        image: staircaseImg,
      },
      {
        id: 'pure_doorway',
        name: 'Pure Doorway',
        japanese: '無用門 (Muyō mon)',
        description:
          'A doorway that is rendered useless by being blocked up, or failing to restrict access to the domain beyond.',
        image: doorwayImg,
      },
      {
        id: 'pure_tunnel',
        name: 'Pure Tunnel',
        japanese: null,
        description:
          'A tunnel that exists without a surrounding hill or any apparent reason for its structure.',
        image: pureImg,
        attribution: { text: 'See', label: 'Kaifu Station (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Kaifu_Station' },
      },
    ],
  },
  {
    id: 'aerial',
    name: 'Aerial',
    japanese: '高所 (Kōsho)',
    description:
      'An otherwise normal, purposeful object who is made purposeless by existing in the air, where it cannot reasonably be used.',
    image: aerialImg,
    attribution: { text: 'Image from', label: '99% Invisible', url: 'https://99percentinvisible.org/episode/thomassons/' },
    subtypes: [],
  },
  {
    id: 'eave',
    name: 'Hisashi',
    japanese: 'ヒサシ (Hisashi)',
    description:
      'Hisashi is the word for "eaves" in Japanese. This refers to eaves that no longer have a window or door underneath to protect from the rain.',
    image: eaveImg,
    attribution: { text: 'Image from', label: 'Kyoto Journal', url: 'https://kyotojournal.org/kyoto-notebook/kyoto-tomason-the-hunt-for-hidden-hyperart/' },
    subtypes: [],
  },
  {
    id: 'atago',
    name: 'Atago',
    japanese: 'アタゴ (Atago)',
    description:
      'A protrusion, or series of protrusions along a road with no purpose. Named by Akasegawa, when he discovered a curious set of these on a walk to Atago, Tokyo.',
    image: atagoImg,
    subtypes: [],
  },
  {
    id: 'outie',
    name: 'Outie',
    japanese: 'でべそ (Debeso)',
    description:
      'A purposeless protrusion along a sealed up wall.',
    image: outieImg,
    subtypes: [],
  },
  {
    id: 'atomic',
    name: 'Atomic',
    japanese: '原爆タイプ (Genbaku taipu)',
    description:
      'A 2-D Thomasson. The outline of a building that remains in silhouette on a wall, like the byproduct of the flash of an atomic bomb.',
    image: abombImg,
    subtypes: [],
  },
  {
    id: 'abe_sada',
    name: 'Abe Sada',
    japanese: '阿部定 (Abe Sada)',
    description:
      <>An object that's been cut down from its original size, deleting its use. The name comes from <a href="https://en.wikipedia.org/wiki/Sada_Abe" target="_blank" rel="noopener noreferrer">Abe Sada</a>; a woman who famously murdered her lover and cut off his genitalia.</>,
    image: abesadaImg,
    subtypes: [],
  },
];

function CategorySection({ cat, isSubtype = false, onImageClick }) {
  const Tag = isSubtype ? 'h4' : 'h3';

  return (
    <section
      className={`category-section ${isSubtype ? 'category-subtype' : ''}`}
      id={cat.id}
    >
      <Tag>{cat.name}</Tag>
      {cat.japanese && (
        <p className="category-japanese">{cat.japanese}</p>
      )}
      <div className="category-content">
        <div className="category-text">
          <p>{cat.description}</p>
          {cat.attribution && (
            <p className="category-attribution">
              <em>
                {cat.attribution.text}{' '}
                <a href={cat.attribution.url} target="_blank" rel="noopener noreferrer">
                  {cat.attribution.label}
                </a>.
              </em>
            </p>
          )}
        </div>
        {cat.image && (
          <div className="category-image-placeholder">
            <img
              className="category-example-img"
              src={cat.image}
              alt={`${cat.name} example`}
              onClick={() => onImageClick({ src: cat.image, alt: `${cat.name} example` })}
            />
          </div>
        )}
      </div>
      {cat.subtypes && cat.subtypes.length > 0 && (
        <div className="category-subtypes">
          {cat.subtypes.map((sub) => (
            <CategorySection
              key={sub.id}
              cat={sub}
              isSubtype={true}
              onImageClick={onImageClick}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default function CategoriesPage() {
  const [lightboxImg, setLightboxImg] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && lightboxImg) {
        setLightboxImg(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxImg]);

  return (
    <div className="about-page content-container">
      <p className="categories-intro">
        Below are some of the most common categories of Thomasson, based on the typology
        established by Akasegawa. This is not a comprehensive list. Many more types exist and
        new ones continue to be identified.
      </p>

      <div className="category-sections">
        {primaryCategories.map((cat) => (
          <CategorySection key={cat.id} cat={cat} onImageClick={setLightboxImg} />
        ))}
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
