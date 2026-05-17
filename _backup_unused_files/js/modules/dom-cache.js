// DOM 緩存模組 - 避免重複查詢 DOM 元素
export const DOMCache = {
    navbar: null,
    navToggle: null,
    navMenu: null,
    navLinks: null,
    navbarHeight: 80,
    viewportWidth: window.innerWidth,
    
    init() {
        this.navbar = document.getElementById('navbar');
        this.navToggle = document.getElementById('nav-toggle');
        this.navMenu = document.getElementById('nav-menu');
        this.navLinks = document.querySelectorAll('.nav-link');
    },
    
    updateViewportWidth() {
        this.viewportWidth = window.innerWidth;
    }
};