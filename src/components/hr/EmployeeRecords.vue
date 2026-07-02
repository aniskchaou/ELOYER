<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Employee Records</h1><p class="body-2 grey--text">Contracts, salaries, emergency contacts and HR data</p></v-col>
      <v-col cols="auto"><v-btn color="brown darken-1" dark @click="open()"><v-icon left>mdi-plus</v-icon>Add Record</v-btn></v-col>
    </v-row>
    <v-card outlined :loading="loading">
      <v-card-title><v-text-field v-model="search" append-icon="mdi-magnify" label="Search…" single-line hide-details dense outlined style="max-width:280px"></v-text-field></v-card-title>
      <v-data-table :headers="headers" :items="records" :search="search" dense class="elevation-0">
        <template v-slot:item.contract_type="{ item }"><v-chip x-small outlined>{{ item.contract_type }}</v-chip></template>
        <template v-slot:item.salary="{ item }">{{ item.salary ? Number(item.salary).toLocaleString() + ' TND' : '—' }}</template>
        <template v-slot:item.actions="{ item }"><v-btn icon small @click="open(item)"><v-icon small>mdi-pencil</v-icon></v-btn></template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="600">
      <v-card>
        <v-card-title>{{ editing ? 'Edit Record' : 'Add Employee Record' }}</v-card-title><v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-row dense>
            <v-col cols="12"><v-select v-model="form.user_id" :items="users" item-text="full_name" item-value="id" label="Employee *" outlined dense :disabled="!!editing"></v-select></v-col>
            <v-col cols="6"><v-text-field v-model="form.job_title" label="Job Title" outlined dense></v-text-field></v-col>
            <v-col cols="6"><v-select v-model="form.contract_type" :items="['permanent','fixed_term','part_time','intern','contractor']" label="Contract Type" outlined dense></v-select></v-col>
            <v-col cols="6"><v-text-field v-model="form.start_date" label="Start Date" outlined dense type="date"></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model.number="form.salary" label="Salary (TND)" outlined dense type="number"></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model="form.national_id" label="National ID" outlined dense></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model="form.bank_account" label="Bank Account" outlined dense></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model="form.emergency_contact_name" label="Emergency Contact" outlined dense></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model="form.emergency_contact_phone" label="Emergency Phone" outlined dense></v-text-field></v-col>
          </v-row>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="dialog=false">Cancel</v-btn><v-btn color="brown darken-1" dark :loading="saving" @click="save">{{ editing ? 'Update' : 'Save' }}</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>
<script>
import { hrGetEmployees, hrUpsertEmployee } from '@/services/hrApi';
export default {
  name: 'EmployeeRecords',
  data() {
    return {
      records: [], loading: true, dialog: false, editing: null, saving: false, search: '',
      form: { user_id: null, job_title: '', contract_type: 'permanent', start_date: '', salary: null, national_id: '', bank_account: '', emergency_contact_name: '', emergency_contact_phone: '' },
      users: [{ id: 1, full_name: 'Ahmed Cherni' }, { id: 2, full_name: 'System Admin' }],
      snack: false, snackMsg: '', snackColor: 'success',
      headers: [
        { text: 'Employee', value: 'full_name' }, { text: 'Role', value: 'role' },
        { text: 'Job Title', value: 'job_title' }, { text: 'Contract', value: 'contract_type' },
        { text: 'Salary', value: 'salary' }, { text: 'Department', value: 'department_name' },
        { text: '', value: 'actions', sortable: false, align: 'end' },
      ],
    };
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.records = await hrGetEmployees(); }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.loading = false; }
    },
    open(r = null) {
      this.editing = r;
      this.form = r ? { user_id: r.user_id, job_title: r.job_title, contract_type: r.contract_type, start_date: r.start_date, salary: r.salary, national_id: r.national_id, bank_account: r.bank_account, emergency_contact_name: r.emergency_contact_name, emergency_contact_phone: r.emergency_contact_phone } : { user_id: null, job_title: '', contract_type: 'permanent', start_date: '', salary: null, national_id: '', bank_account: '', emergency_contact_name: '', emergency_contact_phone: '' };
      this.dialog = true;
    },
    async save() {
      if (!this.form.user_id) return;
      this.saving = true;
      try { await hrUpsertEmployee(this.form); this.notify('Record saved.'); this.dialog = false; this.load(); }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.saving = false; }
    },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
