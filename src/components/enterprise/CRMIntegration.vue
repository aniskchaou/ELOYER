<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">CRM Integration</h1><p class="body-2 grey--text">Sync clients and contacts with external CRM systems</p></v-col>
      <v-col cols="auto"><v-btn color="blue darken-2" dark @click="dialog=true"><v-icon left>mdi-plus</v-icon>Connect CRM</v-btn></v-col>
    </v-row>

    <v-row>
      <v-col v-for="crm in crms" :key="crm.id" cols="12" md="6">
        <v-card outlined class="pa-4">
          <div class="d-flex align-center mb-3">
            <v-icon large :color="providerColor(crm.provider)" class="mr-3">{{ providerIcon(crm.provider) }}</v-icon>
            <div>
              <div class="subtitle-2 font-weight-bold">{{ crm.label }}</div>
              <div class="caption grey--text text-capitalize">{{ crm.provider }} · {{ crm.instance_url || 'No URL' }}</div>
            </div>
            <v-spacer></v-spacer>
            <v-switch v-model="crm.is_active" inset hide-details @change="toggle(crm)"></v-switch>
          </div>
          <v-divider class="mb-2"></v-divider>
          <div class="d-flex justify-space-between align-center">
            <span class="caption grey--text">Last sync: {{ crm.last_synced_at ? new Date(crm.last_synced_at).toLocaleString() : 'Never' }}</span>
            <v-btn x-small color="blue" dark :loading="syncing === crm.id" @click="sync(crm)"><v-icon left x-small>mdi-sync</v-icon>Sync Now</v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
    <v-alert v-if="!loading && !crms.length" type="info" outlined class="mt-4">No CRM connected yet. Connect Salesforce, HubSpot or a custom CRM.</v-alert>

    <v-card outlined class="pa-4 mt-4">
      <v-card-title class="subtitle-1 pb-2">Supported Integrations</v-card-title>
      <v-divider class="mb-3"></v-divider>
      <v-row>
        <v-col v-for="p in providers" :key="p.name" cols="6" md="3" class="text-center">
          <v-icon :color="p.color" x-large>{{ p.icon }}</v-icon>
          <div class="caption mt-1">{{ p.name }}</div>
          <v-chip x-small :color="p.available ? 'success' : 'grey'" dark class="mt-1">{{ p.available ? 'Available' : 'Coming Soon' }}</v-chip>
        </v-col>
      </v-row>
    </v-card>

    <v-dialog v-model="dialog" max-width="480">
      <v-card>
        <v-card-title>Connect CRM</v-card-title><v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-select v-model="form.provider" :items="['salesforce','hubspot','zoho','custom']" label="CRM Provider" outlined dense class="mb-2"></v-select>
          <v-text-field v-model="form.label" label="Label / Name" outlined dense class="mb-2"></v-text-field>
          <v-text-field v-model="form.instance_url" label="Instance URL" outlined dense class="mb-2" placeholder="https://yourcompany.salesforce.com"></v-text-field>
          <v-text-field v-model="form.api_key" label="API Key / Token" outlined dense type="password"></v-text-field>
          <v-alert v-if="err" type="error" dense class="mt-2">{{ err }}</v-alert>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="dialog=false">Cancel</v-btn><v-btn color="blue darken-2" dark :loading="saving" @click="connect">Connect</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>
<script>
import { entGetCRM, entCreateCRM, entToggleCRM, entSyncCRM } from '@/services/enterpriseApi';
export default {
  name: 'CRMIntegration',
  data() {
    return {
      crms: [], loading: true, dialog: false, saving: false, syncing: null, err: '',
      form: { provider: 'salesforce', label: '', instance_url: '', api_key: '' },
      providers: [
        { name: 'Salesforce', icon: 'mdi-cloud', color: 'blue darken-2', available: true },
        { name: 'HubSpot', icon: 'mdi-hub', color: 'orange darken-2', available: true },
        { name: 'Zoho CRM', icon: 'mdi-account-network', color: 'red darken-1', available: true },
        { name: 'Custom API', icon: 'mdi-api', color: 'grey', available: true },
      ],
      snack: false, snackMsg: '', snackColor: 'success',
    };
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.crms = await entGetCRM(); }
      catch (e) { console.error(e); }
      finally { this.loading = false; }
    },
    async connect() {
      if (!this.form.provider || !this.form.label) { this.err = 'Provider and label required.'; return; }
      this.saving = true;
      try { await entCreateCRM(this.form); this.notify('CRM connected.'); this.dialog = false; this.load(); }
      catch (e) { this.err = e.message; }
      finally { this.saving = false; }
    },
    async toggle(crm) {
      try { await entToggleCRM(crm.id); this.notify(`${crm.is_active ? 'Enabled' : 'Disabled'}.`); }
      catch (e) { this.notify(e.message, 'error'); }
    },
    async sync(crm) {
      this.syncing = crm.id;
      try { const r = await entSyncCRM(crm.id); this.notify(`Synced ${r.synced_records} records.`); this.load(); }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.syncing = null; }
    },
    providerIcon(p) { const m = { salesforce:'mdi-cloud', hubspot:'mdi-hub', zoho:'mdi-account-network', custom:'mdi-api' }; return m[p] || 'mdi-api'; },
    providerColor(p) { const m = { salesforce:'blue darken-2', hubspot:'orange darken-2', zoho:'red darken-1', custom:'grey' }; return m[p] || 'grey'; },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
