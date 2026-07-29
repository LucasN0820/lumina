import type React from 'react';
import type { ReactNode } from 'react';

export type EnglishTextProps = {
  children: ReactNode;
};

export function EnglishText({ children }: EnglishTextProps): React.JSX.Element {
  return <span lang="en">{children}</span>;
}
