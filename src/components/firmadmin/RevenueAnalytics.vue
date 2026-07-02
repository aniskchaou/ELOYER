<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Revenue Analytics</h1><p class="body-2 grey--text">Financial performance overview for your firm</p></v-col>
    </v-row>
    <v-row class="mb-4">
      <v-col cols="12" md="4" v-for="s in statusSummary" :key="s.status">
        <v-card outlined class="pa-4" :loading="loading">
          <div class="overline grey--text text-capitalize">{{ s.status }} Invoices</div>
          <div class="text-h4 font-weight-bold" :class="s.color+'--text'">${{ Number(s.amount || 0).toLocaleString() }}</div>
          <div class="caption grey--text">{{ s.count }} invoices</div>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="7">
        <v-card outlined class="pa-4" :loading="loading">
          <v-card-title class="subtitle-1 pb-2">Monthly Revenue (Last 6 Months)</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-list dense>
            <v-list-item v-for="m in (data.monthly || [])" :key="m.month">
              <v-list-item-content><v-list-item-title>{{ m.month }}</v-list-item-title></v-list-item-content>
              <v-list-item-action class="d-flex flex-row align-center" style="min-width:220px">
                <v-progress-linear :value="(m.total / maxMonth) * 100" color="red lighten-1" rounded height="10" class="mr-3" style="min-width:120px"></v-progress-linear>
                <span class="caption">${{ Number(m.total).toLocaleString() }}</span>
              </v-list-item-action>
            </v-list-item>
            <v-list-item v-if="!data.monthly || !data.monthly.length">
              <v-list-item-content><v-list-item-subtitle>No monthly data yet.</v-list-item-subtitle></v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
      <v-col cols="12" md="5">
        <v-card outlined class="pa-4" :loading="loading">
          <v-card-title class="subtitle-1 pb-2">Top 5 Cases by Revenue</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-list dense>
            <v-list-item v-for="(c, i) in (data.topCases || [])" :key="c.title">
              <v-list-item-avatar size="26" :color="['red','orange','blue','teal','purple'][i]" class="mr-2">
                <span class="white--text caption font-weight-bold">{{ i + 1 }}</span>
              </v-list-item-avatar>
              <v-list-item-content><v-list-item-title>{{ c.title }}</v-list-item-title></v-list-item-content>
              <v-list-item-action><v-chip small color="green" dark>${{ Number(c.revenue).toLocaleString() }}</v-chip></v-list-item-action>
            </v-list-item>
            <v-list-item v-if="!data.topCases || !data.topCases.length">
              <v-list-item-content><v-list-item-subtitle>No case revenue data yet.</v-list-item-subtitle></v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import { faGetRevenue } from '@/services/firmadminApi';
export default {
  name: 'RevenueAnalytics',
  data() { return { data: {}, loading: true }; },
  computed: {
    statusSummary() {
      return (this.data.byStatus || []).map(s => ({
        ...s,
        color: s.status === 'paid' ? 'green' : s.status === 'pending' ? 'orange' : 'grey',
      }));
    },
    maxMonth() {
      const vals = (this.data.monthly || []).map(m => Number(m.total));
      return vals.length ? Math.max(...vals) : 1;
    },
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.data = await faGetRevenue(); }
      catch (e) { console.error(e); }
      finally { this.loading = false; }
    },
  },
};
</script>
