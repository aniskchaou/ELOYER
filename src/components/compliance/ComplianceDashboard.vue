<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold"><v-icon left color="red darken-3">mdi-shield-check</v-icon>Compliance Dashboard</h1><p class="body-2 grey--text">Document compliance reviews, risk flags and approval status</p></v-col>
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
      <v-col cols="12" md="7">
        <v-card outlined :loading="loading">
          <v-card-title class="subtitle-1">Recent Reviews</v-card-title>
          <v-list dense>
            <v-list-item v-for="r in reviews.slice(0,5)" :key="r.id">
              <v-list-item-icon><v-icon small :color="riskColor(r.overall_risk)">mdi-shield</v-icon></v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ r.title }}</v-list-item-title>
                <v-list-item-subtitle>{{ r.flags.length }} flags · {{ r.review_type }}</v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action class="d-flex flex-row">
                <v-chip x-small :color="riskColor(r.overall_risk)" dark class="mr-1">{{ r.overall_risk }}</v-chip>
                <v-chip x-small :color="statusColor(r.status)" dark>{{ r.status }}</v-chip>
              </v-list-item-action>
            </v-list-item>
            <v-list-item v-if="!reviews.length"><v-list-item-content><v-list-item-subtitle>No reviews yet.</v-list-item-subtitle></v-list-item-content></v-list-item>
          </v-list>
        </v-card>
      </v-col>
      <v-col cols="12" md="5">
        <v-card outlined class="pa-4">
          <v-card-title class="subtitle-1 pb-2">Quick Actions</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-btn block color="red darken-3" dark class="mb-2" to="/compliance/ai-checker"><v-icon left small>mdi-robot</v-icon>AI Compliance Check</v-btn>
          <v-btn block outlined color="blue" class="mb-2" to="/compliance/clauses"><v-icon left small>mdi-text-search</v-icon>Clause Comparison</v-btn>
          <v-btn block outlined color="orange" class="mb-2" to="/compliance/risk"><v-icon left small>mdi-chart-pie</v-icon>Risk Analysis</v-btn>
          <v-btn block outlined color="green" to="/compliance/approvals"><v-icon left small>mdi-check-decagram</v-icon>Approval Workflow</v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import { extGetCompliance } from '@/services/externalApi';
export default {
  name: 'ComplianceDashboard',
  data() { return { reviews: [], loading: true }; },
  computed: {
    kpis() {
      const allFlags = this.reviews.flatMap(r => r.flags || []);
      return [
        { label: 'Reviews Done', value: this.reviews.length, icon: 'mdi-shield-check', color: 'red darken-3' },
        { label: 'High Risk', value: this.reviews.filter(r => r.overall_risk === 'high').length, icon: 'mdi-alert-circle', color: 'error' },
        { label: 'Flags', value: allFlags.filter(f => !f.is_resolved).length, icon: 'mdi-flag', color: 'orange' },
        { label: 'Approved', value: this.reviews.filter(r => r.status === 'approved').length, icon: 'mdi-check-circle', color: 'green' },
      ];
    },
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.reviews = await extGetCompliance(1); }
      catch (e) { console.error(e); }
      finally { this.loading = false; }
    },
    riskColor(r) { return r === 'high' ? 'error' : r === 'medium' ? 'orange' : 'success'; },
    statusColor(s) { const m = { pending:'orange', completed:'blue', approved:'success', rejected:'error' }; return m[s]||'grey'; },
  },
};
</script>
