<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col>
        <h1 class="text-h5 font-weight-bold">
          <v-icon left color="deep-purple darken-3">mdi-shield-star</v-icon>
          Platform Overview
        </h1>
        <p class="body-2 grey--text">SaaS-wide analytics and status for all law firms</p>
      </v-col>
      <v-col cols="auto">
        <v-chip :color="health.status === 'healthy' ? 'success' : health.status === 'degraded' ? 'warning' : 'error'" dark>
          <v-icon left small>mdi-circle</v-icon>{{ health.status || 'loading' }}
        </v-chip>
      </v-col>
    </v-row>

    <!-- KPI Cards -->
    <v-row class="mb-4">
      <v-col cols="12" sm="6" md="3">
        <v-card outlined class="pa-4" :loading="loading">
          <div class="overline grey--text">Total Tenants</div>
          <div class="text-h4 font-weight-bold deep-purple--text">{{ analytics.tenants && analytics.tenants.total || 0 }}</div>
          <div class="caption">
            <v-chip x-small color="success" class="mr-1">{{ analytics.tenants && analytics.tenants.active || 0 }} active</v-chip>
            <v-chip x-small color="error">{{ analytics.tenants && analytics.tenants.suspended || 0 }} suspended</v-chip>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card outlined class="pa-4" :loading="loading">
          <div class="overline grey--text">Total Users</div>
          <div class="text-h4 font-weight-bold blue--text">{{ analytics.totalUsers || 0 }}</div>
          <div class="caption grey--text">across all firms</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card outlined class="pa-4" :loading="loading">
          <div class="overline grey--text">Total Cases</div>
          <div class="text-h4 font-weight-bold teal--text">{{ analytics.totalCases || 0 }}</div>
          <div class="caption grey--text">platform-wide</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card outlined class="pa-4" :loading="loading">
          <div class="overline grey--text">Total Revenue</div>
          <div class="text-h4 font-weight-bold green--text">${{ Number(analytics.totalRevenue || 0).toLocaleString() }}</div>
          <div class="caption grey--text">paid invoices</div>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <!-- Plan Distribution -->
      <v-col cols="12" md="5">
        <v-card outlined class="pa-4" :loading="loading">
          <v-card-title class="subtitle-1 pb-2">Subscription Plan Distribution</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-list dense>
            <v-list-item v-for="plan in analytics.planDistribution" :key="plan.name">
              <v-list-item-content>
                <v-list-item-title>{{ plan.name }}</v-list-item-title>
              </v-list-item-content>
              <v-list-item-action>
                <v-chip small :color="planColor(plan.name)" dark>{{ plan.count }} firms</v-chip>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- AI Usage -->
      <v-col cols="12" md="7">
        <v-card outlined class="pa-4" :loading="loading">
          <v-card-title class="subtitle-1 pb-2">AI Usage (This Month)</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-row>
            <v-col cols="4" class="text-center">
              <div class="text-h5 font-weight-bold purple--text">{{ ((analytics.aiUsage && analytics.aiUsage.tokensThisMonth) || 0).toLocaleString() }}</div>
              <div class="caption grey--text">tokens used</div>
            </v-col>
            <v-col cols="4" class="text-center">
              <div class="text-h5 font-weight-bold orange--text">{{ (analytics.aiUsage && analytics.aiUsage.totalTokensUsed || 0).toLocaleString() }}</div>
              <div class="caption grey--text">all-time tokens</div>
            </v-col>
            <v-col cols="4" class="text-center">
              <div class="text-h5 font-weight-bold blue--text">{{ (analytics.aiUsage && analytics.aiUsage.models || []).length }}</div>
              <div class="caption grey--text">AI models used</div>
            </v-col>
          </v-row>
          <v-divider class="my-3"></v-divider>
          <v-list dense v-if="analytics.aiUsage">
            <v-list-item v-for="m in analytics.aiUsage.models" :key="m.model">
              <v-list-item-content><v-list-item-title>{{ m.model }}</v-list-item-title></v-list-item-content>
              <v-list-item-action class="d-flex flex-row align-center">
                <span class="caption mr-3">{{ m.calls.toLocaleString() }} calls</span>
                <v-chip small color="purple" dark>{{ m.tokens.toLocaleString() }} tk</v-chip>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Storage -->
      <v-col cols="12" md="5">
        <v-card outlined class="pa-4" :loading="loading">
          <v-card-title class="subtitle-1 pb-2">Storage</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <template v-if="analytics.storageUsed">
            <div class="d-flex justify-space-between mb-1">
              <span class="body-2">{{ toGB(analytics.storageUsed.bytes) }} GB used</span>
              <span class="body-2 grey--text">{{ toGB(analytics.storageUsed.quota) }} GB quota</span>
            </div>
            <v-progress-linear :value="storagePercent" :color="storagePercent > 80 ? 'error' : 'blue'" rounded height="10"></v-progress-linear>
            <div class="caption mt-1 grey--text">{{ storagePercent }}% used</div>
          </template>
        </v-card>
      </v-col>

      <!-- System Services -->
      <v-col cols="12" md="7">
        <v-card outlined class="pa-4" :loading="loadingHealth">
          <v-card-title class="subtitle-1 pb-2">
            System Services
            <v-spacer></v-spacer>
            <span class="caption grey--text">Uptime: {{ formatUptime(health.uptime_seconds) }}</span>
          </v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-list dense>
            <v-list-item v-for="check in health.checks" :key="check.service">
              <v-list-item-icon>
                <v-icon :color="statusColor(check.status)" small>{{ statusIcon(check.status) }}</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ check.service }}</v-list-item-title>
                <v-list-item-subtitle v-if="check.note">{{ check.note }}</v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-chip x-small :color="statusColor(check.status)" dark>{{ check.latency_ms }}ms</v-chip>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <!-- Recent Audit Activity -->
    <v-card outlined class="mt-4 pa-4" :loading="loading">
      <v-card-title class="subtitle-1 pb-2">Recent Platform Activity (7 days)</v-card-title>
      <v-divider class="mb-3"></v-divider>
      <v-list dense>
        <v-list-item v-for="(item, i) in (analytics.auditActivity || [])" :key="i">
          <v-list-item-icon><v-icon small>mdi-clock-outline</v-icon></v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ formatDay(item.day) }}</v-list-item-title>
          </v-list-item-content>
          <v-list-item-action>
            <v-chip small color="grey" dark>{{ item.events }} events</v-chip>
          </v-list-item-action>
        </v-list-item>
        <v-list-item v-if="!analytics.auditActivity || !analytics.auditActivity.length">
          <v-list-item-content><v-list-item-subtitle>No audit data yet</v-list-item-subtitle></v-list-item-content>
        </v-list-item>
      </v-list>
    </v-card>
  </v-container>
