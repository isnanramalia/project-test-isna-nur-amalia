// navigation component
class NavigationComponent {
  constructor() {
    this.currentPage = this.getCurrentPage();
  }

  getCurrentPage() {
    const path = window.location.pathname;
    const fileName = path.split('/').pop() || 'index.html';
    return fileName.replace('.html', '');
  }

  generateNavigation() {
    const navItems = [
      { href: './work.html', key: 'work', label: 'Work' },
      { href: './about.html', key: 'about', label: 'About' },
      { href: './services.html', key: 'services', label: 'Services' },
      { href: './index.html', key: 'index', label: 'Ideas' },
      { href: './careers.html', key: 'careers', label: 'Careers' },
      { href: './contact.html', key: 'contact', label: 'Contact' }
    ];

    return `
      <header class="header" id="header" role="banner">
        <div class="container">
          <a href="./index.html" class="logo" aria-label="Suitmedia Homepage">
            <img src="./assets/logo.png" alt="Suitmedia Logo" />
          </a>

          <button
            class="mobile-menu-toggle"
            id="mobileMenuToggle"
            aria-label="Toggle mobile menu"
          >
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
            <span class="hamburger-line"></span>
          </button>

          <nav
            class="nav"
            id="mainNav"
            role="navigation"
            aria-label="Main navigation"
          >
            ${navItems.map(item => {
              const isActive = this.currentPage === item.key || 
                              (this.currentPage === '' && item.key === 'index');
              return `
                <a 
                  href="${item.href}" 
                  ${isActive ? 'class="active" aria-current="page"' : ''} 
                  aria-label="${item.label}"
                >
                  ${item.label}
                </a>
              `;
            }).join('')}
          </nav>
        </div>
      </header>
    `;
  }

  render(containerId = 'navigation-container') {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = this.generateNavigation();
    } else {
      // fallback - insert at body start
      document.body.insertAdjacentHTML('afterbegin', this.generateNavigation());
    }

    // setup mobile menu
    this.initializeMobileMenu();
  }

  initializeMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mainNav = document.getElementById('mainNav');
    
    if (mobileMenuToggle && mainNav) {
      mobileMenuToggle.addEventListener('click', () => {
        mobileMenuToggle.classList.toggle('active');
        mainNav.classList.toggle('nav-open');
        document.body.classList.toggle('menu-open');
      });

      // close menu on nav click
      const navLinks = mainNav.querySelectorAll('a');
      navLinks.forEach(link => {
        link.addEventListener('click', () => {
          mobileMenuToggle.classList.remove('active');
          mainNav.classList.remove('nav-open');
          document.body.classList.remove('menu-open');
        });
      });

      // close on outside click
      document.addEventListener('click', (e) => {
        if (!mobileMenuToggle.contains(e.target) && !mainNav.contains(e.target)) {
          mobileMenuToggle.classList.remove('active');
          mainNav.classList.remove('nav-open');
          document.body.classList.remove('menu-open');
        }
      });
    }
  }
}

// auto init navigation
document.addEventListener('DOMContentLoaded', () => {
  const navigation = new NavigationComponent();
  navigation.render();
});

// export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NavigationComponent;
}
