<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Sign Documents</h1><p class="body-2 grey--text">Review and electronically sign documents requested by your lawyer</p></v-col>
    </v-row>

    <v-alert v-if="pending.length" type="warning" outlined class="mb-4">
      <strong>{{ pending.length }} document{{ pending.length > 1 ? 's' : '' }} awaiting your signature.</strong>
    </v-alert>

    <v-card outlined :loading="loading">
      <v-data-table :headers="headers" :items="requests" dense class="elevation-0">
        <template v-slot:item.status="{ item }"><v-chip x-small :color="statusColor(item.status)" dark>{{ item.status }}</v-chip></template>
        <template v-slot:item.sent_at="{ item }">{{ item.sent_at ? new Date(item.sent_at).toLocaleDateString() : '—' }}</template>
        <template v-slot:item.actions="{ item }">
          <v-btn v-if="item.status==='pending'" small color="teal" dark @click="openSign(item)">
            <v-icon left small>mdi-draw</v-icon>Sign Now
          </v-btn>
          <v-chip v-else-if="item.status==='signed'" x-small color="success" dark>Signed {{ new Date(item.completed_at).toLocaleDateString() }}</v-chip>
        </template>
      </v-data-table>
    </v-card>

    <!-- Sign Dialog -->
    <v-dialog v-model="signDialog" max-width="500">
      <v-card v-if="selected">
        <v-card-title>Sign: {{ selected.document_title }}</v-card-title><v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-alert type="info" outlined dense>By clicking "Sign", you agree to electronically sign this document. This action is legally binding.</v-alert>
          <div class="mt-3 body-2"><strong>Document:</strong> {{ selected.document_title }}</div>
          <div class="body-2"><strong>Case:</strong> {{ selected.case_title }}</div>
          <v-divider class="my-3"></v-divider>
          <div class="caption grey--text">Draw your signature:</div>
          <div class="mt-2 pa-2" style="border:2px dashed #90a4ae;border-radius:4px;min-height:80px;background:#f5f5f5;text-align:center">
            <v-icon x-large color="grey lighten-1" class="mt-2">mdi-draw</v-icon>
            <div class="caption grey--text mt-1">(Signature pad — click Sign to apply)</div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="signDialog=false">Cancel</v-btn>
          <v-btn color="teal" dark :loading="signing" @click="doSign">Apply Signature</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>
<script>
import { cpGetESignature, cpSignDocument } from '@/services/portalApi';
const CLIENT_ID = 1;
export default {
  name: 'ClientESignature',
  data() {
    return {
      requests: [], loading: true, signDialog: false, signing: false, selected: null,
      snack: false, snackMsg: '', snackColor: 'success',
      headers: [
        { text: 'Document', value: 'document_title' },
        { text: 'Case', value: 'case_title' },
        { text: 'Provider', value: 'provider' },
        { text: 'Sent', value: 'sent_at' },
        { text: 'Status', value: 'status' },
        { text: '', value: 'actions', sortable: false, align: 'end' },
      ],
    };
  },
  computed: {
    pending() { return this.requests.filter(r => r.status === 'pending'); },
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.requests = await cpGetESignature(CLIENT_ID); }
      catch (e) { console.error(e); }
      finally { this.loading = false; }
    },
    openSign(r) { this.selected = r; this.signDialog = true; },
    async doSign() {
      this.signing = true;
      try { await cpSignDocument(this.selected.id); this.notify('Document signed successfully!'); this.signDialog = false; this.load(); }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.signing = false; }
    },
    statusColor(s) { return s === 'signed' ? 'success' : s === 'pending' ? 'orange' : 'grey'; },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
