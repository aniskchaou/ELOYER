<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Approvals</h1><p class="body-2 grey--text">Review and decide on pending filings, motions and requests</p></v-col>
      <v-col cols="auto">
        <v-chip-group v-model="statusFilter" mandatory active-class="indigo white--text">
          <v-chip value="">All</v-chip><v-chip value="pending">Pending</v-chip><v-chip value="approved">Approved</v-chip><v-chip value="rejected">Rejected</v-chip>
        </v-chip-group>
      </v-col>
    </v-row>

    <v-card outlined>
      <v-data-table :headers="headers" :items="filtered" :loading="loading" class="elevation-0">
        <template v-slot:item.approval_type="{ item }">
          <v-chip small outlined>{{ item.approval_type }}</v-chip>
        </template>
        <template v-slot:item.status="{ item }">
          <v-chip small :color="statusColor(item.status)" dark>{{ item.status }}</v-chip>
        </template>
        <template v-slot:item.created_at="{ item }">{{ new Date(item.created_at).toLocaleDateString() }}</template>
        <template v-slot:item.actions="{ item }">
          <template v-if="item.status === 'pending'">
            <v-btn icon small color="success" @click="decide(item, 'approved')" title="Approve"><v-icon small>mdi-check-circle</v-icon></v-btn>
            <v-btn icon small color="error" @click="openReject(item)" title="Reject"><v-icon small>mdi-close-circle</v-icon></v-btn>
          </template>
          <v-btn icon small @click="openView(item)" title="Details"><v-icon small>mdi-eye</v-icon></v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Reject Dialog -->
    <v-dialog v-model="rejectDialog" max-width="440">
      <v-card v-if="selected">
        <v-card-title>Reject: {{ selected.title }}</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-textarea v-model="rejectNotes" label="Rejection reason *" outlined rows="3"></v-textarea>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="rejectDialog=false">Cancel</v-btn><v-btn color="error" :loading="saving" @click="doReject">Reject</v-btn></v-card-actions>
      </v-card>
    </v-dialog>

    <!-- View Dialog -->
    <v-dialog v-model="viewDialog" max-width="520">
      <v-card v-if="selected">
        <v-card-title>{{ selected.title }}</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-3">
          <div class="mb-2"><strong>Type:</strong> {{ selected.approval_type }}</div>
          <div class="mb-2"><strong>Case:</strong> {{ selected.case_title || '—' }}</div>
          <div class="mb-2"><strong>Requested by:</strong> {{ selected.requested_by_name }}</div>
          <div class="mb-2"><strong>Status:</strong> {{ selected.status }}</div>
          <div v-if="selected.description" class="mb-2"><strong>Description:</strong> {{ selected.description }}</div>
          <div v-if="selected.decision_notes" class="mt-2"><strong>Notes:</strong> {{ selected.decision_notes }}</div>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="viewDialog=false">Close</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>
<script>
import { faGetApprovals, faDecideApproval } from '@/services/firmadminApi';
export default {
  name: 'Approvals',
  data() {
    return {
      approvals: [], loading: true, statusFilter: '', selected: null,
      rejectDialog: false, rejectNotes: '', viewDialog: false, saving: false,
      snack: false, snackMsg: '', snackColor: 'success',
      headers: [
        { text: 'Title', value: 'title' },
        { text: 'Type', value: 'approval_type' },
        { text: 'Case', value: 'case_title' },
        { text: 'Requested By', value: 'requested_by_name' },
        { text: 'Status', value: 'status' },
        { text: 'Date', value: 'created_at' },
        { text: '', value: 'actions', sortable: false, align: 'end' },
      ],
    };
  },
  computed: {
    filtered() {
      return this.statusFilter ? this.approvals.filter(a => a.status === this.statusFilter) : this.approvals;
    },
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.approvals = await faGetApprovals(); }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.loading = false; }
    },
    async decide(item, decision, notes = '') {
      this.saving = true;
      try {
        await faDecideApproval(item.id, { decision, decision_notes: notes });
        this.notify(`Approval ${decision}.`);
        this.rejectDialog = false;
        this.load();
      } catch (e) { this.notify(e.message, 'error'); }
      finally { this.saving = false; }
    },
    openReject(item) { this.selected = item; this.rejectNotes = ''; this.rejectDialog = true; },
    doReject() {
      if (!this.rejectNotes) { this.notify('Rejection reason required.', 'error'); return; }
      this.decide(this.selected, 'rejected', this.rejectNotes);
    },
    openView(item) { this.selected = item; this.viewDialog = true; },
    statusColor(s) { return s === 'approved' ? 'success' : s === 'rejected' ? 'error' : 'orange'; },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
