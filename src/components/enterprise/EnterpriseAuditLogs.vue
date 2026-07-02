<template>
  <v-container fluid>
    <v-row class="mb-4"><v-col><h1 class="text-h5 font-weight-bold">Enterprise Audit Logs</h1><p class="body-2 grey--text">Complete activity trail across all users and actions</p></v-col>
      <v-col cols="auto"><v-btn outlined @click="load"><v-icon left>mdi-refresh</v-icon>Refresh</v-btn></v-col></v-row>
    <v-card outlined>
      <v-card-title>
        <v-text-field v-model="search" outlined dense single-line hide-details label="Search…" style="max-width:280px" @keyup.enter="load"></v-text-field>
        <v-spacer></v-spacer><span class="caption grey--text">{{ total }} total records</span>
      </v-card-title>
      <v-data-table :headers="headers" :items="logs" :loading="loading" :server-items-length="total"
        :options.sync="options" :footer-props="{itemsPerPageOptions:[10,25,50]}" class="elevation-0" @update:options="load" dense>
        <template v-slot:item.action="{ item }"><v-chip small :color="actionColor(item.action)" dark>{{ item.action }}</v-chip></template>
        <template v-slot:item.created_at="{ item }">{{ new Date(item.created_at).toLocaleString() }}</template>
        <template v-slot:item.details="{ item }"><v-btn x-small text @click="view(item)"><v-icon x-small>mdi-eye</v-icon></v-btn></template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="viewDialog" max-width="480">
      <v-card v-if="selected">
        <v-card-title>Audit Entry #{{ selected.id }}</v-card-title><v-divider></v-divider>
        <v-card-text class="pt-3">
          <div><strong>Actor:</strong> {{ selected.actor_email }}</div>
          <div><strong>Action:</strong> {{ selected.action }}</div>
          <div><strong>Resource:</strong> {{ selected.resource_type }} #{{ selected.resource_id }}</div>
          <div><strong>IP:</strong> {{ selected.ip_address }}</div>
          <div><strong>Time:</strong> {{ new Date(selected.created_at).toLocaleString() }}</div>
          <pre class="caption mt-3 pa-2 grey lighten-4" style="border-radius:4px;overflow:auto">{{ JSON.stringify(selected.details, null, 2) }}</pre>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="viewDialog=false">Close</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script>
import { entGetAuditLogs } from '@/services/enterpriseApi';
export default {
  name: 'EnterpriseAuditLogs',
  data() {
    return {
      logs: [], loading: true, total: 0, search: '', selected: null, viewDialog: false,
      options: { page: 1, itemsPerPage: 25 },
      headers: [
        { text: 'ID', value: 'id', width: 60 }, { text: 'Actor', value: 'actor_email' },
        { text: 'Action', value: 'action' }, { text: 'Resource', value: 'resource_type' },
        { text: 'IP', value: 'ip_address' }, { text: 'Date', value: 'created_at' },
        { text: '', value: 'details', sortable: false, width: 60 },
      ],
    };
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try {
        const { page, itemsPerPage } = this.options;
        const r = await entGetAuditLogs({ page, limit: itemsPerPage, search: this.search });
        this.logs = r.data; this.total = r.total;
      } catch (e) { console.error(e); }
      finally { this.loading = false; }
    },
    view(item) { this.selected = item; this.viewDialog = true; },
    actionColor(a) {
      if (a && (a.includes('deleted') || a.includes('suspended'))) return 'error';
      if (a && a.includes('created')) return 'success';
      if (a && (a.includes('updated') || a.includes('activated'))) return 'blue';
      if (a && a.includes('impersonated')) return 'deep-orange';
      return 'grey';
    },
  },
};
</script>
