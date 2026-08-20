import { useEffect, useState } from "react";
import { toast } from "../../lib/toast";
import { SkillService } from "../../services/skill.service";

export function SkillModal({ open, onClose, onConfirm }) {
  const [skills, setSkills] = useState<string[]>([]);
  const [selectedSkill, setSelectedSkill] = useState("");

  const [loading, setLoading] = useState(false);
  const skillService = new SkillService();
  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function loadSkills() {
      setLoading(true);

      try {
        const list = await skillService.getAll();

        if (!cancelled) {
          setSkills(
            list
              .map((skill: any) => skill.name)
              .filter(Boolean)
              .sort(),
          );
        }
      } catch (error) {
        console.error("Failed to load skills:", error);

        if (!cancelled) {
          setSkills([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadSkills();

    return () => {
      cancelled = true;
    };
  }, [open]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setSelectedSkill("");
      setIsSubmitting(false);
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const handleConfirm = async () => {
    if (!selectedSkill) {
      toast.error("Please select a skill.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(selectedSkill);
      onClose();
    } catch {
      // Error handled by parent
    } finally {
      setIsSubmitting(false);
    }
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
        aria-labelledby="skillModalTitle"
      >
        <h3 id="skillModalTitle">Add a Skill</h3>

        <label htmlFor="skillSelect">Select Skill</label>

        <select
          id="skillSelect"
          value={selectedSkill}
          onChange={(event) => setSelectedSkill(event.target.value)}
          disabled={loading}
        >
          <option value="">— Select a skill —</option>

          {skills.map((skill) => (
            <option key={skill} value={skill}>
              {skill}
            </option>
          ))}
        </select>

        <div className="lang-modal-actions" style={{ marginTop: 24 }}>
          <button
            type="button"
            className="lang-modal-cancel"
            onClick={onClose}
            disabled={loading || isSubmitting}
          >
            Cancel
          </button>

          <button
            type="button"
            className="lang-modal-confirm"
            onClick={handleConfirm}
            disabled={loading || isSubmitting}
            style={{ opacity: loading || isSubmitting ? 0.6 : 1 }}
          >
            {isSubmitting ? "Adding..." : "Add Skill"}
          </button>
        </div>
      </div>
    </div>
  );
}
