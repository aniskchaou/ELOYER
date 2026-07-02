<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col>
        <h1 class="text-h5 font-weight-bold">AI Usage Monitor</h1>
        <p class="body-2 grey--text">Track AI token consumption across all tenants and models</p>
      </v-col>
    </v-row>

    <!-- Global KPIs -->
    <v-row class="mb-4">
      <v-col cols="12" sm="4">
        <v-card outlined class="pa-4" :loading="loading">
          <div class="overline grey--text">Total Tokens (All Time)</div>
          <div class="text-h4 font-weight-bold purple--text">{{ (usage.total_tokens_used || 0).toLocaleString() }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card outlined class="pa-4" :loading="loading">
          <div class="overline grey--text">Total API Calls</div>
          <div class="text-h4 font-weight-bold indigo--text">{{ (usage.total_calls || 0).toLocaleString() }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="4">
        <v-card outlined class="pa-4" :loading="loading">
          <div class="overline grey--text">Models Active</div>
          <div class="text-h4 font-weight-bold blue--text">{{ (usage.by_model || []).length }}</div>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <!-- By Model -->
      <v-col cols="12" md="5">
        <v-card outlined class="pa-4" :loading="loading">
          <v-card-title class="subtitle-1 pb-2">Usage by Model</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-list dense>
            <v-list-item v-for="m in (usage.by_model || [])" :key="m.model">
              <v-list-item-content>
                <v-list-item-title>{{ m.model }}</v-list-item-title>
                <v-list-item-subtitle>{{ m.calls.toLocaleString() }} calls</v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-chip small color="purple" dark>{{ m.tokens.toLocaleString() }} tk</v-chip>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Daily Trend -->
      <v-col cols="12" md="7">
        <v-card outlined class="pa-4" :loading="loading">
          <v-card-title class="subtitle-1 pb-2">Daily Token Usage (Last 7 Days)</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-list dense>
            <v-list-item v-for="d in (usage.daily_trend || [])" :key="d.day">
              <v-list-item-content><v-list-item-title>{{ d.day }}</v-list-item-title></v-list-item-content>
              <v-list-item-action class="d-flex flex-row align-center" style="min-width:200px">
                <v-progress-linear :value="(d.tokens / maxDay) * 100" color="purple" rounded height="8" class="mr-3" style="min-width:120px"></v-progress-linear>
                <span class="caption">{{ d.tokens.toLocaleString() }}</span>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Per Tenant -->
      <v-col cols="12">
        <v-card outlined :loading="loading">
          <v-card-title class="subtitle-1">Usage per Tenant</v-card-title>
          <v-data-table
            :headers="headers"
            :items="usage.by_tenant || []"
            dense
            class="elevation-0"
          >
            <template v-slot:item.quota_pct="{ item }">
              <v-progress-linear :value="Math.round((item.tokens_used / item.tokens_quota) * 100)" height="10" rounded :color="item.tokens_used > item.tokens_quota * 0.9 ? 'error' : 'purple'"></v-progress-linear>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { saGetAiUsage } from '@/services/superadminApi';
export default {
  name: 'AIUsageMonitor',
  data() {
    return {
      usage: {}, loading: true,
      headers: [
        { text: 'Tenant', value: 'tenant_name' },
        { text: 'Tokens Used', value: 'tokens_used' },
        { text: 'Quota', value: 'tokens_quota' },
        { text: 'Usage %', value: 'quota_pct', sortable: false },
        { text: 'Calls Today', value: 'calls_today' },
        { text: 'Top Model', value: 'top_model' },
      ],
    };
  },
  computed: {
    maxDay() {
      const trend = this.usage.daily_trend || [];
      return trend.length ? Math.max(...trend.map(d => d.tokens)) : 1;
    },
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.usage = await saGetAiUsage(); }
      catch (e) { console.error(e); }
      finally { this.loading = false; }
    },
  },
};
</script>
