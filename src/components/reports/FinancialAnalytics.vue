<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Financial Analytics</h1><p class="body-2 grey--text">Revenue trends, expenses, and profit margin analysis</p></v-col>
      <v-col cols="auto">
        <v-select v-model="period" :items="periods" outlined dense hide-details style="max-width:150px"></v-select>
      </v-col>
    </v-row>

    <v-row class="mb-4">
      <v-col v-for="s in kpis" :key="s.label" cols="6" md="3">
        <v-card outlined class="pa-4 text-center">
          <v-icon :color="s.color" class="mb-1">{{ s.icon }}</v-icon>
          <div class="overline">{{ s.label }}</div>
          <p class="text-h5 font-weight-bold" :class="s.color+'--text'">{{ s.value }}</p>
          <div class="caption" :class="s.change >= 0 ? 'green--text' : 'red--text'">
            <v-icon x-small>{{ s.change >= 0 ? 'mdi-arrow-up' : 'mdi-arrow-down' }}</v-icon> {{ Math.abs(s.change) }}%
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <v-card outlined class="pa-4">
          <v-card-title class="subtitle-1">Revenue vs Expenses</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <div v-for="m in months" :key="m.name" class="mb-3">
            <div class="caption font-weight-bold mb-1">{{ m.name }}</div>
            <div class="d-flex align-center mb-1">
              <span class="caption mr-2" style="min-width:70px">Revenue</span>
              <v-progress-linear :value="(m.revenue / maxVal) * 100" height="10" rounded color="green" style="flex:1"></v-progress-linear>
              <span class="caption ml-2">€{{ m.revenue.toLocaleString() }}</span>
            </div>
            <div class="d-flex align-center">
              <span class="caption mr-2" style="min-width:70px">Expenses</span>
              <v-progress-linear :value="(m.expenses / maxVal) * 100" height="10" rounded color="red lighten-2" style="flex:1"></v-progress-linear>
              <span class="caption ml-2">€{{ m.expenses.toLocaleString() }}</span>
            </div>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card outlined class="pa-4">
          <v-card-title class="subtitle-1">Profit Margin by Practice Area</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <div v-for="a in areas" :key="a.name" class="mb-3">
            <div class="d-flex justify-space-between caption mb-1">
              <span>{{ a.name }}</span>
              <span class="font-weight-bold" :class="a.margin >= 60 ? 'green--text' : a.margin >= 40 ? 'orange--text' : 'red--text'">{{ a.margin }}%</span>
            </div>
            <v-progress-linear :value="a.margin" height="10" rounded :color="a.margin >= 60 ? 'green' : a.margin >= 40 ? 'orange' : 'red'"></v-progress-linear>
          </div>
        </v-card>
        <v-card outlined class="pa-4 mt-4">
          <v-card-title class="subtitle-1">Outstanding Receivables</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <div v-for="r in receivables" :key="r.range" class="mb-2">
            <div class="d-flex justify-space-between caption mb-1">
              <span>{{ r.range }}</span>
              <span class="font-weight-bold" :class="r.color+'--text'">€{{ r.amount.toLocaleString() }}</span>
            </div>
            <v-progress-linear :value="(r.amount / maxReceivable) * 100" height="8" rounded :color="r.color"></v-progress-linear>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
export default {
  name: 'FinancialAnalytics',
  data() {
    return {
      period: '2026',
      periods: ['2024', '2025', '2026', 'Q1 2026', 'Q2 2026'],
      kpis: [
        { label: 'Total Revenue', value: '€48,500', color: 'green', icon: 'mdi-trending-up', change: 14 },
        { label: 'Total Expenses', value: '€12,200', color: 'red', icon: 'mdi-cash-minus', change: -3 },
        { label: 'Net Profit', value: '€36,300', color: 'blue', icon: 'mdi-bank', change: 22 },
        { label: 'Profit Margin', value: '74.8%', color: 'orange', icon: 'mdi-percent', change: 5 },
      ],
      months: [
        { name: 'January', revenue: 14000, expenses: 3800 },
        { name: 'February', revenue: 16500, expenses: 4200 },
        { name: 'March', revenue: 15000, expenses: 3600 },
        { name: 'April', revenue: 18500, expenses: 4800 },
        { name: 'May', revenue: 12000, expenses: 3100 },
      ],
      areas: [
        { name: 'Corporate Law', margin: 78 },
        { name: 'Criminal Law', margin: 65 },
        { name: 'Civil Law', margin: 58 },
        { name: 'Family Law', margin: 70 },
        { name: 'Administrative', margin: 42 },
      ],
      receivables: [
        { range: '0-30 days', amount: 3200, color: 'green' },
        { range: '31-60 days', amount: 1800, color: 'orange' },
        { range: '61-90 days', amount: 900, color: 'red lighten-2' },
        { range: '90+ days', amount: 500, color: 'red' },
      ],
    };
  },
  computed: {
    maxVal() { return Math.max(...this.months.map(m => m.revenue)); },
    maxReceivable() { return Math.max(...this.receivables.map(r => r.amount)); },
  },
};
</script>
