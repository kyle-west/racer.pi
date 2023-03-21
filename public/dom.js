import { kebabToPascal } from './util.js';

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
export function dom (...args) {
  return wc(...args)()
}
export function inline (value) {
  if (value !== null && value !== undefined && value !== false) {
    if (Array.isArray) return value.join('\n')
    return value
  }
  return ''
}
export function css (...args) {
  return `<style>${String.raw(...args)}</style>`
}

export class WebComponent extends HTMLElement {
  constructor(template) {
    super();
    this.template = template
    this._shadowRoot = this.attachShadow({ mode: "open" });
    this.$ = (selector) => this._shadowRoot.querySelector(selector)
    this.$$ = (selector) => this._shadowRoot.querySelectorAll(selector)
    this.render(template)

    this.onclick = this.getEventHandler('onClick');
    this.onsubmit = this.getEventHandler('onSubmit');
    this.oninput = this.getEventHandler('onInput');
    this.onkeydown = this.getEventHandler('onKeyDown');
    this.onkeyup = this.getEventHandler('onKeyUp');
  }
  
  render (template) {
    const templateConstructor = template || this.template
    cleanChildren(this._shadowRoot)
    this._shadowRoot.appendChild(templateConstructor());
  }

  getEventHandler (eventName) {
    return (evt) => {
      const target = evt.composedPath()?.[0] || evt.target
      const { name } = target
      const handler = (name && this[eventName + kebabToPascal(name)]) || this[eventName]
      if (handler) {
        evt.element = target
        return handler.bind(this)(evt)
      }
    }
  }
}

export function register (Component) {
  window.customElements.define(Component.is, Component)
}