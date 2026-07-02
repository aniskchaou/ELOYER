<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col>
        <h1 class="text-h5 font-weight-bold">Global Settings</h1>
        <p class="body-2 grey--text">Platform-wide configuration for the SaaS</p>
      </v-col>
      <v-col cols="auto">
        <v-btn color="deep-purple darken-3" dark :loading="saving" @click="save">
          <v-icon left>mdi-content-save</v-icon>Save Changes
        </v-btn>
      </v-col>
    </v-row>

    <v-skeleton-loader v-if="loading" type="card, card" class="mb-4"></v-skeleton-loader>

    <v-row v-else>
      <v-col cols="12" md="6">
        <v-card outlined class="pa-4 mb-4">
          <v-card-title class="subtitle-1 pb-2">General</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-text-field v-model="settings.platform_name" label="Platform Name" outlined dense class="mb-2"></v-text-field>
          <v-text-field v-model="settings.support_email" label="Support Email" outlined dense class="mb-2" type="email"></v-text-field>
          <v-text-field v-model="settings.max_tenants" label="Max Tenants" outlined dense class="mb-2" type="number"></v-text-field>
          <v-select v-model="settings.default_plan" :items="['starter','pro','business','enterprise']" label="Default Plan for New Tenants" outlined dense></v-select>
        </v-card>

        <v-card outlined class="pa-4">
          <v-card-title class="subtitle-1 pb-2">Access Control</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-switch v-model="maintenanceMode" label="Maintenance Mode" inset color="orange darken-2" hide-details class="mb-2"></v-switch>
          <v-switch v-model="registrationOpen" label="Open Registration (self-signup)" inset color="green" hide-details></v-switch>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card outlined class="pa-4 mb-4">
          <v-card-title class="subtitle-1 pb-2">Infrastructure</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-text-field v-model="settings.smtp_host" label="SMTP Host" outlined dense class="mb-2"></v-text-field>
          <v-text-field v-model="settings.smtp_port" label="SMTP Port" outlined dense class="mb-2" type="number"></v-text-field>
          <v-select v-model="settings.storage_provider" :items="['local','s3','azure','gcs']" label="Storage Provider" outlined dense class="mb-2"></v-select>
          <v-select v-model="settings.ai_provider" :items="['openai','anthropic','gemini','local']" label="AI Provider" outlined dense></v-select>
        </v-card>

        <v-card outlined class="pa-4">
          <v-card-title class="subtitle-1 pb-2">Backup & Compliance</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-select v-model="settings.backup_schedule" :items="['hourly','daily','weekly','monthly']" label="Backup Schedule" outlined dense class="mb-2"></v-select>
          <v-select v-model="settings.sms_provider" :items="['twilio','nexmo','infobip','none']" label="SMS Provider" outlined dense></v-select>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>

<script>
import { saGetSettings, saUpdateSettings } from '@/services/superadminApi';
export default {
  name: 'PlatformSettings',
  data() {
    return {
      settings: {}, loading: true, saving: false,
      snack: false, snackMsg: '', snackColor: 'success',
    };
  },
  computed: {
    maintenanceMode: {
      get() { return this.settings.maintenance_mode === 'true'; },
      set(v) { this.settings.maintenance_mode = v ? 'true' : 'false'; },
    },
    registrationOpen: {
      get() { return this.settings.registration_open !== 'false'; },
      set(v) { this.settings.registration_open = v ? 'true' : 'false'; },
    },
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try {
        const raw = await saGetSettings();
        const flat = {};
        for (const [k, v] of Object.entries(raw)) flat[k] = v.value;
        this.settings = flat;
      } catch (e) { this.notify(e.message, 'error'); }
      finally { this.loading = false; }
    },
    async save() {
      this.saving = true;
      try {
        await saUpdateSettings(this.settings);
        this.notify('Settings saved.');
      } catch (e) { this.notify(e.message, 'error'); }
      finally { this.saving = false; }
    },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
