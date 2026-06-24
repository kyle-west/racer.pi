import { WebComponent, dom, css, register } from '../dom.js'
import { localStorage } from '../storage.js';

const styles = css`
  :host {
    display: block;
    text-align: right;
    margin-top: 1rem;
  }
  button.delete-button {
    border: 1px solid #fecaca;
    background: transparent;
    color: #dc2626;
    font-size: 0.8rem;
    opacity: 0.45;
    padding: 6px 14px;
    transition: background-color 0.15s, border-color 0.15s, opacity 0.15s, box-shadow 0.15s;
  }
  button.delete-button:hover {
    background-color: #fef2f2;
    border-color: #f87171;
    color: #b91c1c;
    opacity: 1;
    box-shadow: none;
  }
`

export default class ClearDataButton extends WebComponent {
  static is = 'clear-data-button';
  static observedAttributes = ['all'];
  constructor () {
    super(() => dom`
      ${(console.log(this.attrs), styles)}
      <button class="delete-button" name="${this.attrs.all ? 'delete-all' : 'delete-race-data'}">
        ${this.attrs.all ? 'Delete All Data & Start New Race' : 'Delete All Race Data'}
      </button>
    `, { defer: true })
    this.render()
  }

  shouldClear () {
    const { all } = this.attrs

    return window.confirm(
      (all
        ? 'This action will remove all information, including car names, weights, race results, etc.'
        : 'This action will remove all race data. Car information such as the names and weights of the cars will be retained.'
      ) + '\n\nThis action cannot be undone. Are you sure you want to continue?'
    )
  }

  onClickDeleteRaceData () {
    if (this.shouldClear()) {
      const cars = localStorage.get('car-group', {})
      localStorage.clear()
      localStorage.set('car-group', cars)
      window.location.reload()
    }
  }

  onClickDeleteAll () {
    if (this.shouldClear()) {
      localStorage.clear()
      window.location.reload()
    }
  }
}

register(ClearDataButton)
