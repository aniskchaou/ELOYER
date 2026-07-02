<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Legal Requests</h1><p class="body-2 grey--text">Submit and track legal service requests</p></v-col>
      <v-col cols="auto"><v-btn color="deep-orange" dark @click="dialog=true"><v-icon left>mdi-plus</v-icon>New Request</v-btn></v-col>
    </v-row>
    <v-card outlined :loading="loading">
      <v-card-title>
        <v-chip-group v-model="filter" mandatory active-class="deep-orange white--text">
          <v-chip value="">All</v-chip><v-chip value="submitted">Submitted</v-chip><v-chip value="in_progress">In Progress</v-chip><v-chip value="resolved">Resolved</v-chip>
        </v-chip-group>
      </v-card-title>
      <v-data-table :headers="headers" :items="filtered" dense class="elevation-0">
        <template v-slot:item.priority="{ item }"><v-chip x-small :color="priorityColor(item.priority)" dark>{{ item.priority }}</v-chip></template>
        <template v-slot:item.status="{ item }"><v-chip x-small :color="statusColor(item.status)" dark>{{ item.status }}</v-chip></template>
        <template v-slot:item.request_type="{ item }"><v-chip x-small outlined>{{ item.request_type }}</v-chip></template>
        <template v-slot:item.created_at="{ item }">{{ new Date(item.created_at).toLocaleDateString() }}</template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="520">
      <v-card>
        <v-card-title>New Legal Request</v-card-title><v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-text-field v-model="form.title" label="Request Title *" outlined dense class="mb-2"></v-text-field>
          <v-row dense>
            <v-col cols="6"><v-select v-model="form.request_type" :items="['consultation','contract_review','litigation','compliance','other']" label="Type" outlined dense></v-select></v-col>
            <v-col cols="6"><v-select v-model="form.priority" :items="['low','normal','high','urgent']" label="Priority" outlined dense></v-select></v-col>
          </v-row>
          <v-textarea v-model="form.description" label="Description" outlined rows="4"></v-textarea>
          <v-alert v-if="err" type="error" dense>{{ err }}</v-alert>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="dialog=false">Cancel</v-btn><v-btn color="deep-orange" dark :loading="saving" @click="submit">Submit</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>
<script>
import { coGetRequests, coCreateRequest } from '@/services/portalApi';
const CORP_ID = 1;
export default {
  name: 'LegalRequests',
  data() {
    return {
      requests: [], loading: true, dialog: false, saving: false, err: '', filter: '',
      form: { corporate_id: CORP_ID, title: '', request_type: 'consultation', priority: 'normal', description: '' },
      snack: false, snackMsg: '', snackColor: 'success',
      headers: [
        { text: 'Title', value: 'title' }, { text: 'Type', value: 'request_type' },
        { text: 'Priority', value: 'priority' }, { text: 'Assigned To', value: 'lawyer_name' },
        { text: 'Status', value: 'status' }, { text: 'Date', value: 'created_at' },
      ],
    };
  },
  computed: {
    filtered() { return this.filter ? this.requests.filter(r => r.status === this.filter) : this.requests; },
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.requests = await coGetRequests(CORP_ID); }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.loading = false; }
    },
    async submit() {
      if (!this.form.title) { this.err = 'Title required.'; return; }
      this.saving = true;
      try { await coCreateRequest(this.form); this.notify('Request submitted.'); this.dialog = false; this.load(); }
      catch (e) { this.err = e.message; }
      finally { this.saving = false; }
    },
    priorityColor(p) { return p === 'urgent' ? 'error' : p === 'high' ? 'orange' : p === 'normal' ? 'blue' : 'grey'; },
    statusColor(s) { const m = { submitted:'blue', in_progress:'orange', resolved:'success', rejected:'error' }; return m[s]||'grey'; },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
