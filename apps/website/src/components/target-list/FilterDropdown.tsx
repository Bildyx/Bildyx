import React, { ReactNode } from "react";

type FilterDropdownProps<T extends string = string> = {
  name: T;
  label: string;
  icon: string;
  count: number;
  openDropdown: T | null;
  setOpenDropdown: React.Dispatch<React.SetStateAction<T | null>>;
  panelClassName?: string;
  children: ReactNode;
};

export function FilterDropdown<T extends string = string>({
  name,
  label,
  icon,
  count,
  openDropdown,
  setOpenDropdown,
  panelClassName = "",
  children,
}: FilterDropdownProps<T>) {
  const isOpen = openDropdown === name;

  return (
    <div className="tl-filter-dropdown">
      <button
        className={`tl-filter-chip${isOpen ? " is-open" : ""}`}
        type="button"
        aria-expanded={isOpen}
        onClick={(event) => {
          event.stopPropagation();
          setOpenDropdown((current) => (current === name ? null : name));
        }}
      >
        <span aria-hidden="true">{icon}</span> {label}{" "}
        <strong>{count ? `(${count})` : ""}</strong>{" "}
        <span aria-hidden="true">⌄</span>
      </button>

      <div
        className={`tl-filter-panel${
          panelClassName ? ` ${panelClassName}` : ""
        }${isOpen ? " is-open" : ""}`}
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        {children}
      </div>
    </div>
  );
}
