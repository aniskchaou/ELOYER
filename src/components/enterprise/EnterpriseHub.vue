<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col>
        <h1 class="text-h5 font-weight-bold"><v-icon left color="indigo darken-2">mdi-domain</v-icon>Enterprise Control Centre</h1>
        <p class="body-2 grey--text">Security, integrations, compliance and infrastructure overview</p>
      </v-col>
      <v-col cols="auto"><v-chip color="indigo darken-2" dark><v-icon left small>mdi-shield-crown</v-icon>Enterprise Plan</v-chip></v-col>
    </v-row>

    <!-- Feature Status Cards -->
    <v-row class="mb-4">
      <v-col cols="6" md="3" v-for="f in featureCards" :key="f.label">
        <v-card outlined class="pa-3 text-center" :loading="loading">
          <v-icon :color="f.enabled ? 'success' : 'grey'" large>{{ f.icon }}</v-icon>
          <div class="overline mt-1">{{ f.label }}</div>
          <v-chip x-small :color="f.enabled ? 'success' : 'grey'" dark>{{ f.enabled ? 'Active' : 'Inactive' }}</v-chip>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <!-- Stats -->
      <v-col cols="12" md="4">
        <v-card outlined class="pa-4" :loading="loading">
          <v-card-title class="subtitle-1 pb-2">Infrastructure Stats</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-list dense>
            <v-list-item>
              <v-list-item-icon><v-icon small color="blue">mdi-office-building</v-icon></v-list-item-icon>
              <v-list-item-content><v-list-item-title>Offices</v-list-item-title></v-list-item-content>
              <v-list-item-action><v-chip small>{{ data.offices && data.offices.total || 0 }}</v-chip></v-list-item-action>
            </v-list-item>
            <v-list-item>
              <v-list-item-icon><v-icon small color="orange">mdi-webhook</v-icon></v-list-item-icon>
              <v-list-item-content><v-list-item-title>Webhooks</v-list-item-title></v-list-item-content>
              <v-list-item-action><v-chip small>{{ data.webhooks && data.webhooks.active || 0 }} active</v-chip></v-list-item-action>
            </v-list-item>
            <v-list-item>
              <v-list-item-icon><v-icon small color="purple">mdi-robot</v-icon></v-list-item-icon>
              <v-list-item-content><v-list-item-title>Automation Rules</v-list-item-title></v-list-item-content>
              <v-list-item-action><v-chip small>{{ data.automations && data.automations.active || 0 }} active</v-chip></v-list-item-action>
            </v-list-item>
            <v-list-item>
              <v-list-item-icon><v-icon small color="green">mdi-database-export</v-icon></v-list-item-icon>
              <v-list-item-content><v-list-item-title>Exports (30 days)</v-list-item-title></v-list-item-content>
              <v-list-item-action><v-chip small>{{ data.exports_this_month || 0 }}</v-chip></v-list-item-action>
            </v-list-item>
            <v-list-item>
              <v-list-item-icon><v-icon small color="teal">mdi-backup-restore</v-icon></v-list-item-icon>
              <v-list-item-content><v-list-item-title>Last Backup</v-list-item-title></v-list-item-content>
              <v-list-item-action><span class="caption">{{ data.backup && data.backup.last_backup ? new Date(data.backup.last_backup).toLocaleDateString() : '—' }}</span></v-list-item-action>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Quick Links -->
      <v-col cols="12" md="8">
        <v-card outlined class="pa-4">
          <v-card-title class="subtitle-1 pb-2">Quick Access</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-row dense>
            <v-col v-for="link in quickLinks" :key="link.to" cols="6" md="4">
              <v-btn block outlined :color="link.color" :to="link.to" class="mb-2">
                <v-icon left small>{{ link.icon }}</v-icon>{{ link.label }}
              </v-btn>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import { entGetDashboard } from '@/services/enterpriseApi';
export default {
  name: 'EnterpriseHub',
  data() {
    return {
      data: {}, loading: true,
      quickLinks: [
        { label: 'Webhooks',        to: '/enterprise/webhooks',          icon: 'mdi-webhook',           color: 'orange' },
        { label: 'Automation',      to: '/enterprise/automation',         icon: 'mdi-robot',             color: 'purple' },
        { label: 'SSO Config',      to: '/enterprise/sso',               icon: 'mdi-lock-open',         color: 'indigo' },
        { label: '2FA',             to: '/enterprise/2fa',               icon: 'mdi-two-factor-authentication',color: 'red' },
        { label: 'Data Export',     to: '/enterprise/data-export',       icon: 'mdi-database-export',   color: 'teal' },
        { label: 'CRM',             to: '/enterprise/crm',               icon: 'mdi-account-sync',      color: 'blue' },
        { label: 'Custom Domains',  to: '/enterprise/domains',           icon: 'mdi-web',               color: 'green' },
        { label: 'BI Dashboard',    to: '/enterprise/bi',                icon: 'mdi-chart-areaspline',  color: 'deep-orange' },
        { label: 'Disaster Recovery',to: '/enterprise/disaster-recovery',icon: 'mdi-backup-restore',    color: 'brown' },
        { label: 'Compliance',      to: '/enterprise/compliance',        icon: 'mdi-shield-check',      color: 'red darken-2' },
        { label: 'Audit Logs',      to: '/enterprise/audit-logs',        icon: 'mdi-history',           color: 'blue-grey' },
        { label: 'Retention',       to: '/enterprise/retention',         icon: 'mdi-clock-time-eight',  color: 'amber darken-2' },
      ],
    };
  },
  computed: {
    featureCards() {
      const f = this.data.features || {};
      return [
        { label: 'SSO', icon: 'mdi-lock-open-variant', enabled: f.sso },
        { label: '2FA', icon: 'mdi-two-factor-authentication', enabled: f.two_fa },
        { label: 'White-Label', icon: 'mdi-palette', enabled: f.white_label },
        { label: 'Custom Domain', icon: 'mdi-web', enabled: f.custom_domain },
        { label: 'Encryption', icon: 'mdi-lock', enabled: f.encryption },
        { label: 'Disaster Recovery', icon: 'mdi-backup-restore', enabled: f.disaster_recovery },
        { label: 'Audit Logs', icon: 'mdi-history', enabled: f.audit_logs },
        { label: 'API Access', icon: 'mdi-api', enabled: f.api_access },
      ];
    },
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.data = await entGetDashboard(); }
      catch (e) { console.error(e); }
      finally { this.loading = false; }
    },
  },
};
</script>
