<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Invoices</h1><p class="body-2 grey--text">Create, send, and track client invoices</p></v-col>
      <v-col cols="auto"><v-btn color="primary" @click="openAdd"><v-icon left>mdi-plus</v-icon> New Invoice</v-btn></v-col>
    </v-row>

    <v-row class="mb-4">
      <v-col v-for="s in stats" :key="s.label" cols="6" md="3">
        <v-card outlined class="pa-3 text-center">
          <v-icon :color="s.color">{{ s.icon }}</v-icon>
          <div class="overline mt-1">{{ s.label }}</div>
          <p class="text-h5 font-weight-bold" :class="s.color+'--text'">{{ s.value }}</p>
        </v-card>
      </v-col>
    </v-row>

    <v-card outlined>
      <v-card-title>All Invoices
        <v-spacer></v-spacer>
        <v-select v-model="filterStatus" :items="statuses" label="Status" outlined dense clearable style="max-width:180px" class="mr-2"></v-select>
        <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line hide-details dense style="max-width:200px"></v-text-field>
      </v-card-title>
      <v-divider></v-divider>
      <v-data-table :headers="headers" :items="filteredInvoices" :search="search">
        <template v-slot:item.status="{ item }">
          <v-chip small :color="statusColor(item.status)" dark>{{ item.status }}</v-chip>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn icon small color="primary" @click="view(item)"><v-icon small>mdi-eye</v-icon></v-btn>
          <v-btn icon small color="green" @click="download(item)"><v-icon small>mdi-download</v-icon></v-btn>
          <v-btn icon small color="blue" @click="sendInvoice(item)" v-if="item.status==='Draft'"><v-icon small>mdi-send</v-icon></v-btn>
          <v-btn icon small color="teal" @click="markPaid(item)" v-if="item.status==='Sent'"><v-icon small>mdi-check</v-icon></v-btn>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-card-title>{{ editMode ? 'Edit Invoice' : 'New Invoice' }}</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-select v-model="form.client" :items="clientNames" label="Client" outlined dense></v-select>
          <v-select v-model="form.case" :items="caseNames" label="Case" outlined dense class="mt-3"></v-select>
          <v-row class="mt-3">
            <v-col cols="6"><v-text-field v-model="form.issueDate" label="Issue Date" outlined dense type="date"></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model="form.dueDate" label="Due Date" outlined dense type="date"></v-text-field></v-col>
          </v-row>
          <v-text-field v-model="form.amount" label="Amount (€)" outlined dense type="number" class="mt-3"></v-text-field>
          <v-textarea v-model="form.description" label="Description" outlined rows="2" class="mt-3"></v-textarea>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="dialog=false">Cancel</v-btn><v-btn color="primary" @click="save">Save</v-btn></v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="viewDialog" max-width="560px">
      <v-card v-if="selected">
        <v-card-title>Invoice #{{ selected.number }}<v-spacer></v-spacer><v-chip small :color="statusColor(selected.status)" dark>{{ selected.status }}</v-chip></v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-row>
            <v-col cols="6"><strong>Client:</strong> {{ selected.client }}</v-col>
            <v-col cols="6"><strong>Case:</strong> {{ selected.case }}</v-col>
            <v-col cols="6"><strong>Issue Date:</strong> {{ selected.issueDate }}</v-col>
            <v-col cols="6"><strong>Due Date:</strong> <span :class="selected.status === 'Overdue' ? 'red--text font-weight-bold' : ''">{{ selected.dueDate }}</span></v-col>
            <v-col cols="6"><strong>Amount:</strong> <span class="font-weight-bold">€{{ selected.amount }}</span></v-col>
            <v-col cols="12"><strong>Description:</strong> {{ selected.description }}</v-col>
          </v-row>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="viewDialog=false">Close</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script>
export default {
  name: 'Invoices',
  data() {
    return {
      search: '', filterStatus: null, dialog: false, viewDialog: false, editMode: false, selected: null,
      form: { client: '', case: '', issueDate: '', dueDate: '', amount: '', description: '', status: 'Draft' },
      statuses: ['Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled'],
      clientNames: ['Ahmed Ben Ali', 'Société ABC SARL', 'Leila Mansour', 'ONG HelpAid'],
      caseNames: ['Corporate Merger – ABC Ltd', 'Property Dispute – Ben Ali', 'Criminal Appeal – Smith'],
      invoices: [
        { id: 1, number: 'INV-2026-001', client: 'Société ABC SARL', case: 'Corporate Merger – ABC Ltd', issueDate: '2026-04-01', dueDate: '2026-05-01', amount: 4500, description: 'Legal services – April 2026', status: 'Paid' },
        { id: 2, number: 'INV-2026-002', client: 'Ahmed Ben Ali', case: 'Property Dispute – Ben Ali', issueDate: '2026-04-15', dueDate: '2026-05-15', amount: 2000, description: 'Consultation and court prep', status: 'Sent' },
        { id: 3, number: 'INV-2026-003', client: 'Leila Mansour', case: 'Criminal Appeal – Smith', issueDate: '2026-03-01', dueDate: '2026-04-01', amount: 1500, description: 'Appeal brief preparation', status: 'Overdue' },
      ],
      headers: [
        { text: 'Invoice #', value: 'number' }, { text: 'Client', value: 'client' }, { text: 'Case', value: 'case' },
        { text: 'Issue Date', value: 'issueDate' }, { text: 'Due Date', value: 'dueDate' }, { text: 'Amount (€)', value: 'amount' },
        { text: 'Status', value: 'status' }, { text: 'Actions', value: 'actions', sortable: false },
      ],
    };
  },
  computed: {
    filteredInvoices() { return this.filterStatus ? this.invoices.filter(i => i.status === this.filterStatus) : this.invoices; },
    stats() {
      const total = this.invoices.reduce((s, i) => s + Number(i.amount), 0);
      return [
        { label: 'Total Invoiced', value: '€' + total, color: 'blue', icon: 'mdi-file-document' },
        { label: 'Paid', value: '€' + this.invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + Number(i.amount), 0), color: 'green', icon: 'mdi-check-circle' },
        { label: 'Outstanding', value: this.invoices.filter(i => i.status === 'Sent').length, color: 'orange', icon: 'mdi-clock' },
        { label: 'Overdue', value: this.invoices.filter(i => i.status === 'Overdue').length, color: 'red', icon: 'mdi-alert-circle' },
      ];
    },
  },
  methods: {
    statusColor(s) { return { Draft: 'grey', Sent: 'blue', Paid: 'green', Overdue: 'red', Cancelled: 'grey darken-1' }[s] || 'grey'; },
    openAdd() { this.editMode = false; this.form = { client: '', case: '', issueDate: '', dueDate: '', amount: '', description: '', status: 'Draft' }; this.dialog = true; },
    view(inv) { this.selected = inv; this.viewDialog = true; },
    sendInvoice(inv) { inv.status = 'Sent'; },
    markPaid(inv) { inv.status = 'Paid'; },
    download(inv) { void inv; },
    save() {
      const newInv = { ...this.form, id: Date.now(), number: 'INV-2026-' + String(this.invoices.length + 1).padStart(3, '0') };
      if (this.editMode) { const i = this.invoices.findIndex(x => x.id === this.form.id); if (i !== -1) this.invoices.splice(i, 1, newInv); }
      else this.invoices.push(newInv);
      this.dialog = false;
    },
  },
};
</script>
