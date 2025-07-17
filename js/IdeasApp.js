class IdeasApp {
  constructor() {
    this.currentPage = 1;
    this.perPage = 10;
    this.sortBy = "-published_at";
    this.totalItems = 0;
    this.totalPages = 0;
    this.lastScrollTop = 0;
    this.isLoading = false;
    this.currentIdeas = [];

    this.init();
  }

  // start everything
  init() {
    this.setupEventListeners();
    this.loadStateFromURL();
    this.loadIdeas();
    this.updateURL();
  }

  // bind events
  setupEventListeners() {
    window.addEventListener("scroll", () => this.handleScroll());

    // controls
    document
      .getElementById("showPerPage")
      .addEventListener("change", (e) => {
        this.perPage = parseInt(e.target.value);
        this.currentPage = 1;
        this.loadIdeas();
        this.updateURL();
      });

    document.getElementById("sortBy").addEventListener("change", (e) => {
      this.sortBy = e.target.value;
      this.currentPage = 1;
      this.loadIdeas();
      this.updateURL();
    });

    document.getElementById("modal").addEventListener("click", (e) => {
      if (e.target.id === "modal") {
        this.closeModal();
      }
    });

    // keyboard stuff
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.closeModal();
      }
    });

    this.setupLazyLoading();
  }

  // header hide/show on scroll
  handleScroll() {
    const header = document.getElementById("header");
    const banner = document.getElementById("banner");
    const bannerContent = banner.querySelector(".banner-content");
    const scrollTop =
      window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > this.lastScrollTop && scrollTop > 100) {
      header.classList.add("hidden");
    } else if (scrollTop < this.lastScrollTop) {
      header.classList.remove("hidden");
    }

    if (scrollTop > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }

    // parallax effect
    if (scrollTop < banner.offsetHeight) {
      const parallaxSpeed = 0.5;
      bannerContent.style.transform = `translateY(${
        scrollTop * parallaxSpeed
      }px)`;
    }

    this.lastScrollTop = scrollTop;
  }

  // lazy loading img
  setupLazyLoading() {
    if ("IntersectionObserver" in window) {
      this.imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove("lazy-placeholder");
            img.onload = () => {
              img.style.opacity = "1";
            };
            this.imageObserver.unobserve(img);
          }
        });
      });
    }
  }

  // get params from url
  loadStateFromURL() {
    const params = new URLSearchParams(window.location.search);
    this.currentPage = parseInt(params.get("page")) || 1;
    this.perPage = parseInt(params.get("size")) || 10;
    this.sortBy = params.get("sort") || "-published_at";

    // update controls
    document.getElementById("showPerPage").value = this.perPage;
    document.getElementById("sortBy").value = this.sortBy;
    
    this.restoreScrollPosition();
  }

  // update url with current state
  updateURL() {
    const params = new URLSearchParams();
    params.set("page", this.currentPage);
    params.set("size", this.perPage);
    params.set("sort", this.sortBy);

    const newURL = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, "", newURL);
  }

  // save scroll position before page change
  saveScrollPosition() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    sessionStorage.setItem('ideasScrollPosition', scrollY.toString());
  }

  restoreScrollPosition() {
    const savedPosition = sessionStorage.getItem('ideasScrollPosition');
    if (savedPosition && this.currentPage > 1) {
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedPosition));
        sessionStorage.removeItem('ideasScrollPosition');
      }, 100);
    }
  }

  // fetch api
  async loadIdeas() {
    if (this.isLoading) return;

    this.isLoading = true;
    this.showLoading(true);

    try {
      const url = `https://suitmedia-backend.suitdev.com/api/ideas?page[number]=${this.currentPage}&page[size]=${this.perPage}&append[]=small_image&append[]=medium_image&sort=${this.sortBy}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      this.currentIdeas = data.data;
      this.totalItems = data.meta.total;
      this.totalPages = data.meta.last_page;

      this.renderIdeas(data.data);
      this.renderPagination(data.meta);
      this.updateShowingInfo();
    } catch (error) {
      console.error("Error loading ideas:", error);
      this.showError("Failed to load ideas. Please try again.");
    } finally {
      this.isLoading = false;
      this.showLoading(false);
    }
  }

  // change page
  goToPage(page) {
    if (page < 1 || page > this.totalPages || page === this.currentPage)
      return;

    this.saveScrollPosition();

    this.currentPage = page;
    this.loadIdeas();
    this.updateURL();

    if (page === 1) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  // update showing info text
  updateShowingInfo() {
    const info = document.getElementById("showingInfo");
    const start = (this.currentPage - 1) * this.perPage + 1;
    const end = Math.min(this.currentPage * this.perPage, this.totalItems);
    info.textContent = `Showing ${start} - ${end} of ${this.totalItems}`;
  }

  // loading spinner
  showLoading(show) {
    const loading = document.getElementById("loading");
    loading.style.display = show ? "block" : "none";
  }

  // error message
  showError(message) {
    const grid = document.getElementById("ideasGrid");
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #666;">
        <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 20px; color: #ff6b35;"></i>
        <p>${message}</p>
      </div>
    `;
  }

  renderIdeas(ideas) {
    UIRenderer.renderIdeas(ideas, this.imageObserver);
  }

  renderPagination(meta) {
    UIRenderer.renderPagination(meta, (page) => this.goToPage(page));
  }

  showIdeaDetail(idea) {
    UIRenderer.showIdeaDetail(idea);
  }

  closeModal() {
    const modal = document.getElementById("modal");
    modal.classList.remove("show");
    document.body.style.overflow = "auto";
  }
}
