<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Roles & Permissions</h1><p class="body-2 grey--text">Manage access control matrix across all modules</p></v-col>
    </v-row>

    <v-card outlined>
      <v-card-title class="subtitle-1">Permission Matrix</v-card-title>
      <v-divider></v-divider>
      <v-card-text class="pa-0">
        <v-simple-table dense>
          <thead>
            <tr>
              <th class="text-left">Permission</th>
              <th v-for="r in roles" :key="r" class="text-center">{{ r }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in permissions" :key="p.key">
              <td class="caption font-weight-bold">{{ p.label }}</td>
              <td v-for="r in roles" :key="p.key + r" class="text-center">
                <v-checkbox
                  :input-value="hasPerm(r, p.key)"
                  hide-details
                  dense
                  class="mt-0 pt-0"
                  @change="toggle(r, p.key, $event)"
                ></v-checkbox>
              </td>
            </tr>
          </tbody>
        </v-simple-table>
      </v-card-text>
    </v-card>

    <v-row class="mt-4">
      <v-col cols="12" class="text-right">
        <v-btn color="primary" @click="save"><v-icon left>mdi-content-save</v-icon> Save Access Rules</v-btn>
      </v-col>
    </v-row>

    <v-snackbar v-model="snackbar" color="green" timeout="2000">Permissions updated.</v-snackbar>
  </v-container>
</template>
<script>
export default {
  name: 'RolesPermissions',
  data() {
    return {
      snackbar: false,
      roles: ['Admin', 'Lawyer', 'Paralegal', 'Accountant', 'Client'],
      permissions: [
        { key: 'dashboard.view', label: 'View Dashboard' },
        { key: 'cases.view', label: 'View Cases' },
        { key: 'cases.edit', label: 'Edit Cases' },
        { key: 'clients.view', label: 'View Clients' },
        { key: 'clients.edit', label: 'Edit Clients' },
        { key: 'documents.view', label: 'View Documents' },
        { key: 'documents.edit', label: 'Edit Documents' },
        { key: 'billing.view', label: 'View Billing' },
        { key: 'billing.edit', label: 'Edit Billing' },
        { key: 'reports.view', label: 'View Reports' },
        { key: 'settings.manage', label: 'Manage Settings' },
      ],
      matrix: {
        Admin: ['dashboard.view', 'cases.view', 'cases.edit', 'clients.view', 'clients.edit', 'documents.view', 'documents.edit', 'billing.view', 'billing.edit', 'reports.view', 'settings.manage'],
        Lawyer: ['dashboard.view', 'cases.view', 'cases.edit', 'clients.view', 'clients.edit', 'documents.view', 'documents.edit', 'billing.view'],
        Paralegal: ['dashboard.view', 'cases.view', 'clients.view', 'documents.view', 'documents.edit'],
        Accountant: ['dashboard.view', 'billing.view', 'billing.edit', 'reports.view'],
        Client: ['dashboard.view', 'documents.view'],
      },
    };
  },
  methods: {
    hasPerm(role, key) { return this.matrix[role].includes(key); },
    toggle(role, key, value) {
      if (value && !this.matrix[role].includes(key)) this.matrix[role].push(key);
      if (!value) this.matrix[role] = this.matrix[role].filter(p => p !== key);
    },
    save() { this.snackbar = true; },
  },
};
</script>
