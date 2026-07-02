<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Risk Analysis</h1><p class="body-2 grey--text">Aggregate risk view across all compliance reviews</p></v-col>
    </v-row>

    <v-row class="mb-4">
      <v-col cols="12" md="4">
        <v-card outlined class="pa-4 text-center" :loading="loading">
          <div class="overline grey--text">Average Score</div>
          <div class="text-h2 font-weight-bold" :class="scoreColor(avgScore)+'--text'">{{ avgScore }}</div>
          <v-progress-linear :value="avgScore" :color="scoreColor(avgScore)" rounded height="10" class="mt-2"></v-progress-linear>
        </v-card>
      </v-col>
      <v-col cols="4" md="2" v-for="r in riskBreakdown" :key="r.level">
        <v-card outlined class="pa-4 text-center" :loading="loading">
          <div class="text-h3 font-weight-bold" :class="r.color+'--text'">{{ r.count }}</div>
          <div class="caption text-capitalize">{{ r.level }} Risk</div>
        </v-card>
      </v-col>
    </v-row>

    <v-card outlined class="pa-4 mb-4" :loading="loading">
      <v-card-title class="subtitle-1 pb-2">Risk by Review Type</v-card-title>
      <v-divider class="mb-3"></v-divider>
      <v-simple-table dense>
        <template v-slot:default>
          <thead><tr><th>Type</th><th>Reviews</th><th>Avg Score</th><th>High Risk</th></tr></thead>
          <tbody>
            <tr v-for="t in byType" :key="t.type">
              <td class="text-capitalize">{{ t.type }}</td>
              <td>{{ t.count }}</td>
              <td :class="scoreColor(t.avgScore)+'--text'">{{ t.avgScore }}</td>
              <td><v-chip x-small :color="t.highRisk > 0 ? 'error' : 'success'" dark>{{ t.highRisk }}</v-chip></td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
    </v-card>

    <v-card outlined :loading="loading">
      <v-card-title class="subtitle-1">All Open Flags</v-card-title>
      <v-list dense>
        <v-list-item v-for="flag in openFlags" :key="flag.id">
          <v-list-item-icon><v-icon :color="severityColor(flag.severity)" small>mdi-flag</v-icon></v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ flag.description }}</v-list-item-title>
            <v-list-item-subtitle>{{ flag.recommendation }}</v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action class="d-flex flex-row align-center">
            <v-chip x-small :color="severityColor(flag.severity)" dark class="mr-2">{{ flag.severity }}</v-chip>
            <v-btn x-small outlined color="success" @click="resolve(flag)">Resolve</v-btn>
          </v-list-item-action>
        </v-list-item>
        <v-list-item v-if="!openFlags.length"><v-list-item-content><v-list-item-subtitle>No open flags.</v-list-item-subtitle></v-list-item-content></v-list-item>
      </v-list>
    </v-card>
    <v-snackbar v-model="snack" color="success" top>Flag resolved.</v-snackbar>
  </v-container>
</template>
<script>
import { extGetCompliance, extResolveFlag } from '@/services/externalApi';
export default {
  name: 'RiskAnalysis',
  data() { return { reviews: [], loading: true, snack: false }; },
  computed: {
    avgScore() {
      if (!this.reviews.length) return 0;
      return Math.round(this.reviews.reduce((s, r) => s + Number(r.compliance_score || 0), 0) / this.reviews.length);
    },
    riskBreakdown() {
      return [
        { level: 'low', count: this.reviews.filter(r => r.overall_risk === 'low').length, color: 'green' },
        { level: 'medium', count: this.reviews.filter(r => r.overall_risk === 'medium').length, color: 'orange' },
        { level: 'high', count: this.reviews.filter(r => r.overall_risk === 'high').length, color: 'error' },
      ];
    },
    byType() {
      const types = [...new Set(this.reviews.map(r => r.review_type))];
      return types.map(t => {
        const group = this.reviews.filter(r => r.review_type === t);
        const avgScore = Math.round(group.reduce((s, r) => s + Number(r.compliance_score || 0), 0) / group.length);
        return { type: t, count: group.length, avgScore, highRisk: group.filter(r => r.overall_risk === 'high').length };
      });
    },
    openFlags() {
      return this.reviews.flatMap(r => (r.flags || []).filter(f => !f.is_resolved));
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
    async resolve(flag) {
      try { await extResolveFlag(flag.id); flag.is_resolved = true; this.snack = true; }
      catch (e) { console.error(e); }
    },
    scoreColor(s) { return s >= 80 ? 'green' : s >= 60 ? 'orange' : 'error'; },
    severityColor(s) { return s === 'high' ? 'error' : s === 'medium' ? 'warning' : 'success'; },
  },
};
</script>
