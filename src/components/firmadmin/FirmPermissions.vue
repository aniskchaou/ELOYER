<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Permissions Matrix</h1><p class="body-2 grey--text">Define what each role can access and perform</p></v-col>
    </v-row>
    <v-card outlined>
      <v-card-text>
        <v-simple-table>
          <template v-slot:default>
            <thead>
              <tr>
                <th>Feature</th>
                <th v-for="role in roles" :key="role" class="text-center text-capitalize">{{ role.replace('_', ' ') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="feature in features" :key="feature.key">
                <td class="font-weight-medium">{{ feature.label }}</td>
                <td v-for="role in roles" :key="role" class="text-center">
                  <v-checkbox v-model="matrix[role][feature.key]" dense hide-details class="d-inline-flex" @change="dirty=true"></v-checkbox>
                </td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="red lighten-1" dark :disabled="!dirty" @click="save"><v-icon left>mdi-content-save</v-icon>Save Permissions</v-btn>
      </v-card-actions>
    </v-card>
    <v-snackbar v-model="snack" color="success" top>Permissions saved.</v-snackbar>
  </v-container>
</template>
<script>
export default {
  name: 'FirmPermissions',
  data() {
    const roles = ['firm_admin', 'senior_lawyer', 'attorney', 'paralegal', 'accountant', 'client'];
    const features = [
      { key: 'view_cases', label: 'View Cases' },
      { key: 'create_cases', label: 'Create Cases' },
      { key: 'assign_lawyers', label: 'Assign Lawyers' },
      { key: 'view_documents', label: 'View Documents' },
      { key: 'upload_documents', label: 'Upload Documents' },
      { key: 'view_billing', label: 'View Billing' },
      { key: 'manage_billing', label: 'Manage Billing' },
      { key: 'view_clients', label: 'View Clients' },
      { key: 'manage_clients', label: 'Manage Clients' },
      { key: 'approve_filings', label: 'Approve Filings' },
      { key: 'view_reports', label: 'View Reports' },
      { key: 'manage_staff', label: 'Manage Staff' },
      { key: 'use_ai', label: 'Use AI Tools' },
      { key: 'view_audit_logs', label: 'View Audit Logs' },
    ];
    const defaults = {
      firm_admin:    { view_cases:true, create_cases:true, assign_lawyers:true, view_documents:true, upload_documents:true, view_billing:true, manage_billing:true, view_clients:true, manage_clients:true, approve_filings:true, view_reports:true, manage_staff:true, use_ai:true, view_audit_logs:true },
      senior_lawyer: { view_cases:true, create_cases:true, assign_lawyers:true, view_documents:true, upload_documents:true, view_billing:true, manage_billing:false, view_clients:true, manage_clients:true, approve_filings:true, view_reports:true, manage_staff:false, use_ai:true, view_audit_logs:false },
      attorney:      { view_cases:true, create_cases:true, assign_lawyers:false, view_documents:true, upload_documents:true, view_billing:true, manage_billing:false, view_clients:true, manage_clients:false, approve_filings:false, view_reports:false, manage_staff:false, use_ai:true, view_audit_logs:false },
      paralegal:     { view_cases:true, create_cases:false, assign_lawyers:false, view_documents:true, upload_documents:true, view_billing:false, manage_billing:false, view_clients:true, manage_clients:false, approve_filings:false, view_reports:false, manage_staff:false, use_ai:false, view_audit_logs:false },
      accountant:    { view_cases:false, create_cases:false, assign_lawyers:false, view_documents:false, upload_documents:false, view_billing:true, manage_billing:true, view_clients:false, manage_clients:false, approve_filings:false, view_reports:true, manage_staff:false, use_ai:false, view_audit_logs:false },
      client:        { view_cases:true, create_cases:false, assign_lawyers:false, view_documents:true, upload_documents:false, view_billing:true, manage_billing:false, view_clients:false, manage_clients:false, approve_filings:false, view_reports:false, manage_staff:false, use_ai:false, view_audit_logs:false },
    };
    const matrix = {};
    roles.forEach(r => { matrix[r] = { ...defaults[r] }; });
    return { roles, features, matrix, dirty: false, snack: false };
  },
  methods: {
    save() { this.snack = true; this.dirty = false; },
  },
};
</script>
