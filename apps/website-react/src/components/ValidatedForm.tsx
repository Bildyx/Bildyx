import React, { FormHTMLAttributes, FormEvent } from "react";

type ValidatedFormProps = FormHTMLAttributes<HTMLFormElement> & {
  errors: Record<string, string>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  children: React.ReactNode;
};

export default function ValidatedForm({
  errors,
  setErrors,
  onChange,
  onSubmit,
  noValidate = true,
  children,
  ...props
}: ValidatedFormProps) {
  function handleFormChange(event: FormEvent<HTMLFormElement>) {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    if (target.name && errors[target.name] && target.value.trim()) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[target.name];
        return next;
      });
    }
    if (onChange) {
      onChange(event);
    }
  }

  return (
    <form
      noValidate={noValidate}
      onSubmit={onSubmit}
      onChange={handleFormChange}
      {...props}
    >
      {children}
    </form>
  );
}
