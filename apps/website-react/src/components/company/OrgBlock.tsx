import React from "react";
import { OrgCard } from "./OrgCard";

type Props = {
  title: string;
  addButtonLabel: string;
  onAddClick: () => void;
  items: any[];
  orgIdKey: string;
  isAdminMode: boolean;
  onDelete: (id: string) => void;
};

export default function OrgBlock({
  title,
  addButtonLabel,
  onAddClick,
  items,
  orgIdKey,
  isAdminMode,
  onDelete,
}: Props) {
  return (
    <section className="ca-block">
      <header>
        <span>{title}</span>
        {isAdminMode && (
          <button onClick={onAddClick}>
            {addButtonLabel}
          </button>
        )}
      </header>
      <div>
        {items.length === 0 ? (
          `No ${title.toLowerCase()} added yet.`
        ) : (
          <div className="ca-org-grid">
            {items.map((item) => (
              <OrgCard
                key={item.id}
                orgId={item[orgIdKey]}
                onDelete={isAdminMode ? () => onDelete(item.id) : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
