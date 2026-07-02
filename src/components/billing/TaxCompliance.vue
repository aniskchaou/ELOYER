<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Tax Compliance</h1><p class="body-2 grey--text">Manage VAT, tax filings, and regulatory compliance</p></v-col>
      <v-col cols="auto"><v-btn color="primary" @click="dialog=true"><v-icon left>mdi-plus</v-icon> New Tax Filing</v-btn></v-col>
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

    <v-row>
      <v-col cols="12" md="7">
        <v-card outlined>
          <v-card-title class="subtitle-1">Tax Filing Calendar</v-card-title>
          <v-divider></v-divider>
          <v-data-table :headers="filingHeaders" :items="filings">
            <template v-slot:item.status="{ item }">
              <v-chip small :color="item.status === 'Filed' ? 'green' : item.status === 'Pending' ? 'orange' : 'red'" dark>{{ item.status }}</v-chip>
            </template>
            <template v-slot:item.actions="{ item }">
              <v-btn icon small color="green" @click="item.status='Filed'" v-if="item.status==='Pending'"><v-icon small>mdi-check</v-icon></v-btn>
              <v-btn icon small color="primary"><v-icon small>mdi-download</v-icon></v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
      <v-col cols="12" md="5">
        <v-card outlined class="pa-4 mb-4">
          <v-card-title class="subtitle-1 pb-2">VAT Summary</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <div v-for="v in vatSummary" :key="v.period" class="d-flex justify-space-between mb-2 caption">
            <span>{{ v.period }}</span>
            <span class="font-weight-bold" :class="v.amount >= 0 ? 'green--text' : 'red--text'">€{{ Math.abs(v.amount) }} {{ v.amount >= 0 ? 'payable' : 'refund' }}</span>
          </div>
        </v-card>
        <v-card outlined class="pa-4">
          <v-card-title class="subtitle-1 pb-2">Compliance Checklist</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <div v-for="item in checklist" :key="item.label" class="d-flex align-center mb-2">
            <v-icon :color="item.done ? 'green' : 'orange'" class="mr-2" small>{{ item.done ? 'mdi-check-circle' : 'mdi-alert-circle' }}</v-icon>
            <span class="caption">{{ item.label }}</span>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>New Tax Filing</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-select v-model="form.type" :items="taxTypes" label="Tax Type" outlined dense></v-select>
          <v-text-field v-model="form.period" label="Period (e.g. Q2 2026)" outlined dense class="mt-3"></v-text-field>
          <v-text-field v-model="form.deadline" label="Deadline" outlined dense type="date" class="mt-3"></v-text-field>
          <v-text-field v-model="form.amount" label="Amount (€)" outlined dense type="number" class="mt-3"></v-text-field>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="dialog=false">Cancel</v-btn><v-btn color="primary" @click="addFiling">Save</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script>
export default {
  name: 'TaxCompliance',
  data() {
    return {
      dialog: false,
      form: { type: '', period: '', deadline: '', amount: '', status: 'Pending' },
      taxTypes: ['VAT (TVA)', 'Corporate Tax', 'Withholding Tax', 'Social Contributions', 'Professional Tax'],
      filings: [
        { id: 1, type: 'VAT (TVA)', period: 'Q1 2026', deadline: '2026-04-20', amount: 3200, status: 'Filed' },
        { id: 2, type: 'Social Contributions', period: 'April 2026', deadline: '2026-05-10', amount: 1800, status: 'Pending' },
        { id: 3, type: 'Corporate Tax', period: '2025', deadline: '2026-03-31', amount: 8500, status: 'Filed' },
        { id: 4, type: 'VAT (TVA)', period: 'Q2 2026', deadline: '2026-07-20', amount: 0, status: 'Pending' },
      ],
      vatSummary: [
        { period: 'Q1 2026', amount: 3200 },
        { period: 'Q4 2025', amount: 2800 },
        { period: 'Q3 2025', amount: -400 },
      ],
      checklist: [
        { label: 'Annual financial statements submitted', done: true },
        { label: 'Q1 VAT filed and paid', done: true },
        { label: 'Social contributions up to date', done: false },
        { label: 'Tax identification number verified', done: true },
        { label: 'Withholding tax certificates issued', done: false },
      ],
      filingHeaders: [
        { text: 'Type', value: 'type' }, { text: 'Period', value: 'period' }, { text: 'Deadline', value: 'deadline' },
        { text: 'Amount (€)', value: 'amount' }, { text: 'Status', value: 'status' }, { text: 'Actions', value: 'actions', sortable: false },
      ],
    };
  },
  computed: {
    stats() {
      return [
        { label: 'Filed', value: this.filings.filter(f => f.status === 'Filed').length, color: 'green', icon: 'mdi-check-circle' },
        { label: 'Pending', value: this.filings.filter(f => f.status === 'Pending').length, color: 'orange', icon: 'mdi-clock' },
        { label: 'Overdue', value: this.filings.filter(f => f.status === 'Overdue').length, color: 'red', icon: 'mdi-alert' },
        { label: 'Total Tax Paid', value: '€' + this.filings.filter(f => f.status === 'Filed').reduce((s, f) => s + Number(f.amount), 0).toLocaleString(), color: 'blue', icon: 'mdi-currency-eur' },
      ];
    },
  },
  methods: {
    addFiling() { this.filings.push({ ...this.form, id: Date.now() }); this.dialog = false; },
  },
};
</script>
