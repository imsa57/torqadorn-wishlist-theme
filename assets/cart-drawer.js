class MCartDrawer extends HTMLElement {
  constructor() {
    super(),
      (this.cartDrawerInner = this.querySelector(".m-cart-drawer__inner")),
      (this.cartDrawerCloseIcon = this.querySelector(".m-cart-drawer__close")),
      (this.cartOverlay = this.querySelector(".m-cart__overlay")),
      (this.shippingToggle = this.querySelector("[shipping-text-toggle]")),
      this.shippingToggle.addEventListener("click", this.togglOpen.bind(this)),
      (this.shippingToggleContent = this.querySelector(
        "[shipping-text-toggle-content]"
      )),
      (this.rootUrl = window.Shopify.routes.root),
      this.setHeaderCartIconAccessibility(),
      this.cartDrawerCloseIcon.addEventListener("click", this.close.bind(this)),
      this.addEventListener("click", (e) => {
        e.target.closest(".m-cart-drawer__inner") !== this.cartDrawerInner &&
          this.close();
      });
  }
  togglOpen() {
    this.shippingToggle.classList.toggle("open");
    this.shippingToggleContent.classList.toggle("m:hidden");
  }
  setHeaderCartIconAccessibility() {
    document.querySelectorAll(".m-cart-icon-bubble").forEach((e) => {
      e.setAttribute("role", "button"),
        e.setAttribute("aria-haspopup", "dialog"),
        e.addEventListener("click", (t) => {
          MinimogSettings.enable_cart_drawer &&
            (t.preventDefault(), this.open(e));
        });
    });
  }
  open(e) {
    e && this.setActiveElement(e),
      this.classList.add("m-cart-drawer--active"),
      requestAnimationFrame(() => {
        this.style.setProperty("--m-bg-opacity", "0.5"),
          this.cartDrawerInner.style.setProperty("--translate-x", "0");
      }),
      window.MinimogEvents.emit(MinimogTheme.pubSubEvents.openCartDrawer),
      document.documentElement.classList.add("prevent-scroll");
  }
  close() {
    this.style.setProperty("--m-bg-opacity", "0"),
      this.cartDrawerInner.style.setProperty("--translate-x", "100%"),
      setTimeout(() => {
        this.classList.remove("m-cart-drawer--active"),
          document.documentElement.classList.remove("prevent-scroll");
      }, 300);
  }
  renderContents(e) {
    this.classList.contains("m-cart--empty") &&
      this.classList.remove("m-cart--empty"),
      (this.productId = e.id),
      (this.querySelector("slide-popup .content-box .offers-coupon-list").innerHTML =
        this.getSectionInnerHTML(
          e.sections["cart-drawer"],
          "slide-popup .content-box .offers-coupon-list"
        )),
      (this.querySelector("[shipping-text-toggle-content]").innerHTML =
        this.getSectionInnerHTML(
          e.sections["cart-drawer"],
          "[shipping-text-toggle-content]"
        )),
      this.getSectionsToRender().forEach((t) => {
        (t.selector
          ? document.querySelector(t.selector)
          : document.getElementById(t.id)
        ).innerHTML = this.getSectionInnerHTML(e.sections[t.id], t.selector);
      }),
      setTimeout(() => {
        this.open();
      });
  }
  updateCartCount(e) {
    document.querySelectorAll(".m-cart-count-bubble").forEach((t) => {
      e > 0
        ? ((t.textContent = e), t.classList.remove("m:hidden"))
        : t.classList.add("m:hidden");
    });
  }
  getCart() {
    return fetchJSON(this.rootUrl + "cart.json");
  }
  onCartDrawerUpdate(e = !0) {
    fetch(`${MinimogSettings.routes.cart}?section_id=cart-drawer`)
      .then((e) => e.text())
      .then((t) => {
        this.getSectionsToRender().forEach((r) => {
          console.log(r.selector, this.getSectionInnerHTML(t, r.selector));
          if ("cart-items" === r.block) {
            (r.selector
              ? document.querySelector(r.selector)
              : document.getElementById(r.id)
            ).innerHTML = this.getSectionInnerHTML(t, r.selector);
          } else if (e) {
            (r.selector
              ? document.querySelector(r.selector)
              : document.getElementById(r.id)
            ).innerHTML = this.getSectionInnerHTML(t, r.selector);
          }
        });

        this.querySelector("slide-popup .content-box .offers-coupon-list").innerHTML =
          this.getSectionInnerHTML(t, "slide-popup .content-box .offers-coupon-list");
        this.querySelector("[shipping-text-toggle-content]").innerHTML =
          this.getSectionInnerHTML(t, "[shipping-text-toggle-content]");
      })
      .catch((e) => {}),
      this.getCart().then((e) => {
        this.classList.toggle("m-cart--empty", 0 === e.item_count),
          this.updateCartCount(e.item_count);
      });
  }
  getSectionInnerHTML(e, t = ".shopify-section") {
    return new DOMParser().parseFromString(e, "text/html").querySelector(t)
      .innerHTML;
  }
  getSectionsToRender() {
    return [
      {
        id: "cart-drawer",
        selector: "[data-minimog-cart-items]",
        block: "cart-items",
      },
      {
        id: "cart-drawer",
        selector: "[data-minimog-cart-discounts]",
        block: "cart-footer",
      },
      {
        id: "cart-drawer",
        selector: "[data-cart-subtotal]",
        block: "cart-footer",
      },
      {
        id: "cart-drawer",
        selector: "[data-minimog-gift-wrapping]",
        block: "cart-footer",
      },
      // {
      //   id: "cart-drawer",
      //   selector: "slide-popup .content-box",
      //   block: "",
      // },
      {
        id: "cart-drawer",
        selector: "[checkout-data-cart-subtotal]",
        block: "cart-footer",
      },
    ];
  }
  getSectionDOM(e, t = ".shopify-section") {
    return new DOMParser().parseFromString(e, "text/html").querySelector(t);
  }
  setActiveElement(e) {
    this.activeElement = e;
  }
}
customElements.define("m-cart-drawer", MCartDrawer);
class MCartDrawerItems extends MCartTemplate {
  getSectionsToRender() {
    return [
      {
        id: "MinimogCartDrawer",
        section: "cart-drawer",
        selector: "[data-minimog-cart-items]",
      },
      {
        id: "MinimogCartDrawer",
        section: "cart-drawer",
        selector: "[data-minimog-cart-discounts]",
      },
      {
        id: "MinimogCartDrawer",
        section: "cart-drawer",
        selector: "[data-cart-subtotal]",
      },
      {
        id: "MinimogCartDrawer",
        section: "cart-drawer",
        selector: "[data-minimog-gift-wrapping]",
      },
      {
        id: "MinimogCartDrawer",
        section: "cart-drawer",
        selector: "[data-cart-item-count]",
      },
      {
        id: "MinimogCartDrawer",
        section: "cart-drawer",
        selector: "[checkout-data-cart-subtotal]",
      },
      {
        id: "MinimogCartDrawer",
        section: "cart-drawer",
        selector: "slide-popup .content-box .offers-coupon-list",
      },
    ];
  }
}
customElements.define("m-cart-drawer-items", MCartDrawerItems);
class MDISCOUNTFORM extends HTMLElement{
  constructor(){
    super();
this.addEventListener('submit',this.handleDiscountSubmit.bind(this));
  }
  handleDiscountSubmit(e) {
    e.preventDefault();
    const code = this.querySelector("input").value.trim();
    const applyFormButton =
      this.querySelector('[type="submit"]');
    const textEl = applyFormButton.querySelector(".apply-text");
    const loaderEl = applyFormButton.querySelector(".loader");
    const errorEl = this.querySelector(
      "[apply-coupon-error]"
    );
    const cartDrwaerEL = document.querySelector('m-cart-drawer');
    const popupSlideEl = cartDrwaerEL.querySelector("slide-popup");
    if (!code) {
      return;
    }
    document.querySelector("discount-code-button").applyDiscountCode.call(
      applyFormButton,
      code,
      textEl,
      loaderEl,
      cartDrwaerEL,
      popupSlideEl,
      errorEl
    );
  }
}
customElements.define("m-discount-form",MDISCOUNTFORM );
class DiscountCodeButton extends HTMLElement {
  constructor() {
    super();
  }
  connectedCallback() {
    // Add your initialization code here
    this.cartDrwaer = document.querySelector("m-cart-drawer");
    this.discountCode = this.getAttribute("data-coupon-code");
    this.skipDiscount = this.cartDrwaer.querySelector(
      ".offers-coupon-skip-btn"
    );
    this.popupSlide = this.cartDrwaer.querySelector("slide-popup");
    this.applyText = this.querySelector(".apply-text");
    this.loader = this.querySelector(".loader");

    this.addEventListener(
      "click",
      this.applyDiscountCode.bind(
        this,
        this.discountCode,
        this.applyText,
        this.loader,
        this.cartDrwaer,
        this.popupSlide
      )
    );
    this.skipDiscount.addEventListener("click", () => {
      this.popupSlide.close();
    });
  }
  applyDiscountCode(
    code,
    textEl,
    loaderEl,
    cartDrwaerEL,
    popupSlideEl,
    errorEl
  ) {
    // console.log(code);
    let error = false;
    // this.setAttribute("disabled", true);
    textEl.innerHTML = "Applying..";
    loaderEl.classList.remove("m:hidden");
    let authorization_token;
    const checkout_json_url = "/wallets/checkouts/";
    // Definição movida para aqui

    let discountApplyUrl =
      "/discount/" + code + "?v=" + Date.now() + "&redirect=/checkout/";
    fetch(discountApplyUrl)
      .then((response) => {
        return response.text();
      })
      .then(() => {
        return fetch("/payments/config", {
          method: "GET",
        });
      })
      .then((response) => response.json())
      .then((data) => {
        authorization_token = btoa(data.paymentInstruments.accessToken);
        return fetch("/cart.js");
      })
      .then((res) => res.json())
      .then((cartData) => {
        console.log(cartData);
        if (cartData.discount_codes.length > 0) {
          cartData.discount_codes.forEach((discount) => {
            if (discount.applicable === false) {
              error = true;
              // throw new Error("Discount code already applied");
            }
          });
        }
        let body = {
          checkout: {
            country: Shopify.country,
            discount_code: code,
            line_items: cartData.items,
            presentment_currency: Shopify.currency.active,
          },
        };
        return fetch(checkout_json_url, {
          headers: {
            accept: "*/*",
            "cache-control": "no-cache",
            authorization: "Basic " + authorization_token,
            "content-type": "application/json, text/javascript",
            pragma: "no-cache",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
          },
          referrerPolicy: "strict-origin-when-cross-origin",
          method: "POST",
          mode: "cors",
          credentials: "include",
          body: JSON.stringify(body),
        });
      })
      .then((response) => response.json())
      .then((data) => {
        if (data.checkout && data.checkout.discount_codes.length > 0) {
          // console.log(data.checkout)
          console.log(data);
        } else {
          this._this.clearLocalStorage();
          if (data.checkout?.discount_violations.length > 0) {
            throw new Error(
              data.checkout.discount_violations[0].non_applicable_reason
            );
          }
          if (data?.errors) {
            throw new Error(data.errors.discount.code[0].message);
          }
          // this._this.discountCodeError.innerHTML =
          //   data.errors.discount.code[0].message;
        }
      })
      .catch((error) => {
        // console.error("Erro ao aplicar o desconto:", error);
        //  this._this.discountCodeError.innerHTML = error;
      })
      .finally(() => {
        // this.setAttribute("disabled", false);
        textEl.innerHTML = "Apply";
        loaderEl.classList.add("m:hidden");
        cartDrwaerEL.onCartDrawerUpdate();
        if (error && errorEl) {
          errorEl.classList.remove("m:hidden");
          setTimeout(() => {
            errorEl.classList.add("m:hidden");
          }, 3000);
        }
      });
  }
}

customElements.define("discount-code-button", DiscountCodeButton);
