import React, { InputHTMLAttributes, useState } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  icon?: string;
  hint?: string;
  showPasswordToggle?: boolean;
  children?: React.ReactNode;
};

export default function FormField({
  label,
  error,
  icon,
  hint,
  showPasswordToggle,
  type = "text",
  id,
  className = "",
  children,
  ...props
}: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const actualType = isPassword && showPasswordToggle && showPassword ? "text" : type;

  return (
    <div className={`field ${className}`}>
      <label htmlFor={id}>{label}</label>
      <div className={`input-wrap${error ? " invalid" : ""}`}>
        {icon && <img className="input-icon" src={icon} alt="" />}
        <input id={id} type={actualType} {...props} />
        {isPassword && showPasswordToggle && (
          <button
            className="icon-btn toggle-password"
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? "🙈" : "👁"}
          </button>
        )}
      </div>
      {children}
      {hint && <small className="hint">{hint}</small>}
      {error && <small className="error">{error}</small>}
    </div>
  );
}
