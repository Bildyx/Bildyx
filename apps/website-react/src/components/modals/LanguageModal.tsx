import { useEffect, useState } from "react";
import { toast } from "../../lib/toast";

const LANGUAGES = [
  "ENGLISH",
  "FRENCH",
  "SPANISH",
  "GERMAN",
  "CHINESE_MANDARIN",
  "CHINESE_CANTONESE",
  "JAPANESE",
  "KOREAN",
  "ITALIAN",
  "PORTUGUESE",
  "RUSSIAN",
  "ARABIC",
];

const SPECIAL: Record<string, string> = {
  CHINESE_MANDARIN: "Chinese (Mandarin)",
  CHINESE_CANTONESE: "Chinese (Cantonese)",
  HAITIAN_CREOLE: "Haitian Creole",
  AMBONESE_MALAY: "Ambonese Malay",
  BAJAN_CREOLE: "Bajan Creole",
  GUYANESE_CREOLE: "Guyanese Creole",
  SCOTTISH_GAELIC: "Scottish Gaelic",
  SEYCHELLOIS_CREOLE: "Seychellois Creole",
};

export function formatLanguageLabel(key: string) {
  if (SPECIAL[key]) {
    return SPECIAL[key];
  }

  return key
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function LanguageModal({ open, onClose, onConfirm }) {
  const [language, setLanguage] = useState("");
  const [level, setLevel] = useState<string>("Fluent");

  useEffect(() => {
    if (!open) {
      setLanguage("");
      setLevel("Fluent");
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const handleConfirm = () => {
    if (!language) {
      toast.error("Please select a language.");
      return;
    }

    onConfirm(language, level);
    onClose();
  };

  return (
    <div
      className="lang-modal-overlay is-open"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="lang-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="langModalTitle"
      >
        <h3 id="langModalTitle">Add a Language</h3>

        <label htmlFor="langSelect">Language</label>

        <select
          id="langSelect"
          value={language}
          onChange={(event) => setLanguage(event.target.value)}
        >
          <option value="">— Select a language —</option>

          {LANGUAGES.map((item) => (
            <option key={item} value={item}>
              {formatLanguageLabel(item)}
            </option>
          ))}
        </select>

        <label>Level</label>

        <div className="lang-level-grid">
          {["Native", "Fluent", "Intermediate"].map((item) => (
            <button
              key={item}
              type="button"
              className={`lang-level-btn ${level === item ? "is-active" : ""}`}
              onClick={() => setLevel(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="lang-modal-actions">
          <button type="button" className="lang-modal-cancel" onClick={onClose}>
            Cancel
          </button>

          <button
            type="button"
            className="lang-modal-confirm"
            onClick={handleConfirm}
          >
            Add Language
          </button>
        </div>
      </div>
    </div>
  );
}
