<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col>
        <h1 class="text-h5 font-weight-bold">Client Portal Access</h1>
        <p class="body-2 grey--text">Manage client portal accounts, permissions and secure access</p>
      </v-col>
      <v-col cols="auto">
        <v-btn color="primary" @click="inviteDialog = true">
          <v-icon left>mdi-account-plus</v-icon> Invite Client
        </v-btn>
      </v-col>
    </v-row>

    <!-- Stats -->
    <v-row class="mb-4">
      <v-col cols="6" md="3" v-for="s in stats" :key="s.label">
        <v-card outlined class="pa-3 text-center">
          <v-icon :color="s.color" class="mb-1">{{ s.icon }}</v-icon>
          <div class="overline">{{ s.label }}</div>
          <p class="text-h5 font-weight-bold" :class="s.color + '--text'">{{ s.value }}</p>
        </v-card>
      </v-col>
    </v-row>

    <!-- Portal accounts table -->
    <v-card outlined>
      <v-card-title>Portal Accounts
        <v-spacer></v-spacer>
        <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line hide-details dense></v-text-field>
      </v-card-title>
      <v-divider></v-divider>
      <v-data-table :headers="headers" :items="accounts" :search="search" class="elevation-0">
        <template v-slot:item.status="{ item }">
          <v-chip small :color="item.status === 'Active' ? 'green' : item.status === 'Pending' ? 'orange' : 'red'" dark>{{ item.status }}</v-chip>
        </template>
        <template v-slot:item.permissions="{ item }">
          <v-chip v-for="p in item.permissions" :key="p" x-small outlined class="mr-1">{{ p }}</v-chip>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn icon small color="primary" @click="managePerms(item)"><v-icon small>mdi-shield-account</v-icon></v-btn>
          <v-btn icon small :color="item.status === 'Active' ? 'orange' : 'green'" @click="toggleStatus(item)">
            <v-icon small>{{ item.status === 'Active' ? 'mdi-lock' : 'mdi-lock-open' }}</v-icon>
          </v-btn>
          <v-btn icon small color="blue" @click="resendInvite(item)"><v-icon small>mdi-email-send</v-icon></v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Invite Dialog -->
    <v-dialog v-model="inviteDialog" max-width="500px">
      <v-card>
        <v-card-title><v-icon left color="primary">mdi-account-plus</v-icon> Invite Client to Portal</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-select v-model="inviteForm.client" :items="clientNames" label="Select Client" outlined dense></v-select>
          <v-text-field v-model="inviteForm.email" label="Portal Email" outlined dense class="mt-3" type="email"></v-text-field>
          <v-select v-model="inviteForm.permissions" :items="allPermissions" label="Permissions" multiple outlined dense class="mt-3" chips small-chips></v-select>
          <v-alert type="info" outlined class="mt-3 caption">An invitation email will be sent to the client with a secure login link.</v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="inviteDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="sendInvite">Send Invitation</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Permissions Dialog -->
    <v-dialog v-model="permsDialog" max-width="500px">
      <v-card v-if="selectedAccount">
        <v-card-title>Permissions – {{ selectedAccount.client }}</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-checkbox v-for="p in allPermissions" :key="p" v-model="selectedAccount.permissions" :label="p" :value="p" dense></v-checkbox>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="permsDialog = false">Close</v-btn>
          <v-btn color="primary" @click="permsDialog = false">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar" timeout="3000" color="success">{{ snackMsg }}</v-snackbar>
  </v-container>
</template>

<script>
export default {
  name: 'ClientPortal',
  data() {
    return {
      search: '', inviteDialog: false, permsDialog: false,
      selectedAccount: null, snackbar: false, snackMsg: '',
      inviteForm: { client: '', email: '', permissions: [] },
      allPermissions: ['View Cases', 'View Documents', 'Download Documents', 'View Invoices', 'Pay Online', 'Send Messages'],
      clientNames: ['Ahmed Ben Ali', 'Société ABC SARL', 'Leila Mansour', 'ONG HelpAid'],
      accounts: [
        { id: 1, client: 'Ahmed Ben Ali', email: 'ahmed@corp.tn', status: 'Active', lastLogin: '2026-04-30', permissions: ['View Cases', 'View Documents', 'View Invoices'] },
        { id: 2, client: 'Société ABC SARL', email: 'contact@abc.tn', status: 'Active', lastLogin: '2026-05-01', permissions: ['View Cases', 'View Documents', 'Download Documents', 'View Invoices', 'Pay Online'] },
        { id: 3, client: 'Leila Mansour', email: 'leila@mail.com', status: 'Pending', lastLogin: 'Never', permissions: ['View Cases'] },
      ],
      headers: [
        { text: 'Client', value: 'client' },
        { text: 'Email', value: 'email' },
        { text: 'Status', value: 'status' },
        { text: 'Last Login', value: 'lastLogin' },
        { text: 'Permissions', value: 'permissions', sortable: false },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
    };
  },
  computed: {
    stats() {
      return [
        { label: 'Total Accounts', value: this.accounts.length, color: 'blue', icon: 'mdi-account-multiple' },
        { label: 'Active', value: this.accounts.filter(a => a.status === 'Active').length, color: 'green', icon: 'mdi-check-circle' },
        { label: 'Pending', value: this.accounts.filter(a => a.status === 'Pending').length, color: 'orange', icon: 'mdi-clock' },
        { label: 'Suspended', value: this.accounts.filter(a => a.status === 'Suspended').length, color: 'red', icon: 'mdi-lock' },
      ];
    },
  },
  methods: {
    toggleStatus(item) { item.status = item.status === 'Active' ? 'Suspended' : 'Active'; },
    managePerms(item) { this.selectedAccount = item; this.permsDialog = true; },
    sendInvite() {
      this.accounts.push({ id: Date.now(), client: this.inviteForm.client, email: this.inviteForm.email, status: 'Pending', lastLogin: 'Never', permissions: this.inviteForm.permissions });
      this.inviteDialog = false; this.snackMsg = 'Invitation sent!'; this.snackbar = true;
    },
    resendInvite(item) { void item; this.snackMsg = 'Invitation resent!'; this.snackbar = true; },
  },
};
</script>
