const ACSIS_HANDBOOK_URL = 'https://mpbconsulting2025.github.io/ACSISLC/coaches-handbook/?embed=1&v=22';
class AcsisCoachesHandbook extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.handleMessage = this.handleMessage.bind(this);
  }

  connectedCallback() {
    if (!this.shadowRoot.childElementCount) {
      const style = document.createElement('style');
      style.textContent = `
        :host {
          display: block;
          width: 100%;
          min-height: 1200px;
          height: 1200px;
          overflow: visible;
          background: #fafafa;
        }
        iframe {
          display: block;
          width: 100%;
          height: 100%;
          border: 0;
          overflow: hidden;
          background: #fafafa;
        }
      `;
      this.frame = document.createElement('iframe');
      this.frame.src = this.getAttribute('handbook-url') || ACSIS_HANDBOOK_URL;
      this.frame.title = 'ACSIS Coaches Handbook';
      this.frame.loading = 'eager';
      this.frame.scrolling = 'no';
      this.frame.setAttribute('allow', 'clipboard-write');
      this.shadowRoot.append(style, this.frame);
    } else {
      this.frame = this.shadowRoot.querySelector('iframe');
    }
    window.addEventListener('message', this.handleMessage);
  }

  disconnectedCallback() {
    window.removeEventListener('message', this.handleMessage);
  }

  handleMessage(event) {
    const handbookOrigin = new URL(this.frame.src).origin;
    const originMatches = event.origin === handbookOrigin || event.origin === 'null';
    if (!originMatches || event.source !== this.frame?.contentWindow) return;
    if (event.data?.type !== 'acsis-handbook-height') return;
    const requestedHeight = Number(event.data.height);
    if (!Number.isFinite(requestedHeight)) return;
    const height = Math.min(Math.max(Math.ceil(requestedHeight), 900), 12000);
    const cssHeight = `${height}px`;
    this.style.setProperty('height', cssHeight, 'important');
    this.style.setProperty('min-height', cssHeight, 'important');
    this.frame.style.height = cssHeight;
    this.dispatchEvent(new CustomEvent('acsis-handbook-resized', {
      bubbles: true,
      composed: true,
      detail: { height }
    }));
  }
}

if (!customElements.get('acsis-coaches-handbook')) {
  customElements.define('acsis-coaches-handbook', AcsisCoachesHandbook);
}
