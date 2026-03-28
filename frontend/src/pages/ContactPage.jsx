import './ContactPage.css';

export default function ContactPage() {
  return (
    <div className="contact-page content-container">
      <h1>Contact</h1>

      <section className="contact-body">
        <p>
          Hyperart Atlas is a community-driven project to catalog Hyperart Thomassons from around the world. If you have questions, suggestions,
          or feedback about the project, please reach out.
        </p>

        <div className="contact-info-box">
          <p>
            Email:{' '}
            <a href="mailto:cejdajackson@gmail.com">cejdajackson@gmail.com</a>
          </p>
        </div>
      </section>
    </div>
  );
}