</template>

<script>
import { saGetAnalytics, saGetHealth } from '@/services/superadminApi';
export default {
  name: 'SADashboard',
  data() {
    return { analytics: {}, health: {}, loading: true, loadingHealth: true };
  },
  computed: {
    storagePercent() {
      if (!this.analytics.storageUsed) return 0;
      return Math.round((this.analytics.storageUsed.bytes / this.analytics.storageUsed.quota) * 100);
    },
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      this.loadingHealth = true;
      try {
        [this.analytics, this.health] = await Promise.all([saGetAnalytics(), saGetHealth()]);
      } catch (e) { this.$emit('error', e.message); }
      finally { this.loading = false; this.loadingHealth = false; }
    },
    planColor(name) {
      const map = { Starter: 'blue-grey', Pro: 'blue', Business: 'deep-purple', Enterprise: 'deep-orange' };
      return map[name] || 'grey';
    },
    statusColor(s) { return s === 'healthy' ? 'success' : s === 'degraded' ? 'warning' : 'error'; },
    statusIcon(s) { return s === 'healthy' ? 'mdi-check-circle' : s === 'degraded' ? 'mdi-alert' : 'mdi-close-circle'; },
    toGB(bytes) { return (bytes / 1073741824).toFixed(1); },
    formatUptime(s) {
      if (!s) return '—';
      const h = Math.floor(s / 3600);
      const m = Math.floor((s % 3600) / 60);
      return `${h}h ${m}m`;
    },
    formatDay(d) { return d ? new Date(d).toLocaleDateString() : ''; },
  },
};
</script>
