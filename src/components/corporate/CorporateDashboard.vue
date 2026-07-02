<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col>
        <h1 class="text-h5 font-weight-bold"><v-icon left color="deep-orange">mdi-domain</v-icon>{{ company.company_name || 'Corporate Dashboard' }}</h1>
        <p class="body-2 grey--text">{{ company.industry || '' }} · Legal operations overview</p>
      </v-col>
      <v-col cols="auto">
        <v-chip :color="company.status==='active'?'success':'grey'" dark small>{{ company.plan || 'standard' }} plan</v-chip>
      </v-col>
    </v-row>

    <v-row class="mb-4">
      <v-col cols="6" md="3" v-for="s in kpis" :key="s.label">
        <v-card outlined class="pa-4 text-center" :loading="loading">
          <v-icon :color="s.color" large>{{ s.icon }}</v-icon>
          <div class="overline mt-1">{{ s.label }}</div>
          <div class="text-h4 font-weight-bold" :class="s.color+'--text'">{{ s.value }}</div>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <v-card outlined class="pa-4">
          <v-card-title class="subtitle-1 pb-2">Request Breakdown</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-list dense>
            <v-list-item v-for="r in data.requests" :key="r.status">
              <v-list-item-icon><v-icon small :color="reqColor(r.status)">mdi-gavel</v-icon></v-list-item-icon>
              <v-list-item-content><v-list-item-title class="text-capitalize">{{ r.status }}</v-list-item-title></v-list-item-content>
              <v-list-item-action><v-chip small :color="reqColor(r.status)" dark>{{ r.count }}</v-chip></v-list-item-action>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card outlined class="pa-4">
          <v-card-title class="subtitle-1 pb-2">Quick Actions</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-btn block color="deep-orange" dark class="mb-2" to="/corporate/requests"><v-icon left small>mdi-plus</v-icon>New Legal Request</v-btn>
          <v-btn block outlined color="blue" class="mb-2" to="/corporate/approvals"><v-icon left small>mdi-check-decagram</v-icon>Pending Approvals ({{ data.pending_approvals || 0 }})</v-btn>
          <v-btn block outlined color="teal" class="mb-2" to="/corporate/contracts"><v-icon left small>mdi-file-sign</v-icon>Contracts</v-btn>
          <v-btn block outlined color="purple" to="/corporate/spending"><v-icon left small>mdi-chart-pie</v-icon>Spending Analytics</v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import { coGetDashboard } from '@/services/portalApi';
const CORP_ID = 1;
export default {
  name: 'CorporateDashboard',
  data() { return { data: {}, company: {}, loading: true }; },
  computed: {
    kpis() {
      const totalReqs = (this.data.requests || []).reduce((s, r) => s + Number(r.count), 0);
      const totalContracts = (this.data.contracts || []).reduce((s, r) => s + Number(r.count), 0);
      return [
        { label: 'Legal Requests', value: totalReqs, icon: 'mdi-gavel', color: 'deep-orange' },
        { label: 'Contracts', value: totalContracts, icon: 'mdi-file-sign', color: 'blue' },
        { label: 'Pending Approvals', value: this.data.pending_approvals || 0, icon: 'mdi-clock', color: 'orange' },
        { label: 'Contract Value', value: Number(this.data.active_contract_value||0).toLocaleString() + ' TND', icon: 'mdi-currency-usd', color: 'green' },
      ];
    },
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.data = await coGetDashboard(CORP_ID); this.company = this.data.company || {}; }
      catch (e) { console.error(e); }
      finally { this.loading = false; }
    },
    reqColor(s) { const m = { submitted:'blue', in_progress:'orange', resolved:'success', rejected:'error' }; return m[s]||'grey'; },
  },
};
</script>
