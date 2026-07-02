<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col>
        <h1 class="text-h5 font-weight-bold">Contracts & Agreements</h1>
        <p class="body-2 grey--text">Manage all client contracts and engagement letters</p>
      </v-col>
      <v-col cols="auto">
        <v-btn color="primary" @click="openAdd">
          <v-icon left>mdi-plus</v-icon> New Contract
        </v-btn>
      </v-col>
    </v-row>

    <v-card outlined class="mb-4 pa-3">
      <v-row>
        <v-col cols="12" md="3">
          <v-select v-model="filterStatus" :items="statuses" label="Status" outlined dense clearable></v-select>
        </v-col>
        <v-col cols="12" md="3">
          <v-select v-model="filterType" :items="contractTypes" label="Type" outlined dense clearable></v-select>
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="Search" outlined dense></v-text-field>
        </v-col>
      </v-row>
    </v-card>

    <v-data-table :headers="headers" :items="filteredContracts" :search="search" class="elevation-1">
      <template v-slot:item.status="{ item }">
        <v-chip small :color="statusColor(item.status)" dark>{{ item.status }}</v-chip>
      </template>
      <template v-slot:item.type="{ item }">
        <v-chip small outlined :color="typeColor(item.type)">{{ item.type }}</v-chip>
      </template>
      <template v-slot:item.expiry="{ item }">
        <span :class="isExpiringSoon(item.expiry) ? 'red--text font-weight-bold' : ''">{{ item.expiry }}</span>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-btn icon small color="primary" @click="viewContract(item)"><v-icon small>mdi-eye</v-icon></v-btn>
        <v-btn icon small color="orange" @click="editContract(item)"><v-icon small>mdi-pencil</v-icon></v-btn>
        <v-btn icon small color="green" @click="download(item)"><v-icon small>mdi-download</v-icon></v-btn>
        <v-btn icon small color="red" @click="deleteContract(item.id)"><v-icon small>mdi-delete</v-icon></v-btn>
      </template>
    </v-data-table>

    <!-- Add/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-card-title>{{ editMode ? 'Edit Contract' : 'New Contract' }}</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-text-field v-model="form.title" label="Contract Title" outlined dense></v-text-field>
          <v-select v-model="form.client" :items="clientNames" label="Client" outlined dense class="mt-3"></v-select>
          <v-select v-model="form.type" :items="contractTypes" label="Type" outlined dense class="mt-3"></v-select>
          <v-row class="mt-3">
            <v-col cols="6">
              <v-text-field v-model="form.startDate" label="Start Date" outlined dense type="date"></v-text-field>
            </v-col>
            <v-col cols="6">
              <v-text-field v-model="form.expiry" label="Expiry Date" outlined dense type="date"></v-text-field>
            </v-col>
          </v-row>
          <v-text-field v-model="form.value" label="Contract Value (€)" outlined dense class="mt-3"></v-text-field>
          <v-select v-model="form.status" :items="statuses" label="Status" outlined dense class="mt-3"></v-select>
          <v-textarea v-model="form.notes" label="Notes" outlined rows="3" class="mt-3"></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="dialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="saveContract">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- View Dialog -->
    <v-dialog v-model="viewDialog" max-width="600px">
      <v-card v-if="selectedContract">
        <v-card-title>{{ selectedContract.title }}
          <v-spacer></v-spacer>
          <v-chip small :color="statusColor(selectedContract.status)" dark>{{ selectedContract.status }}</v-chip>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-row>
            <v-col cols="6"><strong>Client:</strong> {{ selectedContract.client }}</v-col>
            <v-col cols="6"><strong>Type:</strong> {{ selectedContract.type }}</v-col>
            <v-col cols="6"><strong>Start:</strong> {{ selectedContract.startDate }}</v-col>
            <v-col cols="6"><strong>Expiry:</strong> {{ selectedContract.expiry }}</v-col>
            <v-col cols="6"><strong>Value:</strong> {{ selectedContract.value }}</v-col>
            <v-col cols="12"><strong>Notes:</strong> {{ selectedContract.notes }}</v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="viewDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
export default {
  name: 'ClientContracts',
  data() {
    return {
      search: '', filterStatus: null, filterType: null,
      dialog: false, viewDialog: false, editMode: false, selectedContract: null,
      form: { id: null, title: '', client: '', type: '', startDate: '', expiry: '', value: '', status: 'Active', notes: '' },
      statuses: ['Active', 'Expired', 'Draft', 'Terminated'],
      contractTypes: ['Retainer', 'Fixed Fee', 'Contingency', 'Hourly', 'Pro Bono'],
      clientNames: ['Ahmed Ben Ali', 'Société ABC SARL', 'Leila Mansour', 'ONG HelpAid'],
      contracts: [
        { id: 1, title: 'Retainer Agreement – ABC SARL', client: 'Société ABC SARL', type: 'Retainer', startDate: '2025-01-01', expiry: '2026-12-31', value: '€24,000/yr', status: 'Active', notes: 'Annual retainer, auto-renew clause.' },
        { id: 2, title: 'Engagement Letter – Ben Ali', client: 'Ahmed Ben Ali', type: 'Fixed Fee', startDate: '2024-03-01', expiry: '2025-03-01', value: '€3,500', status: 'Expired', notes: 'Property dispute matter.' },
        { id: 3, title: 'Pro Bono Agreement – HelpAid', client: 'ONG HelpAid', type: 'Pro Bono', startDate: '2024-06-01', expiry: '2025-06-01', value: '€0', status: 'Active', notes: 'Pro bono arrangement, NGO client.' },
      ],
      headers: [
        { text: 'Title', value: 'title' },
        { text: 'Client', value: 'client' },
        { text: 'Type', value: 'type' },
        { text: 'Start', value: 'startDate' },
        { text: 'Expiry', value: 'expiry' },
        { text: 'Value', value: 'value' },
        { text: 'Status', value: 'status' },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
    };
  },
  computed: {
    filteredContracts() {
      let list = this.contracts;
      if (this.filterStatus) list = list.filter(c => c.status === this.filterStatus);
      if (this.filterType) list = list.filter(c => c.type === this.filterType);
      return list;
    },
  },
  methods: {
    statusColor(s) { return { Active: 'green', Expired: 'red', Draft: 'orange', Terminated: 'grey' }[s] || 'grey'; },
    typeColor(t) { return { Retainer: 'blue', 'Fixed Fee': 'teal', Contingency: 'purple', Hourly: 'orange', 'Pro Bono': 'green' }[t] || 'grey'; },
    isExpiringSoon(date) { const d = new Date(date); const now = new Date(); const diff = (d - now) / (1000 * 60 * 60 * 24); return diff > 0 && diff <= 30; },
    openAdd() { this.editMode = false; this.form = { id: null, title: '', client: '', type: '', startDate: '', expiry: '', value: '', status: 'Active', notes: '' }; this.dialog = true; },
    editContract(item) { this.editMode = true; this.form = { ...item }; this.dialog = true; },
    viewContract(item) { this.selectedContract = item; this.viewDialog = true; },
    saveContract() {
      if (this.editMode) { const i = this.contracts.findIndex(c => c.id === this.form.id); if (i !== -1) this.contracts.splice(i, 1, { ...this.form }); }
      else this.contracts.push({ ...this.form, id: Date.now() });
      this.dialog = false;
    },
    deleteContract(id) { this.contracts = this.contracts.filter(c => c.id !== id); },
    download(item) { void item; },
  },
};
</script>
