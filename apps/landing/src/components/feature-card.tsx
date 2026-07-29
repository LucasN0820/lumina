import type React from 'react';

import { EnglishText } from '@/components/english-text';

export type FeatureCardProps = {
  description: string;
  englishEyebrow: string;
  eyebrow: string;
  title: string;
};

export function FeatureCard({
  description,
  englishEyebrow,
  eyebrow,
  title,
}: FeatureCardProps): React.JSX.Element {
  return (
    <article className="feature-card">
      <p className="feature-card__eyebrow">
        <EnglishText>{englishEyebrow}</EnglishText> / {eyebrow}
      </p>
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  );
}
