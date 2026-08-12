import { useEffect, useRef, useState } from "react";
import { CardService } from "../services/card.service";

const cardService = new CardService();

type OrgCardProps = {
  organizationId: string;
  score: number;
};

/** Ported from loadCard() + alignCardHeight() in js/target-list.ts */
export default function OrgCard({ organizationId, score }: OrgCardProps) {
  const [state, setState] = useState<"loading" | "filled" | "error">("loading");
  const [html, setHtml] = useState("");
  const slotRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    let cancelled = false;
    setState("loading");

    cardService
      .getOrganization(organizationId)
      .then((result) => {
        if (cancelled) return;
        setHtml(result);
        setState("filled");
      })
      .catch((err) => {
        console.warn(`[OrgCard] Could not load card organization/${organizationId}:`, err);
        if (!cancelled) setState("error");
      });

    return () => {
      cancelled = true;
    };
  }, [organizationId]);

  function alignCardHeight() {
    const slot = slotRef.current;
    const iframe = iframeRef.current;
    if (!slot || !iframe) return;

    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      const wrap = doc?.getElementById("scaleWrap") as HTMLElement | null | undefined;
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
      console.error("[OrgCard] Error aligning card height:", err);
    }
  }

  useEffect(() => {
    if (state !== "filled") return;
    const handleResize = () => alignCardHeight();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [state]);

  if (state === "error") {
    return (
      <div className="backend-slot is-error" ref={slotRef}>
        Failed to load card
      </div>
    );
  }

  if (state === "loading") {
    return (
      <div className="backend-slot is-loading" ref={slotRef}>
        <div className="skeleton-loader skeleton-card" />
      </div>
    );
  }

  const srcDoc = `<html><head><style>html,body{margin:0;padding:0;overflow:hidden;font-family:"Plus Jakarta Sans",system-ui,sans-serif}.scale-wrap{position:absolute;top:0;left:0;transform-origin:top left;width:500px}.main-card{height:100%!important;box-sizing:border-box}.footer-row{margin-top:auto!important}</style></head><body><div class="scale-wrap" id="scaleWrap">${html}</div></body></html>`;

  return (
    <div className="backend-slot is-filled" ref={slotRef}>
      <iframe ref={iframeRef} className="org-card-frame" srcDoc={srcDoc} onLoad={alignCardHeight} title={`Organization ${organizationId}`} />
      <span className="tl-match-badge">{score}% Match</span>
    </div>
  );
}
