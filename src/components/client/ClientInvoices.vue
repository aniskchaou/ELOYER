<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">My Invoices</h1><p class="body-2 grey--text">View and pay your outstanding legal invoices</p></v-col>
    </v-row>
    <v-row class="mb-4">
      <v-col cols="6" md="3" v-for="s in stats" :key="s.label">
        <v-card outlined class="pa-3 text-center" :loading="loading">
          <v-icon :color="s.color">{{ s.icon }}</v-icon>
          <div class="overline mt-1">{{ s.label }}</div>
          <div class="body-1 font-weight-bold" :class="s.color+'--text'">{{ s.value }}</div>
        </v-card>
      </v-col>
    </v-row>
    <v-card outlined :loading="loading">
      <v-data-table :headers="headers" :items="invoices" dense class="elevation-0">
        <template v-slot:item.amount="{ item }">{{ Number(item.amount).toLocaleString() }} TND</template>
        <template v-slot:item.status="{ item }"><v-chip x-small :color="statusColor(item.status)" dark>{{ item.status }}</v-chip></template>
        <template v-slot:item.due_date="{ item }">
          <span :class="isPast(item.due_date) && item.status==='pending' ? 'red--text font-weight-bold':''">{{ item.due_date ? new Date(item.due_date).toLocaleDateString() : '—' }}</span>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn small color="teal" dark v-if="item.status==='pending'" @click="openPay(item)">
            <v-icon left small>mdi-credit-card</v-icon>Pay Now
          </v-btn>
          <v-chip x-small color="success" dark v-else-if="item.status==='paid'">Paid</v-chip>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="payDialog" max-width="440">
      <v-card v-if="selected">
        <v-card-title>Pay Invoice</v-card-title><v-divider></v-divider>
        <v-card-text class="pt-4">
          <div class="body-1 mb-3">Amount: <strong class="teal--text">{{ Number(selected.amount).toLocaleString() }} TND</strong></div>
          <v-select v-model="method" :items="methods" item-text="label" item-value="value" label="Payment Method" outlined dense class="mb-3"></v-select>
          <v-alert type="info" dense outlined>Secure payment processed via {{ method }}.</v-alert>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="payDialog=false">Cancel</v-btn><v-btn color="teal" dark :loading="paying" @click="pay">Confirm Payment</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>
<script>
import { cpGetInvoices, cpPayInvoice } from '@/services/portalApi';
const CLIENT_ID = 1;
export default {
  name: 'ClientInvoices',
  data() {
    return {
      invoices: [], loading: true, payDialog: false, paying: false, selected: null,
      method: 'bank_transfer',
      methods: [{ label: 'Bank Transfer', value: 'bank_transfer' }, { label: 'Credit Card', value: 'credit_card' }, { label: 'PayPal', value: 'paypal' }],
      snack: false, snackMsg: '', snackColor: 'success',
      headers: [
        { text: 'Case', value: 'case_title' }, { text: 'Amount', value: 'amount' },
        { text: 'Status', value: 'status' }, { text: 'Due', value: 'due_date' },
        { text: '', value: 'actions', sortable: false, align: 'end' },
      ],
    };
  },
  computed: {
    stats() {
      const paid = this.invoices.filter(i => i.status === 'paid').reduce((s, i) => s + Number(i.amount), 0);
      const pending = this.invoices.filter(i => i.status === 'pending').reduce((s, i) => s + Number(i.amount), 0);
      return [
        { label: 'Total Invoices', value: this.invoices.length, icon: 'mdi-receipt', color: 'grey' },
        { label: 'Paid', value: paid.toLocaleString() + ' TND', icon: 'mdi-check-circle', color: 'green' },
        { label: 'Pending', value: pending.toLocaleString() + ' TND', icon: 'mdi-clock', color: 'orange' },
        { label: 'Overdue', value: this.invoices.filter(i => i.status==='pending' && this.isPast(i.due_date)).length, icon: 'mdi-alert', color: 'red' },
      ];
    },
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.invoices = await cpGetInvoices(CLIENT_ID); }
      catch (e) { console.error(e); }
      finally { this.loading = false; }
    },
    openPay(inv) { this.selected = inv; this.payDialog = true; },
    async pay() {
      this.paying = true;
      try {
        await cpPayInvoice({ client_id: CLIENT_ID, invoice_id: this.selected.id, amount: this.selected.amount, payment_method: this.method });
        this.notify('Payment successful!'); this.payDialog = false; this.load();
      } catch (e) { this.notify(e.message, 'error'); }
      finally { this.paying = false; }
    },
    isPast(d) { return d && new Date(d) < new Date(); },
    statusColor(s) { return s === 'paid' ? 'success' : s === 'pending' ? 'orange' : s === 'overdue' ? 'error' : 'grey'; },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
