import './ContactPage.css';

export default function ContactPage() {
  return (
    <div className="contact-page content-container">
      <h1>Contact</h1>

      <section className="contact-body">
        <p>
          HyperartAtlas is a community-driven project to catalog Hyperart Thomassons -- useless
          architectural relics -- from around the world. If you have questions, suggestions,
          or feedback about the project, feel free to reach out.
        </p>

        <div className="contact-info-box">
          <h3>Get in touch</h3>
          <p>
            Email:{' '}
            <a href="mailto:cejdajackson@gmail.com">cejdajackson@gmail.com</a>
          </p>
        </div>

        <p>
          If you&apos;d like to contribute Thomasson sightings, you can do so directly through
          the site by creating an account and submitting your findings. All submissions are
          reviewed by moderators to maintain quality.
        </p>

        <p>
          We welcome contributions from Thomasson enthusiasts, urban explorers, architectural
          historians, and anyone with an eye for the beautifully useless.
        </p>
      </section>
    </div>
  );
}
