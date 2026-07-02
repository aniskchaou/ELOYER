<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Trust Account Ledger</h1><p class="body-2 grey--text">Client trust funds — deposits, withdrawals and balances</p></v-col>
      <v-col cols="auto"><v-btn color="green darken-2" dark @click="txDialog=true"><v-icon left>mdi-plus</v-icon>Record Transaction</v-btn></v-col>
    </v-row>

    <!-- Accounts -->
    <v-row class="mb-4">
      <v-col v-for="acc in accounts" :key="acc.id" cols="12" md="6">
        <v-card outlined class="pa-4" :class="selected && selected.id===acc.id ? 'green lighten-5' : ''" @click="selected=acc" style="cursor:pointer">
          <div class="d-flex align-center mb-2">
            <v-icon color="green" class="mr-2">mdi-safe</v-icon>
            <div class="subtitle-2 font-weight-bold">{{ acc.account_name }}</div>
            <v-spacer></v-spacer>
            <v-chip small :color="acc.balance > 0 ? 'green' : 'grey'" dark>{{ acc.currency }} {{ Number(acc.balance).toLocaleString() }}</v-chip>
          </div>
          <div class="caption grey--text">{{ acc.bank_name || 'No bank' }} · {{ acc.case_title || acc.client_name || 'General' }}</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Transactions -->
    <v-card outlined :loading="loading">
      <v-card-title class="subtitle-1">
        {{ selected ? 'Transactions — ' + selected.account_name : 'Recent Transactions (All)' }}
      </v-card-title>
      <v-data-table :headers="headers" :items="displayTx" dense class="elevation-0">
        <template v-slot:item.transaction_type="{ item }">
          <v-chip x-small :color="item.transaction_type==='deposit'?'green':'red'" dark>{{ item.transaction_type }}</v-chip>
        </template>
        <template v-slot:item.amount="{ item }">
          <span :class="item.transaction_type==='deposit'?'green--text':'red--text'">
            {{ item.transaction_type==='deposit' ? '+' : '-' }}{{ Number(item.amount).toLocaleString() }}
          </span>
        </template>
        <template v-slot:item.balance_after="{ item }">{{ Number(item.balance_after||0).toLocaleString() }}</template>
        <template v-slot:item.transaction_date="{ item }">{{ item.transaction_date }}</template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="txDialog" max-width="480">
      <v-card>
        <v-card-title>Record Transaction</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-select v-model="txForm.trust_account_id" :items="accounts" item-text="account_name" item-value="id" label="Trust Account *" outlined dense class="mb-2"></v-select>
          <v-select v-model="txForm.transaction_type" :items="['deposit','withdrawal','fee','refund']" label="Type *" outlined dense class="mb-2"></v-select>
          <v-text-field v-model.number="txForm.amount" label="Amount (TND) *" outlined dense type="number" class="mb-2"></v-text-field>
          <v-text-field v-model="txForm.description" label="Description" outlined dense class="mb-2"></v-text-field>
          <v-text-field v-model="txForm.reference" label="Reference / Cheque No." outlined dense></v-text-field>
          <v-alert v-if="err" type="error" dense class="mt-2">{{ err }}</v-alert>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="txDialog=false">Cancel</v-btn><v-btn color="green darken-2" dark :loading="saving" @click="record">Record</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>
<script>
import { stGetTrustAccounts, stAddTrustTransaction } from '@/services/staffApi';
export default {
  name: 'TrustLedger',
  data() {
    return {
      accounts: [], transactions: [], selected: null, loading: true,
      txDialog: false, saving: false, err: '',
      txForm: { trust_account_id: null, transaction_type: 'deposit', amount: null, description: '', reference: '', recorded_by: 1 },
      snack: false, snackMsg: '', snackColor: 'success',
      headers: [
        { text: 'Date', value: 'transaction_date' },
        { text: 'Type', value: 'transaction_type' },
        { text: 'Amount (TND)', value: 'amount' },
        { text: 'Balance After', value: 'balance_after' },
        { text: 'Description', value: 'description' },
        { text: 'Reference', value: 'reference' },
      ],
    };
  },
  computed: {
    displayTx() {
      if (this.selected) return this.transactions.filter(t => t.trust_account_id === this.selected.id);
      return this.transactions;
    },
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { const r = await stGetTrustAccounts(); this.accounts = r.accounts; this.transactions = r.recent_transactions; }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.loading = false; }
    },
    async record() {
      if (!this.txForm.trust_account_id || !this.txForm.amount) { this.err = 'Account and amount required.'; return; }
      this.saving = true;
      try { await stAddTrustTransaction(this.txForm); this.notify('Transaction recorded.'); this.txDialog = false; this.load(); }
      catch (e) { this.err = e.message; }
      finally { this.saving = false; }
    },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
