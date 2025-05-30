class MCartRemoveButton extends HTMLElement {
  constructor() {
    super(),
      this.addEventListener("click", (t) => {
        t.preventDefault();
        (
          this.closest("m-cart") || this.closest("m-cart-drawer-items")
        ).updateQuantity(this.dataset.index, 0);
      });
  }
}
customElements.define("m-cart-remove-button", MCartRemoveButton);
class MCartTemplate extends HTMLElement {
  constructor() {
    super(),
      (this.cartUpdateUnsubscriber = void 0),
      (this.isCartPage = "cart" === MinimogSettings.templateName),
      (this.cartDrawerWrapper = document.querySelector("m-cart-drawer")),
      (this.cartDrawerInner = document.querySelector(".m-cart-drawer__inner")),
      (this.mainCartItems = this.querySelector("[data-minimog-cart-items]")),
      (this.cartSubTotal = this.querySelector("[data-cart-subtotal]")),
      (this.cartDiscount = this.querySelector("[data-minimog-cart-discounts]")),
      (this.cartBreakdownButton = this.querySelector("[shipping-text-toggle]")),
      (this.cartBreakdownContent = this.querySelector("[shipping-text-toggle-content]")),
      (this.giftWrapping = this.querySelector("[data-minimog-gift-wrapping]"));
    let t = this.cartDrawerInner;
    this.isCartPage && (t = document.body),
      (this.loading = new MinimogLibs.AnimateLoading(t, { overlay: t })),
      (this.rootUrl = window.Shopify.routes.root);
    const e = debounce((t) => {
      "id" !== t.target.name && this.onChange(t);
    }, 300);
    this.isCartPage
      ? this.mainCartItems.addEventListener("change", e.bind(this))
      : this.addEventListener("change", e.bind(this)),
      MinimogEvents.subscribe(MinimogTheme.pubSubEvents.cartUpdate, (t) => {
        this.getCart().then((t) => {
          this.updateCartCount(t.item_count);
        });
      });
      this.cartBreakdownButton.addEventListener('click',()=>{
        this.cartBreakdownButton.classList.toggle('open');
        this.cartBreakdownContent.classList.toggle('m:hidden');
      })
  }
  updateCartCount(t) {
    document.querySelectorAll(".m-cart-count-bubble").forEach((e) => {
      t > 0
        ? ((e.textContent = t), e.classList.remove("m:hidden"))
        : e.classList.add("m:hidden");
    });
  }
  getCart() {
    return fetchJSON(this.rootUrl + "cart.json");
  }
  connectedCallback() {
    this.cartUpdateUnsubscriber = MinimogEvents.subscribe(
      MinimogTheme.pubSubEvents.cartUpdate,
      (t) => {
        "main-cart-items" !== t.source && this.onCartUpdate();
      }
    );
  }
  disconnectedCallback() {
    this.cartUpdateUnsubscriber && this.cartUpdateUnsubscriber();
  }
  onCartUpdate(t = !0) {
    const { routes: e } = window.MinimogSettings;
    fetch(`${e.cart}?section_id=cart-template`)
      .then((t) => t.text())
      .then((e) => {
        const i = new DOMParser().parseFromString(e, "text/html"),
          n = i.querySelector("[data-minimog-cart-items]"),
          r = i.querySelector("[data-cart-subtotal]"),
          a = i.querySelector("[data-minimog-cart-discounts]"),
          s = i.querySelector("[data-minimog-gift-wrapping]");
        this.isCartPage &&
          ((this.mainCartItems.innerHTML = n.innerHTML),
          t &&
            ((this.cartSubTotal.innerHTML = r.innerHTML),
            (this.cartDiscount.innerHTML = a.innerHTML),
            (this.giftWrapping.innerHTML = s.innerHTML)));
            this.getSectionsToRender().forEach((t) => {
              (
                document.getElementById(t.id).querySelector(t.selector) ||
                document.getElementById(t.id)
              ).innerHTML = this.getSectionInnerHTML(
                e,
                t.selector
              );
            });    
      })
      .catch((t) => {});
  }
  onChange(t) {
    this.updateQuantity(
      t.target.dataset.index,
      t.target.value,
      document.activeElement.getAttribute("name")
    );
  }
  updateQuantity(t, e, i) {
    this.loading.start();
    const { routes: n } = window.MinimogSettings,
      r = JSON.stringify({
        line: t,
        quantity: e,
        sections: this.getSectionsToRender().map((t) => t.section),
        sections_url: window.location.pathname,
      });
    fetch(`${n.cart_change_url}`, { ...fetchConfig(), body: r })
      .then((t) => t.text())
      .then((e) => {
        const i = JSON.parse(e);
        let n = document.getElementById(`MinimogDrawer-quantity-${t}`);
        this.isCartPage &&
          (n = MinimogTheme.config.mqlMobile
            ? document.querySelector(
                `.MinimogQuantity-${t}.MinimogQuantity-mobile`
              )
            : document.querySelector(
                `.MinimogQuantity-${t}.MinimogQuantity-desktop`
              ));
        const r = document.querySelectorAll(".m-cart-item");
        if (i.errors)
          return (
            this.loading.finish(),
            (n.value = n.getAttribute("value")),
            void this.updateLiveRegions(t, i.errors)
          );
        this.classList.toggle("m-cart--empty", 0 === i.item_count),
          this.cartDrawerWrapper &&
            this.cartDrawerWrapper.classList.toggle(
              "m-cart--empty",
              0 === i.item_count
            ),
          this.getSectionsToRender().forEach((t) => {
            (
              document.getElementById(t.id).querySelector(t.selector) ||
              document.getElementById(t.id)
            ).innerHTML = this.getSectionInnerHTML(
              i.sections[t.section],
              t.selector
            );
          });
        const a = i.items[t - 1] ? i.items[t - 1].quantity : void 0;
        let s = "";
        r.length === i.items.length &&
          a !== parseInt(n.value) &&
          (s =
            void 0 === a
              ? window.MinimogStrings.cartError
              : window.MinimogStrings.quantityError.replace(
                  "{{ quantity }}",
                  a
                )),
          this.updateLiveRegions(t, s),
          MinimogEvents.emit(MinimogTheme.pubSubEvents.cartUpdate, {
            ...i,
            source: "main-cart-items",
          });
      })
      .catch(() => {})
      .finally(() => {
        this.loading.finish();
      });
  }
  updateLiveRegions(t, e) {
    let i = document.getElementById(`MinimogCartDrawer-Item-${t}`);
    this.isCartPage && (i = document.getElementById(`MinimogCart-Item-${t}`)),
      "" !== e &&
        i &&
        MinimogTheme.Notification.show({
          target: i,
          type: "warning",
          message: e,
        });
  }
  getSectionInnerHTML(t, e) {
    return new DOMParser().parseFromString(t, "text/html").querySelector(e)
      .innerHTML;
  }
  getSectionsToRender() {
    return [
      {
        id: "MinimogCart",
        section: "cart-template",
        selector: "[data-minimog-cart-items]",
      },
      {
        id: "MinimogCart",
        section: "cart-template",
        selector: "[data-cart-subtotal]",
      },
      {
        id: "MinimogCart",
        section: "cart-template",
        selector: "[data-minimog-cart-discounts]",
      },
      {
        id: "MinimogCart",
        section: "cart-template",
        selector: "[data-minimog-gift-wrapping]",
      },
      {
        id: "MinimogCart",
        section: "cart-template",
        selector: "[shipping-text-toggle-content]",
      },
      {
        id: "MinimogCart",
        section: "cart-template",
        selector: "[checkout-data-cart-subtotal]",
      },
      {
        id: "MinimogCart",
        section: "cart-template",
        selector: ".offers-coupon-list",
      },
    ];
  }
}
customElements.define("m-cart", MCartTemplate);
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
    const cartPage = document.querySelector('m-cart');
    if (!code) {
      return;
    }
    document.querySelector("discount-code-button").applyDiscountCode.call(
      applyFormButton,
      code,
      textEl,
      loaderEl,
      cartDrwaerEL,
      errorEl,
      cartPage
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
    this.cartPage = document.querySelector("m-cart");
    this.discountCode = this.getAttribute("data-coupon-code");
    if(this.cartDrwaer){
      this.skipDiscount = this.cartDrwaer.querySelector(
        ".offers-coupon-skip-btn"
      );
      this.popupSlide = this.cartDrwaer.querySelector("slide-popup");
      this.skipDiscount.addEventListener("click", () => {
        this.popupSlide.close();
      });
    }
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
        "",
        this.cartPage
      )
    );
   
  }
  applyDiscountCode(
    code,
    textEl,
    loaderEl,
    cartDrwaerEL,
    errorEl,
    cartPage
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
        if(cartDrwaerEL){
          cartDrwaerEL.onCartDrawerUpdate();
        }
        if(cartPage){
          cartPage.onCartUpdate();
        }
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