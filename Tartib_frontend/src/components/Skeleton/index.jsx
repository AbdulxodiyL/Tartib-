import './style.css';

export function Skeleton({ width = '100%', height = '16px', radius = '6px', style = {} }) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius: radius, ...style }}
    />
  );
}

export function TaskSkeleton() {
  return (
    <div className="skeleton-task-wrap">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="skeleton-task-row">
          <Skeleton width="20px" height="20px" radius="50%" />
          <Skeleton width="60px" height="20px" radius="6px" />
          <Skeleton width={`${40 + i * 15}%`} height="16px" />
          <Skeleton width="70px" height="16px" style={{ marginLeft: 'auto' }} />
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ rows = 3 }) {
  return (
    <div className="skeleton-card">
      <Skeleton width="40%" height="18px" style={{ marginBottom: '0.75rem' }} />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} width={`${70 + i * 10}%`} height="14px" style={{ marginBottom: '0.5rem' }} />
      ))}
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1rem' }}>
      {[1, 2, 3].map(i => (
        <div key={i} className="skeleton-card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Skeleton width="40px" height="40px" radius="10px" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <Skeleton width="60%" height="12px" style={{ marginBottom: '0.4rem' }} />
            <Skeleton width="80%" height="20px" />
          </div>
        </div>
      ))}
    </div>
  );
}
