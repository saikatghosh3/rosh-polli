"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function Accordion({ children }) {
  return <div className="accordion">{children}</div>;
}

export function AccordionItem({ index, question, answer }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`accordion-item${open ? " is-open" : ""}`}>
      <button
        type="button"
        className="accordion-item__header"
        aria-expanded={open}
        aria-controls={`faq-${index}`}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span>{question}</span>
        <ChevronDown aria-hidden="true" className="accordion-item__icon" />
      </button>
      <div id={`faq-${index}`} className="accordion-item__body" aria-hidden={!open}>
        <p>{answer}</p>
      </div>
    </div>
  );
}