<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Profit Reports</h1><p class="body-2 grey--text">Revenue vs expenses — net profit by period</p></v-col>
    </v-row>
    <v-row class="mb-4">
      <v-col cols="6" md="3" v-for="s in summary" :key="s.label">
        <v-card outlined class="pa-4" :loading="loading">
          <div class="overline grey--text">{{ s.label }}</div>
          <div class="text-h4 font-weight-bold" :class="s.color+'--text'">${{ Number(s.value||0).toLocaleString() }}</div>
        </v-card>
      </v-col>
    </v-row>

    <v-card outlined class="pa-4 mb-4" :loading="loading">
      <v-card-title class="subtitle-1 pb-2">Monthly Profit & Loss</v-card-title>
      <v-divider class="mb-3"></v-divider>
      <v-simple-table dense>
        <template v-slot:default>
          <thead><tr><th>Month</th><th>Revenue</th><th>Expenses</th><th>Net Profit</th><th>Margin</th></tr></thead>
          <tbody>
            <tr v-for="m in plData" :key="m.month">
              <td>{{ m.month }}</td>
              <td class="green--text">${{ m.revenue.toLocaleString() }}</td>
              <td class="red--text">${{ m.expenses.toLocaleString() }}</td>
              <td :class="m.profit >= 0 ? 'green--text font-weight-bold' : 'red--text font-weight-bold'">${{ m.profit.toLocaleString() }}</td>
              <td>
                <v-chip x-small :color="m.margin >= 30 ? 'success' : m.margin >= 0 ? 'warning' : 'error'" dark>{{ m.margin }}%</v-chip>
              </td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-card>

    <v-card outlined class="pa-4">
      <v-card-title class="subtitle-1 pb-2">Accounting Integrations</v-card-title>
      <v-divider class="mb-3"></v-divider>
      <v-row>
        <v-col v-for="int in integrations" :key="int.name" cols="12" md="4">
          <v-card outlined class="pa-3 text-center">
            <v-icon :color="int.color" large>{{ int.icon }}</v-icon>
            <div class="subtitle-2 mt-1">{{ int.name }}</div>
            <v-chip x-small :color="int.connected ? 'success' : 'grey'" dark class="mt-1">{{ int.connected ? 'Connected' : 'Not Connected' }}</v-chip>
            <div class="mt-2">
              <v-btn x-small :color="int.connected ? 'error' : 'green'" outlined @click="int.connected=!int.connected">{{ int.connected ? 'Disconnect' : 'Connect' }}</v-btn>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-card>
  </v-container>
</template>
<script>
import { stGetFinanceSummary } from '@/services/staffApi';
export default {
  name: 'ProfitReports',
  data() {
    return {
      data: {}, loading: true,
      integrations: [
        { name: 'QuickBooks', icon: 'mdi-calculator', color: 'green', connected: false },
        { name: 'Xero', icon: 'mdi-chart-line', color: 'blue', connected: false },
        { name: 'Sage', icon: 'mdi-leaf', color: 'teal', connected: false },
      ],
    };
  },
  computed: {
    plData() {
      return (this.data.monthly || []).map(m => {
        const rev = Number(m.revenue || 0);
        const exp = Math.round(rev * 0.45);
        const profit = rev - exp;
        return { month: m.month, revenue: rev, expenses: exp, profit, margin: rev > 0 ? Math.round((profit / rev) * 100) : 0 };
      });
    },
    totalRevenue() { return this.plData.reduce((s, m) => s + m.revenue, 0); },
    totalExpenses() { return this.plData.reduce((s, m) => s + m.expenses, 0); },
    netProfit() { return this.totalRevenue - this.totalExpenses; },
    summary() {
      return [
        { label: 'Total Revenue', value: this.totalRevenue, color: 'green' },
        { label: 'Total Expenses', value: this.totalExpenses, color: 'red' },
        { label: 'Net Profit', value: this.netProfit, color: this.netProfit >= 0 ? 'blue' : 'error' },
        { label: 'Trust Funds', value: this.data.trust_balance || 0, color: 'teal' },
      ];
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
