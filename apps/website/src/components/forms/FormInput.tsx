import React, { InputHTMLAttributes, useState } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  icon?: string;
  hint?: string;
  showPasswordToggle?: boolean;
  children?: React.ReactNode;
};

const ERROR_COLOR = "#ef4444";

export default function FormInput({
  label,
  error,
  icon,
  hint,
  showPasswordToggle,
  type = "text",
  id,
  className = "",
  children,
  style,
  ...props
}: Props) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const actualType =
    isPassword && showPasswordToggle && showPassword ? "text" : type;
  const hasError = Boolean(error);

  return (
    <div
      className={`field ${hasError ? "invalid is-invalid" : ""} ${className}`.trim()}
      style={{ position: "relative" }}
    >
      <div className="label-row">
        <label
          htmlFor={id}
          style={{
            color: hasError ? ERROR_COLOR : undefined,
            transition: "color 0.15s ease",
          }}
        >
          {label}
        </label>
        {children}
      </div>

      <div
        className={`input-wrap ${hasError ? "invalid is-invalid" : ""}`.trim()}
        style={{
          borderColor: hasError ? ERROR_COLOR : undefined,
        }}
      >
        {icon && <img className="input-icon" src={icon} alt="" />}

        <input
          id={id}
          type={actualType}
          className={hasError ? "invalid is-invalid" : ""}
          style={{
            borderColor: hasError ? ERROR_COLOR : undefined,
            ...style,
          }}
          {...props}
        />

        {isPassword && showPasswordToggle && (
          <button
            className="icon-btn toggle-password"
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                <line x1="2" x2="22" y1="2" y2="22" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>

      {hint && <small className="hint">{hint}</small>}

      {error && (
        <small
          className="error error-message"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            fontSize: "0.75rem",
            color: ERROR_COLOR,
            marginTop: "2px",
            whiteSpace: "nowrap",
          }}
        >
          {error}
        </small>
      )}
    </div>
  );
}
