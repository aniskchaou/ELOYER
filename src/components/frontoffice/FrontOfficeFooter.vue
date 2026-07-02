<template>
  <footer style="background:#0A1628;color:white" class="pt-16 pb-8">
    <v-container>
      <v-row class="mb-12">
        <!-- Brand -->
        <v-col cols="12" md="4" class="pr-md-8">
          <div class="d-flex align-center mb-4">
            <v-icon color="#C8A96E" size="32" class="mr-2">mdi-scale-balance</v-icon>
            <span class="text-h5 font-weight-black">ELoyer</span>
          </div>
          <p class="body-2" style="color:rgba(255,255,255,.6);line-height:1.8">
            The complete legal practice management platform trusted by law firms across North Africa and Europe. Manage cases, clients, billing and AI-powered legal work in one place.
          </p>
          <div class="d-flex mt-6">
            <v-btn v-for="s in socials" :key="s.icon" icon small class="mr-2" style="background:rgba(255,255,255,.08)" :href="s.href">
              <v-icon size="18" color="white">{{ s.icon }}</v-icon>
            </v-btn>
          </div>
        </v-col>

        <!-- Links -->
        <v-col v-for="group in footerLinks" :key="group.title" cols="6" md="2">
          <div class="overline font-weight-bold mb-4" style="color:#C8A96E;letter-spacing:1.5px">{{ group.title }}</div>
          <div v-for="link in group.links" :key="link.label" class="mb-3">
            <router-link :to="link.to" style="color:rgba(255,255,255,.65);text-decoration:none;font-size:14px" class="footer-link">{{ link.label }}</router-link>
          </div>
        </v-col>

        <!-- Newsletter -->
        <v-col cols="12" md="2">
          <div class="overline font-weight-bold mb-4" style="color:#C8A96E;letter-spacing:1.5px">NEWSLETTER</div>
          <p class="caption mb-3" style="color:rgba(255,255,255,.6)">Get legal tech insights and platform updates.</p>
          <v-text-field v-model="email" placeholder="your@email.com" dense outlined dark hide-details class="mb-2"
            style="font-size:13px" background-color="rgba(255,255,255,.05)"></v-text-field>
          <v-btn block rounded small elevation="0" @click="subscribe"
            style="background:linear-gradient(135deg,#C8A96E,#a8893e);color:white;font-weight:700">Subscribe</v-btn>
        </v-col>
      </v-row>

      <!-- Trust badges -->
      <v-divider style="border-color:rgba(255,255,255,.1)" class="mb-6"></v-divider>
      <v-row align="center">
        <v-col cols="12" md="6">
          <div class="d-flex flex-wrap align-center">
            <v-chip v-for="badge in badges" :key="badge" x-small outlined dark class="mr-2 mb-2"
              style="border-color:rgba(255,255,255,.2);color:rgba(255,255,255,.5);font-size:10px">{{ badge }}</v-chip>
          </div>
        </v-col>
        <v-col cols="12" md="6" class="text-md-right">
          <span class="caption" style="color:rgba(255,255,255,.4)">© {{ year }} ELoyer SaaS. All rights reserved. |
            <router-link to="/privacy" style="color:rgba(255,255,255,.4);text-decoration:none">Privacy Policy</router-link> ·
            <router-link to="/terms" style="color:rgba(255,255,255,.4);text-decoration:none">Terms of Service</router-link>
          </span>
        </v-col>
      </v-row>
    </v-container>
    <v-snackbar v-model="snack" top color="success" :timeout="3000">You're subscribed. Welcome!</v-snackbar>
  </footer>
</template>

<script>
export default {
  name: 'FrontOfficeFooter',
  data() {
    return {
      email: '', snack: false, year: new Date().getFullYear(),
      socials: [
        { icon: 'mdi-linkedin', href: '#' }, { icon: 'mdi-twitter', href: '#' },
        { icon: 'mdi-facebook', href: '#' }, { icon: 'mdi-youtube', href: '#' },
      ],
      badges: ['GDPR Compliant', 'SOC 2 In Progress', 'ISO 27001 Aligned', 'AES-256 Encrypted', 'TLS 1.3', 'HIPAA-Oriented'],
      footerLinks: [
        { title: 'PRODUCT', links: [
          { label: 'Features', to: '/features' }, { label: 'Services', to: '/services' },
          { label: 'Pricing', to: '/pricing' }, { label: 'AI Features', to: '/features' },
          { label: 'Enterprise', to: '/pricing' },
        ]},
        { title: 'COMPANY', links: [
          { label: 'About Us', to: '/about' }, { label: 'Contact', to: '/contact' },
          { label: 'Careers', to: '/about' }, { label: 'Blog', to: '/about' },
          { label: 'Press', to: '/about' },
        ]},
        { title: 'SUPPORT', links: [
          { label: 'Documentation', to: '/contact' }, { label: 'API Reference', to: '/contact' },
          { label: 'Status Page', to: '/contact' }, { label: 'Help Centre', to: '/contact' },
          { label: 'Get Demo', to: '/contact' },
        ]},
      ],
    };
  },
  methods: {
    subscribe() { if (this.email) { this.snack = true; this.email = ''; } },
  },
};
</script>

<style scoped>
.footer-link:hover { color: white !important; }
</style>
