import { useEffect, useRef, useState } from "react";
import { CardService } from "../../services/card.service";

const cardService = new CardService();

interface BackendCardSlotProps {
  slotType:
    | "company-card"
    | "university-card"
    | "subject-card"
    | "brand-card"
    | "role-card"
    | "client-card"
    | "degree-card"
    | "certification-card";
  entityId?: string | null;
  placeholderText: string;
  onClick: (slot: HTMLElement) => void;
}

export default function BackendCardSlot({
  slotType,
  entityId,
  placeholderText,
  onClick,
}: BackendCardSlotProps) {
  const [state, setState] = useState<"empty" | "loading" | "filled" | "error">(
    entityId ? "loading" : "empty",
  );
  const [html, setHtml] = useState("");
  const slotRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!entityId) {
      setState("empty");
      setHtml("");
      return;
    }

    let cancelled = false;
    setState("loading");

    const fetchCard = async () => {
      if (slotType === "company-card" || slotType === "university-card") {
        return await cardService.getOrganization(entityId);
      } else if (slotType === "subject-card" || slotType === "brand-card") {
        return await cardService.getSubject(entityId);
      } else if (slotType === "role-card") {
        return await cardService.getJob(entityId);
      } else if (slotType === "client-card") {
        return await cardService.getIndustry(entityId);
      } else if (slotType === "degree-card") {
        return await cardService.getDegree(entityId);
      } else if (slotType === "certification-card") {
        return await cardService.getCertification(entityId);
      }
      throw new Error(`Unsupported slotType: ${slotType}`);
    };

    fetchCard()
      .then((result) => {
        if (cancelled) return;
        if (!result) {
          setState("empty");
          return;
        }
        setHtml(result);
        setState("filled");
      })
      .catch((err) => {
        console.warn(
          `[BackendCardSlot] Could not load card ${slotType}/${entityId}:`,
          err,
        );
        if (!cancelled) setState("error");
      });

    return () => {
      cancelled = true;
    };
  }, [entityId, slotType]);

  function alignCardHeight() {
    const slot = slotRef.current;
    const iframe = iframeRef.current;
    if (!slot || !iframe) return;

    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      const wrap = doc?.getElementById("scaleWrap") as
        | HTMLElement
        | null
        | undefined;
      if (!wrap) return;

      wrap.style.height = "auto";
      const mainCard = wrap.querySelector(".main-card") as HTMLElement | null;
      if (mainCard) mainCard.style.setProperty("height", "auto", "important");

      const cardWidth = wrap.offsetWidth || 500;
      const cardHeight = wrap.scrollHeight || 400;
      const containerWidth = slot.clientWidth || iframe.clientWidth || 250;
      const scale = Math.min(containerWidth / cardWidth, 1);
      const scaledHeight = cardHeight * scale;

      slot.style.minHeight = "auto";
      slot.style.height = `${scaledHeight}px`;
      iframe.style.height = `${scaledHeight}px`;
      wrap.style.height = `${scaledHeight / scale}px`;
      wrap.style.transform = `scale(${scale})`;
      wrap.style.top = "0px";
      wrap.style.left = `${(containerWidth - cardWidth * scale) / 2}px`;

      if (mainCard) mainCard.style.setProperty("height", "100%", "important");
    } catch (err) {
      console.error("[BackendCardSlot] Error aligning card height:", err);
    }
  }

  useEffect(() => {
    if (state !== "filled") return;
    const handleResize = () => alignCardHeight();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [state]);

  const handleDivClick = () => {
    if (slotRef.current) {
      onClick(slotRef.current);
    }
  };

  if (state === "error") {
    return (
      <div
        className="backend-slot is-error"
        ref={slotRef}
        data-card-slot={slotType}
        onClick={handleDivClick}
      >
        Failed to load card
      </div>
    );
  }

  if (state === "loading") {
    return (
      <div
        className="backend-slot is-loading"
        ref={slotRef}
        data-card-slot={slotType}
        onClick={handleDivClick}
      >
        <div
          className="skeleton-loader skeleton-card"
          style={{ height: "100%", minHeight: "inherit", borderRadius: 14 }}
        />
      </div>
    );
  }

  if (state === "filled") {
    const srcDoc = `<html><head><style>html,body{margin:0;padding:0;overflow:hidden;font-family:"Plus Jakarta Sans",system-ui,sans-serif}.scale-wrap{position:absolute;top:0;left:0;transform-origin:top left;width:500px}.main-card{height:100%!important;box-sizing:border-box}.footer-row{margin-top:auto!important}</style></head><body><div class="scale-wrap" id="scaleWrap">${html}</div></body></html>`;
    return (
      <div
        className="backend-slot is-filled"
        ref={slotRef}
        data-card-slot={slotType}
        onClick={handleDivClick}
        style={{ cursor: "pointer" }}
      >
        <iframe
          ref={iframeRef}
          className="org-card-frame"
          srcDoc={srcDoc}
          onLoad={alignCardHeight}
          title={`${slotType} ${entityId}`}
          style={{ pointerEvents: "none" }}
        />
      </div>
    );
  }

  return (
    <div
      className="backend-slot"
      ref={slotRef}
      data-card-slot={slotType}
      onClick={handleDivClick}
    >
      <span className="backend-slot-plus">+</span>
      <span>{placeholderText}</span>
    </div>
  );
}
