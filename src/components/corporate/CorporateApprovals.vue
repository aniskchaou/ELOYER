<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Corporate Approvals</h1><p class="body-2 grey--text">Manage internal approval workflows for legal actions</p></v-col>
      <v-col cols="auto"><v-btn color="deep-orange" dark @click="openCreate"><v-icon left>mdi-plus</v-icon>Request Approval</v-btn></v-col>
    </v-row>
    <v-card outlined :loading="loading">
      <v-card-title>
        <v-chip-group v-model="filter" mandatory active-class="deep-orange white--text">
          <v-chip value="">All</v-chip><v-chip value="pending">Pending</v-chip><v-chip value="approved">Approved</v-chip><v-chip value="rejected">Rejected</v-chip>
        </v-chip-group>
      </v-card-title>
      <v-data-table :headers="headers" :items="filtered" dense class="elevation-0">
        <template v-slot:item.priority="{ item }"><v-chip x-small :color="priorityColor(item.priority)" dark>{{ item.priority }}</v-chip></template>
        <template v-slot:item.status="{ item }"><v-chip x-small :color="statusColor(item.status)" dark>{{ item.status }}</v-chip></template>
        <template v-slot:item.created_at="{ item }">{{ new Date(item.created_at).toLocaleDateString() }}</template>
        <template v-slot:item.actions="{ item }">
          <template v-if="item.status==='pending'">
            <v-btn icon small color="success" @click="decide(item,'approved')"><v-icon small>mdi-check</v-icon></v-btn>
            <v-btn icon small color="error" @click="decide(item,'rejected')"><v-icon small>mdi-close</v-icon></v-btn>
          </template>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="480">
      <v-card>
        <v-card-title>Request Approval</v-card-title><v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-text-field v-model="form.title" label="Title *" outlined dense class="mb-2"></v-text-field>
          <v-text-field v-model="form.requested_by" label="Requested By *" outlined dense class="mb-2"></v-text-field>
          <v-select v-model="form.priority" :items="['low','normal','high','urgent']" label="Priority" outlined dense class="mb-2"></v-select>
          <v-textarea v-model="form.description" label="Description" outlined rows="3"></v-textarea>
          <v-alert v-if="err" type="error" dense>{{ err }}</v-alert>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="dialog=false">Cancel</v-btn><v-btn color="deep-orange" dark :loading="saving" @click="create">Submit</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>
<script>
import { coGetApprovals, coCreateApproval, coDecideApproval } from '@/services/portalApi';
const CORP_ID = 1;
export default {
  name: 'CorporateApprovals',
  data() {
    return {
      approvals: [], loading: true, dialog: false, saving: false, err: '', filter: '',
      form: { corporate_id: CORP_ID, title: '', requested_by: '', priority: 'normal', description: '' },
      snack: false, snackMsg: '', snackColor: 'success',
      headers: [
        { text: 'Title', value: 'title' }, { text: 'Requested By', value: 'requested_by' },
        { text: 'Priority', value: 'priority' }, { text: 'Status', value: 'status' },
        { text: 'Date', value: 'created_at' }, { text: '', value: 'actions', sortable: false, align: 'end' },
      ],
    };
  },
  computed: {
    filtered() { return this.filter ? this.approvals.filter(a => a.status === this.filter) : this.approvals; },
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.approvals = await coGetApprovals(CORP_ID); }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.loading = false; }
    },
    openCreate() { this.form = { corporate_id: CORP_ID, title: '', requested_by: '', priority: 'normal', description: '' }; this.err = ''; this.dialog = true; },
    async create() {
      if (!this.form.title || !this.form.requested_by) { this.err = 'Title and requester required.'; return; }
      this.saving = true;
      try { await coCreateApproval(this.form); this.notify('Approval requested.'); this.dialog = false; this.load(); }
      catch (e) { this.err = e.message; }
      finally { this.saving = false; }
    },
    async decide(item, status) {
      try { await coDecideApproval(item.id, { status, approved_by: 'Management' }); this.notify(`${status}.`); this.load(); }
      catch (e) { this.notify(e.message, 'error'); }
    },
    priorityColor(p) { return p === 'urgent' ? 'error' : p === 'high' ? 'orange' : p === 'normal' ? 'blue' : 'grey'; },
    statusColor(s) { return s === 'approved' ? 'success' : s === 'pending' ? 'orange' : 'error'; },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
