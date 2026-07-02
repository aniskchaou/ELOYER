<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Expenses</h1><p class="body-2 grey--text">Track and manage all firm and case-related expenses</p></v-col>
      <v-col cols="auto"><v-btn color="primary" @click="openAdd"><v-icon left>mdi-plus</v-icon> Add Expense</v-btn></v-col>
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
      <v-card-title>Expense Records
        <v-spacer></v-spacer>
        <v-select v-model="filterCat" :items="categories" label="Category" outlined dense clearable style="max-width:200px" class="mr-2"></v-select>
        <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line hide-details dense style="max-width:200px"></v-text-field>
      </v-card-title>
      <v-divider></v-divider>
      <v-data-table :headers="headers" :items="filteredExpenses" :search="search">
        <template v-slot:item.category="{ item }">
          <v-chip small :color="catColor(item.category)" dark>{{ item.category }}</v-chip>
        </template>
        <template v-slot:item.reimbursable="{ item }">
          <v-icon :color="item.reimbursable ? 'green' : 'grey'">{{ item.reimbursable ? 'mdi-check-circle' : 'mdi-minus-circle' }}</v-icon>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn icon small color="orange" @click="editExp(item)"><v-icon small>mdi-pencil</v-icon></v-btn>
          <v-btn icon small color="red" @click="deleteExp(item.id)"><v-icon small>mdi-delete</v-icon></v-btn>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="520px">
      <v-card>
        <v-card-title>{{ editMode ? 'Edit Expense' : 'New Expense' }}</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-text-field v-model="form.description" label="Description" outlined dense></v-text-field>
          <v-row class="mt-3">
            <v-col cols="6"><v-select v-model="form.category" :items="categories" label="Category" outlined dense></v-select></v-col>
            <v-col cols="6"><v-text-field v-model="form.date" label="Date" outlined dense type="date"></v-text-field></v-col>
          </v-row>
          <v-text-field v-model="form.amount" label="Amount (€)" outlined dense type="number" class="mt-3"></v-text-field>
          <v-select v-model="form.case" :items="caseNames" label="Related Case (optional)" outlined dense clearable class="mt-3"></v-select>
          <v-select v-model="form.paidBy" :items="teamMembers" label="Paid By" outlined dense class="mt-3"></v-select>
          <v-checkbox v-model="form.reimbursable" label="Reimbursable" class="mt-1"></v-checkbox>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="dialog=false">Cancel</v-btn><v-btn color="primary" @click="save">Save</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script>
export default {
  name: 'Expenses',
  data() {
    return {
      search: '', filterCat: null, dialog: false, editMode: false,
      form: { id: null, description: '', category: '', date: '', amount: '', case: '', paidBy: '', reimbursable: false },
      categories: ['Filing Fees', 'Travel', 'Research', 'Office Supplies', 'Expert Fees', 'Postage', 'Other'],
      caseNames: ['Corporate Merger – ABC Ltd', 'Property Dispute – Ben Ali', 'Criminal Appeal – Smith'],
      teamMembers: ['Ahmed Cherni', 'Karim Slim', 'Leila Mansour'],
      expenses: [
        { id: 1, description: 'Court filing fee – Property case', category: 'Filing Fees', date: '2026-04-28', amount: 120, case: 'Property Dispute – Ben Ali', paidBy: 'Ahmed Cherni', reimbursable: true },
        { id: 2, description: 'Expert witness fee', category: 'Expert Fees', date: '2026-04-20', amount: 800, case: 'Criminal Appeal – Smith', paidBy: 'Karim Slim', reimbursable: true },
        { id: 3, description: 'Office supplies – Printer ink', category: 'Office Supplies', date: '2026-04-15', amount: 45, case: '', paidBy: 'Leila Mansour', reimbursable: false },
        { id: 4, description: 'Travel to court – Sousse', category: 'Travel', date: '2026-05-05', amount: 60, case: 'Property Dispute – Ben Ali', paidBy: 'Ahmed Cherni', reimbursable: true },
      ],
      headers: [
        { text: 'Description', value: 'description' }, { text: 'Category', value: 'category' }, { text: 'Date', value: 'date' },
        { text: 'Amount (€)', value: 'amount' }, { text: 'Paid By', value: 'paidBy' }, { text: 'Reimbursable', value: 'reimbursable' },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
    };
  },
  computed: {
    filteredExpenses() { return this.filterCat ? this.expenses.filter(e => e.category === this.filterCat) : this.expenses; },
    stats() {
      const total = this.expenses.reduce((s, e) => s + Number(e.amount), 0);
      const reimb = this.expenses.filter(e => e.reimbursable).reduce((s, e) => s + Number(e.amount), 0);
      return [
        { label: 'Total Expenses', value: '€' + total, color: 'red', icon: 'mdi-cash-minus' },
        { label: 'Reimbursable', value: '€' + reimb, color: 'green', icon: 'mdi-cash-refund' },
        { label: 'This Month', value: this.expenses.filter(e => e.date.startsWith('2026-05')).length, color: 'blue', icon: 'mdi-calendar-month' },
        { label: 'Categories', value: [...new Set(this.expenses.map(e => e.category))].length, color: 'orange', icon: 'mdi-tag-multiple' },
      ];
    },
  },
  methods: {
    catColor(c) { return { 'Filing Fees': 'blue', Travel: 'teal', Research: 'purple', 'Office Supplies': 'orange', 'Expert Fees': 'red', Postage: 'grey', Other: 'grey darken-1' }[c] || 'grey'; },
    openAdd() { this.editMode = false; this.form = { id: null, description: '', category: '', date: '', amount: '', case: '', paidBy: '', reimbursable: false }; this.dialog = true; },
    editExp(e) { this.editMode = true; this.form = { ...e }; this.dialog = true; },
    deleteExp(id) { this.expenses = this.expenses.filter(e => e.id !== id); },
    save() {
      if (this.editMode) { const i = this.expenses.findIndex(e => e.id === this.form.id); if (i !== -1) this.expenses.splice(i, 1, { ...this.form }); }
      else this.expenses.push({ ...this.form, id: Date.now() });
      this.dialog = false;
    },
  },
};
</script>
