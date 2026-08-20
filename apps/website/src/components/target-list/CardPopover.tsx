import React from "react";
import ReactDOM from "react-dom";

const SCALE_SCRIPT = `
  function scaleCard() {
    var wrap = document.getElementById('sw');
    if (!wrap) return;
    wrap.style.height = 'auto';
    var mc = wrap.querySelector('.main-card');
    if (mc) mc.style.setProperty('height','auto','important');
    var cw = wrap.offsetWidth || 500;
    var ch = wrap.scrollHeight || 400;
    var aw = window.innerWidth || 500;
    
    // Account for 8px padding on each side (total 16px)
    var scale = Math.min((aw - 16) / cw, 1);
    var scaledH = Math.ceil(ch * scale) + 16;
    
    wrap.style.transform = 'scale(' + scale + ')';
    wrap.style.transformOrigin = 'top left';
    wrap.style.left = '8px';
    wrap.style.top = '8px';
    wrap.style.height = ch + 'px';
    if (mc) mc.style.setProperty('height','100%','important');
    window.parent.postMessage({ type: 'tl-card-height', height: scaledH }, '*');
  }
  window.addEventListener('load', scaleCard);
  window.addEventListener('resize', scaleCard);
`;

export function buildSrcDoc(html: string): string {
  return `<!doctype html><html><head><meta charset="UTF-8"><style>
    html,body{margin:0;padding:0;overflow:hidden;font-family:"Plus Jakarta Sans",system-ui,sans-serif;}
    #sw{position:absolute;top:8px;left:8px;transform-origin:top left;width:500px;}
    .main-card{box-sizing:border-box;}
    .footer-row{margin-top:auto!important;}
  </style></head><body>
  <div id="sw">${html}</div>
  <script>${SCALE_SCRIPT}<\/script></body></html>`;
}

interface CardPopoverProps {
  html: string | null;
  title: string;
  anchorEl: HTMLElement | null;
}

const MARGIN = 12;

export function CardPopover({ html, title, anchorEl }: CardPopoverProps) {
  const [iframeHeight, setIframeHeight] = React.useState(0);

  React.useEffect(() => {
    function onMessage(evt: MessageEvent) {
      if (
        evt.data &&
        typeof evt.data === "object" &&
        evt.data.type === "tl-card-height" &&
        typeof evt.data.height === "number"
      ) {
        setIframeHeight(evt.data.height);
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const [coords, setCoords] = React.useState<{
    top: number;
    left: number;
  } | null>(null);

  React.useLayoutEffect(() => {
    if (!anchorEl) return;
    const POPOVER_WIDTH = 400;
    const estimatedH = iframeHeight || 440;
    const rect = anchorEl.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let left = rect.right + MARGIN;
    if (left + POPOVER_WIDTH > vw - MARGIN) {
      left = rect.left - POPOVER_WIDTH - MARGIN;
    }
    left = Math.max(MARGIN, Math.min(left, vw - POPOVER_WIDTH - MARGIN));

    let top = rect.top;
    if (top + estimatedH > vh - MARGIN) {
      top = vh - estimatedH - MARGIN;
    }
    top = Math.max(MARGIN, top);

    setCoords({ top, left });
  }, [anchorEl, iframeHeight]);

  const style: React.CSSProperties = coords
    ? {
        position: "fixed",
        top: coords.top,
        left: coords.left,
        width: 400,
        zIndex: 9999,
        opacity: 1,
      }
    : { opacity: 0 };

  const content = (
    <div className="tl-card-popover" style={style}>
      {html ? (
        <iframe
          key={html.slice(0, 20)} // force re-mount si html change
          title={title}
          srcDoc={buildSrcDoc(html)}
          style={{
            width: "100%",
            height: iframeHeight || 340,
            border: 0,
            display: "block",
            pointerEvents: "none",
          }}
        />
      ) : (
        <div
          className="skeleton-loader"
          style={{ width: "100%", height: 260 }}
        />
      )}
    </div>
  );

  return ReactDOM.createPortal(content, document.body);
}
