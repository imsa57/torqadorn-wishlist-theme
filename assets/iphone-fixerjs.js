if (!customElements.get("slide-popup")) {
  class s extends HTMLElement {
    constructor() {
      super();
      this.closeButton = this.querySelector("header .menu_close");
      this.overlay = this.querySelector(".slide-popup-overlay");
      this.closeButton.addEventListener("click", this.close.bind(this));
      this.overlay.addEventListener("click", this.close.bind(this));
    }
    close() {
      this.classList.remove("active");
    }
    open() {
      this.classList.add("active");
    }
  }
  customElements.define("slide-popup", s);
}
if (!customElements.get("slide-popup-button")) {
  class b extends HTMLButtonElement {
    constructor() {
      super();
      this.addEventListener("click", this.openPopup.bind(this));
    }
    openPopup() {
      const element = document.getElementById(
        `${this.getAttribute("data-popup-id")}`
      );
      element.open.call(element);
    }
  }
  customElements.define("slide-popup-button", b, { extends: "button" });
}
