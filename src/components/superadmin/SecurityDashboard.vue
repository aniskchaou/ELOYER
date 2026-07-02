<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col>
        <h1 class="text-h5 font-weight-bold">Security Dashboard</h1>
        <p class="body-2 grey--text">Authentication events, login audit and impersonation history</p>
      </v-col>
    </v-row>

    <!-- Stats -->
    <v-row class="mb-4">
      <v-col cols="12" sm="3">
        <v-card outlined class="pa-4" :loading="loading">
          <div class="overline grey--text">Login Attempts (7d)</div>
          <div class="text-h4 font-weight-bold">{{ security.login_attempts && security.login_attempts.total || 0 }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="3">
        <v-card outlined class="pa-4" :loading="loading">
          <div class="overline grey--text">Failed Logins</div>
          <div class="text-h4 font-weight-bold orange--text">{{ security.login_attempts && security.login_attempts.failed || 0 }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="3">
        <v-card outlined class="pa-4" :loading="loading">
          <div class="overline grey--text">Blocked IPs</div>
          <div class="text-h4 font-weight-bold red--text">{{ security.login_attempts && security.login_attempts.blocked || 0 }}</div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="3">
        <v-card outlined class="pa-4" :loading="loading">
          <div class="overline grey--text">Active Impersonations</div>
          <div class="text-h4 font-weight-bold deep-purple--text">{{ (security.impersonation_sessions || []).filter(s => s.is_active).length }}</div>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <!-- Security Flags -->
      <v-col cols="12" md="5">
        <v-card outlined class="pa-4 mb-4">
          <v-card-title class="subtitle-1 pb-2">Security Flags</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-list dense v-if="security.flags">
            <v-list-item>
              <v-list-item-icon><v-icon :color="security.flags.two_factor_enabled ? 'success' : 'error'" small>{{ security.flags.two_factor_enabled ? 'mdi-check-circle' : 'mdi-close-circle' }}</v-icon></v-list-item-icon>
              <v-list-item-content><v-list-item-title>Two-Factor Auth</v-list-item-title></v-list-item-content>
              <v-list-item-action><v-chip x-small :color="security.flags.two_factor_enabled ? 'success' : 'grey'">{{ security.flags.two_factor_enabled ? 'ON' : 'OFF' }}</v-chip></v-list-item-action>
            </v-list-item>
            <v-list-item>
              <v-list-item-icon><v-icon :color="security.flags.sso_enabled ? 'success' : 'grey'" small>mdi-lock-open</v-icon></v-list-item-icon>
              <v-list-item-content><v-list-item-title>SSO / SAML</v-list-item-title></v-list-item-content>
              <v-list-item-action><v-chip x-small :color="security.flags.sso_enabled ? 'success' : 'grey'">{{ security.flags.sso_enabled ? 'ON' : 'OFF' }}</v-chip></v-list-item-action>
            </v-list-item>
            <v-list-item>
              <v-list-item-icon><v-icon :color="security.flags.maintenance_mode ? 'orange' : 'success'" small>mdi-wrench</v-icon></v-list-item-icon>
              <v-list-item-content><v-list-item-title>Maintenance Mode</v-list-item-title></v-list-item-content>
              <v-list-item-action><v-chip x-small :color="security.flags.maintenance_mode ? 'warning' : 'success'">{{ security.flags.maintenance_mode ? 'ON' : 'OFF' }}</v-chip></v-list-item-action>
            </v-list-item>
            <v-list-item>
              <v-list-item-icon><v-icon :color="security.flags.registration_open ? 'success' : 'grey'" small>mdi-account-plus</v-icon></v-list-item-icon>
              <v-list-item-content><v-list-item-title>Open Registration</v-list-item-title></v-list-item-content>
              <v-list-item-action><v-chip x-small :color="security.flags.registration_open ? 'success' : 'grey'">{{ security.flags.registration_open ? 'ON' : 'OFF' }}</v-chip></v-list-item-action>
            </v-list-item>
          </v-list>
          <v-btn small outlined color="deep-purple darken-3" class="mt-3" to="/superadmin/settings">Manage in Settings</v-btn>
        </v-card>

        <!-- Top Actions -->
        <v-card outlined class="pa-4">
          <v-card-title class="subtitle-1 pb-2">Top Audit Actions (7d)</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-list dense>
            <v-list-item v-for="a in (security.top_actions || [])" :key="a.action">
              <v-list-item-content><v-list-item-title>{{ a.action }}</v-list-item-title></v-list-item-content>
              <v-list-item-action><v-chip small color="grey darken-1" dark>{{ a.count }}</v-chip></v-list-item-action>
            </v-list-item>
            <v-list-item v-if="!security.top_actions || !security.top_actions.length">
              <v-list-item-content><v-list-item-subtitle>No audit data yet.</v-list-item-subtitle></v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Impersonation Log -->
      <v-col cols="12" md="7">
        <v-card outlined :loading="loading">
          <v-card-title class="subtitle-1">
            <v-icon left>mdi-incognito</v-icon>Impersonation Sessions
          </v-card-title>
          <v-data-table
            :headers="impHeaders"
            :items="security.impersonation_sessions || []"
            dense
            class="elevation-0"
          >
            <template v-slot:item.is_active="{ item }">
              <v-chip x-small :color="item.is_active ? 'warning' : 'grey'" dark>{{ item.is_active ? 'Active' : 'Ended' }}</v-chip>
            </template>
            <template v-slot:item.started_at="{ item }">
              {{ new Date(item.started_at).toLocaleString() }}
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Impersonate User -->
    <v-card outlined class="mt-4 pa-4">
      <v-card-title class="subtitle-1 pb-2"><v-icon left color="orange">mdi-account-switch</v-icon>Impersonate a User</v-card-title>
      <v-divider class="mb-3"></v-divider>
      <v-row align="end">
        <v-col cols="12" md="4">
          <v-select v-model="impForm.user_id" :items="users" item-text="email" item-value="id" label="Target User" outlined dense></v-select>
        </v-col>
        <v-col cols="12" md="5">
          <v-text-field v-model="impForm.reason" label="Reason (required)" outlined dense></v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-btn color="orange darken-2" dark :loading="impersonating" @click="impersonate" block>
            <v-icon left>mdi-incognito</v-icon>Start Session
          </v-btn>
        </v-col>
      </v-row>
      <v-alert v-if="impResult" type="success" dense class="mt-2">
        Impersonation session started for <strong>{{ impResult.target_user.email }}</strong> ({{ impResult.target_user.role }}).
      </v-alert>
    </v-card>

    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>

<script>
import { saGetSecurity, saGetUsers, saImpersonate } from '@/services/superadminApi';
export default {
  name: 'SASecurityDashboard',
  data() {
    return {
      security: {}, users: [], loading: true,
      impForm: { user_id: null, reason: '' }, impersonating: false, impResult: null,
      snack: false, snackMsg: '', snackColor: 'success',
      impHeaders: [
        { text: 'Target User', value: 'email' },
        { text: 'Name', value: 'full_name' },
        { text: 'Reason', value: 'reason' },
        { text: 'Status', value: 'is_active' },
        { text: 'Started', value: 'started_at' },
      ],
    };
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { [this.security, this.users] = await Promise.all([saGetSecurity(), saGetUsers()]); }
      catch (e) { console.error(e); }
      finally { this.loading = false; }
    },
    async impersonate() {
      if (!this.impForm.user_id || !this.impForm.reason) {
        this.notify('Select a user and provide a reason.', 'error'); return;
      }
      this.impersonating = true;
      try {
        this.impResult = await saImpersonate(this.impForm);
        this.notify('Impersonation session started.');
        this.load();
      } catch (e) { this.notify(e.message, 'error'); }
      finally { this.impersonating = false; }
    },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
