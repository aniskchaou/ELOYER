<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Compliance Approvals</h1><p class="body-2 grey--text">Review completed analyses and approve or reject documents</p></v-col>
    </v-row>
    <v-card outlined :loading="loading">
      <v-card-title>
        <v-chip-group v-model="filter" mandatory active-class="red darken-3 white--text">
          <v-chip value="">All</v-chip><v-chip value="completed">Awaiting Decision</v-chip><v-chip value="approved">Approved</v-chip><v-chip value="rejected">Rejected</v-chip>
        </v-chip-group>
      </v-card-title>
      <v-data-table :headers="headers" :items="filtered" dense class="elevation-0">
        <template v-slot:item.overall_risk="{ item }"><v-chip x-small :color="riskColor(item.overall_risk)" dark>{{ item.overall_risk }}</v-chip></template>
        <template v-slot:item.compliance_score="{ item }">
          <span :class="scoreColor(item.compliance_score)+'--text font-weight-bold'">{{ item.compliance_score }}/100</span>
        </template>
        <template v-slot:item.status="{ item }"><v-chip x-small :color="statusColor(item.status)" dark>{{ item.status }}</v-chip></template>
        <template v-slot:item.flags="{ item }">
          <v-chip x-small :color="(item.flags||[]).length > 0 ? 'orange' : 'success'">{{ (item.flags||[]).length }} flags</v-chip>
        </template>
        <template v-slot:item.created_at="{ item }">{{ new Date(item.created_at).toLocaleDateString() }}</template>
        <template v-slot:item.actions="{ item }">
          <template v-if="item.status==='completed'">
            <v-btn icon small color="success" @click="approve(item)" title="Approve"><v-icon small>mdi-check-circle</v-icon></v-btn>
            <v-btn icon small color="error" @click="reject(item)" title="Reject"><v-icon small>mdi-close-circle</v-icon></v-btn>
          </template>
        </template>
      </v-data-table>
    </v-card>
    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>
<script>
import { extGetCompliance, extApproveCompliance, extRejectCompliance } from '@/services/externalApi';
export default {
  name: 'ComplianceApprovals',
  data() {
    return {
      reviews: [], loading: true, filter: '',
      snack: false, snackMsg: '', snackColor: 'success',
      headers: [
        { text: 'Title', value: 'title' }, { text: 'Type', value: 'review_type' },
        { text: 'Score', value: 'compliance_score' }, { text: 'Risk', value: 'overall_risk' },
        { text: 'Flags', value: 'flags' }, { text: 'Status', value: 'status' },
        { text: 'Date', value: 'created_at' }, { text: '', value: 'actions', sortable: false, align: 'end' },
      ],
    };
  },
  computed: {
    filtered() { return this.filter ? this.reviews.filter(r => r.status === this.filter) : this.reviews; },
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.reviews = await extGetCompliance(1); }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.loading = false; }
    },
    async approve(r) {
      try { await extApproveCompliance(r.id); this.notify('Document approved.'); this.load(); }
      catch (e) { this.notify(e.message, 'error'); }
    },
    async reject(r) {
      try { await extRejectCompliance(r.id); this.notify('Document rejected.', 'warning'); this.load(); }
      catch (e) { this.notify(e.message, 'error'); }
    },
    riskColor(r) { return r === 'high' ? 'error' : r === 'medium' ? 'orange' : 'success'; },
    scoreColor(s) { return s >= 80 ? 'green' : s >= 60 ? 'orange' : 'red'; },
    statusColor(s) { const m = { pending:'grey', completed:'blue', approved:'success', rejected:'error' }; return m[s]||'grey'; },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
