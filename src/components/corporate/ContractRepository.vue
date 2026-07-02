<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Contract Repository</h1><p class="body-2 grey--text">All corporate contracts and agreements</p></v-col>
      <v-col cols="auto"><v-btn color="deep-orange" dark @click="open()"><v-icon left>mdi-plus</v-icon>Add Contract</v-btn></v-col>
    </v-row>
    <v-card outlined :loading="loading">
      <v-card-title>
        <v-text-field v-model="search" append-icon="mdi-magnify" label="Search…" single-line hide-details dense outlined style="max-width:260px"></v-text-field>
        <v-spacer></v-spacer>
        <v-select v-model="typeFilter" :items="['All','service','employment','nda','lease','partnership','loan']" dense outlined hide-details style="max-width:160px"></v-select>
      </v-card-title>
      <v-data-table :headers="headers" :items="filtered" :search="search" dense class="elevation-0">
        <template v-slot:item.status="{ item }"><v-chip x-small :color="statusColor(item.status)" dark>{{ item.status }}</v-chip></template>
        <template v-slot:item.contract_type="{ item }"><v-chip x-small outlined>{{ item.contract_type }}</v-chip></template>
        <template v-slot:item.value="{ item }">{{ item.value ? Number(item.value).toLocaleString() + ' TND' : '—' }}</template>
        <template v-slot:item.expires_at="{ item }">
          <span :class="isExpiringSoon(item.expires_at) ? 'orange--text' : ''">{{ item.expires_at || '—' }}</span>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn icon small @click="open(item)"><v-icon small>mdi-pencil</v-icon></v-btn>
          <v-btn icon small color="blue" :href="item.document_url||'#'" target="_blank" title="Download"><v-icon small>mdi-download</v-icon></v-btn>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="560">
      <v-card>
        <v-card-title>{{ editing ? 'Edit Contract' : 'Add Contract' }}</v-card-title><v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-row dense>
            <v-col cols="12"><v-text-field v-model="form.title" label="Title *" outlined dense></v-text-field></v-col>
            <v-col cols="6"><v-select v-model="form.contract_type" :items="['service','employment','nda','lease','partnership','loan','other']" label="Type" outlined dense></v-select></v-col>
            <v-col cols="6"><v-select v-model="form.status" :items="['draft','active','expired','terminated']" label="Status" outlined dense></v-select></v-col>
            <v-col cols="6"><v-text-field v-model="form.signed_at" label="Signed Date" outlined dense type="date"></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model="form.expires_at" label="Expiry Date" outlined dense type="date"></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model.number="form.value" label="Contract Value (TND)" outlined dense type="number"></v-text-field></v-col>
            <v-col cols="12"><v-textarea v-model="form.notes" label="Notes" outlined rows="2" auto-grow></v-textarea></v-col>
          </v-row>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="dialog=false">Cancel</v-btn><v-btn color="deep-orange" dark :loading="saving" @click="save">{{ editing ? 'Update' : 'Add' }}</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>
<script>
import { coGetContracts, coCreateContract } from '@/services/portalApi';
const CORP_ID = 1;
export default {
  name: 'ContractRepository',
  data() {
    return {
      contracts: [], loading: true, dialog: false, editing: null, saving: false, search: '', typeFilter: 'All',
      form: { corporate_id: CORP_ID, title: '', contract_type: 'service', status: 'active', signed_at: '', expires_at: '', value: null, notes: '' },
      snack: false, snackMsg: '', snackColor: 'success',
      headers: [
        { text: 'Title', value: 'title' }, { text: 'Type', value: 'contract_type' },
        { text: 'Status', value: 'status' }, { text: 'Value', value: 'value' },
        { text: 'Expires', value: 'expires_at' }, { text: '', value: 'actions', sortable: false, align: 'end' },
      ],
    };
  },
  computed: {
    filtered() { return this.typeFilter === 'All' ? this.contracts : this.contracts.filter(c => c.contract_type === this.typeFilter); },
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.contracts = await coGetContracts(CORP_ID); }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.loading = false; }
    },
    open(c = null) {
      this.editing = c;
      this.form = c ? { corporate_id: CORP_ID, title: c.title, contract_type: c.contract_type, status: c.status, signed_at: c.signed_at, expires_at: c.expires_at, value: c.value, notes: c.notes } : { corporate_id: CORP_ID, title: '', contract_type: 'service', status: 'active', signed_at: '', expires_at: '', value: null, notes: '' };
      this.dialog = true;
    },
    async save() {
      if (!this.form.title) return;
      this.saving = true;
      try { await coCreateContract(this.form); this.notify(this.editing ? 'Updated.' : 'Contract added.'); this.dialog = false; this.load(); }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.saving = false; }
    },
    isExpiringSoon(d) { if (!d) return false; const diff = (new Date(d) - new Date()) / 86400000; return diff > 0 && diff < 30; },
    statusColor(s) { const m = { active:'success', draft:'orange', expired:'error', terminated:'grey' }; return m[s]||'grey'; },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
