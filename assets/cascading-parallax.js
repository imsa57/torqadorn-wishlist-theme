if (!customElements.get("m-cascading")) {
  class t extends HTMLElement {
    constructor() {
      super();
    }
    connectedCallback() {
      this.init();
    }
    map(t, e, a, i, s) {
      return ((t - e) * (s - i)) / (a - e) + i;
    }
    setPosition() {
      let t = this.position;
      return (
        (this.position =
          (
            document.documentElement ||
            document.body.parentNode ||
            document.body
          ).scrollTop || window.pageYOffset),
        t != this.position
      );
    }
    updatePosition(t, e) {
      let a = e * (100 * (1 - t));
      return Math.round(a);
    }
    cacheParallaxContainers() {
      for (var t = 0; t < this.parallaxContainers.length; t++) {
        var e = this.createParallaxItem(this.parallaxContainers[t]);
        this.parallaxItems.push(e);
      }
    }
    inViewport(t) {
      if (!t) return !1;
      if (1 !== t.nodeType) return !1;
      var e = document.documentElement,
        a = t.getBoundingClientRect();
      return (
        !!a &&
        a.width > 0 &&
        a.height > 0 &&
        a.bottom >= 0 &&
        a.right >= 0 &&
        a.left <= e.clientWidth &&
        a.top <= e.clientHeight
      );
    }
    createParallaxItem(t) {
      const e = t.getAttribute("data-parallax-id"),
        a = t,
        i = t.querySelector("[data-parallax-element]");
      let s = parseInt(t.getAttribute("data-parallax-speed"));
      s *= -1;
      return {
        id: e,
        container: a,
        item: i,
        height: i.clientHeight || i.offsetHeight || i.scrollHeight,
        speed: s,
        visible: this.inViewport(t),
      };
    }
    observeCascadeItems(t) {
      t &&
        (this.parallaxObserver = new IntersectionObserver(
          (t) => {
            t.forEach((t) => {
              if (this.cascadeEnableParallax) {
                const e = this.parallaxItems.findIndex(
                  (e) => e.id === t.target.getAttribute("data-parallax-id")
                );
                e > -1 && (this.parallaxItems[e].visible = t.isIntersecting);
              }
            });
          },
          { rootMargin: "0px 0px 20% 0px", threshold: 0 }
        ));
      for (var e = 0; e < this.cascadeItems.length; e++)
        t && this.parallaxObserver.observe(this.cascadeItems[e]);
    }
    animate() {
      for (var t = 0; t < this.parallaxContainers.length; t++)
        if (this.parallaxItems[t].visible) {
          const e =
              (this.screenHeight -
                this.parallaxItems[t].item.getBoundingClientRect().top) /
                (this.screenHeight + this.parallaxItems[t].height) -
              0.5,
            a = this.intensity * (this.parallaxItems[t].speed * (100 * e)),
            i = Math.round(100 * a + Number.EPSILON) / 100;
          this.parallaxItems[t].item.style.transform = `translateY(${i}px)`;
        }
      this.firstAnimate = !0;
    }
    initParallax() {
      (this.screenHeight = window.innerHeight),
        (this.parallaxItems = []),
        (this.parallaxContainers = this.querySelectorAll(
          "[data-parallax-container]"
        )),
        (this.cascadeParallaxIntensity = parseInt(
          this.dataset.parallaxIntensity
        )),
        this.setPosition(),
        this.cacheParallaxContainers(),
        (this.intensity =
          this.map(this.cascadeParallaxIntensity, 0, 100, 1, 110) / 100),
        this.animate(),
        document.addEventListener(
          "scroll",
          () => {
            this.setPosition() &&
              requestAnimationFrame(this.animate.bind(this));
          },
          { passive: !0 }
        );
    }
    init() {
      (this.cascadeEnableParallax = "true" === this.dataset.enableParallax),
        (this.cascadeItems = this.querySelectorAll("[data-cascade-item]")),
        this.observeCascadeItems(this.cascadeEnableParallax),
        this.cascadeEnableParallax && this.initParallax(),
        window.addEventListener("resize", () => {
          this.cascadeEnableParallax && this.initParallax();
        });
    }
  }
  customElements.define("m-cascading", t);
}
