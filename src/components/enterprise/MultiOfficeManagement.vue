<template>
  <v-container fluid>
    <v-row class="mb-4"><v-col><h1 class="text-h5 font-weight-bold">Multi-Office Management</h1><p class="body-2 grey--text">Manage multiple office locations and their staff</p></v-col>
    <v-col cols="auto"><v-btn color="red lighten-1" dark to="/firmadmin/locations"><v-icon left>mdi-arrow-right</v-icon>Manage Locations</v-btn></v-col></v-row>
    <v-row>
      <v-col cols="12" md="8">
        <v-card outlined :loading="loading">
          <v-card-title class="subtitle-1">Office Network</v-card-title>
          <v-list dense>
            <v-list-item v-for="o in offices" :key="o.id">
              <v-list-item-avatar :color="o.is_hq ? 'red' : 'blue-grey'" size="36"><v-icon dark small>{{ o.is_hq ? 'mdi-star' : 'mdi-office-building' }}</v-icon></v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title>{{ o.name }}</v-list-item-title>
                <v-list-item-subtitle>{{ o.address }}, {{ o.city }} · {{ o.phone }}</v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-chip x-small :color="o.is_hq ? 'red' : 'blue-grey'" dark>{{ o.is_hq ? 'HQ' : 'Branch' }}</v-chip>
              </v-list-item-action>
            </v-list-item>
            <v-list-item v-if="!offices.length"><v-list-item-content><v-list-item-subtitle>No offices configured yet.</v-list-item-subtitle></v-list-item-content></v-list-item>
          </v-list>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card outlined class="pa-4">
          <v-card-title class="subtitle-1 pb-2">Office Features</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-list dense>
            <v-list-item v-for="f in features" :key="f"><v-list-item-icon><v-icon small color="red lighten-1">mdi-check</v-icon></v-list-item-icon><v-list-item-content><v-list-item-title>{{ f }}</v-list-item-title></v-list-item-content></v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import { faGetLocations } from '@/services/firmadminApi';
export default {
  name: 'MultiOfficeManagement',
  data() { return { offices: [], loading: true, features: ['Per-office billing','Office-specific staff assignment','Inter-office case transfer','Office performance reports','Location-based client portal','Per-office branding'] }; },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.offices = await faGetLocations(); }
      catch (e) { console.error(e); }
      finally { this.loading = false; }
    },
  },
};
</script>
