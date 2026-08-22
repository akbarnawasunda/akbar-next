export function SkeletonCard() {
  return (
    <div className="release-card skeleton" aria-hidden="true">
      <span className="skeleton-number" />
      <span className="skeleton-icon" />
      <span className="skeleton-text" />
      <span className="skeleton-title" />
    </div>
  );
}
