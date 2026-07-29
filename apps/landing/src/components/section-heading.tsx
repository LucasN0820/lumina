import type React from 'react';

export type SectionHeadingProps = {
  eyebrow: string;
  summary: string;
  title: string;
};

export function SectionHeading({
  eyebrow,
  summary,
  title,
}: SectionHeadingProps): React.JSX.Element {
  return (
    <div className="section-heading">
      <p className="section-heading__eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p className="section-heading__summary">{summary}</p>
    </div>
  );
}
