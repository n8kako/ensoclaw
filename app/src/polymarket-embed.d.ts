import type * as React from 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'polymarket-market-embed': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        market?: string;
        event?: string;
        creator?: string;
        via?: string;
        volume?: 'true' | 'false';
        chart?: 'true' | 'false';
        theme?: 'light' | 'dark';
        width?: number | string;
        height?: number | string;
      };
    }
  }
}

export {};
