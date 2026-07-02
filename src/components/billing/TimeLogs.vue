<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Time Logs</h1><p class="body-2 grey--text">Track billable and non-billable hours across all cases and tasks</p></v-col>
      <v-col cols="auto"><v-btn color="primary" @click="openAdd"><v-icon left>mdi-plus</v-icon> Log Time</v-btn></v-col>
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
      <v-card-title>Time Entries
        <v-spacer></v-spacer>
        <v-select v-model="filterBillable" :items="['Billable','Non-Billable']" label="Billable" outlined dense clearable style="max-width:180px" class="mr-2"></v-select>
        <v-select v-model="filterUser" :items="teamMembers" label="Staff" outlined dense clearable style="max-width:180px"></v-select>
      </v-card-title>
      <v-divider></v-divider>
      <v-data-table :headers="headers" :items="filteredLogs">
        <template v-slot:item.billable="{ item }">
          <v-chip small :color="item.billable ? 'green' : 'grey'" dark>{{ item.billable ? 'Billable' : 'Non-Billable' }}</v-chip>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn icon small color="orange" @click="editLog(item)"><v-icon small>mdi-pencil</v-icon></v-btn>
          <v-btn icon small color="red" @click="deleteLog(item.id)"><v-icon small>mdi-delete</v-icon></v-btn>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="520px">
      <v-card>
        <v-card-title>{{ editMode ? 'Edit Time Entry' : 'Log Time' }}</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-text-field v-model="form.date" label="Date" outlined dense type="date"></v-text-field>
          <v-select v-model="form.case" :items="caseNames" label="Case" outlined dense class="mt-3"></v-select>
          <v-select v-model="form.user" :items="teamMembers" label="Staff Member" outlined dense class="mt-3"></v-select>
          <v-text-field v-model="form.hours" label="Hours" outlined dense type="number" step="0.25" class="mt-3"></v-text-field>
          <v-text-field v-model="form.rate" label="Rate (€/hr)" outlined dense type="number" class="mt-3"></v-text-field>
          <v-checkbox v-model="form.billable" label="Billable" class="mt-1"></v-checkbox>
          <v-textarea v-model="form.description" label="Description" outlined rows="2" class="mt-3"></v-textarea>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="dialog=false">Cancel</v-btn><v-btn color="primary" @click="save">Save</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script>
export default {
  name: 'TimeLogs',
  data() {
    return {
      filterBillable: null, filterUser: null, dialog: false, editMode: false,
      form: { id: null, date: '', case: '', user: '', hours: 1, rate: 150, billable: true, description: '' },
      caseNames: ['Corporate Merger – ABC Ltd', 'Property Dispute – Ben Ali', 'Criminal Appeal – Smith'],
      teamMembers: ['Ahmed Cherni', 'Karim Slim', 'Leila Mansour'],
      logs: [
        { id: 1, date: '2026-05-01', case: 'Property Dispute – Ben Ali', user: 'Ahmed Cherni', hours: 3, rate: 150, billable: true, description: 'Client consultation and document review' },
        { id: 2, date: '2026-05-01', case: 'Criminal Appeal – Smith', user: 'Karim Slim', hours: 2, rate: 130, billable: true, description: 'Legal research for appeal brief' },
        { id: 3, date: '2026-04-30', case: 'Corporate Merger – ABC Ltd', user: 'Ahmed Cherni', hours: 1.5, rate: 150, billable: false, description: 'Internal meeting' },
      ],
      headers: [
        { text: 'Date', value: 'date' }, { text: 'Case', value: 'case' }, { text: 'Staff', value: 'user' },
        { text: 'Hours', value: 'hours' }, { text: 'Rate (€/hr)', value: 'rate' }, { text: 'Amount', value: 'amount' },
        { text: 'Billable', value: 'billable' }, { text: 'Description', value: 'description' },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
    };
  },
  computed: {
    enrichedLogs() { return this.logs.map(l => ({ ...l, amount: '€' + (l.hours * l.rate).toFixed(0) })); },
    filteredLogs() {
      let list = this.enrichedLogs;
      if (this.filterBillable === 'Billable') list = list.filter(l => l.billable);
      if (this.filterBillable === 'Non-Billable') list = list.filter(l => !l.billable);
      if (this.filterUser) list = list.filter(l => l.user === this.filterUser);
      return list;
    },
    stats() {
      const total = this.logs.reduce((s, l) => s + l.hours, 0);
      const billHrs = this.logs.filter(l => l.billable).reduce((s, l) => s + l.hours, 0);
      const revenue = this.logs.filter(l => l.billable).reduce((s, l) => s + l.hours * l.rate, 0);
      return [
        { label: 'Total Hours', value: total.toFixed(1) + 'h', color: 'blue', icon: 'mdi-clock' },
        { label: 'Billable Hours', value: billHrs.toFixed(1) + 'h', color: 'green', icon: 'mdi-cash' },
        { label: 'Revenue', value: '€' + revenue.toFixed(0), color: 'teal', icon: 'mdi-currency-eur' },
        { label: 'Entries', value: this.logs.length, color: 'orange', icon: 'mdi-format-list-bulleted' },
      ];
    },
  },
  methods: {
    openAdd() { this.editMode = false; this.form = { id: null, date: '', case: '', user: '', hours: 1, rate: 150, billable: true, description: '' }; this.dialog = true; },
    editLog(l) { this.editMode = true; this.form = { ...l }; this.dialog = true; },
    deleteLog(id) { this.logs = this.logs.filter(l => l.id !== id); },
    save() {
      if (this.editMode) { const i = this.logs.findIndex(l => l.id === this.form.id); if (i !== -1) this.logs.splice(i, 1, { ...this.form }); }
      else this.logs.push({ ...this.form, id: Date.now() });
      this.dialog = false;
    },
  },
};
</script>
