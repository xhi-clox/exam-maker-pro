import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      width="1em"
      height="1em"
      {...props}
    >
      <path fill="none" d="M0 0h256v256H0z" />
      <path
        fill="currentColor"
        d="M208 80v96a16 16 0 0 1-16 16H64a16 16 0 0 1-16-16V80a16 16 0 0 1 16-16h128a16 16 0 0 1 16 16Zm-40 48a8 8 0 0 0-8-8H96a8 8 0 0 0 0 16h64a8 8 0 0 0 8-8Zm0-32a8 8 0 0 0-8-8H96a8 8 0 0 0 0 16h64a8 8 0 0 0 8-8Zm-40 64a8 8, 0, 0, 0-8-8h-24a8 8 0 0 0 0 16h24a8 8 0 0 0 8-8Z"
      />
      <path
        fill="currentColor"
        d="M48 179.5V80a16.2 16.2 0 0 1 16-16h128a16.2 16.2 0 0 1 16 16v99.5a12.3 12.3 0 0 0-3.1-6.1l-25.8-25.8a8.1 8.1 0 0 0-11.3 0l-16.9 16.9-31-31a8.1 8.1 0 0 0-11.3 0L86.8 174l-11.6-11.6a8.1 8.1 0 0 0-11.3 0L48.5 178A14.6 14.6 0 0 0 48 179.5Z"
        opacity={0.2}
      />
    </svg>
  );
}
