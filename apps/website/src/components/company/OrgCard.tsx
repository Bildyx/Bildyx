import { useState, useEffect, useRef } from "react";
import { CardService } from "../../services/card.service";

const cardService = new CardService();

export function OrgCard({
  orgId,
  onDelete,
}: {
  orgId: string;
  onDelete?: () => void;
}) {
  const [html, setHtml] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const cardHtml = await cardService.getOrganization(orgId);
        if (active) {
          setHtml(cardHtml);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [orgId]);

  const handleLoad = () => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      const wrap = doc?.getElementById("scaleWrap");
      if (!wrap) return;

      const cardWidth = 500;
      const slotWidth = iframe.parentElement?.clientWidth || 300;
      const scale = slotWidth / cardWidth;

      wrap.style.transform = `scale(${scale})`;
      const rect = wrap.getBoundingClientRect();

      iframe.style.height = `${rect.height}px`;
      if (iframe.parentElement) {
        iframe.parentElement.style.minHeight = `${rect.height}px`;
        iframe.parentElement.style.height = `${rect.height}px`;
      }
    } catch (e) {
      console.warn("Failed to scale iframe", e);
    }
  };

  useEffect(() => {
    window.addEventListener("resize", handleLoad);
    return () => window.removeEventListener("resize", handleLoad);
  }, []);

  if (loading) {
    return <div className="ca-photo-skeleton" style={{ borderRadius: 14 }} />;
  }

  const srcDoc = `<html><head><style>html,body{margin:0;padding:0;overflow:hidden;font-family:"Plus Jakarta Sans",system-ui,sans-serif}.scale-wrap{position:absolute;top:0;left:0;transform-origin:top left;width:500px}.main-card{height:100%!important;box-sizing:border-box}.footer-row{margin-top:auto!important}</style></head><body><div class="scale-wrap" id="scaleWrap">${html}</div></body></html>`;

  return (
    <div className="ca-card-slot" style={{ position: "relative" }}>
      <iframe
        ref={iframeRef}
        className="org-card-frame"
        srcDoc={srcDoc}
        onLoad={handleLoad}
        style={{ width: "100%", border: "none", display: "block" }}
      />
      {onDelete && (
        <i className="ca-card-delete-btn bi bi-trash" onClick={onDelete} />
      )}
    </div>
  );
}
