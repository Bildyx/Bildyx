import { ReactNode } from "react";

export default function CaModal({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  return (
    <div className="ca-overlay is-open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="ca-modal">
        <button className="ca-x" type="button" aria-label="Close" onClick={onClose}>
          ×
        </button>
        <div>{children}</div>
      </div>
    </div>
  );
}
