function cleanChildren (node) {
  while (node.firstChild) {
    node.removeChild(node.lastChild);
  }
}
  
export function attach (node, Component, attrs = {}) {
  cleanChildren(node)
  const elem = document.createElement(Component.is)
  Object.entries(attrs).forEach(([name, value]) => {
    elem.setAttribute(name, value)
  })
  node.appendChild(elem)
}

export function wc (...args) {
  const template = document.createElement('template')
  template.innerHTML = String.raw(...args)
  return () => template.content.cloneNode(true)
}

export class WebComponent extends HTMLElement {
  constructor(template) {
    super();
    this.render(template)
  }

  render (template) {
    this.appendChild(template())
  }
}