if (!customElements.get("variant-picker")) {
  class e extends HTMLElement {
    constructor() {
      super(),
        (this.selectors = {
          container: "[data-variant-picker]",
          productInfo: ".m-product-info--wrapper",
          productInfo: ".m-product-info--wrapper",
          error: ".m-product-form-message",
          variantIdInput: '[name="id"]',
          // pickerFields: ["[data-picker-field]"],
          // optionNodes: [".m-product-option--node"],
          productSku: "[data-variant-sku]",
          productAvailability: "[data-availability]",
          shareUrlInput: "[data-share-url]",
          stockCountdown: ".prod__stock-countdown",
          productWrapper: ".m-main-product--wrapper",
        }),
        (this.container = this.closest(this.selectors.container)),
        (this.productWrapper = this.closest(this.selectors.productWrapper)),
        (this.productInfo = this.productWrapper.querySelector(
          this.selectors.productInfo
        )),
        (this.domNodes = queryDomNodes(this.selectors, this.productInfo));
        this.domNodes.optionNodes = this.querySelectorAll('.m-product-option--node');
        this.domNodes.pickerFields = this.querySelectorAll('[data-picker-field]');
        // (this.domNodes = queryDomNodes(this.selectors, this));
    }
    connectedCallback() {
      this.setupData();
    }
    async setupData() {
      let e = (window._themeProducts || {})[this.container.dataset.productId];
      (this.productId = this.container.dataset.productId),
        (this.sectionId = this.container.dataset.section),
        (this.productUrl = this.container.dataset.productUrl),
        (this.productHandle = this.container.dataset.productHandle),
        (this.hasOnlyDefaultVariant =
          "true" === this.dataset.hasOnlyDefaultVariant),
        (this.section = this.container.closest(
          `[data-section-id="${this.sectionId}"]`
        )),
        (this.variantData = this.getVariantData()),
        (this.productData = Object.assign(await this.getProductJson(), e)),
        (this.showFeaturedMedia = "true" === this.dataset.showFeaturedMedia),
        (this.productForm = this.productWrapper.querySelector("product-form"));
      const t = window.location.search.includes("?variant=");
      (this.selectedVariantDefault =
        "true" === this.dataset.disableSelectedVariantDefault &&
        this.productData &&
        this.productData.variants.length > 1 &&
        !t),
        this.selectedVariantDefault && this.disableSelectedVariantDefault(),
        (this.enableVariantGroupImages =
          "true" === this.container.dataset.enableVariantGroupImages),
        this.enableVariantGroupImages &&
          (this.variantGroupImages = this.getVariantGroupImageData()),
        (this.selectedVariant = this.productInfo.querySelector(
          this.selectors.variantIdInput
        ));
      const i = this.selectedVariant.value;
      (this.currentVariant = this.productData.variants.find(
        (e) => e.id === Number(i)
      )),
        (this.productData.current_variant_id =
          this.currentVariant && this.currentVariant.id),
        (this.productData.initialVariant = this.currentVariant),
        this.currentVariant &&
          (this.getDataImageVariant(this.currentVariant.id),
          this.hideSoldOutAndUnavailableOptions(),
          this.updateButton(!this.currentVariant.available, "", !1)),
        this.getMediaGallery(),
        document.addEventListener("matchMobile", () => {
          this.getMediaGallery();
        }),
        document.addEventListener("unmatchMobile", () => {
          this.getMediaGallery();
        }),
        this.initOptionSwatches(),
        this.addEventListener("change", this.onVariantChange);
    }
    disableSelectedVariantDefault() {
      const e = this.querySelectorAll('input[type="radio"]');
      e && e.forEach((e) => (e.checked = !1));
      const t = this.querySelectorAll("[data-picker-field='radio']");
      t &&
        t.forEach((e) => {
          e.setAttribute("data-selected-value", "");
        });
      const i = this.querySelectorAll("[data-picker-field='select']");
      i &&
        i.forEach((e) => {
          const t = e.querySelector("select");
          t && (t.value = ""), e.setAttribute("data-selected-value", "");
        });
      const a = this.querySelectorAll(".option-label--selected");
      a &&
        a.forEach((e) => {
          e.textContent = "";
        });
      const s =
        this.productForm && this.productForm.querySelector("[name='id']");
      s && !this.hasOnlyDefaultVariant && (s.value = "");
    }
    getMediaGallery() {
      (this.mediaGallery = this.section.querySelector("media-gallery")),
        (this.mediaGalleryMobile = this.section.querySelector(
          "media-gallery-mobile"
        )),
        (this.check = setInterval(() => {
          if (this.mediaGallery || this.mediaGalleryMobile) {
            if ((clearInterval(this.check), MinimogTheme.config.mqlMobile)) {
              const e = this.mediaGalleryMobile || this.mediaGallery;
              (this.media = e),
                !this.slides && e.slider && (this.slides = e.slider.slides),
                e.navSlider &&
                  !this.slidesNav &&
                  (this.slidesNav = e.navSlider.slides);
            } else
              (this.media = this.mediaGallery),
                (this.layout = this.mediaGallery.layout),
                "slider" === this.mediaGallery.mediaMode
                  ? (!this.slides &&
                      this.mediaGallery.slider &&
                      (this.slides = this.mediaGallery.slider.slides),
                    this.mediaGallery.navSlider &&
                      !this.slidesNav &&
                      (this.slidesNav = this.mediaGallery.navSlider.slides))
                  : (this.mediaItems = this.mediaGallery.querySelectorAll(
                      ".m-product-media--item"
                    ));
            (!this.showFeaturedMedia ||
              (this.enableVariantGroupImages &&
                this.variantGroupImages.enable)) &&
              this.updateMedia();
          }
        }, 100));
    }
    onVariantChange() {
      this.getSelectedOptions(),
        this.getSelectedVariant(),
        this.updateButton(!0, "", !1),
        this.updatePickupAvailability(),
        this.removeErrorMessage(),
        this.currentVariant
          ? (this.getDataImageVariant(this.currentVariant.id),
            this.updateMedia(),
            this.updateBrowserHistory(),
            this.updateVariantInput(),
            this.updateProductMeta(),
            this.updatePrice(),
            this.updateButton(
              !this.currentVariant.available,
              window.MinimogStrings.soldOut
            ),
            this.hideSoldOutAndUnavailableOptions())
          : (this.updateButton(!0, "", !0), this.setUnavailable()),
        window.MinimogEvents.emit(
          `${this.productId}__VARIANT_CHANGE`,
          this.currentVariant,
          this
        );
    }
    getDataImageVariant(e) {
      const t =
        this.variantGroupImages &&
        this.variantGroupImages.mapping.find((t) => Number(t.id) === e);
      this.variantGroupImages &&
        this.variantGroupImages.enable &&
        t &&
        (this.currentVariantMedia = t.media);
    }
    getProductJson() {
      return fetch(this.productUrl + ".js")
        .then((e) => {
          if (e.ok) return e.json();
          return JSON.parse(
            this.productWrapper.querySelector(
              "#productData[type='application/json']"
            ).textContent
          );
        })
        .catch((e) => {});
    }
    getSelectedVariant() {
      let e = getVariantFromOptionArray(this.productData, this.options),
        t = [...this.options];
      e ||
        (t.pop(),
        (e = getVariantFromOptionArray(this.productData, t)),
        e || (t.pop(), (e = getVariantFromOptionArray(this.productData, t))),
        (this.options = [...e.options]),
        this.updateSelectedOptions()),
        (this.currentVariant = e);
    }
    getSelectedOptions() {
      const e = Array.from(this.querySelectorAll("[data-picker-field]"));
      this.options = e.map((e) =>
        "radio" === e.dataset.pickerField &&
        Array.from(e.querySelectorAll("input")).find((e) => e.checked)
          ? Array.from(e.querySelectorAll("input")).find((e) => e.checked).value
          : e.querySelector("select")
          ? e.querySelector("select").value
          : void 0
      );
    }
    updateSelectedOptions() {
      this.domNodes.pickerFields.forEach((e, t) => {
        if (e.dataset.selectedValue !== this.options[t]) {
          const i = e.querySelector(
            `input[value="${this.options[t].replace(/["\\]/g, "\\$&")}"]`
          );
          i && ((i.checked = !0), e.updateSelectedValue());
        }
      });
    }
    updateMedia() {
      if (!this.currentVariant) return;
      let e = [],
        t = [],
        i = 0,
        a = 0,
        s = 0,
        r = 0;
      if (this.variantGroupImages && this.variantGroupImages.enable)
        if ("slider" === this.media.mediaMode && this.slides)
          this.slides.forEach((t) => {
            const s = t.querySelector("[data-media-id]").dataset.mediaId;
            this.currentVariantMedia && this.currentVariantMedia.length > 0
              ? (this.currentVariantMedia.includes(s) &&
                  ((t.dataset.swiperSlideIndex = i++),
                  (t.dataset.index = a++),
                  "0" === t.dataset.swiperSlideIndex &&
                    t.classList.add("swiper-slide-active"),
                  e.push(t)),
                t.classList.contains("media-type-image") ||
                  ((t.dataset.swiperSlideIndex = i++),
                  (t.dataset.index = a++),
                  e.push(t)))
              : ((t.dataset.swiperSlideIndex = i++),
                (t.dataset.index = a++),
                e.push(t));
          }),
            this.media.slider.removeAllSlides(),
            this.media.slider.appendSlide(e),
            "layout-7" == this.layout
              ? this.media.slider.slideToLoop(1)
              : this.media.slider.slideToLoop(0),
            this.media.handleSlideChange(),
            this.slidesNav &&
              this.slidesNav.forEach((e) => {
                const i = e.querySelector("[data-media-id]").dataset.mediaId;
                this.currentVariantMedia && this.currentVariantMedia.length > 0
                  ? (this.currentVariantMedia.includes(i) &&
                      ((e.dataset.swiperSlideIndex = s++),
                      (e.dataset.index = r++),
                      "0" === e.dataset.swiperSlideIndex &&
                        e.classList.add("swiper-slide-thumb-active"),
                      t.push(e)),
                    e.classList.contains("media-type-image") ||
                      ((e.dataset.swiperSlideIndex = s++),
                      (e.dataset.index = r++),
                      t.push(e)))
                  : ((e.dataset.swiperSlideIndex = s++),
                    (e.dataset.index = r++),
                    e.classList.remove("swiper-slide-thumb-active"),
                    "0" === e.dataset.swiperSlideIndex &&
                      e.classList.add("swiper-slide-thumb-active"),
                    t.push(e));
              }),
            this.media.navSlider && this.media.navSlider.removeAllSlides(),
            this.media.navSlider && this.media.navSlider.appendSlide(t),
            this.media.navSlider && this.media.navSlider.slideToLoop(0),
            this.media && this.media.removeAttribute("data-media-loading"),
            this.media && (this.media.firstElementChild.style.opacity = 1);
        else {
          let t = 0;
          const i = this.media.querySelector(".m-product-media--list");
          if (!i) return;
          this.mediaItems &&
            this.mediaItems.forEach((a) => {
              const s = a.querySelector("[data-media-id]").dataset.mediaId;
              this.currentVariantMedia && this.currentVariantMedia.length > 0
                ? (this.currentVariantMedia.includes(s) &&
                    ((a.dataset.index = t++), e.push(a)),
                  a.classList.contains("media-type-image") ||
                    ((a.dataset.index = t++), e.push(a)))
                : ((a.dataset.index = t++), e.push(a)),
                (i.innerHTML = ""),
                e.forEach((e) => {
                  if ("layout-2" == this.layout) {
                    e.classList.remove("m-col-span-2");
                    0 == e.dataset.index % 3 && e.classList.add("m-col-span-2");
                  }
                  i.append(e);
                });
            }),
            this.media && this.media.removeAttribute("data-media-loading"),
            this.media && (this.media.firstElementChild.style.opacity = 1);
        }
      else {
        parseInt(this.media && this.media.dataset.mediaSize) > 0 &&
          this.media.setActiveMedia(this.currentVariant);
      }
      const n = [];
      e.length > 0 &&
        e.forEach((e, t) => {
          if ("image" === e.dataset.mediaType) {
            const t = e.querySelector(".m-product-media").dataset;
            n.push({
              src: t.mediaSrc,
              width: parseInt(t.mediaWidth),
              height: parseInt(t.mediaHeight),
              alt: t.mediaAlt,
              id: e.dataset.index,
            });
          } else
            n.push({
              html: `<div class="pswp__${e.dataset.mediaType}">${e.innerHTML}</div>`,
              type: e.dataset.mediaType,
              id: e.dataset.index,
            });
        }),
        this.media && this.media.lightbox && this.media.lightbox.destroy(),
        this.media && this.media.handlePhotoswipe(n),
        this.media && this.media.initPhotoswipe();
    }
    updateBrowserHistory() {
      this.currentVariant &&
        "false" !== this.dataset.updateUrl &&
        window.history.replaceState(
          {},
          "",
          `${this.productUrl}?variant=${this.currentVariant.id}`
        );
    }
    updateVariantInput() {
      document
        .querySelectorAll(
          `#product-form-${this.sectionId}, #product-form-installment`
        )
        .forEach((e) => {
          const t = e.querySelector(this.selectors.variantIdInput);
          (t.value = this.currentVariant.id),
            t.dispatchEvent(new Event("change", { bubbles: !0 }));
        });
    }
    updatePickupAvailability() {
      const e = this.section.querySelector("pickup-availability");
      e &&
        (this.currentVariant && this.currentVariant.available
          ? e.fetchAvailability(this.currentVariant.id)
          : (e.removeAttribute("available"), (e.innerHTML = "")));
    }
    removeErrorMessage() {
      const e = this.closest("section");
      if (!e) return;
      const t = e.querySelector("product-form");
      t && t.handleErrorMessage();
    }
    updatePrice() {
      const e = "m-price--on-sale",
        t = "m-price--sold-out",
        i = this.productInfo.querySelector(".main-product__block-price");
      if (!i) return;
      const a = window.MinimogSettings.money_format,
        {
          priceWrapper: s,
          salePrice: r,
          unitPrice: n,
          compareAtPrice: d,
          saleBadge: o,
          saleAmount: l,
          unitPriceWrapper: c,
        } = queryDomNodes(
          {
            priceWrapper: ".m-price",
            salePrice: ".m-price-item--sale",
            compareAtPrice: [".m-price-item--regular"],
            unitPrice: ".m-price__unit",
            unitPriceWrapper: ".m-price__unit-wrapper",
            saleBadge: ".m-price__badge-sale",
            saleAmount: "[data-saved-price]",
          },
          i
        ),
        {
          compare_at_price: u,
          price: h,
          unit_price_measurement: p,
        } = this.currentVariant,
        m = s.dataset.saleBadgeType,
        v = u && u > h,
        y = !this.currentVariant.available;
      if (
        (v ? s.classList.add(e) : s.classList.remove(e),
        y ? s.classList.add(t) : s.classList.remove(t),
        s && s.classList.remove("visibility-hidden"),
        r && (r.innerHTML = formatMoney(h, a)),
        d.length && u > h
          ? d.forEach((e) => (e.innerHTML = formatMoney(u, a)))
          : d.forEach((e) => (e.innerHTML = formatMoney(h, a))),
        o && u > h && "text" !== m)
      ) {
        let e;
        if ("fixed_amount" === m) e = formatMoney(u - h, a);
        else {
          const t = (100 * (u - h)) / u;
          e = Math.round(t) + "%";
        }
        l && (l.innerHTML = e);
      }
      if (p && n) {
        c.classList.remove("m:hidden");
        const e = `<span>${formatMoney(
          this.currentVariant.unit_price,
          a
        )}</span>/<span data-unit-price-base-unit>${this._getBaseUnit()}</span>`;
        n.innerHTML = e;
      } else c.classList.add("m:hidden");
    }
    _getBaseUnit = () =>
      1 === this.currentVariant.unit_price_measurement.reference_value
        ? this.currentVariant.unit_price_measurement.reference_unit
        : this.currentVariant.unit_price_measurement.reference_value +
          this.currentVariant.unit_price_measurement.reference_unit;
    updateButton(e = !0, t, i = !0) {
      const a = document.querySelectorAll(`.product-form-${this.sectionId}`);
      a &&
        a.forEach((i) => {
          const a = i.querySelector('[name="add"]'),
            s = i.querySelector(".m-product-dynamic-checkout"),
            r = i.querySelector('[name="add"] > .m-add-to-cart--text');
          a &&
            (e
              ? (a.setAttribute("disabled", "disabled"),
                a.classList.add("disabled"),
                s && s.classList.add("disabled"),
                t && (r.textContent = t))
              : (a.removeAttribute("disabled"),
                a.classList.remove("disabled"),
                s && s.classList.remove("disabled"),
                (r.textContent = window.MinimogStrings.addToCart)));
        });
    }
    updateProductMeta() {
      const { available: e, sku: t } = this.currentVariant,
        { inStock: i, outOfStock: a } = window.MinimogStrings,
        s = this.section.querySelector(this.selectors.productAvailability),
        r = this.section.querySelector(this.selectors.productSku);
      if ((r && (r.textContent = t || "N/A"), s)) {
        const t = e ? "remove" : "add";
        (s.textContent = e ? i : a),
          s.classList[t]("m-product-availability--outofstock");
      }
    }
    setUnavailable() {
      const e = document.getElementById(`product-form-${this.sectionId}`),
        t = e.querySelector('[name="add"]'),
        i = e.querySelector('[name="add"] > span.m-add-to-cart--text'),
        a = this.section.querySelector(".m-price");
      t &&
        ((i.textContent = window.MinimogStrings.unavailable),
        a && a.classList.add("visibility-hidden"));
    }
    hideSoldOutAndUnavailableOptions = () => {
      const e = "m-product-option--node__soldout",
        t = "m-product-option--node__unavailable",
        i = this.currentVariant,
        { optionNodes: a } = this.domNodes,
        {
          productData: s,
          productData: {
            variants: r,
            options: { length: n },
          },
        } = this;
      a.forEach((a) => {
        const { optionPosition: d, value: o } = a.dataset,
          l = Number(d),
          c = "OPTION" === a.tagName;
        let u = [];
        if (l === n) {
          const e = Array.from(i.options);
          (e[n - 1] = o), u.push(getVariantFromOptionArray(s, e));
        } else
          u = r.filter(
            (e) =>
              e.options[l - 1] === o &&
              e.options[l - 2] === i["option" + (l - 1)]
          );
        if (((u = u.filter(Boolean)), u.length)) {
          a.classList.remove(t), c && a.removeAttribute("disabled");
          const i = u.every((e) => !1 === e.available) ? "add" : "remove";
          a.classList[i](e);
        } else a.classList.add(t), c && a.setAttribute("disabled", "true");
      });
    };
    getVariantData() {
      return (
        (this.variantData =
          this.variantData ||
          JSON.parse(
            this.container.querySelector(
              '#productVariants[type="application/json"]'
            ).textContent
          )),
        this.variantData
      );
    }
    getVariantGroupImageData() {
      return (
        (this.variantGroupImages =
          this.variantGroupImages ||
          JSON.parse(
            this.container.querySelector(
              '#variantGroup[type="application/json"]'
            ).textContent
          )),
        this.variantGroupImages
      );
    }
    initOptionSwatches() {
      const { _colorSwatches: e = [], _imageSwatches: t = [] } =
        window.MinimogSettings;
      this.domNodes.optionNodes &&
        this.domNodes.optionNodes.forEach((i) => {
          const { optionType: a, optionPosition: s, value: r } = i.dataset,
            n = r && r.toLowerCase(),
            d = this.variantData.find((e) => e[`option${s}`] === r),
            o =
              d && d.featured_image && d.featured_image.src
                ? getSizedImageUrl(d.featured_image.src, "100x")
                : null,
            l = t.find((e) => e.key === n)
              ? t.find((e) => e.key === n).value
              : "",
            c = e.find((e) => e.key === n)
              ? e.find((e) => e.key === n).value
              : "";
          switch (
            ((o || l) &&
              i.querySelector("label") &&
              i.querySelector("label").classList.add("has-bg-img"),
            a)
          ) {
            case "default":
              (i.querySelector("label").style.backgroundImage = `url(${
                l || o || ""
              })`),
                i.querySelector("label").classList.remove("option-loading");
              break;
            case "image":
              (i.querySelector("label").style.backgroundImage = `url(${
                o || l || ""
              })`),
                i.querySelector("label").classList.remove("option-loading");
              break;
            case "color":
              (i.querySelector("label").style.backgroundColor = c || n),
                l &&
                  (i.querySelector(
                    "label"
                  ).style.backgroundImage = `url(${l})`),
                i.querySelector("label").classList.remove("option-loading");
          }
        });
    }
  }
  customElements.define("variant-picker", e);
}
if (!customElements.get("variant-button")) {
  class e extends HTMLElement {
    constructor() {
      super();
      this.allInputs = Array.from(this.querySelectorAll("input"));
      if(this.allInputs.length > 0){
        this.allInputs.find(e=>e.value=== this.getAttribute('data-selected-value')).parentElement.classList.add('connected-label');
      }
        (this.selectedSpan = this.querySelector(".option-label--selected")),
      (this.productTags = JSON.parse(
        document.querySelector('#productTags[type="application/json"]')
          .textContent
      )),
        this.addEventListener("change", this.updateSelectedValue);
    }
    updateSelectedValue() {
      this.querySelectorAll(".connected-label").forEach(e=>e.classList.remove("connected-label"));
      this.value = Array.from(this.querySelectorAll("input")).find(
        (e) => e.checked
      ).value;

      
      let selectedTagValue = null;
      this.productTags.forEach((tag) =>{
        const lowercaseTag = tag.toLowerCase();
        if(lowercaseTag.includes("inventoryalert".toLowerCase())){
          if(lowercaseTag.split("-")[1]== this.value.toLowerCase()){
            selectedTagValue = lowercaseTag.split("-")[2];
          }
        }
      }
      );

      let sizeText = this.value;
      if (selectedTagValue) {
        sizeText = `${this.value} - Only ${selectedTagValue} left`;
      }
      this.setAttribute("data-selected-value", this.value),
        this.selectedSpan &&
          ((this.selectedSpan.textContent = sizeText),
          this.selectedSpan.classList.remove("m:text-color-error"));
    }
  }
  if (
    (customElements.define("variant-button", e),
    !customElements.get("variant-select"))
  ) {
    class t extends e {
      constructor() {
        super();
      }
      updateSelectedValue() {
        (this.value = this.querySelector("select").value),
          this.setAttribute("data-selected-value", this.value),
          this.selectedSpan &&
            ((this.selectedSpan.textContent = this.value),
            this.selectedSpan.classList.remove("m:text-color-error"));
      }
    }
    customElements.define("variant-select", t);
  }
  if (!customElements.get("variant-image")) {
    class t extends e {
      constructor() {
        super();
      }
    }
    customElements.define("variant-image", t);
  }
  if (!customElements.get("variant-color")) {
    class t extends e {
      constructor() {
        super();
      }
    }
    customElements.define("variant-color", t);
  }
}
