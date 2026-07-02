<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold"><v-icon left color="indigo">mdi-account-tie</v-icon>Partner Dashboard</h1><p class="body-2 grey--text">Overview of pending approvals, strategies and team activity</p></v-col>
    </v-row>

    <v-row class="mb-4">
      <v-col cols="6" md="3">
        <v-card outlined class="pa-4" :loading="loading">
          <div class="overline grey--text">Pending Approvals</div>
          <div class="text-h4 font-weight-bold orange--text">{{ pendingApprovals }}</div>
          <v-btn x-small text color="orange" to="/senior/approvals">Review</v-btn>
        </v-card>
      </v-col>
      <v-col cols="6" md="3">
        <v-card outlined class="pa-4" :loading="loading">
          <div class="overline grey--text">Pending Settlements</div>
          <div class="text-h4 font-weight-bold blue--text">{{ pendingSettlements }}</div>
          <v-btn x-small text color="blue" to="/senior/settlements">Review</v-btn>
        </v-card>
      </v-col>
      <v-col cols="6" md="3">
        <v-card outlined class="pa-4" :loading="loading">
          <div class="overline grey--text">Active Strategies</div>
          <div class="text-h4 font-weight-bold indigo--text">{{ activeStrategies }}</div>
          <v-btn x-small text color="indigo" to="/senior/strategies">Manage</v-btn>
        </v-card>
      </v-col>
      <v-col cols="6" md="3">
        <v-card outlined class="pa-4" :loading="loading">
          <div class="overline grey--text">Unread Messages</div>
          <div class="text-h4 font-weight-bold teal--text">{{ threadCount }}</div>
          <v-btn x-small text color="teal" to="/senior/collaboration">Open</v-btn>
        </v-card>
      </v-col>
    </v-row>

    <!-- Recent Approvals -->
    <v-row>
      <v-col cols="12" md="6">
        <v-card outlined :loading="loading">
          <v-card-title class="subtitle-1">Recent Approvals</v-card-title>
          <v-list dense>
            <v-list-item v-for="a in recentApprovals" :key="a.id">
              <v-list-item-icon><v-icon :color="approvalColor(a.status)" small>mdi-checkbox-marked-circle</v-icon></v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ a.title }}</v-list-item-title>
                <v-list-item-subtitle>{{ a.approval_type }} · {{ a.case_title || 'No case' }}</v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action><v-chip x-small :color="approvalColor(a.status)" dark>{{ a.status }}</v-chip></v-list-item-action>
            </v-list-item>
            <v-list-item v-if="!recentApprovals.length">
              <v-list-item-content><v-list-item-subtitle>No approvals yet.</v-list-item-subtitle></v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card outlined :loading="loading">
          <v-card-title class="subtitle-1">Quick Actions</v-card-title>
          <v-card-text>
            <v-btn block outlined color="indigo" class="mb-2" to="/senior/approvals"><v-icon left>mdi-check-decagram</v-icon>Review Approvals</v-btn>
            <v-btn block outlined color="blue" class="mb-2" to="/senior/case-assignment"><v-icon left>mdi-account-switch</v-icon>Assign Cases</v-btn>
            <v-btn block outlined color="teal" class="mb-2" to="/senior/strategies"><v-icon left>mdi-lightbulb</v-icon>Legal Strategies</v-btn>
            <v-btn block outlined color="purple" class="mb-2" to="/senior/settlements"><v-icon left>mdi-handshake</v-icon>Settlements</v-btn>
            <v-btn block outlined color="orange" to="/senior/collaboration"><v-icon left>mdi-account-group</v-icon>Team Collaboration</v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import { faGetApprovals, faGetSettlements, faGetStrategies, faGetThreads } from '@/services/firmadminApi';
export default {
  name: 'SeniorDashboard',
  data() { return { approvals: [], settlements: [], strategies: [], threads: [], loading: true }; },
  computed: {
    pendingApprovals() { return this.approvals.filter(a => a.status === 'pending').length; },
    pendingSettlements() { return this.settlements.filter(s => s.status === 'proposed').length; },
    activeStrategies() { return this.strategies.filter(s => s.status !== 'archived').length; },
    threadCount() { return this.threads.length; },
    recentApprovals() { return this.approvals.slice(0, 5); },
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try {
        [this.approvals, this.settlements, this.strategies, this.threads] = await Promise.all([
          faGetApprovals(), faGetSettlements(), faGetStrategies(), faGetThreads(),
        ]);
      } catch (e) { console.error(e); }
      finally { this.loading = false; }
    },
    approvalColor(s) { return s === 'approved' ? 'success' : s === 'rejected' ? 'error' : 'orange'; },
  },
};
</script>
