import { useState } from "react";

const LANGUAGES = [
  "English",
  "French",
  "Spanish",
  "German",
  "Chinese (Mandarin)",
  "Chinese (Cantonese)",
  "Japanese",
  "Korean",
  "Italian",
  "Portuguese",
  "Russian",
  "Arabic",
];

const LEVELS = ["Native", "Fluent", "Intermediate"];

type LanguageModalProps = {
  onConfirm: (language: string, level: string) => void;
  onClose: () => void;
};

export function LanguageModal({ onConfirm, onClose }: LanguageModalProps) {
  const [language, setLanguage] = useState("");
  const [level, setLevel] = useState("Fluent");
  const [error, setError] = useState("");

  function handleConfirm() {
    if (!language) {
      setError("Please select a language.");
      return;
    }
    onConfirm(language, level);
  }

  return (
    <div className="lang-modal-overlay is-open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="lang-modal" role="dialog" aria-modal="true" aria-labelledby="langModalTitle">
        <h3 id="langModalTitle">Add a Language</h3>
        <label htmlFor="langSelect">Language</label>
        <select id="langSelect" value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="">— Select a language —</option>
          {LANGUAGES.map((l) => (
            <option value={l} key={l}>
              {l}
            </option>
          ))}
        </select>

        <label>Level</label>
        <div className="lang-level-grid">
          {LEVELS.map((l) => (
            <button
              key={l}
              type="button"
              className={`lang-level-btn${level === l ? " is-active" : ""}`}
              onClick={() => setLevel(l)}
            >
              {l}
            </button>
          ))}
        </div>

        {error && <small className="error">{error}</small>}

        <div className="lang-modal-actions">
          <button type="button" className="lang-modal-cancel" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="lang-modal-confirm" onClick={handleConfirm}>
            Add Language
          </button>
        </div>
      </div>
    </div>
  );
}

type SkillModalProps = {
  suggestions: string[];
  onConfirm: (skillName: string) => void;
  onClose: () => void;
};

export function SkillModal({ suggestions, onConfirm, onClose }: SkillModalProps) {
  const [skill, setSkill] = useState("");
  const [error, setError] = useState("");

  function handleConfirm() {
    if (!skill.trim()) {
      setError("Please select or type a skill.");
      return;
    }
    onConfirm(skill.trim());
  }

  return (
    <div className="lang-modal-overlay is-open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="lang-modal" role="dialog" aria-modal="true" aria-labelledby="skillModalTitle">
        <h3 id="skillModalTitle">Add a Skill</h3>
        <label htmlFor="skillInput">Skill</label>
        <input
          id="skillInput"
          list="skillSuggestions"
          type="text"
          placeholder="Type or pick a skill..."
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
        />
        <datalist id="skillSuggestions">
          {suggestions.map((s) => (
            <option value={s} key={s} />
          ))}
        </datalist>

        {error && <small className="error">{error}</small>}

        <div className="lang-modal-actions" style={{ marginTop: 24 }}>
          <button type="button" className="lang-modal-cancel" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="lang-modal-confirm" onClick={handleConfirm}>
            Add Skill
          </button>
        </div>
      </div>
    </div>
  );
}
