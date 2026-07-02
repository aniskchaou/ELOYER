<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Leave Management</h1><p class="body-2 grey--text">Review and action employee leave requests</p></v-col>
      <v-col cols="auto">
        <v-chip-group v-model="filter" mandatory active-class="brown darken-1 white--text">
          <v-chip value="">All</v-chip><v-chip value="pending">Pending</v-chip><v-chip value="approved">Approved</v-chip><v-chip value="rejected">Rejected</v-chip>
        </v-chip-group>
      </v-col>
    </v-row>
    <v-card outlined :loading="loading">
      <v-data-table :headers="headers" :items="leaves" dense class="elevation-0">
        <template v-slot:item.leave_type="{ item }"><v-chip x-small outlined>{{ item.leave_type }}</v-chip></template>
        <template v-slot:item.status="{ item }"><v-chip x-small :color="statusColor(item.status)" dark>{{ item.status }}</v-chip></template>
        <template v-slot:item.days_count="{ item }"><strong>{{ item.days_count }}</strong></template>
        <template v-slot:item.start_date="{ item }">{{ item.start_date }} → {{ item.end_date }}</template>
        <template v-slot:item.actions="{ item }">
          <template v-if="item.status==='pending'">
            <v-btn icon small color="success" @click="decide(item,'approved')" title="Approve"><v-icon small>mdi-check</v-icon></v-btn>
            <v-btn icon small color="error" @click="openReject(item)" title="Reject"><v-icon small>mdi-close</v-icon></v-btn>
          </template>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="rejectDialog" max-width="400">
      <v-card v-if="selected">
        <v-card-title>Reject Leave — {{ selected.employee_name }}</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4"><v-textarea v-model="rejectNotes" label="Reason *" outlined rows="3"></v-textarea></v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="rejectDialog=false">Cancel</v-btn><v-btn color="error" :loading="saving" @click="doReject">Reject</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>
<script>
import { hrGetLeave, hrReviewLeave } from '@/services/hrApi';
export default {
  name: 'LeaveManagement',
  data() {
    return {
      allLeaves: [], loading: true, filter: '', selected: null,
      rejectDialog: false, rejectNotes: '', saving: false,
      snack: false, snackMsg: '', snackColor: 'success',
      headers: [
        { text: 'Employee', value: 'employee_name' }, { text: 'Type', value: 'leave_type' },
        { text: 'Period', value: 'start_date' }, { text: 'Days', value: 'days_count' },
        { text: 'Reason', value: 'reason' }, { text: 'Status', value: 'status' },
        { text: '', value: 'actions', sortable: false, align: 'end' },
      ],
    };
  },
  computed: {
    leaves() { return this.filter ? this.allLeaves.filter(l => l.status === this.filter) : this.allLeaves; },
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.allLeaves = await hrGetLeave(); }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.loading = false; }
    },
    async decide(item, status, notes = '') {
      this.saving = true;
      try { await hrReviewLeave(item.id, { status, reviewed_by: 1, review_notes: notes }); this.notify(`Leave ${status}.`); this.rejectDialog = false; this.load(); }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.saving = false; }
    },
    openReject(item) { this.selected = item; this.rejectNotes = ''; this.rejectDialog = true; },
    doReject() { if (!this.rejectNotes) { this.notify('Reason required.', 'error'); return; } this.decide(this.selected, 'rejected', this.rejectNotes); },
    statusColor(s) { return s === 'approved' ? 'success' : s === 'pending' ? 'orange' : 'error'; },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
