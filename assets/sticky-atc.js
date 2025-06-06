customElements.get("sticky-atc") ||
  customElements.define(
    "sticky-atc",
    class extends HTMLElement {
      constructor() {
        super(),
          (this.selectors = {
            prodTitle: ".m-sticky-addtocart--title",
            mainImage: ".m-sticky-addtocart--image",
            addToCart: ".m-add-to-cart",
            buyNowBtn: ".m-product-dynamic-checkout",
            variantIdSelect: '[name="id"]',
            foxkitBtn: ".foxkit-button",
          }),
          (this.hasCustomFields = !!document.querySelector(
            ".m-main-product--info .m-product-custom-field"
          ));
      }
      connectedCallback() {
        (this.container = this.closest(".m-sticky-addtocart")),
          (this.mainProductForm = document.querySelector(
            ".m-product-form--main"
          )),
          (this.selectSizeButton = document.querySelector(
            ".select-size-button-1"
          )),
          (this.mainProductInfo = document.querySelector(
            ".m-main-product--info"
          )),
          (this.mainAddToCart =
            this.mainProductForm.querySelector(".m-add-to-cart")),
          (this.mainDynamicCheckout = this.mainProductForm.querySelector(
            this.selectors.buyNowBtn
          )),
          (this.productId = this.dataset.productId),
          (this.selectedVariantDefault =
            "true" === this.dataset.disableSelectedVariantDefault),
          (this.domNodes = queryDomNodes(this.selectors, this.container)),
          (this.variantData = this.getVariantData());
        !window.location.search.includes("?variant=") &&
          this.selectedVariantDefault &&
          this.variantData &&
          this.variantData.length > 1 &&
          this.disableSelectedVariantDefault(),
          this.init(),
          this.setStickyAddToCartHeight(),
          this.addEventListener("change", () => {
            const t = this.querySelector(this.selectors.variantIdSelect).value;
            (this.currentVariant = this.variantData.find(
              (e) => e.id === Number(t)
            )),
              this.updateButton(!0, "", !1),
              this.currentVariant
                ? this.updateButton(
                    !this.currentVariant.available,
                    window.MinimogStrings.soldOut
                  )
                : this.updateButton(!0, "", !0);
          }),
          document.addEventListener("matchMobile", () => {
            this.setStickyAddToCartHeight();
          }),
          document.addEventListener("unmatchMobile", () => {
            this.setStickyAddToCartHeight();
          });
      }
      getVariantData() {
        return (
          (this.variantData =
            this.variantData ||
            JSON.parse(
              this.container.querySelector('[type="application/json"]')
                .textContent
            )),
          this.variantData
        );
      }
      init() {
        if (!this.mainAddToCart)
          return void this.container.style.setProperty("--m-translate-y", 0);
        const {
          prodTitle: t,
          mainImage: e,
          addToCart: i,
          buyNowBtn: a,
          foxkitBtn: o,
        } = this.domNodes;
        a && (this.enable_dynamic_checkout = !0);
        const r = `${MinimogSettings.headerHeight || 66}px 0px 0px 0px`;
        if (
          ("IntersectionObserver" in window &&
            (this.observer = new IntersectionObserver(
              (t) => {
                t.forEach((t) => {
                  1 !== t.intersectionRatio
                    ? this.container.style.setProperty("--m-translate-y", 0)
                    : this.container.style.setProperty(
                        "--m-translate-y",
                        "100%"
                      ),
                    document.documentElement.classList[
                      1 !== t.intersectionRatio ? "add" : "remove"
                    ]("stick-atc-show");
                });
              },
              { threshold: 1, rootMargin: r }
            )),
          t.addEventListener("click", () => __scrollToTop()),
          e.addEventListener("click", () => __scrollToTop()),
          this.hasCustomFields)
        ) {
          let t = !1;
          const e = document.querySelectorAll(
            ".m-main-product--info .m-product-custom-field"
          );
          e &&
            e.forEach((e) => {
              const i = e.querySelector(".form-field");
              "" == i.value && i.hasAttribute("required") && (t = !0);
            }),
            t &&
              i.addEventListener("click", (t) => {
                t.preventDefault(),
                  t.stopPropagation(),
                  __scrollToTop(this.mainProductForm, () =>
                    this.mainAddToCart.click()
                  );
              }),
            a &&
              a.addEventListener(
                "click",
                (t) => {
                  validateForm(this.mainProductInfo).length > 0 &&
                    (t.preventDefault(),
                    t.stopPropagation(),
                    __scrollToTop(this.mainProductForm, () =>
                      this.mainDynamicCheckout.click()
                    ));
                },
                !0
              ),
            o &&
              o.addEventListener("click", (t) => {
                t.preventDefault(),
                  __scrollToTop(this.mainProductForm, () =>
                    this.mainAddToCart.click()
                  );
              });
        }
        this.setObserveTarget(), this.syncWithMainProductForm();
      }
      setObserveTarget() {
        this.observer &&
          (this.observer.observe(this.selectSizeButton),
          (this.observeTarget = this.selectSizeButton));
      }
      checkDevice(t) {
        const e = this.clientHeight + "px";
        document.documentElement.style.setProperty(
          "--f-sticky-atc-bar-height",
          e
        );
      }
      disableSelectedVariantDefault() {
        const t = this.querySelector(".m-product-option--dropdown-select");
        t && (t.value = "");
      }
      updateButton(t = !0, e, i = !0) {
        const a = this.querySelector(".sticky-atc-form");
        if (!a) return;
        const o = a.querySelector('[name="add"]'),
          r = a.querySelector('[name="add"] > .m-add-to-cart--text');
        o &&
          (t
            ? (o.setAttribute("disabled", "disabled"), e && (r.textContent = e))
            : (o.removeAttribute("disabled"),
              o.classList.remove("disabled"),
              (r.textContent = window.MinimogStrings.addToCart)));
      }
      syncWithMainProductForm() {
        const t = this.querySelector('[name="id"]');
        window.MinimogEvents.subscribe(
          `${this.productId}__VARIANT_CHANGE`,
          async (e) => {
            e && (t.value = e.id);
          }
        );
      }
      setStickyAddToCartHeight() {
        document.documentElement.style.setProperty(
          "--f-sticky-atc-bar-height",
          this.offsetHeight + "px"
        ),
          (window.MinimogSettings.stickyAddToCartHeight = this.offsetHeight);
      }
    }
  );
