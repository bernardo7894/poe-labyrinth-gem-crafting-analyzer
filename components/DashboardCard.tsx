
import React from 'react';

interface DashboardCardProps {
  title: string;
  children: React.ReactNode;
  eyebrow?: string;
  className?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({ title, children, eyebrow, className = '' }) => {
  return (
    <section className={`poe-card ${className}`}>
      <div className="poe-card__ornament" aria-hidden="true" />
      <div className="poe-card__header">
        {eyebrow && <p className="card-eyebrow">{eyebrow}</p>}
        <h2>{title}</h2>
        <div className="card-rule" aria-hidden="true"><span /></div>
      </div>
      {children}
    </section>
  );
};
