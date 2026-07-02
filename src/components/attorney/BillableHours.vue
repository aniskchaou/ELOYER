<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Billable Hours</h1><p class="body-2 grey--text">Record and track billable time for accurate invoicing</p></v-col>
      <v-col cols="auto"><v-btn color="blue darken-2" dark @click="open()"><v-icon left>mdi-plus</v-icon>Log Hours</v-btn></v-col>
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
      <v-data-table :headers="headers" :items="hours" sort-by="date" sort-desc class="elevation-0">
        <template v-slot:item.hours="{ item }"><strong>{{ item.hours }}h</strong></template>
        <template v-slot:item.amount="{ item }">{{ (item.hours * item.rate).toLocaleString() }} TND</template>
        <template v-slot:item.is_billed="{ item }">
          <v-chip x-small :color="item.is_billed ? 'success' : 'orange'" dark>{{ item.is_billed ? 'Billed' : 'Unbilled' }}</v-chip>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-card-title>Log Billable Hours</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-text-field v-model="form.date" label="Date" outlined dense type="date" class="mb-2"></v-text-field>
          <v-text-field v-model.number="form.hours" label="Hours *" outlined dense type="number" step="0.25" class="mb-2"></v-text-field>
          <v-text-field v-model.number="form.rate" label="Hourly Rate (TND)" outlined dense type="number" class="mb-2"></v-text-field>
          <v-text-field v-model="form.activity" label="Activity Description *" outlined dense class="mb-2"></v-text-field>
          <div class="caption grey--text mb-2">Billable amount: {{ ((form.hours || 0) * (form.rate || 0)).toLocaleString() }} TND</div>
          <v-alert v-if="err" type="error" dense>{{ err }}</v-alert>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="dialog=false">Cancel</v-btn><v-btn color="blue darken-2" dark :loading="saving" @click="save">Log</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>
<script>
import { faGetBillableHours, faCreateBillableHour } from '@/services/firmadminApi';
export default {
  name: 'BillableHours',
  data() {
    const today = new Date().toISOString().slice(0, 10);
    return {
      hours: [], loading: true, dialog: false, saving: false, err: '',
      form: { lawyer_id: 1, date: today, hours: 1, rate: 150, activity: '' },
      snack: false, snackMsg: '', snackColor: 'success',
      headers: [
        { text: 'Date', value: 'date' },
        { text: 'Case', value: 'case_title' },
        { text: 'Activity', value: 'activity' },
        { text: 'Hours', value: 'hours' },
        { text: 'Amount', value: 'amount' },
        { text: 'Status', value: 'is_billed' },
      ],
    };
  },
  computed: {
    stats() {
      const total = this.hours.reduce((s, h) => s + Number(h.hours), 0);
      const billed = this.hours.filter(h => h.is_billed).reduce((s, h) => s + Number(h.hours), 0);
      const unbilledAmt = this.hours.filter(h => !h.is_billed).reduce((s, h) => s + (Number(h.hours) * Number(h.rate)), 0);
      return [
        { label: 'Total Hours', value: total.toFixed(1) + 'h', icon: 'mdi-clock', color: 'blue' },
        { label: 'Billed Hours', value: billed.toFixed(1) + 'h', icon: 'mdi-check-circle', color: 'green' },
        { label: 'Unbilled Hours', value: (total - billed).toFixed(1) + 'h', icon: 'mdi-clock-alert', color: 'orange' },
        { label: 'Unbilled Amount', value: unbilledAmt.toLocaleString() + ' TND', icon: 'mdi-currency-usd', color: 'teal' },
      ];
    },
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.hours = await faGetBillableHours(1); }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.loading = false; }
    },
    open() {
      this.form = { lawyer_id: 1, date: new Date().toISOString().slice(0, 10), hours: 1, rate: 150, activity: '' };
      this.err = ''; this.dialog = true;
    },
    async save() {
      if (!this.form.hours || !this.form.activity) { this.err = 'Hours and activity required.'; return; }
      this.saving = true;
      try { await faCreateBillableHour(this.form); this.notify('Hours logged.'); this.dialog = false; this.load(); }
      catch (e) { this.err = e.message; }
      finally { this.saving = false; }
    },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
