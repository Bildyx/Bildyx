import React from "react";

type Captcha = {
  question: string;
  value: string;
  setValue: (value: string) => void;
  error: string;
  refresh: () => void;
};

type Props = {
  captcha: Captcha;
};

export default function CaptchaBox({ captcha }: Props) {
  return (
    <>
      <div className="captcha-box">
        <div>
          <strong>Security check</strong>
          <p>
            Solve this quick captcha:{" "}
            <span className="captcha-question">{captcha.question}</span>
          </p>
        </div>
        <button
          className="captcha-refresh"
          type="button"
          aria-label="Refresh captcha"
          onClick={captcha.refresh}
        >
          Refresh
        </button>
        <input
          className="captcha-answer"
          type="number"
          inputMode="numeric"
          placeholder="Answer"
          required
          value={captcha.value}
          onChange={(e) => captcha.setValue(e.target.value)}
        />
      </div>
      {captcha.error && (
        <small className="captcha-error error">{captcha.error}</small>
      )}
    </>
  );
}
