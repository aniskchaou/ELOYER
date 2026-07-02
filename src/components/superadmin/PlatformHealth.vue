<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col>
        <h1 class="text-h5 font-weight-bold">Platform Health</h1>
        <p class="body-2 grey--text">Live status of all system services and infrastructure components</p>
      </v-col>
      <v-col cols="auto">
        <v-btn outlined @click="load"><v-icon left>mdi-refresh</v-icon>Refresh</v-btn>
        <v-chip class="ml-2" :color="overallColor" dark>
          <v-icon left small>mdi-circle</v-icon>{{ health.status || '...' }}
        </v-chip>
      </v-col>
    </v-row>

    <!-- System Info -->
    <v-row class="mb-4">
      <v-col cols="12" sm="3">
        <v-card outlined class="pa-4" :loading="loading">
          <div class="overline grey--text">Uptime</div>
          <div class="text-h5 font-weight-bold">{{ formatUptime(health.uptime_seconds) }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="3">
        <v-card outlined class="pa-4" :loading="loading">
          <div class="overline grey--text">Node.js</div>
          <div class="text-h5 font-weight-bold">{{ health.node_version || '—' }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="3">
        <v-card outlined class="pa-4" :loading="loading">
          <div class="overline grey--text">Memory (RSS)</div>
          <div class="text-h5 font-weight-bold">{{ health.memory_mb || 0 }} MB</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="3">
        <v-card outlined class="pa-4" :loading="loading">
          <div class="overline grey--text">Last Check</div>
          <div class="body-2">{{ health.timestamp ? new Date(health.timestamp).toLocaleTimeString() : '—' }}</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Service Checks -->
    <v-card outlined :loading="loading">
      <v-card-title class="subtitle-1">Service Status</v-card-title>
      <v-divider></v-divider>
      <v-list>
        <v-list-item v-for="check in (health.checks || [])" :key="check.service">
          <v-list-item-avatar>
            <v-icon :color="statusColor(check.status)" large>{{ statusIcon(check.status) }}</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title class="font-weight-medium">{{ check.service }}</v-list-item-title>
            <v-list-item-subtitle v-if="check.note" class="orange--text">{{ check.note }}</v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action class="d-flex flex-row align-center">
            <v-chip :color="statusColor(check.status)" dark class="mr-3">{{ check.status }}</v-chip>
            <span class="body-2 grey--text">{{ check.latency_ms }} ms</span>
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </v-card>

    <!-- Auto-refresh toggle -->
    <div class="mt-4 d-flex align-center">
      <v-switch v-model="autoRefresh" inset label="Auto-refresh every 30s" hide-details @change="toggleAutoRefresh"></v-switch>
    </div>
  </v-container>
</template>

<script>
import { saGetHealth } from '@/services/superadminApi';
export default {
  name: 'PlatformHealth',
  data() {
    return { health: {}, loading: true, autoRefresh: false, refreshInterval: null };
  },
  computed: {
    overallColor() {
      const s = this.health.status;
      return s === 'healthy' ? 'success' : s === 'degraded' ? 'warning' : s === 'down' ? 'error' : 'grey';
    },
  },
  created() { this.load(); },
  beforeDestroy() { this.stopAutoRefresh(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.health = await saGetHealth(); }
      catch (e) { console.error(e); }
      finally { this.loading = false; }
    },
    statusColor(s) { return s === 'healthy' ? 'success' : s === 'degraded' ? 'warning' : 'error'; },
    statusIcon(s) { return s === 'healthy' ? 'mdi-check-circle' : s === 'degraded' ? 'mdi-alert' : 'mdi-close-circle'; },
    formatUptime(s) {
      if (!s) return '—';
      const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
      return `${h}h ${m}m`;
    },
    toggleAutoRefresh(v) {
      if (v) this.refreshInterval = setInterval(this.load, 30000);
      else this.stopAutoRefresh();
    },
    stopAutoRefresh() { if (this.refreshInterval) { clearInterval(this.refreshInterval); this.refreshInterval = null; } },
  },
};
</script>
