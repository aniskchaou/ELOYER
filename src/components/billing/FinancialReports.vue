<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Financial Reports</h1><p class="body-2 grey--text">Revenue, expenses, and profitability analytics</p></v-col>
      <v-col cols="auto">
        <v-select v-model="period" :items="periods" outlined dense hide-details style="max-width:160px"></v-select>
      </v-col>
    </v-row>

    <v-row class="mb-4">
      <v-col v-for="s in kpis" :key="s.label" cols="6" md="3">
        <v-card outlined class="pa-4 text-center">
          <v-icon :color="s.color" class="mb-1">{{ s.icon }}</v-icon>
          <div class="overline">{{ s.label }}</div>
          <p class="text-h5 font-weight-bold" :class="s.color+'--text'">{{ s.value }}</p>
          <div class="caption" :class="s.trend >= 0 ? 'green--text' : 'red--text'">
            <v-icon x-small :color="s.trend >= 0 ? 'green' : 'red'">{{ s.trend >= 0 ? 'mdi-trending-up' : 'mdi-trending-down' }}</v-icon>
            {{ Math.abs(s.trend) }}% vs last period
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <v-card outlined class="pa-4">
          <v-card-title class="subtitle-1">Revenue by Practice Area</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <div v-for="item in revenueByArea" :key="item.area" class="mb-3">
            <div class="d-flex justify-space-between caption mb-1">
              <span>{{ item.area }}</span>
              <span class="font-weight-bold">€{{ item.amount.toLocaleString() }}</span>
            </div>
            <v-progress-linear :value="(item.amount / maxRevenue) * 100" height="10" rounded :color="item.color"></v-progress-linear>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card outlined class="pa-4">
          <v-card-title class="subtitle-1">Monthly Revenue Trend</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <div v-for="(m, i) in monthlyRevenue" :key="i" class="mb-2">
            <div class="d-flex justify-space-between caption mb-1">
              <span>{{ m.month }}</span>
              <span class="font-weight-bold">€{{ m.revenue.toLocaleString() }}</span>
            </div>
            <v-progress-linear :value="(m.revenue / maxMonthly) * 100" height="10" rounded color="blue"></v-progress-linear>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12">
        <v-card outlined>
          <v-card-title class="subtitle-1">Billing Summary by Client</v-card-title>
          <v-divider></v-divider>
          <v-data-table :headers="tableHeaders" :items="clientSummary" dense>
            <template v-slot:item.outstanding="{ item }">
              <span :class="item.outstanding > 0 ? 'orange--text font-weight-bold' : 'green--text'">€{{ item.outstanding }}</span>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
export default {
  name: 'FinancialReports',
  data() {
    return {
      period: 'Q2 2026',
      periods: ['Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026', 'Full Year 2025'],
      kpis: [
        { label: 'Total Revenue', value: '€48,500', color: 'green', icon: 'mdi-currency-eur', trend: 12 },
        { label: 'Total Expenses', value: '€12,200', color: 'red', icon: 'mdi-cash-minus', trend: -5 },
        { label: 'Net Profit', value: '€36,300', color: 'blue', icon: 'mdi-trending-up', trend: 18 },
        { label: 'Unpaid Invoices', value: '€6,800', color: 'orange', icon: 'mdi-clock-alert', trend: -3 },
      ],
      revenueByArea: [
        { area: 'Corporate Law', amount: 18000, color: 'blue' },
        { area: 'Criminal Law', amount: 12000, color: 'red' },
        { area: 'Civil Law', amount: 9500, color: 'green' },
        { area: 'Family Law', amount: 6000, color: 'pink' },
        { area: 'Administrative', amount: 3000, color: 'purple' },
      ],
      monthlyRevenue: [
        { month: 'January', revenue: 14000 },
        { month: 'February', revenue: 16500 },
        { month: 'March', revenue: 15000 },
        { month: 'April', revenue: 18500 },
        { month: 'May', revenue: 12000 },
      ],
      clientSummary: [
        { client: 'Société ABC SARL', billed: 24000, paid: 20000, outstanding: 4000 },
        { client: 'Ahmed Ben Ali', billed: 8500, paid: 7700, outstanding: 800 },
        { client: 'Leila Mansour', billed: 6000, paid: 4000, outstanding: 2000 },
        { client: 'ONG HelpAid', billed: 0, paid: 0, outstanding: 0 },
      ],
      tableHeaders: [
        { text: 'Client', value: 'client' }, { text: 'Billed (€)', value: 'billed' },
        { text: 'Paid (€)', value: 'paid' }, { text: 'Outstanding', value: 'outstanding' },
      ],
    };
  },
  computed: {
    maxRevenue() { return Math.max(...this.revenueByArea.map(r => r.amount)); },
    maxMonthly() { return Math.max(...this.monthlyRevenue.map(m => m.revenue)); },
  },
};
</script>
