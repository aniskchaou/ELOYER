<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col>
        <h1 class="text-h5 font-weight-bold"><v-icon left color="red lighten-1">mdi-office-building</v-icon>Firm Administration Dashboard</h1>
        <p class="body-2 grey--text">Operations overview for your law firm</p>
      </v-col>
    </v-row>

    <v-row class="mb-4">
      <v-col cols="6" md="3" v-for="kpi in kpis" :key="kpi.label">
        <v-card outlined class="pa-4" :loading="loading">
          <div class="overline grey--text">{{ kpi.label }}</div>
          <div class="text-h4 font-weight-bold" :class="kpi.color + '--text'">{{ kpi.value }}</div>
          <div class="caption grey--text">{{ kpi.sub }}</div>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <!-- Staff Breakdown -->
      <v-col cols="12" md="5">
        <v-card outlined class="pa-4" :loading="loading">
          <v-card-title class="subtitle-1 pb-2">Staff by Role</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-list dense>
            <v-list-item v-for="s in data.staff" :key="s.role">
              <v-list-item-icon><v-icon small>mdi-account</v-icon></v-list-item-icon>
              <v-list-item-content><v-list-item-title>{{ s.role }}</v-list-item-title></v-list-item-content>
              <v-list-item-action><v-chip small color="blue" dark>{{ s.total }}</v-chip></v-list-item-action>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Cases by Status -->
      <v-col cols="12" md="7">
        <v-card outlined class="pa-4" :loading="loading">
          <v-card-title class="subtitle-1 pb-2">Cases by Status</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-row>
            <v-col v-for="c in data.cases" :key="c.status" cols="6" md="4" class="text-center">
              <v-chip :color="caseColor(c.status)" dark class="ma-1">{{ c.status }}: {{ c.total }}</v-chip>
            </v-col>
          </v-row>
          <v-divider class="my-3"></v-divider>
          <v-row class="text-center">
            <v-col cols="6">
              <div class="overline grey--text">Revenue Paid</div>
              <div class="text-h5 font-weight-bold green--text">${{ Number(data.revenue && data.revenue.paid || 0).toLocaleString() }}</div>
            </v-col>
            <v-col cols="6">
              <div class="overline grey--text">Revenue Pending</div>
              <div class="text-h5 font-weight-bold orange--text">${{ Number(data.revenue && data.revenue.pending || 0).toLocaleString() }}</div>
            </v-col>
          </v-row>
        </v-card>
      </v-col>

      <!-- Quick Links -->
      <v-col cols="12">
        <v-card outlined class="pa-4">
          <v-card-title class="subtitle-1 pb-2">Quick Actions</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-row>
            <v-col v-for="action in quickActions" :key="action.label" cols="6" md="2">
              <v-btn block outlined :to="action.to" class="mb-2" :color="action.color">
                <v-icon left small>{{ action.icon }}</v-icon>{{ action.label }}
              </v-btn>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { faGetDashboard } from '@/services/firmadminApi';
export default {
  name: 'FirmAdminDashboard',
  data() {
    return {
      data: { staff: [], cases: [], revenue: {}, tasks: [] },
      loading: true,
      quickActions: [
        { label: 'Invite Staff', to: '/firmadmin/invitations', icon: 'mdi-account-plus', color: 'blue' },
        { label: 'Departments', to: '/firmadmin/departments', icon: 'mdi-sitemap', color: 'teal' },
        { label: 'Locations', to: '/firmadmin/locations', icon: 'mdi-map-marker', color: 'orange' },
        { label: 'Workflows', to: '/firmadmin/workflows', icon: 'mdi-sitemap', color: 'purple' },
        { label: 'Revenue', to: '/firmadmin/revenue', icon: 'mdi-chart-line', color: 'green' },
        { label: 'Pricing', to: '/firmadmin/pricing', icon: 'mdi-currency-usd', color: 'indigo' },
      ],
    };
  },
  computed: {
    kpis() {
      const totalStaff = this.data.staff.reduce((s, r) => s + Number(r.total), 0);
      const totalCases = this.data.cases.reduce((s, c) => s + Number(c.total), 0);
      const totalTasks = this.data.tasks.reduce((s, t) => s + Number(t.total), 0);
      return [
        { label: 'Total Staff', value: totalStaff, sub: 'across all roles', color: 'blue' },
        { label: 'Total Cases', value: totalCases, sub: 'active + closed', color: 'teal' },
        { label: 'Total Tasks', value: totalTasks, sub: 'all statuses', color: 'orange' },
        { label: 'Clients', value: this.data.totalClients || 0, sub: 'registered', color: 'green' },
      ];
    },
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.data = await faGetDashboard(); }
      catch (e) { console.error(e); }
      finally { this.loading = false; }
    },
    caseColor(s) {
      const m = { open: 'blue', in_progress: 'orange', closed: 'grey', won: 'success', lost: 'error' };
      return m[s] || 'grey';
    },
  },
};
</script>
