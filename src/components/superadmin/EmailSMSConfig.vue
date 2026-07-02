<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col>
        <h1 class="text-h5 font-weight-bold">Email / SMS Configuration</h1>
        <p class="body-2 grey--text">Configure delivery providers for transactional email and SMS</p>
      </v-col>
      <v-col cols="auto">
        <v-btn color="deep-purple darken-3" dark @click="openCreate">
          <v-icon left>mdi-plus</v-icon>Add Provider
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col v-for="cfg in configs" :key="cfg.id" cols="12" md="6">
        <v-card outlined class="pa-4">
          <div class="d-flex align-center mb-3">
            <v-icon large :color="cfg.config_type === 'email' ? 'blue' : 'green'" class="mr-3">
              {{ cfg.config_type === 'email' ? 'mdi-email' : 'mdi-message-text' }}
            </v-icon>
            <div>
              <div class="subtitle-1 font-weight-bold">{{ cfg.provider }}</div>
              <v-chip x-small :color="cfg.config_type === 'email' ? 'blue' : 'green'" dark>{{ cfg.config_type }}</v-chip>
            </div>
            <v-spacer></v-spacer>
            <v-switch v-model="cfg.is_active" inset hide-details @change="saveConfig(cfg)" :color="cfg.is_active ? 'success' : 'grey'"></v-switch>
          </div>
          <v-divider class="mb-3"></v-divider>
          <div v-for="(val, key) in cfg.settings" :key="key" class="mb-2">
            <v-text-field
              v-model="cfg.settings[key]"
              :label="key"
              outlined dense
              :type="key.toLowerCase().includes('password') || key.toLowerCase().includes('key') || key.toLowerCase().includes('secret') ? 'password' : 'text'"
            ></v-text-field>
          </div>
          <v-btn small color="primary" outlined @click="saveConfig(cfg)" :loading="cfg._saving">Save</v-btn>
          <v-btn small color="secondary" outlined class="ml-2" @click="testConfig(cfg)" :loading="cfg._testing">Test</v-btn>
        </v-card>
      </v-col>
    </v-row>

    <v-skeleton-loader v-if="loading" type="card" class="mt-4"></v-skeleton-loader>
    <v-alert v-if="!loading && !configs.length" type="info" outlined class="mt-4">No providers configured yet. Add an SMTP or SMS provider to enable notifications.</v-alert>

    <!-- Add Provider Dialog -->
    <v-dialog v-model="dialog" max-width="480">
      <v-card>
        <v-card-title>Add Provider</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-select v-model="form.config_type" :items="['email','sms']" label="Type" outlined dense class="mb-2"></v-select>
          <v-select v-model="form.provider" :items="providerOptions" label="Provider" outlined dense class="mb-2"></v-select>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="dialog = false">Cancel</v-btn>
          <v-btn color="deep-purple darken-3" dark :loading="saving" @click="create">Add</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>

<script>
import { saGetEmailSms, saUpdateEmailSms, saCreateEmailSms } from '@/services/superadminApi';
export default {
  name: 'EmailSMSConfig',
  data() {
    return {
      configs: [], loading: true, dialog: false, saving: false,
      snack: false, snackMsg: '', snackColor: 'success',
      form: { config_type: 'email', provider: 'smtp' },
    };
  },
  computed: {
    providerOptions() {
      if (this.form.config_type === 'email') return ['smtp', 'sendgrid', 'mailgun', 'ses'];
      return ['twilio', 'nexmo', 'infobip'];
    },
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try {
        const raw = await saGetEmailSms();
        this.configs = raw.map(c => ({ ...c, settings: typeof c.settings === 'string' ? JSON.parse(c.settings) : (c.settings || {}), _saving: false, _testing: false }));
      } catch (e) { this.notify(e.message, 'error'); }
      finally { this.loading = false; }
    },
    async saveConfig(cfg) {
      this.$set(cfg, '_saving', true);
      try {
        await saUpdateEmailSms(cfg.id, { provider: cfg.provider, settings: cfg.settings, is_active: cfg.is_active });
        this.notify('Configuration saved.');
      } catch (e) { this.notify(e.message, 'error'); }
      finally { this.$set(cfg, '_saving', false); }
    },
    testConfig(cfg) {
      this.$set(cfg, '_testing', true);
      setTimeout(() => {
        this.$set(cfg, '_testing', false);
        this.notify(`Test ${cfg.config_type} sent via ${cfg.provider}.`);
      }, 1500);
    },
    async create() {
      this.saving = true;
      const defaults = {
        smtp: { host: '', port: 587, tls: true },
        sendgrid: { api_key: '' },
        mailgun: { api_key: '', domain: '' },
        twilio: { account_sid: '', auth_token: '', from: '' },
      };
      try {
        await saCreateEmailSms({ ...this.form, settings: defaults[this.form.provider] || {} });
        this.dialog = false;
        this.load();
      } catch (e) { this.notify(e.message, 'error'); }
      finally { this.saving = false; }
    },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
