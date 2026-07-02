<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Custom Domains</h1><p class="body-2 grey--text">Use your firm's own domain (e.g. portal.yourfirm.com)</p></v-col>
      <v-col cols="auto"><v-btn color="green darken-1" dark @click="dialog=true"><v-icon left>mdi-plus</v-icon>Add Domain</v-btn></v-col>
    </v-row>
    <v-card outlined :loading="loading">
      <v-data-table :headers="headers" :items="domains" dense class="elevation-0">
        <template v-slot:item.status="{ item }"><v-chip x-small :color="item.status==='active'?'success':item.status==='pending'?'orange':'error'" dark>{{ item.status }}</v-chip></template>
        <template v-slot:item.ssl_enabled="{ item }"><v-icon :color="item.ssl_enabled ? 'success' : 'grey'" small>{{ item.ssl_enabled ? 'mdi-lock' : 'mdi-lock-open' }}</v-icon></template>
        <template v-slot:item.actions="{ item }">
          <v-btn x-small outlined color="success" @click="verify(item)" v-if="item.status==='pending'" :loading="verifying === item.id">Verify DNS</v-btn>
          <v-btn icon small color="error" @click="del(item)"><v-icon small>mdi-delete</v-icon></v-btn>
        </template>
      </v-data-table>
    </v-card>

    <v-card outlined class="pa-4 mt-4" v-if="selected">
      <v-card-title class="subtitle-1 pb-2">DNS Setup Instructions for {{ selected.domain }}</v-card-title>
      <v-divider class="mb-3"></v-divider>
      <p class="body-2">Add the following TXT record to your DNS provider to verify ownership:</p>
      <v-alert outlined class="body-2 font-weight-bold" style="font-family:monospace">{{ selected.dns_txt_record }}</v-alert>
      <p class="caption grey--text">DNS propagation can take up to 48 hours. After adding the TXT record, click "Verify DNS".</p>
    </v-card>

    <v-dialog v-model="dialog" max-width="440">
      <v-card>
        <v-card-title>Add Custom Domain</v-card-title><v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-text-field v-model="newDomain" label="Domain Name *" outlined dense placeholder="portal.yourfirm.com" class="mb-2"></v-text-field>
          <v-alert type="info" dense outlined class="caption">After adding, you will receive DNS verification instructions.</v-alert>
          <v-alert v-if="err" type="error" dense class="mt-2">{{ err }}</v-alert>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="dialog=false">Cancel</v-btn><v-btn color="green darken-1" dark :loading="saving" @click="addDomain">Add Domain</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>
<script>
import { entGetDomains, entAddDomain, entVerifyDomain, entDeleteDomain } from '@/services/enterpriseApi';
export default {
  name: 'CustomDomains',
  data() {
    return {
      domains: [], loading: true, dialog: false, saving: false, verifying: null, err: '', newDomain: '', selected: null,
      snack: false, snackMsg: '', snackColor: 'success',
      headers: [
        { text: 'Domain', value: 'domain' }, { text: 'Status', value: 'status' },
        { text: 'SSL', value: 'ssl_enabled' }, { text: '', value: 'actions', sortable: false, align: 'end' },
      ],
    };
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.domains = await entGetDomains(); }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.loading = false; }
    },
    async addDomain() {
      if (!this.newDomain) { this.err = 'Domain required.'; return; }
      this.saving = true;
      try { const d = await entAddDomain({ domain: this.newDomain }); this.selected = d; this.notify('Domain added. Check DNS instructions below.'); this.dialog = false; this.load(); }
      catch (e) { this.err = e.message; }
      finally { this.saving = false; }
    },
    async verify(d) {
      this.verifying = d.id;
      try { await entVerifyDomain(d.id); this.notify('Domain verified and SSL enabled!'); this.load(); }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.verifying = null; }
    },
    async del(d) {
      if (!confirm(`Remove domain ${d.domain}?`)) return;
      try { await entDeleteDomain(d.id); this.notify('Domain removed.', 'warning'); this.load(); }
      catch (e) { this.notify(e.message, 'error'); }
    },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
