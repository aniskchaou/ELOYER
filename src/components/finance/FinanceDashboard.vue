<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold"><v-icon left color="green darken-2">mdi-bank</v-icon>Finance Dashboard</h1><p class="body-2 grey--text">Complete financial overview — revenue, trust, payroll</p></v-col>
    </v-row>

    <v-row class="mb-4">
      <v-col cols="6" md="3" v-for="s in kpis" :key="s.label">
        <v-card outlined class="pa-4" :loading="loading">
          <div class="overline grey--text">{{ s.label }}</div>
          <div class="text-h4 font-weight-bold" :class="s.color+'--text'">${{ Number(s.value||0).toLocaleString() }}</div>
          <div class="caption grey--text">{{ s.sub }}</div>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <!-- Monthly Revenue -->
      <v-col cols="12" md="7">
        <v-card outlined class="pa-4" :loading="loading">
          <v-card-title class="subtitle-1 pb-2">Monthly Revenue (Last 6 Months)</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-list dense>
            <v-list-item v-for="m in (data.monthly||[])" :key="m.month">
              <v-list-item-content><v-list-item-title>{{ m.month }}</v-list-item-title></v-list-item-content>
              <v-list-item-action class="d-flex flex-row align-center" style="min-width:240px">
                <v-progress-linear :value="(m.revenue/maxMonth)*100" color="green" rounded height="10" class="mr-3" style="min-width:130px"></v-progress-linear>
                <span class="caption">${{ Number(m.revenue||0).toLocaleString() }}</span>
              </v-list-item-action>
            </v-list-item>
            <v-list-item v-if="!data.monthly||!data.monthly.length"><v-list-item-content><v-list-item-subtitle>No data yet.</v-list-item-subtitle></v-list-item-content></v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Invoice Breakdown + Quick Nav -->
      <v-col cols="12" md="5">
        <v-card outlined class="pa-4 mb-4" :loading="loading">
          <v-card-title class="subtitle-1 pb-2">Invoice Breakdown</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-list dense v-if="data.invoices">
            <v-list-item>
              <v-list-item-icon><v-icon small color="green">mdi-check-circle</v-icon></v-list-item-icon>
              <v-list-item-content><v-list-item-title>Paid</v-list-item-title></v-list-item-content>
              <v-list-item-action><v-chip small color="green" dark>${{ Number(data.invoices.paid||0).toLocaleString() }}</v-chip></v-list-item-action>
            </v-list-item>
            <v-list-item>
              <v-list-item-icon><v-icon small color="orange">mdi-clock</v-icon></v-list-item-icon>
              <v-list-item-content><v-list-item-title>Pending</v-list-item-title></v-list-item-content>
              <v-list-item-action><v-chip small color="orange" dark>${{ Number(data.invoices.pending||0).toLocaleString() }}</v-chip></v-list-item-action>
            </v-list-item>
            <v-list-item>
              <v-list-item-icon><v-icon small color="red">mdi-alert</v-icon></v-list-item-icon>
              <v-list-item-content><v-list-item-title>Overdue</v-list-item-title></v-list-item-content>
              <v-list-item-action><v-chip small color="error" dark>${{ Number(data.invoices.overdue||0).toLocaleString() }}</v-chip></v-list-item-action>
            </v-list-item>
          </v-list>
        </v-card>
        <v-card outlined class="pa-4">
          <v-card-title class="subtitle-1 pb-2">Quick Navigation</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-btn block outlined color="blue" class="mb-2" to="/finance/payments"><v-icon left small>mdi-credit-card</v-icon>Payment Tracking</v-btn>
          <v-btn block outlined color="teal" class="mb-2" to="/finance/trust"><v-icon left small>mdi-safe</v-icon>Trust Ledger</v-btn>
          <v-btn block outlined color="purple" class="mb-2" to="/finance/payroll"><v-icon left small>mdi-account-cash</v-icon>Payroll</v-btn>
          <v-btn block outlined color="orange" to="/finance/reports"><v-icon left small>mdi-chart-bar</v-icon>Profit Reports</v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import { stGetFinanceSummary } from '@/services/staffApi';
export default {
  name: 'FinanceDashboard',
  data() { return { data: {}, loading: true }; },
  computed: {
    kpis() {
      return [
        { label: 'Total Revenue', value: this.data.invoices && this.data.invoices.paid, sub: 'paid invoices', color: 'green' },
        { label: 'Pending', value: this.data.invoices && this.data.invoices.pending, sub: 'awaiting payment', color: 'orange' },
        { label: 'Trust Balance', value: this.data.trust_balance, sub: 'in trust accounts', color: 'blue' },
        { label: 'Payroll (Mo.)', value: this.data.payroll_this_month, sub: 'paid this month', color: 'purple' },
      ];
    },
    maxMonth() {
      const vals = (this.data.monthly || []).map(m => Number(m.revenue || 0));
      return vals.length ? Math.max(...vals) : 1;
    },
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.data = await stGetFinanceSummary(); }
      catch (e) { console.error(e); }
      finally { this.loading = false; }
    },
  },
};
</script>
