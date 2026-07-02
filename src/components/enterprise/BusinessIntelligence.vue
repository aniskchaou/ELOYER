<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Business Intelligence</h1><p class="body-2 grey--text">Advanced analytics and KPI dashboards</p></v-col>
      <v-col cols="auto"><v-btn outlined color="deep-orange" @click="saveReport"><v-icon left>mdi-content-save</v-icon>Save Report</v-btn></v-col>
    </v-row>

    <v-row class="mb-4">
      <v-col cols="6" md="3" v-for="s in summaryKpis" :key="s.label">
        <v-card outlined class="pa-4 text-center" :loading="loading">
          <div class="overline grey--text">{{ s.label }}</div>
          <div class="text-h4 font-weight-bold" :class="s.color+'--text'">{{ s.value }}</div>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <!-- Revenue Trend -->
      <v-col cols="12" md="6">
        <v-card outlined class="pa-4" :loading="loading">
          <v-card-title class="subtitle-1 pb-2">Monthly Revenue (6 months)</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-list dense>
            <v-list-item v-for="m in (biData.monthly_revenue || [])" :key="m.month">
              <v-list-item-content><v-list-item-title>{{ m.month }}</v-list-item-title></v-list-item-content>
              <v-list-item-action class="d-flex flex-row align-center" style="min-width:200px">
                <v-progress-linear :value="(m.revenue / maxRevenue) * 100" color="deep-orange" rounded height="10" class="mr-3" style="min-width:120px"></v-progress-linear>
                <span class="caption">${{ Number(m.revenue || 0).toLocaleString() }}</span>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Cases by type -->
      <v-col cols="12" md="6">
        <v-card outlined class="pa-4" :loading="loading">
          <v-card-title class="subtitle-1 pb-2">Cases by Type</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-list dense>
            <v-list-item v-for="c in casesGrouped" :key="c.case_type">
              <v-list-item-content><v-list-item-title>{{ c.case_type || 'Unknown' }}</v-list-item-title></v-list-item-content>
              <v-list-item-action class="d-flex flex-row align-center">
                <v-chip small :color="typeColor(c.case_type)" dark class="mr-2">{{ c.total }}</v-chip>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Users by Role -->
      <v-col cols="12" md="5">
        <v-card outlined class="pa-4" :loading="loading">
          <v-card-title class="subtitle-1 pb-2">Staff by Role</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-list dense>
            <v-list-item v-for="u in (biData.users_by_role || [])" :key="u.role">
              <v-list-item-content><v-list-item-title class="text-capitalize">{{ u.role.replace(/_/g,' ') }}</v-list-item-title></v-list-item-content>
              <v-list-item-action><v-chip small color="indigo" dark>{{ u.count }}</v-chip></v-list-item-action>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Billable Summary -->
      <v-col cols="12" md="7">
        <v-card outlined class="pa-4" :loading="loading">
          <v-card-title class="subtitle-1 pb-2">Billable Hours Summary</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-row class="text-center" v-if="biData.billable">
            <v-col cols="6">
              <div class="text-h3 font-weight-bold teal--text">{{ Number(biData.billable.total_hours || 0).toFixed(1) }}h</div>
              <div class="caption grey--text">Total Billable Hours</div>
            </v-col>
            <v-col cols="6">
              <div class="text-h3 font-weight-bold green--text">${{ Number(biData.billable.total_value || 0).toLocaleString() }}</div>
              <div class="caption grey--text">Total Billable Value</div>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
    <v-snackbar v-model="snack" color="success" top>Report saved to BI library.</v-snackbar>
  </v-container>
</template>
<script>
import { entGetBI } from '@/services/enterpriseApi';
export default {
  name: 'BusinessIntelligence',
  data() { return { biData: {}, loading: true, snack: false }; },
  computed: {
    maxRevenue() { return Math.max(...(this.biData.monthly_revenue || []).map(m => Number(m.revenue || 0)), 1); },
    casesGrouped() {
      const map = {};
      for (const c of (this.biData.cases_by_type || [])) {
        if (!map[c.case_type]) map[c.case_type] = { case_type: c.case_type, total: 0 };
        map[c.case_type].total += Number(c.count || 0);
      }
      return Object.values(map).sort((a, b) => b.total - a.total);
    },
    summaryKpis() {
      const totalRevenue = (this.biData.monthly_revenue || []).reduce((s, m) => s + Number(m.revenue || 0), 0);
      const totalCases = this.casesGrouped.reduce((s, c) => s + c.total, 0);
      const totalStaff = (this.biData.users_by_role || []).reduce((s, u) => s + Number(u.count || 0), 0);
      return [
        { label: 'Revenue (6 mo)', value: '$' + totalRevenue.toLocaleString(), color: 'green' },
        { label: 'Total Cases', value: totalCases, color: 'blue' },
        { label: 'Total Staff', value: totalStaff, color: 'indigo' },
        { label: 'Billable Hours', value: Number((this.biData.billable && this.biData.billable.total_hours) || 0).toFixed(0) + 'h', color: 'teal' },
      ];
    },
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.biData = await entGetBI(); }
      catch (e) { console.error(e); }
      finally { this.loading = false; }
    },
    saveReport() { this.snack = true; },
    typeColor(t) { const m = { Civil:'blue', Commercial:'orange', Labour:'green', Criminal:'red', Family:'pink', Corporate:'indigo' }; return m[t] || 'grey'; },
  },
};
</script>
