class MHeader extends HTMLElement {
  constructor() {
    super(),
      (this.selectors = {
        headers: ["header"],
        logos: [".m-logo"],
        topbar: ".m-topbar",
        headerWrapper: ".m-header__wrapper",
        topbarClose: ".m-topbar__close",
      }),
      (this.domNodes = queryDomNodes(this.selectors, this)),
      (this.innerWidth = window.innerWidth),
      (this.headerOffsetTop = this.domNodes.headerWrapper.offsetTop),
      (this.headerHeight = this.domNodes.headerWrapper.offsetHeight),
      (this.stickyHeader = this.dataset.sticky),
      (this.classes = {
        scrollUp: "scroll-up",
        scrollDown: "scroll-down",
        stuck: "stuck",
        always: "header-sticky-always",
        headerScrollUp: "header-scroll-up",
        headerScrollDown: "header-scroll-down",
      }),
      this.init();
  }
  init() {
    (this.transparentHeader =
      this.domNodes &&
      this.domNodes.headers[0] &&
      "true" === this.domNodes.headers[0].dataset.transparent),
      this.initAddon(),
      this.handleSticky(),
      document.addEventListener("matchMobile", () => this.handleSticky()),
      document.addEventListener("unmatchMobile", () => this.handleSticky()),
      (this.siteNav = new SiteNav(this)),
      (window.__sfHeader = this),
      window.addEventListener("resize", () => {
        this.innerWidth = window.innerWidth;
      });
  }
  initAddon() {
    (this.megamenu = new Megamenu(this)),
      Shopify.designMode &&
        ((MinimogTheme = MinimogTheme || {}),
        MinimogTheme &&
          MinimogTheme.Wishlist &&
          MinimogTheme.Wishlist.updateWishlistCount());
  }
  handleSticky() {
    let s = 20;
    document
      .querySelectorAll(".shopify-section-group-header-group")
      .forEach((e) => {
        e.classList.contains("m-section-header") ||
          e.classList.contains("m-section-scaling-logo") ||
          (s += e.offsetHeight);
      });
    const e = document.querySelector(".m-topbar");
    e && (s += e.offsetHeight);
    let t = 0;
    window.addEventListener("scroll", () => {
      const e = window.scrollY;
      if (e <= s)
        return (
          this.classList.remove(
            this.classes.scrollUp,
            this.classes.stuck,
            this.classes.always
          ),
          void document.body.classList.remove(
            this.classes.headerScrollUp,
            this.classes.headerScrollDown
          )
        );
      "on_scroll_up" === this.stickyHeader
        ? this.classList.add(this.classes.stuck)
        : "always" === this.stickyHeader &&
          this.classList.add(this.classes.always),
        e > this.headerHeight + s &&
        e > t &&
        !this.classList.contains(this.classes.scrollDown)
          ? (this.classList.remove(this.classes.scrollUp),
            document.body.classList.remove(this.classes.headerScrollUp),
            this.classList.add(this.classes.scrollDown),
            document.body.classList.add(this.classes.headerScrollDown))
          : e < t &&
            this.classList.contains(this.classes.scrollDown) &&
            (this.classList.remove(this.classes.scrollDown),
            document.body.classList.remove(this.classes.headerScrollDown),
            this.classList.add(this.classes.scrollUp),
            document.body.classList.add(this.classes.headerScrollUp)),
        (t = e);
    });
  }
}
customElements.define("m-header", MHeader);
