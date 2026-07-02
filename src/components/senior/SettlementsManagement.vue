<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Settlement Management</h1><p class="body-2 grey--text">Review and approve or reject proposed settlements</p></v-col>
      <v-col cols="auto"><v-btn color="indigo" dark @click="openCreate"><v-icon left>mdi-plus</v-icon>Propose Settlement</v-btn></v-col>
    </v-row>

    <v-card outlined>
      <v-data-table :headers="headers" :items="settlements" :loading="loading" class="elevation-0">
        <template v-slot:item.amount="{ item }">
          <strong>{{ item.amount ? Number(item.amount).toLocaleString() + ' TND' : 'TBD' }}</strong>
        </template>
        <template v-slot:item.status="{ item }">
          <v-chip small :color="statusColor(item.status)" dark>{{ item.status }}</v-chip>
        </template>
        <template v-slot:item.created_at="{ item }">{{ new Date(item.created_at).toLocaleDateString() }}</template>
        <template v-slot:item.actions="{ item }">
          <template v-if="item.status === 'proposed'">
            <v-btn icon small color="success" @click="review(item, 'approved')" title="Approve"><v-icon small>mdi-handshake</v-icon></v-btn>
            <v-btn icon small color="error" @click="openReject(item)" title="Reject"><v-icon small>mdi-close</v-icon></v-btn>
          </template>
          <v-btn icon small @click="viewItem(item)"><v-icon small>mdi-eye</v-icon></v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Create Dialog -->
    <v-dialog v-model="createDialog" max-width="520">
      <v-card>
        <v-card-title>Propose Settlement</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-text-field v-model.number="form.amount" label="Settlement Amount (TND)" outlined dense type="number" class="mb-2"></v-text-field>
          <v-textarea v-model="form.terms" label="Terms & Conditions" outlined rows="4"></v-textarea>
          <v-alert v-if="err" type="error" dense>{{ err }}</v-alert>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="createDialog=false">Cancel</v-btn><v-btn color="indigo" dark :loading="saving" @click="create">Propose</v-btn></v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Reject Dialog -->
    <v-dialog v-model="rejectDialog" max-width="440">
      <v-card>
        <v-card-title>Reject Settlement</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-textarea v-model="rejectReason" label="Reason for rejection *" outlined rows="3"></v-textarea>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="rejectDialog=false">Cancel</v-btn><v-btn color="error" :loading="saving" @click="doReject">Reject</v-btn></v-card-actions>
      </v-card>
    </v-dialog>

    <!-- View Dialog -->
    <v-dialog v-model="viewDialog" max-width="480">
      <v-card v-if="selected">
        <v-card-title>Settlement #{{ selected.id }}</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-3">
          <div><strong>Case:</strong> {{ selected.case_title }}</div>
          <div><strong>Proposed by:</strong> {{ selected.proposed_by_name }}</div>
          <div><strong>Amount:</strong> {{ selected.amount ? Number(selected.amount).toLocaleString() + ' TND' : 'TBD' }}</div>
          <div><strong>Status:</strong> {{ selected.status }}</div>
          <div v-if="selected.terms" class="mt-2"><strong>Terms:</strong><p class="body-2">{{ selected.terms }}</p></div>
          <div v-if="selected.rejected_reason" class="mt-2 red--text"><strong>Rejection Reason:</strong> {{ selected.rejected_reason }}</div>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="viewDialog=false">Close</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>
<script>
import { faGetSettlements, faCreateSettlement, faReviewSettlement } from '@/services/firmadminApi';
export default {
  name: 'SettlementsManagement',
  data() {
    return {
      settlements: [], loading: true, saving: false,
      createDialog: false, rejectDialog: false, viewDialog: false,
      selected: null, rejectReason: '', err: '',
      form: { case_id: 1, proposed_by: 1, amount: null, terms: '' },
      snack: false, snackMsg: '', snackColor: 'success',
      headers: [
        { text: '#', value: 'id', width: 60 },
        { text: 'Case', value: 'case_title' },
        { text: 'Proposed By', value: 'proposed_by_name' },
        { text: 'Amount', value: 'amount' },
        { text: 'Status', value: 'status' },
        { text: 'Date', value: 'created_at' },
        { text: '', value: 'actions', sortable: false, align: 'end' },
      ],
    };
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.settlements = await faGetSettlements(); }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.loading = false; }
    },
    openCreate() { this.form = { case_id: 1, proposed_by: 1, amount: null, terms: '' }; this.err = ''; this.createDialog = true; },
    async create() {
      this.saving = true;
      try { await faCreateSettlement(this.form); this.notify('Settlement proposed.'); this.createDialog = false; this.load(); }
      catch (e) { this.err = e.message; }
      finally { this.saving = false; }
    },
    async review(item, status) {
      this.saving = true;
      try { await faReviewSettlement(item.id, { reviewed_by: 1, status }); this.notify(`Settlement ${status}.`); this.load(); }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.saving = false; }
    },
    openReject(item) { this.selected = item; this.rejectReason = ''; this.rejectDialog = true; },
    async doReject() {
      if (!this.rejectReason) { this.notify('Reason required.', 'error'); return; }
      this.saving = true;
      try { await faReviewSettlement(this.selected.id, { reviewed_by: 1, status: 'rejected', rejected_reason: this.rejectReason }); this.notify('Settlement rejected.', 'warning'); this.rejectDialog = false; this.load(); }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.saving = false; }
    },
    viewItem(item) { this.selected = item; this.viewDialog = true; },
    statusColor(s) { const m = { proposed:'orange', approved:'success', rejected:'error', counter_proposed:'blue' }; return m[s] || 'grey'; },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
