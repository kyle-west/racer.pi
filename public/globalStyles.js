export function css (...args) {
  return `<style>${String.raw(...args)}</style>`
}

export default css`
  button:not([no-styles]) {
    padding: 10px 20px;
    margin: 5px;
    border: 1px solid black;
    border-radius: 5px;
    background-color: #eee;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
  }

  button:not([no-styles]):hover {
    background-color: white;
  }
`