export function css (...args) {
  return `<style>${String.raw(...args)}</style>`
}

export default css`
  *, *::before, *::after {
    box-sizing: border-box;
  }

  h1 {
    font-size: 1.875rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--text, #0f172a);
    margin: 0 0 1.25rem;
    line-height: 1.2;
  }

  h2 {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text, #0f172a);
    margin: 0 0 0.75rem;
    line-height: 1.3;
  }

  h3 {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text, #0f172a);
    margin: 0 0 0.5rem;
    line-height: 1.3;
  }

  p {
    margin: 0 0 1rem;
    line-height: 1.65;
  }

  button:not([no-styles]) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 8px 16px;
    margin: 4px;
    border: 1px solid var(--border, #e2e8f0);
    border-radius: var(--radius, 6px);
    background-color: var(--surface, #ffffff);
    color: var(--text, #0f172a);
    font-size: 0.875rem;
    font-family: inherit;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.15s, border-color 0.15s, box-shadow 0.15s, transform 0.1s;
    letter-spacing: 0.01em;
    line-height: 1.25;
    white-space: nowrap;
  }

  button:not([no-styles]):hover {
    background-color: var(--bg, #f8fafc);
    border-color: #c4cfd8;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  }

  button:not([no-styles]):active {
    background-color: #edf0f5;
    transform: translateY(1px);
  }
`