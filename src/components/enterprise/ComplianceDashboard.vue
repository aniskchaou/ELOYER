<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Compliance & Data Governance</h1><p class="body-2 grey--text">GDPR, SOC 2, ISO 27001 and regulatory compliance status</p></v-col>
    </v-row>

    <!-- Overall Score -->
    <v-row class="mb-4">
      <v-col cols="12" md="4">
        <v-card outlined class="pa-4 text-center" :loading="loading">
          <div class="overline grey--text">Compliance Score</div>
          <div class="text-h1 font-weight-bold green--text">78</div>
          <div class="caption grey--text">out of 100</div>
          <v-progress-linear value="78" color="green" rounded height="10" class="mt-2"></v-progress-linear>
        </v-card>
      </v-col>
      <v-col cols="12" md="8">
        <v-card outlined class="pa-4" :loading="loading">
          <v-card-title class="subtitle-1 pb-2">Framework Status</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-row v-if="compliance">
            <v-col v-for="f in frameworks" :key="f.key" cols="6" md="3" class="text-center">
              <v-avatar :color="f.enabled ? 'success' : 'grey lighten-2'" size="48" class="mb-2">
                <v-icon :color="f.enabled ? 'white' : 'grey'" small>{{ f.icon }}</v-icon>
              </v-avatar>
              <div class="caption font-weight-bold">{{ f.label }}</div>
              <v-chip x-small :color="f.enabled ? 'success' : f.inprogress ? 'orange' : 'grey'" dark class="mt-1">{{ f.status }}</v-chip>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <!-- Controls Detail -->
    <v-row>
      <v-col cols="12" md="6">
        <v-card outlined class="pa-4" :loading="loading">
          <v-card-title class="subtitle-1 pb-2">Security Controls</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-list dense v-if="compliance">
            <v-list-item v-for="c in controls" :key="c.label">
              <v-list-item-icon><v-icon :color="c.enabled ? 'success' : 'error'" small>{{ c.enabled ? 'mdi-check-circle' : 'mdi-close-circle' }}</v-icon></v-list-item-icon>
              <v-list-item-content><v-list-item-title>{{ c.label }}</v-list-item-title></v-list-item-content>
              <v-list-item-action><v-chip x-small :color="c.enabled ? 'success' : 'grey'" dark>{{ c.enabled ? 'Active' : 'Inactive' }}</v-chip></v-list-item-action>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card outlined class="pa-4" :loading="loading">
          <v-card-title class="subtitle-1 pb-2">GDPR Controls</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-list dense v-if="compliance && compliance.gdpr">
            <v-list-item><v-list-item-icon><v-icon color="success" small>mdi-check-circle</v-icon></v-list-item-icon><v-list-item-content><v-list-item-title>Data Residency</v-list-item-title></v-list-item-content><v-list-item-action><v-chip small>{{ compliance.gdpr.data_residency }}</v-chip></v-list-item-action></v-list-item>
            <v-list-item><v-list-item-icon><v-icon :color="compliance.gdpr.right_to_erasure ? 'success' : 'grey'" small>{{ compliance.gdpr.right_to_erasure ? 'mdi-check-circle' : 'mdi-close-circle' }}</v-icon></v-list-item-icon><v-list-item-content><v-list-item-title>Right to Erasure</v-list-item-title></v-list-item-content></v-list-item>
            <v-list-item><v-list-item-icon><v-icon :color="compliance.gdpr.data_export ? 'success' : 'grey'" small>{{ compliance.gdpr.data_export ? 'mdi-check-circle' : 'mdi-close-circle' }}</v-icon></v-list-item-icon><v-list-item-content><v-list-item-title>Data Export / Portability</v-list-item-title></v-list-item-content></v-list-item>
            <v-divider class="my-2"></v-divider>
            <v-list-item><v-list-item-content><v-list-item-title class="font-weight-medium">Last Penetration Test</v-list-item-title></v-list-item-content><v-list-item-action><span class="caption">{{ compliance.pen_test_date }}</span></v-list-item-action></v-list-item>
            <v-list-item><v-list-item-content><v-list-item-title class="font-weight-medium">SOC 2 Assessment</v-list-item-title></v-list-item-content><v-list-item-action><v-chip x-small color="orange" dark>In Progress</v-chip></v-list-item-action></v-list-item>
          </v-list>
          <v-btn outlined color="blue" small class="mt-3" to="/enterprise/data-export"><v-icon left small>mdi-download</v-icon>Download Compliance Report</v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import { entGetCompliance } from '@/services/enterpriseApi';
export default {
  name: 'ComplianceDashboard',
  data() { return { compliance: null, loading: true }; },
  computed: {
    frameworks() {
      if (!this.compliance) return [];
      return [
        { key: 'gdpr', label: 'GDPR', icon: 'mdi-shield-account', enabled: this.compliance.gdpr?.enabled, inprogress: true, status: 'Active' },
        { key: 'soc2', label: 'SOC 2', icon: 'mdi-security', enabled: false, inprogress: true, status: 'In Progress' },
        { key: 'iso27001', label: 'ISO 27001', icon: 'mdi-certificate', enabled: false, inprogress: true, status: 'Planned' },
        { key: 'hipaa', label: 'HIPAA', icon: 'mdi-hospital', enabled: false, inprogress: false, status: 'N/A' },
      ];
    },
    controls() {
      if (!this.compliance) return [];
      return [
        { label: 'Encryption at Rest', enabled: this.compliance.encryption_at_rest },
        { label: 'Encryption in Transit (TLS)', enabled: this.compliance.encryption_in_transit },
        { label: 'Two-Factor Authentication', enabled: this.compliance.two_fa },
        { label: 'Audit Log Export', enabled: this.compliance.audit_log_export },
        { label: 'Document Retention Policy', enabled: this.compliance.data_retention_policy },
        { label: 'SSO / SAML', enabled: false },
        { label: 'Penetration Testing', enabled: !!this.compliance.pen_test_date },
        { label: 'Offsite Backup', enabled: true },
      ];
    },
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.compliance = await entGetCompliance(); }
      catch (e) { console.error(e); }
      finally { this.loading = false; }
    },
  },
};
</script>
