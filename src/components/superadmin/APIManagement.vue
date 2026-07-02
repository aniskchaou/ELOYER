<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col>
        <h1 class="text-h5 font-weight-bold">API Key Management</h1>
        <p class="body-2 grey--text">Issue and revoke REST API keys for tenants</p>
      </v-col>
      <v-col cols="auto">
        <v-btn color="deep-purple darken-3" dark @click="openCreate">
          <v-icon left>mdi-key-plus</v-icon>Generate Key
        </v-btn>
      </v-col>
    </v-row>

    <v-card outlined>
      <v-data-table :headers="headers" :items="keys" :loading="loading" class="elevation-0">
        <template v-slot:item.key_prefix="{ item }">
          <code>{{ item.key_prefix }}…</code>
        </template>
        <template v-slot:item.is_active="{ item }">
          <v-chip small :color="item.is_active ? 'success' : 'grey'" dark>{{ item.is_active ? 'Active' : 'Revoked' }}</v-chip>
        </template>
        <template v-slot:item.expires_at="{ item }">
          {{ item.expires_at ? new Date(item.expires_at).toLocaleDateString() : 'Never' }}
        </template>
        <template v-slot:item.created_at="{ item }">
          {{ new Date(item.created_at).toLocaleDateString() }}
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn v-if="item.is_active" icon small color="error" @click="revoke(item)" title="Revoke">
            <v-icon small>mdi-key-remove</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Create Dialog -->
    <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-card-title>Generate API Key</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-text-field v-model="form.label" label="Label / Description *" outlined dense class="mb-2"></v-text-field>
          <v-select v-model="form.tenant_id" :items="tenants" item-text="name" item-value="id" label="Tenant (optional)" outlined dense clearable class="mb-2"></v-select>
          <v-combobox v-model="form.scopes" :items="['read','write','admin','billing','ai']" label="Scopes" multiple outlined dense chips small-chips class="mb-2"></v-combobox>
          <v-text-field v-model="form.expires_at" label="Expires At (leave blank = never)" outlined dense type="date"></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="dialog = false">Cancel</v-btn>
          <v-btn color="deep-purple darken-3" dark :loading="saving" @click="create">Generate</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Show new key once -->
    <v-dialog v-model="showKey" max-width="500">
      <v-card>
        <v-card-title><v-icon left color="success">mdi-check-circle</v-icon>Key Generated</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-alert type="warning" dense outlined>Copy this key now. It will not be shown again.</v-alert>
          <v-text-field :value="newRawKey" label="API Key" outlined dense readonly append-icon="mdi-content-copy" @click:append="copy"></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="success" @click="showKey = false">Done</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>

<script>
import { saGetApiKeys, saCreateApiKey, saRevokeApiKey, saGetTenants } from '@/services/superadminApi';
export default {
  name: 'APIManagement',
  data() {
    return {
      keys: [], tenants: [], loading: true, dialog: false, saving: false,
      showKey: false, newRawKey: '',
      snack: false, snackMsg: '', snackColor: 'success',
      form: { label: '', tenant_id: null, scopes: ['read'], expires_at: '' },
      headers: [
        { text: 'Label', value: 'label' },
        { text: 'Tenant', value: 'tenant_name' },
        { text: 'Prefix', value: 'key_prefix' },
        { text: 'Status', value: 'is_active' },
        { text: 'Expires', value: 'expires_at' },
        { text: 'Created', value: 'created_at' },
        { text: '', value: 'actions', sortable: false, align: 'end' },
      ],
    };
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { [this.keys, this.tenants] = await Promise.all([saGetApiKeys(), saGetTenants()]); }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.loading = false; }
    },
    openCreate() {
      this.form = { label: '', tenant_id: null, scopes: ['read'], expires_at: '' };
      this.dialog = true;
    },
    async create() {
      if (!this.form.label) { this.notify('Label required.', 'error'); return; }
      this.saving = true;
      try {
        const result = await saCreateApiKey({ ...this.form, expires_at: this.form.expires_at || null });
        this.newRawKey = result.raw_key;
        this.dialog = false;
        this.showKey = true;
        this.load();
      } catch (e) { this.notify(e.message, 'error'); }
      finally { this.saving = false; }
    },
    async revoke(key) {
      try {
        await saRevokeApiKey(key.id);
        this.notify('Key revoked.', 'warning');
        this.load();
      } catch (e) { this.notify(e.message, 'error'); }
    },
    copy() {
      navigator.clipboard.writeText(this.newRawKey);
      this.notify('Copied to clipboard.');
    },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
