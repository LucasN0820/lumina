import type React from 'react';

export type FeatureCardProps = {
  description: string;
  eyebrow: string;
  title: string;
};

export function FeatureCard({ description, eyebrow, title }: FeatureCardProps): React.JSX.Element {
  return (
    <article className="feature-card">
      <p className="feature-card__eyebrow">{eyebrow}</p>
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  );
}
