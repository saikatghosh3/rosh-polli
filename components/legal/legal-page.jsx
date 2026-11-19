import Link from "next/link";
import LegalToc from "@/components/legal/legal-toc";

const pad = (number) => String(number).padStart(2, "0");

export default function LegalPage({ eyebrow, title, intro, updatedAt, sections = [], related = [] }) {
  return (
    <section className="page-shell site-container">
      <div className="page-title-block page-title-block--split legal-hero">
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{intro}</p>
        </div>
        <div className="legal-meta">
          <span>সর্বশেষ হালনাগাদ</span>
          <time>{updatedAt}</time>
        </div>
      </div>

      <div className="legal-layout">
        <LegalToc
          items={sections.map((section) => ({ id: section.id, title: section.title }))}
          related={related}
        />

        <article className="legal-doc">
          {sections.map((section, index) => (
            <section className="legal-section" id={section.id} key={section.id}>
              <header>
                <span className="legal-section__num" aria-hidden="true">{pad(index + 1)}</span>
                <h2>{section.title}</h2>
              </header>
              <div className="legal-section__body">{section.body}</div>
            </section>
          ))}

          <div className="legal-foot">
            <p>এই নথি নিয়ে কোনো প্রশ্ন থাকলে সরাসরি আমাদের জানান — আপনার প্রশ্নের উত্তর দিতে আমরা প্রস্তুত।</p>
            <div className="legal-foot__actions">
              <Link className="button button--gold" href="/contact">যোগাযোগ করুন</Link>
              <Link className="button button--outline" href="/faq">প্রশ্নোত্তর</Link>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
