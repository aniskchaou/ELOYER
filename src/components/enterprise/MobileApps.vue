<template>
  <v-container fluid>
    <v-row class="mb-4"><v-col><h1 class="text-h5 font-weight-bold">Mobile Applications</h1><p class="body-2 grey--text">ELoyer mobile app for iOS and Android</p></v-col></v-row>
    <v-row>
      <v-col cols="12" md="4" v-for="app in apps" :key="app.platform">
        <v-card outlined class="pa-4 text-center">
          <v-icon x-large :color="app.color" class="mb-3">{{ app.icon }}</v-icon>
          <div class="subtitle-1 font-weight-bold mb-1">{{ app.platform }}</div>
          <v-chip small :color="app.status === 'available' ? 'success' : 'orange'" dark class="mb-3">{{ app.statusLabel }}</v-chip>
          <p class="caption grey--text">{{ app.desc }}</p>
          <v-btn v-if="app.status === 'available'" color="black" dark block small class="mt-3"><v-icon left small>{{ app.icon }}</v-icon>Download</v-btn>
          <v-btn v-else outlined block small class="mt-3" disabled>Coming Soon</v-btn>
        </v-card>
      </v-col>
    </v-row>
    <v-card outlined class="pa-4 mt-4">
      <v-card-title class="subtitle-1 pb-2">Mobile Features</v-card-title>
      <v-divider class="mb-3"></v-divider>
      <v-row>
        <v-col cols="6" md="3" v-for="f in features" :key="f"><v-chip outlined class="ma-1"><v-icon left small>mdi-check</v-icon>{{ f }}</v-chip></v-col>
      </v-row>
    </v-card>
  </v-container>
</template>
<script>
export default {
  name: 'MobileApps',
  data() {
    return {
      apps: [
        { platform: 'iOS', icon: 'mdi-apple', color: 'grey darken-3', status: 'coming_soon', statusLabel: 'Q4 2026', desc: 'Native iOS app for iPhone and iPad with full case management.' },
        { platform: 'Android', icon: 'mdi-android', color: 'green darken-1', status: 'coming_soon', statusLabel: 'Q4 2026', desc: 'Android app for phones and tablets. Supports offline mode.' },
        { platform: 'Web App (PWA)', icon: 'mdi-web', color: 'blue darken-1', status: 'available', statusLabel: 'Available Now', desc: 'Install ELoyer as a Progressive Web App — works on all devices.' },
      ],
      features: ['Case management','Document upload','Client messaging','Push notifications','Offline document access','Biometric login','Calendar sync','E-signature'],
    };
  },
};
</script>
