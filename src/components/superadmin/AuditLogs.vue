<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col>
        <h1 class="text-h5 font-weight-bold">Platform Audit Logs</h1>
        <p class="body-2 grey--text">Full trail of all super-admin actions across the platform</p>
      </v-col>
      <v-col cols="auto">
        <v-btn outlined @click="load"><v-icon left>mdi-refresh</v-icon>Refresh</v-btn>
      </v-col>
    </v-row>

    <v-card outlined>
      <v-card-title>
        <v-text-field v-model="search" append-icon="mdi-magnify" label="Search action, actor…" dense outlined single-line hide-details @keyup.enter="load" style="max-width:320px"></v-text-field>
        <v-spacer></v-spacer>
        <span class="caption grey--text">{{ total }} total records</span>
      </v-card-title>
      <v-data-table
        :headers="headers"
        :items="logs"
        :loading="loading"
        :server-items-length="total"
        :options.sync="options"
        :footer-props="{ itemsPerPageOptions: [10,25,50,100] }"
        class="elevation-0"
        @update:options="load"
      >
        <template v-slot:item.action="{ item }">
          <v-chip small :color="actionColor(item.action)" dark>{{ item.action }}</v-chip>
        </template>
        <template v-slot:item.details="{ item }">
          <v-btn x-small text @click="showDetails(item)"><v-icon x-small>mdi-eye</v-icon></v-btn>
        </template>
        <template v-slot:item.created_at="{ item }">
          {{ new Date(item.created_at).toLocaleString() }}
        </template>
      </v-data-table>
    </v-card>

    <!-- Details Dialog -->
    <v-dialog v-model="detailsDialog" max-width="480">
      <v-card v-if="selected">
        <v-card-title>Audit Entry #{{ selected.id }}</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-3">
          <div class="mb-2"><strong>Actor:</strong> {{ selected.actor_email }}</div>
          <div class="mb-2"><strong>Role:</strong> {{ selected.actor_role }}</div>
          <div class="mb-2"><strong>Action:</strong> {{ selected.action }}</div>
          <div class="mb-2"><strong>Resource:</strong> {{ selected.resource_type }} #{{ selected.resource_id }}</div>
          <div class="mb-2"><strong>IP:</strong> {{ selected.ip_address }}</div>
          <div class="mb-2"><strong>Date:</strong> {{ new Date(selected.created_at).toLocaleString() }}</div>
          <div class="mt-3"><strong>Details:</strong></div>
          <pre class="caption grey lighten-4 pa-2 mt-1" style="border-radius:4px;overflow:auto">{{ JSON.stringify(selected.details, null, 2) }}</pre>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="detailsDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { saGetAuditLogs } from '@/services/superadminApi';
export default {
  name: 'AuditLogs',
  data() {
    return {
      logs: [], loading: true, total: 0, search: '',
      options: { page: 1, itemsPerPage: 25 },
      selected: null, detailsDialog: false,
      headers: [
        { text: 'ID', value: 'id', width: 60 },
        { text: 'Actor', value: 'actor_email' },
        { text: 'Action', value: 'action' },
        { text: 'Resource', value: 'resource_type' },
        { text: 'Resource ID', value: 'resource_id', width: 100 },
        { text: 'IP', value: 'ip_address' },
        { text: 'Date', value: 'created_at' },
        { text: 'Details', value: 'details', sortable: false, align: 'center', width: 80 },
      ],
    };
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try {
        const { page, itemsPerPage } = this.options;
        const result = await saGetAuditLogs({ page, limit: itemsPerPage, search: this.search });
        this.logs = result.data;
        this.total = result.total;
      } catch (e) { console.error(e); }
      finally { this.loading = false; }
    },
    showDetails(item) { this.selected = item; this.detailsDialog = true; },
    actionColor(action) {
      if (action.includes('deleted') || action.includes('suspended')) return 'error';
      if (action.includes('created')) return 'success';
      if (action.includes('updated') || action.includes('activated')) return 'blue';
      if (action.includes('impersonated')) return 'deep-orange';
      return 'grey';
    },
  },
};
</script>
