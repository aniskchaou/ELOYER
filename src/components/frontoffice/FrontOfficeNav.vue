<template>
  <v-app-bar app elevation="0" :color="scrolled ? 'white' : 'transparent'" :class="scrolled ? 'nav-scrolled' : 'nav-transparent'" style="transition:all .3s ease">
    <!-- Logo -->
    <v-toolbar-title class="d-flex align-center" style="cursor:pointer" @click="$router.push('/home')">
      <div class="logo-icon mr-2" :class="scrolled ? 'logo-dark' : 'logo-light'">
        <v-icon :color="scrolled ? '#0A1628' : 'white'" size="28">mdi-scale-balance</v-icon>
      </div>
      <span class="logo-text font-weight-black text-h6" :style="scrolled ? 'color:#0A1628' : 'color:white'">ELoyer</span>
    </v-toolbar-title>

    <v-spacer></v-spacer>

    <!-- Desktop Nav -->
    <div class="d-none d-md-flex align-center">
      <v-btn v-for="item in navItems" :key="item.to" text :to="item.to"
        :style="scrolled ? 'color:#0A1628' : 'color:rgba(255,255,255,0.9)'"
        class="nav-link font-weight-medium text-body-2 mr-1">{{ item.label }}</v-btn>
      <v-divider vertical class="mx-3" :dark="!scrolled"></v-divider>
      <v-btn text to="/login" class="mr-2"
        :style="scrolled ? 'color:#0A1628' : 'color:rgba(255,255,255,0.9)'"
        style="font-weight:600">Sign In</v-btn>
      <v-btn rounded elevation="0" to="/contact"
        style="background:linear-gradient(135deg,#C8A96E,#a8893e);color:white;font-weight:700;letter-spacing:.5px"
        class="px-6">Get Started</v-btn>
    </div>

    <!-- Mobile Menu -->
    <v-btn icon class="d-md-none" @click="mobileMenu = !mobileMenu" :color="scrolled ? '#0A1628' : 'white'">
      <v-icon>{{ mobileMenu ? 'mdi-close' : 'mdi-menu' }}</v-icon>
    </v-btn>

    <!-- Mobile Drawer -->
    <v-navigation-drawer v-model="mobileMenu" fixed right temporary width="280" style="top:64px">
      <v-list nav dense class="pa-4">
        <v-list-item v-for="item in navItems" :key="item.to" :to="item.to" @click="mobileMenu=false" class="mb-1">
          <v-list-item-icon><v-icon color="#0A1628">{{ item.icon }}</v-icon></v-list-item-icon>
          <v-list-item-content><v-list-item-title class="font-weight-medium">{{ item.label }}</v-list-item-title></v-list-item-content>
        </v-list-item>
        <v-divider class="my-3"></v-divider>
        <v-btn block text to="/login" class="mb-2">Sign In</v-btn>
        <v-btn block rounded elevation="0" to="/contact" style="background:linear-gradient(135deg,#C8A96E,#a8893e);color:white;font-weight:700">Get Started Free</v-btn>
      </v-list>
    </v-navigation-drawer>
  </v-app-bar>
</template>

<script>
export default {
  name: 'FrontOfficeNav',
  data() {
    return {
      scrolled: false,
      mobileMenu: false,
      navItems: [
        { label: 'Features',    to: '/features',  icon: 'mdi-star' },
        { label: 'Services',    to: '/services',  icon: 'mdi-briefcase' },
        { label: 'Pricing',     to: '/pricing',   icon: 'mdi-tag' },
        { label: 'About Us',    to: '/about',     icon: 'mdi-information' },
        { label: 'Contact',     to: '/contact',   icon: 'mdi-email' },
      ],
    };
  },
  mounted() {
    window.addEventListener('scroll', this.onScroll);
    this.onScroll();
  },
  beforeDestroy() {
    window.removeEventListener('scroll', this.onScroll);
  },
  methods: {
    onScroll() { this.scrolled = window.scrollY > 60; },
  },
};
</script>

<style scoped>
.nav-transparent { background: transparent !important; }
.nav-scrolled { box-shadow: 0 2px 20px rgba(0,0,0,.08) !important; }
.nav-link:hover { opacity: 1 !important; }
.logo-icon { width:36px; height:36px; border-radius:8px; display:flex; align-items:center; justify-content:center; }
.logo-dark { background: rgba(10,22,40,.08); }
.logo-light { background: rgba(255,255,255,.15); }
</style>
