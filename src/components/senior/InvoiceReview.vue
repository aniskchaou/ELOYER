<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Invoice Review</h1><p class="body-2 grey--text">Review and approve invoices before sending to clients</p></v-col>
    </v-row>
    <v-row class="mb-4">
      <v-col cols="6" md="3" v-for="s in stats" :key="s.label">
        <v-card outlined class="pa-3 text-center" :loading="loading">
          <v-icon :color="s.color">{{ s.icon }}</v-icon>
          <div class="overline mt-1">{{ s.label }}</div>
          <div class="text-h5 font-weight-bold" :class="s.color+'--text'">{{ s.value }}</div>
        </v-card>
      </v-col>
    </v-row>
    <v-card outlined :loading="loading">
      <v-card-title>Invoices Pending Review
        <v-spacer></v-spacer>
        <v-chip-group v-model="statusFilter" mandatory active-class="indigo white--text">
          <v-chip value="">All</v-chip><v-chip value="pending">Pending</v-chip><v-chip value="paid">Paid</v-chip><v-chip value="overdue">Overdue</v-chip>
        </v-chip-group>
      </v-card-title>
      <v-data-table :headers="headers" :items="filteredInvoices" class="elevation-0">
        <template v-slot:item.amount="{ item }">{{ Number(item.amount).toLocaleString() }} TND</template>
        <template v-slot:item.status="{ item }">
          <v-chip small :color="statusColor(item.status)" dark>{{ item.status }}</v-chip>
        </template>
        <template v-slot:item.due_date="{ item }">{{ item.due_date ? new Date(item.due_date).toLocaleDateString() : '—' }}</template>
        <template v-slot:item.actions="{ item }">
          <v-btn small outlined color="success" v-if="item.status==='pending'" @click="approve(item)"><v-icon left small>mdi-check</v-icon>Approve & Send</v-btn>
        </template>
      </v-data-table>
    </v-card>
    <v-snackbar v-model="snack" color="success" top>Invoice approved and marked for sending.</v-snackbar>
  </v-container>
</template>
<script>
export default {
  name: 'InvoiceReview',
  data() {
    return {
      loading: false, statusFilter: '', snack: false,
      invoices: [
        { id: 1, case_title: 'Property Dispute', client: 'Ahmed Ben Ali', amount: 1800, status: 'pending', due_date: new Date(Date.now() + 3*86400000) },
        { id: 2, case_title: 'Corporate Merger', client: 'ABC SARL', amount: 3500, status: 'pending', due_date: new Date(Date.now() + 7*86400000) },
        { id: 3, case_title: 'Labor Dispute', client: 'Leila Mansour', amount: 950, status: 'paid', due_date: new Date(Date.now() - 5*86400000) },
      ],
      headers: [
        { text: 'Case', value: 'case_title' },
        { text: 'Client', value: 'client' },
        { text: 'Amount', value: 'amount' },
        { text: 'Status', value: 'status' },
        { text: 'Due', value: 'due_date' },
        { text: '', value: 'actions', sortable: false, align: 'end' },
      ],
    };
  },
  computed: {
    filteredInvoices() {
      return this.statusFilter ? this.invoices.filter(i => i.status === this.statusFilter) : this.invoices;
    },
    stats() {
      const total = this.invoices.reduce((s, i) => s + Number(i.amount), 0);
      const paid = this.invoices.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.amount), 0);
      const pending = this.invoices.filter(i => i.status === 'pending').reduce((s, i) => s + Number(i.amount), 0);
      return [
        { label: 'Total', value: total.toLocaleString() + ' TND', color: 'grey', icon: 'mdi-receipt' },
        { label: 'Paid', value: paid.toLocaleString() + ' TND', color: 'green', icon: 'mdi-check-circle' },
        { label: 'Pending', value: pending.toLocaleString() + ' TND', color: 'orange', icon: 'mdi-clock' },
        { label: 'Count', value: this.invoices.length, color: 'blue', icon: 'mdi-file-document' },
      ];
    },
  },
  methods: {
    approve(inv) { inv.status = 'sent'; this.snack = true; },
    statusColor(s) { return s === 'paid' ? 'success' : s === 'pending' ? 'orange' : s === 'overdue' ? 'error' : 'grey'; },
  },
};
</script>
