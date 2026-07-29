import type React from 'react';

import { EnglishText } from '@/components/english-text';

export type SectionHeadingProps = {
  englishEyebrow: string;
  englishSummary: string;
  eyebrow: string;
  summary: string;
  title: string;
};

export function SectionHeading({
  englishEyebrow,
  englishSummary,
  eyebrow,
  summary,
  title,
}: SectionHeadingProps): React.JSX.Element {
  return (
    <div className="section-heading">
      <p className="section-heading__eyebrow">
        <EnglishText>{englishEyebrow}</EnglishText> / {eyebrow}
      </p>
      <h2>{title}</h2>
      <p className="section-heading__summary">
        {summary} <EnglishText>{englishSummary}</EnglishText>
      </p>
    </div>
  );
}
