<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col>
        <h1 class="text-h5 font-weight-bold">Storage Management</h1>
        <p class="body-2 grey--text">Monitor file storage across all tenants and configure providers</p>
      </v-col>
      <v-col cols="auto">
        <v-btn color="deep-purple darken-3" dark :loading="saving" @click="saveStorage">
          <v-icon left>mdi-content-save</v-icon>Save
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <!-- Usage Overview -->
      <v-col cols="12" md="5">
        <v-card outlined class="pa-4 mb-4">
          <v-card-title class="subtitle-1 pb-2">Usage Overview</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <div class="text-h4 font-weight-bold mb-1">{{ toGB(storage.used_bytes) }} GB</div>
          <div class="caption grey--text mb-3">of {{ toGB(storage.quota_bytes) }} GB quota</div>
          <v-progress-linear :value="pct" :color="pct > 80 ? 'error' : pct > 60 ? 'warning' : 'blue'" height="14" rounded></v-progress-linear>
          <div class="caption mt-1">{{ pct }}% used · {{ toGB(storage.quota_bytes - storage.used_bytes) }} GB free</div>
        </v-card>

        <!-- Breakdown mock -->
        <v-card outlined class="pa-4">
          <v-card-title class="subtitle-1 pb-2">Storage by Type</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-list dense>
            <v-list-item v-for="item in breakdown" :key="item.type">
              <v-list-item-icon><v-icon :color="item.color" small>{{ item.icon }}</v-icon></v-list-item-icon>
              <v-list-item-content><v-list-item-title>{{ item.type }}</v-list-item-title></v-list-item-content>
              <v-list-item-action><v-chip small :color="item.color" dark>{{ item.size }}</v-chip></v-list-item-action>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Configuration -->
      <v-col cols="12" md="7">
        <v-card outlined class="pa-4">
          <v-card-title class="subtitle-1 pb-2">Storage Provider</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-select v-model="storage.provider" :items="providers" label="Provider" outlined dense class="mb-3"></v-select>
          <v-text-field v-model="quotaGB" label="Storage Quota (GB)" outlined dense type="number" class="mb-3"></v-text-field>

          <template v-if="storage.provider === 's3'">
            <v-text-field v-model="s3.bucket" label="S3 Bucket" outlined dense class="mb-2"></v-text-field>
            <v-text-field v-model="s3.region" label="AWS Region" outlined dense class="mb-2"></v-text-field>
            <v-text-field v-model="s3.access_key" label="Access Key" outlined dense class="mb-2"></v-text-field>
            <v-text-field v-model="s3.secret_key" label="Secret Key" outlined dense type="password"></v-text-field>
          </template>
          <template v-else-if="storage.provider === 'azure'">
            <v-text-field v-model="azure.container" label="Container Name" outlined dense class="mb-2"></v-text-field>
            <v-text-field v-model="azure.connection_string" label="Connection String" outlined dense type="password"></v-text-field>
          </template>
          <template v-else-if="storage.provider === 'gcs'">
            <v-text-field v-model="gcs.bucket" label="GCS Bucket" outlined dense class="mb-2"></v-text-field>
            <v-text-field v-model="gcs.project_id" label="Project ID" outlined dense></v-text-field>
          </template>
          <v-alert v-else type="info" dense outlined class="mt-2">Using local filesystem storage. Switch to a cloud provider for scalability.</v-alert>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>

<script>
import { saGetStorage, saUpdateStorage } from '@/services/superadminApi';
export default {
  name: 'StorageManagement',
  data() {
    return {
      storage: { provider: 'local', used_bytes: 0, quota_bytes: 10737418240 },
      loading: true, saving: false,
      s3: {}, azure: {}, gcs: {},
      providers: ['local', 's3', 'azure', 'gcs'],
      snack: false, snackMsg: '', snackColor: 'success',
      breakdown: [
        { type: 'Case Documents', size: '1.8 GB', color: 'blue', icon: 'mdi-file-document' },
        { type: 'Evidence Files', size: '890 MB', color: 'orange', icon: 'mdi-paperclip' },
        { type: 'Profile Photos', size: '45 MB', color: 'teal', icon: 'mdi-account' },
        { type: 'System Logs', size: '320 MB', color: 'grey', icon: 'mdi-file-code' },
      ],
    };
  },
  computed: {
    pct() { return this.storage.quota_bytes ? Math.round((this.storage.used_bytes / this.storage.quota_bytes) * 100) : 0; },
    quotaGB: {
      get() { return Math.round(this.storage.quota_bytes / 1073741824); },
      set(v) { this.storage.quota_bytes = Number(v) * 1073741824; },
    },
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.storage = await saGetStorage(); }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.loading = false; }
    },
    async saveStorage() {
      this.saving = true;
      const settings = this.storage.provider === 's3' ? this.s3 : this.storage.provider === 'azure' ? this.azure : this.storage.provider === 'gcs' ? this.gcs : {};
      try {
        await saUpdateStorage({ provider: this.storage.provider, quota_bytes: this.storage.quota_bytes, settings });
        this.notify('Storage config saved.');
      } catch (e) { this.notify(e.message, 'error'); }
      finally { this.saving = false; }
    },
    toGB(bytes) { return ((bytes || 0) / 1073741824).toFixed(1); },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
