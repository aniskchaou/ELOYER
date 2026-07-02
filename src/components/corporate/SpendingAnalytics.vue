<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Spending Analytics</h1><p class="body-2 grey--text">Legal spending breakdown and contract value analysis</p></v-col>
    </v-row>
    <v-row class="mb-4">
      <v-col cols="6" md="3">
        <v-card outlined class="pa-4 text-center" :loading="loading">
          <div class="overline grey--text">Total Contract Value</div>
          <div class="text-h4 font-weight-bold deep-orange--text">${{ Number(data.total_contract_value||0).toLocaleString() }}</div>
        </v-card>
      </v-col>
      <v-col cols="6" md="3">
        <v-card outlined class="pa-4 text-center" :loading="loading">
          <div class="overline grey--text">Active Contracts</div>
          <div class="text-h4 font-weight-bold blue--text">{{ (data.by_contract_type||[]).reduce((s,r)=>s+Number(r.count),0) }}</div>
        </v-card>
      </v-col>
      <v-col cols="6" md="3">
        <v-card outlined class="pa-4 text-center" :loading="loading">
          <div class="overline grey--text">Legal Requests</div>
          <div class="text-h4 font-weight-bold teal--text">{{ (data.by_request_type||[]).reduce((s,r)=>s+Number(r.count),0) }}</div>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <v-card outlined class="pa-4" :loading="loading">
          <v-card-title class="subtitle-1 pb-2">Contract Value by Type</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-list dense>
            <v-list-item v-for="t in (data.by_contract_type||[])" :key="t.contract_type">
              <v-list-item-content>
                <v-list-item-title class="text-capitalize">{{ t.contract_type }}</v-list-item-title>
                <v-progress-linear :value="maxVal > 0 ? (t.total / maxVal) * 100 : 0" color="deep-orange" rounded height="6" class="mt-1"></v-progress-linear>
              </v-list-item-content>
              <v-list-item-action class="d-flex flex-row align-center ml-2">
                <span class="caption mr-2">{{ t.count }}x</span>
                <v-chip small color="deep-orange" dark>${{ Number(t.total).toLocaleString() }}</v-chip>
              </v-list-item-action>
            </v-list-item>
            <v-list-item v-if="!data.by_contract_type||!data.by_contract_type.length"><v-list-item-content><v-list-item-subtitle>No contracts yet.</v-list-item-subtitle></v-list-item-content></v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card outlined class="pa-4" :loading="loading">
          <v-card-title class="subtitle-1 pb-2">Requests by Type</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-list dense>
            <v-list-item v-for="r in (data.by_request_type||[])" :key="r.request_type">
              <v-list-item-icon><v-icon small color="teal">mdi-gavel</v-icon></v-list-item-icon>
              <v-list-item-content><v-list-item-title class="text-capitalize">{{ r.request_type }}</v-list-item-title></v-list-item-content>
              <v-list-item-action><v-chip small color="teal" dark>{{ r.count }}</v-chip></v-list-item-action>
            </v-list-item>
            <v-list-item v-if="!data.by_request_type||!data.by_request_type.length"><v-list-item-content><v-list-item-subtitle>No requests yet.</v-list-item-subtitle></v-list-item-content></v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import { coGetSpending } from '@/services/portalApi';
const CORP_ID = 1;
export default {
  name: 'SpendingAnalytics',
  data() { return { data: {}, loading: true }; },
  computed: {
    maxVal() { return Math.max(...(this.data.by_contract_type||[]).map(t => Number(t.total)), 1); },
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.data = await coGetSpending(CORP_ID); }
      catch (e) { console.error(e); }
      finally { this.loading = false; }
    },
  },
};
</script>
