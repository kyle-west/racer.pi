import { interpolate as JSONinterpolate } from './storage.js';
import { kebabToPascal } from './util.js';
import globalStyles, { css } from './globalStyles.js';
export { css }

function interpolate (value) {
  const json = JSONinterpolate(value)
  if (json) return json
  if (json === '') return true
  return json || value
}

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
  template.innerHTML = globalStyles
  template.innerHTML += String.raw(...args)
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

export class WebComponent extends HTMLElement {
  constructor(template, { defer } = {}) {
    super();
    this.template = template
    this.attrs = Object.fromEntries(
      this.getAttributeNames().map(name => [name, interpolate(this.getAttribute(name))])
    )
    this._shadowRoot = this.attachShadow({ mode: "open" });
    this.$ = (selector) => this._shadowRoot.querySelector(selector)
    this.$$ = (selector) => [...(this._shadowRoot.querySelectorAll(selector) || [])]
    !defer && this.render(template)

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

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return
    this.attrs[name] = interpolate(newValue)
    this.render()
  }
}

export function register (Component) {
  window.customElements.define(Component.is, Component)
}