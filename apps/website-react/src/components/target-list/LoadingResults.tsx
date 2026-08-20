export function LoadingResults() {
  return (
    <div className="tl-match-section">
      <div className="tl-match-section__header tl-skeleton-header">
        <div
          className="skeleton-loader"
          style={{ width: 200, height: 22, borderRadius: 6 }}
        />
      </div>
      <div className="tl-company-row">
        <div className="tl-inline-card">
          <div
            className="skeleton-loader"
            style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0 }}
          />
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div
              className="skeleton-loader"
              style={{ width: "60%", height: 14, borderRadius: 6 }}
            />
            <div
              className="skeleton-loader"
              style={{ width: "40%", height: 12, borderRadius: 6 }}
            />
          </div>
        </div>
        <div className="tl-inline-card">
          <div
            className="skeleton-loader"
            style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0 }}
          />
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div
              className="skeleton-loader"
              style={{ width: "60%", height: 14, borderRadius: 6 }}
            />
            <div
              className="skeleton-loader"
              style={{ width: "40%", height: 12, borderRadius: 6 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
