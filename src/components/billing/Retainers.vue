<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Retainers</h1><p class="body-2 grey--text">Manage client retainer agreements and balance tracking</p></v-col>
      <v-col cols="auto"><v-btn color="primary" @click="openAdd"><v-icon left>mdi-plus</v-icon> New Retainer</v-btn></v-col>
    </v-row>

    <v-data-table :headers="headers" :items="retainers" class="elevation-1">
      <template v-slot:item.status="{ item }">
        <v-chip small :color="item.status === 'Active' ? 'green' : item.status === 'Depleted' ? 'red' : 'orange'" dark>{{ item.status }}</v-chip>
      </template>
      <template v-slot:item.balance="{ item }">
        <v-progress-linear :value="(item.balance / item.total) * 100" height="12" rounded :color="balanceColor(item.balance / item.total)"></v-progress-linear>
        <span class="caption">€{{ item.balance }} / €{{ item.total }}</span>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-btn icon small color="green" @click="topUp(item)"><v-icon small>mdi-plus-circle</v-icon></v-btn>
        <v-btn icon small color="orange" @click="editR(item)"><v-icon small>mdi-pencil</v-icon></v-btn>
        <v-btn icon small color="primary" @click="viewTransactions(item)"><v-icon small>mdi-history</v-icon></v-btn>
      </template>
    </v-data-table>

    <!-- Transactions dialog -->
    <v-dialog v-model="txDialog" max-width="520px">
      <v-card v-if="selectedRetainer">
        <v-card-title>{{ selectedRetainer.client }} – Transactions</v-card-title>
        <v-divider></v-divider>
        <v-data-table :headers="txHeaders" :items="selectedRetainer.transactions" dense></v-data-table>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="txDialog=false">Close</v-btn></v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Add/Edit dialog -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>{{ editMode ? 'Edit Retainer' : 'New Retainer' }}</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-select v-model="form.client" :items="clientNames" label="Client" outlined dense></v-select>
          <v-text-field v-model="form.total" label="Total Amount (€)" outlined dense type="number" class="mt-3"></v-text-field>
          <v-row class="mt-3">
            <v-col cols="6"><v-text-field v-model="form.startDate" label="Start Date" outlined dense type="date"></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model="form.endDate" label="End Date" outlined dense type="date"></v-text-field></v-col>
          </v-row>
          <v-text-field v-model="form.hourlyRate" label="Hourly Rate (€/hr)" outlined dense type="number" class="mt-3"></v-text-field>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="dialog=false">Cancel</v-btn><v-btn color="primary" @click="save">Save</v-btn></v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Top-up dialog -->
    <v-dialog v-model="topUpDialog" max-width="360px">
      <v-card>
        <v-card-title>Top Up Retainer</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-text-field v-model="topUpAmount" label="Amount to Add (€)" outlined dense type="number"></v-text-field>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="topUpDialog=false">Cancel</v-btn><v-btn color="primary" @click="confirmTopUp">Add</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script>
export default {
  name: 'Retainers',
  data() {
    return {
      dialog: false, txDialog: false, topUpDialog: false, editMode: false, selectedRetainer: null, topUpAmount: 0, topUpTarget: null,
      form: { id: null, client: '', total: 5000, balance: 5000, startDate: '', endDate: '', hourlyRate: 150, status: 'Active' },
      clientNames: ['Ahmed Ben Ali', 'Société ABC SARL', 'Leila Mansour'],
      retainers: [
        { id: 1, client: 'Société ABC SARL', total: 10000, balance: 6500, startDate: '2026-01-01', endDate: '2026-12-31', hourlyRate: 150, status: 'Active', transactions: [{ date: '2026-04-01', description: 'Monthly service', debit: 1500, credit: 0, balance: 6500 }, { date: '2026-03-01', description: 'Monthly service', debit: 1500, credit: 0, balance: 8000 }] },
        { id: 2, client: 'Ahmed Ben Ali', total: 3000, balance: 500, startDate: '2026-02-01', endDate: '2026-08-01', hourlyRate: 130, status: 'Active', transactions: [{ date: '2026-04-15', description: 'Court prep 3h', debit: 390, credit: 0, balance: 500 }] },
        { id: 3, client: 'Leila Mansour', total: 2000, balance: 0, startDate: '2025-06-01', endDate: '2026-01-01', hourlyRate: 120, status: 'Depleted', transactions: [] },
      ],
      headers: [
        { text: 'Client', value: 'client' }, { text: 'Balance', value: 'balance' }, { text: 'Start', value: 'startDate' },
        { text: 'End', value: 'endDate' }, { text: 'Rate (€/hr)', value: 'hourlyRate' }, { text: 'Status', value: 'status' },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
      txHeaders: [{ text: 'Date', value: 'date' }, { text: 'Description', value: 'description' }, { text: 'Debit', value: 'debit' }, { text: 'Credit', value: 'credit' }, { text: 'Balance', value: 'balance' }],
    };
  },
  methods: {
    balanceColor(ratio) { return ratio > 0.5 ? 'green' : ratio > 0.2 ? 'orange' : 'red'; },
    openAdd() { this.editMode = false; this.form = { id: null, client: '', total: 5000, balance: 5000, startDate: '', endDate: '', hourlyRate: 150, status: 'Active' }; this.dialog = true; },
    editR(r) { this.editMode = true; this.form = { ...r }; this.dialog = true; },
    viewTransactions(r) { this.selectedRetainer = r; this.txDialog = true; },
    topUp(r) { this.topUpTarget = r; this.topUpAmount = 0; this.topUpDialog = true; },
    confirmTopUp() { this.topUpTarget.balance += Number(this.topUpAmount); this.topUpTarget.total += Number(this.topUpAmount); this.topUpDialog = false; },
    save() {
      if (this.editMode) { const i = this.retainers.findIndex(r => r.id === this.form.id); if (i !== -1) this.retainers.splice(i, 1, { ...this.form, transactions: this.retainers[i].transactions }); }
      else this.retainers.push({ ...this.form, id: Date.now(), transactions: [] });
      this.dialog = false;
    },
  },
};
</script>
