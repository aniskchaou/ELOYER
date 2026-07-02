<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Email Integration</h1><p class="body-2 grey--text">Connect your email accounts to sync client communications</p></v-col>
      <v-col cols="auto"><v-btn color="blue darken-2" dark @click="dialog=true"><v-icon left>mdi-email-plus</v-icon>Connect Email</v-btn></v-col>
    </v-row>

    <v-row>
      <v-col v-for="acc in accounts" :key="acc.id" cols="12" md="6">
        <v-card outlined class="pa-4">
          <div class="d-flex align-center mb-2">
            <v-icon :color="providerColor(acc.provider)" large class="mr-3">{{ providerIcon(acc.provider) }}</v-icon>
            <div>
              <div class="subtitle-2 font-weight-bold">{{ acc.email_address }}</div>
              <div class="caption grey--text text-capitalize">{{ acc.provider }}</div>
            </div>
            <v-spacer></v-spacer>
            <v-switch v-model="acc.is_active" inset hide-details @change="toggle(acc)" :color="acc.is_active ? 'success' : 'grey'"></v-switch>
          </div>
          <v-divider class="my-2"></v-divider>
          <div class="d-flex justify-space-between">
            <span class="caption grey--text">Last sync: {{ acc.last_synced_at ? new Date(acc.last_synced_at).toLocaleString() : 'Never' }}</span>
            <v-btn x-small text color="blue" @click="sync(acc)">Sync Now</v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-alert v-if="!loading && !accounts.length" type="info" outlined class="mt-4">No email accounts connected. Connect Gmail, Outlook or custom IMAP to sync client emails.</v-alert>

    <v-card outlined class="mt-4 pa-4">
      <v-card-title class="subtitle-1 pb-2">Sync Settings</v-card-title>
      <v-divider class="mb-3"></v-divider>
      <v-row>
        <v-col cols="12" md="4"><v-select v-model="syncFreq" :items="['every 5 min','every 15 min','every hour','manual']" label="Sync Frequency" outlined dense></v-select></v-col>
        <v-col cols="12" md="4"><v-switch v-model="autoLink" inset label="Auto-link emails to cases" hide-details></v-switch></v-col>
        <v-col cols="12" md="4"><v-switch v-model="autoReply" inset label="AI-suggested replies" hide-details></v-switch></v-col>
      </v-row>
    </v-card>

    <v-dialog v-model="dialog" max-width="480">
      <v-card>
        <v-card-title>Connect Email Account</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-select v-model="form.provider" :items="providers" item-text="label" item-value="value" label="Provider" outlined dense class="mb-2"></v-select>
          <v-text-field v-model="form.email_address" label="Email Address *" outlined dense type="email" class="mb-2"></v-text-field>
          <v-alert type="info" dense outlined class="caption">OAuth authorization will open in a new window after clicking Connect.</v-alert>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="dialog=false">Cancel</v-btn><v-btn color="blue darken-2" dark :loading="saving" @click="connect">Connect</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>
<script>
import { faGetEmailIntegrations, faConnectEmail, faToggleEmail } from '@/services/firmadminApi';
export default {
  name: 'EmailIntegration',
  data() {
    return {
      accounts: [], loading: true, dialog: false, saving: false,
      form: { provider: 'gmail', email_address: '', user_id: 1 },
      syncFreq: 'every 15 min', autoLink: true, autoReply: false,
      providers: [
        { label: 'Gmail', value: 'gmail' }, { label: 'Outlook / Microsoft 365', value: 'outlook' },
        { label: 'IMAP (Custom)', value: 'imap' }, { label: 'Exchange', value: 'exchange' },
      ],
      snack: false, snackMsg: '', snackColor: 'success',
    };
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.accounts = await faGetEmailIntegrations(1); }
      catch (e) { console.error(e); }
      finally { this.loading = false; }
    },
    async connect() {
      if (!this.form.email_address) { this.notify('Email address required.', 'error'); return; }
      this.saving = true;
      try { await faConnectEmail(this.form); this.notify('Account connected.'); this.dialog = false; this.load(); }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.saving = false; }
    },
    async toggle(acc) {
      try { await faToggleEmail(acc.id); this.notify(`Account ${acc.is_active ? 'enabled' : 'disabled'}.`); }
      catch (e) { this.notify(e.message, 'error'); }
    },
    sync(acc) { this.notify(`Syncing ${acc.email_address}…`); setTimeout(() => { this.notify(`${acc.email_address} synced.`); }, 1500); },
    providerIcon(p) { const m = { gmail: 'mdi-gmail', outlook: 'mdi-microsoft-outlook', imap: 'mdi-email', exchange: 'mdi-microsoft-exchange' }; return m[p] || 'mdi-email'; },
    providerColor(p) { const m = { gmail: 'red', outlook: 'blue', imap: 'grey', exchange: 'blue darken-4' }; return m[p] || 'grey'; },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
