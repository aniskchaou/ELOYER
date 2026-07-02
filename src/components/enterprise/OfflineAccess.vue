<template>
  <v-container fluid>
    <v-row class="mb-4"><v-col><h1 class="text-h5 font-weight-bold">Offline Document Access</h1><p class="body-2 grey--text">Access critical documents without internet connectivity</p></v-col></v-row>
    <v-row>
      <v-col cols="12" md="5">
        <v-card outlined class="pa-4">
          <v-card-title class="subtitle-1 pb-2">Offline Sync Status</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <div class="text-center mb-4">
            <v-icon x-large color="blue darken-2">mdi-cloud-sync</v-icon>
            <div class="subtitle-1 font-weight-bold mt-2">Last Sync: {{ lastSync }}</div>
            <v-chip small color="success" dark class="mt-1">All documents up to date</v-chip>
          </div>
          <v-list dense>
            <v-list-item><v-list-item-content><v-list-item-title>Synced Documents</v-list-item-title></v-list-item-content><v-list-item-action><v-chip small>24</v-chip></v-list-item-action></v-list-item>
            <v-list-item><v-list-item-content><v-list-item-title>Cache Size</v-list-item-title></v-list-item-content><v-list-item-action><v-chip small>148 MB</v-chip></v-list-item-action></v-list-item>
            <v-list-item><v-list-item-content><v-list-item-title>Max Cache</v-list-item-title></v-list-item-content><v-list-item-action><v-chip small>2 GB</v-chip></v-list-item-action></v-list-item>
          </v-list>
          <v-btn color="blue darken-2" dark block class="mt-3" @click="sync" :loading="syncing"><v-icon left>mdi-sync</v-icon>Sync Now</v-btn>
        </v-card>
      </v-col>
      <v-col cols="12" md="7">
        <v-card outlined class="pa-4">
          <v-card-title class="subtitle-1 pb-2">Offline Capabilities</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-list dense>
            <v-list-item v-for="c in capabilities" :key="c.label">
              <v-list-item-icon><v-icon :color="c.available ? 'success' : 'grey'" small>{{ c.available ? 'mdi-check-circle' : 'mdi-close-circle' }}</v-icon></v-list-item-icon>
              <v-list-item-content><v-list-item-title>{{ c.label }}</v-list-item-title><v-list-item-subtitle>{{ c.desc }}</v-list-item-subtitle></v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
    <v-snackbar v-model="snack" color="success" top>Documents synced successfully.</v-snackbar>
  </v-container>
</template>
<script>
export default {
  name: 'OfflineAccess',
  data() {
    return {
      syncing: false, snack: false, lastSync: new Date().toLocaleTimeString(),
      capabilities: [
        { label: 'View Case Documents', desc: 'Read downloaded documents without internet', available: true },
        { label: 'Review Contracts', desc: 'Offline contract and template access', available: true },
        { label: 'View Client Notes', desc: 'Access saved case notes offline', available: true },
        { label: 'Edit Documents', desc: 'Edit and queue changes for sync', available: false },
        { label: 'Submit Filings', desc: 'Requires internet connection', available: false },
        { label: 'Search Database', desc: 'Full-text search requires connection', available: false },
      ],
    };
  },
  methods: {
    sync() {
      this.syncing = true;
      setTimeout(() => {
        this.syncing = false; this.snack = true;
        this.lastSync = new Date().toLocaleTimeString();
      }, 1500);
    },
  },
};
</script>
