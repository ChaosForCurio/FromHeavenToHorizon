import { PolymerElement, html } from 'https://unpkg.com/@polymer/polymer@3.0.0/polymer-element.js?module';

class ExploreButton extends PolymerElement {
    static get template() {
        return html`
      <style>
        :host {
          display: inline-block;
        }
        button {
          padding: 1vw 2vw;
          font-size: 2.5vw;
          font-family: "Marck Script", cursive;
          background: #ffffff;
          color: #000000;
          border: none;
          cursor: pointer;
          transition: transform 0.2s, background-color 0.2s;
        }
        button:hover {
          transform: scale(1.05);
          background-color: #f0f0f0;
        }
        @media (max-width: 400px) {
          button {
            font-size: 0.8rem;
            padding: 0.5em 1em;
          }
        }
      </style>
      <button on-click="handleClick">
        <slot>Explore More</slot>
      </button>
    `;
    }

    handleClick() {
        window.open('https://www.cloudskillsboost.google/profile/badges', '_blank');
    }
}

customElements.define('explore-button', ExploreButton);
