<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Payroll Management</h1><p class="body-2 grey--text">Process salaries, bonuses and staff payments</p></v-col>
      <v-col cols="auto"><v-btn color="green darken-2" dark @click="openCreate"><v-icon left>mdi-plus</v-icon>New Payroll</v-btn></v-col>
    </v-row>

    <v-row class="mb-4">
      <v-col cols="6" md="3" v-for="s in stats" :key="s.label">
        <v-card outlined class="pa-3 text-center" :loading="loading">
          <v-icon :color="s.color">{{ s.icon }}</v-icon>
          <div class="overline mt-1">{{ s.label }}</div>
          <div class="text-h5 font-weight-bold" :class="s.color+'--text'">${{ Number(s.value||0).toLocaleString() }}</div>
        </v-card>
      </v-col>
    </v-row>

    <v-card outlined :loading="loading">
      <v-card-title>
        <v-chip-group v-model="statusFilter" mandatory active-class="green darken-2 white--text">
          <v-chip value="">All</v-chip><v-chip value="pending">Pending</v-chip><v-chip value="paid">Paid</v-chip>
        </v-chip-group>
      </v-card-title>
      <v-data-table :headers="headers" :items="filtered" dense class="elevation-0">
        <template v-slot:item.status="{ item }"><v-chip x-small :color="item.status==='paid'?'success':'orange'" dark>{{ item.status }}</v-chip></template>
        <template v-slot:item.net_pay="{ item }"><strong>${{ Number(item.net_pay||0).toLocaleString() }}</strong></template>
        <template v-slot:item.actions="{ item }">
          <v-btn small outlined color="success" v-if="item.status==='pending'" :loading="paying===item.id" @click="pay(item)">
            <v-icon left small>mdi-check</v-icon>Pay
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="560">
      <v-card>
        <v-card-title>New Payroll Entry</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-row dense>
            <v-col cols="12"><v-select v-model="form.user_id" :items="employees" item-text="full_name" item-value="id" label="Employee *" outlined dense></v-select></v-col>
            <v-col cols="6"><v-text-field v-model="form.pay_period_start" label="Period Start *" outlined dense type="date"></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model="form.pay_period_end" label="Period End *" outlined dense type="date"></v-text-field></v-col>
            <v-col cols="4"><v-text-field v-model.number="form.base_salary" label="Base Salary" outlined dense type="number"></v-text-field></v-col>
            <v-col cols="4"><v-text-field v-model.number="form.bonus" label="Bonus" outlined dense type="number"></v-text-field></v-col>
            <v-col cols="4"><v-text-field v-model.number="form.deductions" label="Deductions" outlined dense type="number"></v-text-field></v-col>
            <v-col cols="12">
              <div class="caption grey--text">Net Pay: <strong class="green--text">${{ ((form.base_salary||0) + (form.bonus||0) - (form.deductions||0)).toLocaleString() }}</strong></div>
            </v-col>
            <v-col cols="12"><v-textarea v-model="form.notes" label="Notes" outlined rows="2" auto-grow></v-textarea></v-col>
          </v-row>
          <v-alert v-if="err" type="error" dense>{{ err }}</v-alert>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="dialog=false">Cancel</v-btn><v-btn color="green darken-2" dark :loading="saving" @click="create">Create</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>
<script>
import { stGetPayroll, stCreatePayroll, stPayPayroll } from '@/services/staffApi';
export default {
  name: 'Payroll',
  data() {
    return {
      payroll: [], loading: true, dialog: false, saving: false, paying: null, err: '', statusFilter: '',
      form: { user_id: null, pay_period_start: '', pay_period_end: '', base_salary: 0, bonus: 0, deductions: 0, notes: '' },
      employees: [{ id: 1, full_name: 'Ahmed Cherni' }, { id: 2, full_name: 'System Admin' }],
      snack: false, snackMsg: '', snackColor: 'success',
      headers: [
        { text: 'Employee', value: 'employee_name' },
        { text: 'Role', value: 'employee_role' },
        { text: 'Period', value: 'pay_period_start' },
        { text: 'Base ($)', value: 'base_salary' },
        { text: 'Bonus ($)', value: 'bonus' },
        { text: 'Net Pay', value: 'net_pay' },
        { text: 'Status', value: 'status' },
        { text: '', value: 'actions', sortable: false, align: 'end' },
      ],
    };
  },
  computed: {
    filtered() { return this.statusFilter ? this.payroll.filter(p => p.status === this.statusFilter) : this.payroll; },
    stats() {
      const pending = this.payroll.filter(p => p.status === 'pending').reduce((s, p) => s + Number(p.net_pay||0), 0);
      const paid = this.payroll.filter(p => p.status === 'paid').reduce((s, p) => s + Number(p.net_pay||0), 0);
      return [
        { label: 'Total Pending', value: pending, icon: 'mdi-clock', color: 'orange' },
        { label: 'Total Paid', value: paid, icon: 'mdi-check-circle', color: 'green' },
        { label: 'Entries', value: this.payroll.length, icon: 'mdi-account-cash', color: 'blue' },
        { label: 'Employees', value: this.employees.length, icon: 'mdi-account-group', color: 'purple' },
      ];
    },
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.payroll = await stGetPayroll(); }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.loading = false; }
    },
    openCreate() {
      this.form = { user_id: null, pay_period_start: '', pay_period_end: '', base_salary: 0, bonus: 0, deductions: 0, notes: '' };
      this.err = ''; this.dialog = true;
    },
    async create() {
      if (!this.form.user_id || !this.form.pay_period_start) { this.err = 'Employee and period required.'; return; }
      this.saving = true;
      try { await stCreatePayroll(this.form); this.notify('Payroll created.'); this.dialog = false; this.load(); }
      catch (e) { this.err = e.message; }
      finally { this.saving = false; }
    },
    async pay(p) {
      this.paying = p.id;
      try { await stPayPayroll(p.id); this.notify(`Paid ${p.employee_name}.`); this.load(); }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.paying = null; }
    },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
