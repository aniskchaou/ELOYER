<template>
  <v-app>
    <template v-if="showAppShell">
      <Navigation />
      <Headerbar @toggle-menu="drawer = !drawer" />
    </template>
    <v-main>
      <v-container fluid class="pa-0" :style="!showAppShell ? 'min-height:100vh;' : ''">
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import Navigation from './components/Navigation.vue';
import Headerbar from './components/Headerbar.vue';
export default {
  name: 'App',
  components: { Navigation, Headerbar },
  data() { return { drawer: true }; },
  computed: {
    showAppShell() {
      return !this.$route.meta.frontOffice;
    },
  },
  created() {
    const saved = localStorage.getItem('eloyer-dark-mode');
    if (saved !== null && this.$vuetify) this.$vuetify.theme.dark = saved === 'true';
  },
};
</script>
