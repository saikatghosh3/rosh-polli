"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export default function StoreSelect({ id, name, value = "", onChange, options = [], placeholder = "বেছে নিন", invalid = false, disabled = false, ariaLabel, className = "" }) {
  const autoId = useId();
  const selectId = id || autoId;
  const listId = `${selectId}-list`;
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const optionRefs = useRef([]);

  const selectedIndex = options.findIndex((option) => String(option.value) === String(value));
  const selected = selectedIndex >= 0 ? options[selectedIndex] : null;
  const [activeIndex, setActiveIndex] = useState(selectedIndex >= 0 ? selectedIndex : 0);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) setOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    optionRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  const openList = () => {
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  };

  const choose = (option) => {
    onChange?.(option.value);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const handleTriggerKeyDown = (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) {
        openList();
        return;
      }
      setActiveIndex((current) => {
        const total = options.length;
        if (!total) return 0;
        const delta = event.key === "ArrowDown" ? 1 : -1;
        return (current + delta + total) % total;
      });
      return;
    }
    if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
      event.preventDefault();
      if (!open) {
        openList();
        return;
      }
      const option = options[activeIndex];
      if (option) choose(option);
      return;
    }
    if (event.key === "Home" && open) {
      event.preventDefault();
      setActiveIndex(0);
      return;
    }
    if (event.key === "End" && open) {
      event.preventDefault();
      setActiveIndex(options.length - 1);
      return;
    }
    if (event.key === "Tab") setOpen(false);
  };

  return (
    <div ref={rootRef} className={`store-selectbox${open ? " is-open" : ""}${invalid ? " is-invalid" : ""}${className ? ` ${className}` : ""}`} data-invalid={invalid ? "true" : undefined}>
      {name ? <input type="hidden" name={name} value={value ?? ""} readOnly /> : null}
      <button
        ref={triggerRef}
        type="button"
        id={selectId}
        className="store-selectbox__trigger"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={ariaLabel}
        aria-invalid={invalid ? "true" : undefined}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={handleTriggerKeyDown}
      >
        <span className={`store-selectbox__value${selected ? "" : " is-placeholder"}`}>{selected ? selected.label : placeholder}</span>
        <ChevronDown className="store-selectbox__chevron" aria-hidden="true" />
      </button>
      {open ? (
        <ul className="store-selectbox__panel" role="listbox" id={listId} aria-label={ariaLabel}>
          {options.length === 0 ? <li className="store-selectbox__empty">কোনো অপশন নেই</li> : null}
          {options.map((option, index) => {
            const isSelected = String(option.value) === String(value);
            return (
              <li key={option.value} role="none">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  tabIndex={-1}
                  ref={(element) => { optionRefs.current[index] = element; }}
                  className={`store-selectbox__option${index === activeIndex ? " is-active" : ""}`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => choose(option)}
                >
                  <span>{option.label}</span>
                  {isSelected ? <Check aria-hidden="true" /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
