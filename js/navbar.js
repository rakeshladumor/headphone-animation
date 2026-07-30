export class NavbarController {
  constructor() {
    this.navbar = document.getElementById('navbar');
    this.mobileToggle = document.querySelector('.navbar-mobile-toggle');
    this.mobileMenu = document.querySelector('.navbar-mobile-menu');
    this.navLinks = document.querySelectorAll('.navbar-links a, .navbar-mobile-menu a');
    this.isMenuOpen = false;
    this.scrollThreshold = 50;

    this._bindEvents();
    this._checkScroll(); // Check initial state
  }

  _bindEvents() {
    // Scroll handler for glassmorphism transition
    window.addEventListener('scroll', () => this._checkScroll(), { passive: true });

    // Mobile menu toggle
    if (this.mobileToggle) {
      this.mobileToggle.addEventListener('click', () => this._toggleMobileMenu());
    }

    // Smooth scroll for nav links
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => this._handleNavClick(e));
    });

    // Close mobile menu on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isMenuOpen) this._closeMobileMenu();
    });
  }

  _checkScroll() {
    if (!this.navbar) return;
    if (window.scrollY > this.scrollThreshold) {
      this.navbar.classList.add('scrolled');
    } else {
      this.navbar.classList.remove('scrolled');
    }
  }

  _toggleMobileMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    if (this.mobileToggle) this.mobileToggle.classList.toggle('open', this.isMenuOpen);
    if (this.mobileMenu) this.mobileMenu.classList.toggle('open', this.isMenuOpen);
    document.body.style.overflow = this.isMenuOpen ? 'hidden' : '';
  }

  _closeMobileMenu() {
    this.isMenuOpen = false;
    if (this.mobileToggle) this.mobileToggle.classList.remove('open');
    if (this.mobileMenu) this.mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  }

  _handleNavClick(e) {
    const href = e.currentTarget.getAttribute('href');
    if (href && href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        this._closeMobileMenu();
      }
    }
  }
}
