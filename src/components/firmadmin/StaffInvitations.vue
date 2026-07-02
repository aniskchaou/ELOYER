<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Staff Invitations</h1><p class="body-2 grey--text">Invite lawyers and staff to join your firm</p></v-col>
      <v-col cols="auto"><v-btn color="red lighten-1" dark @click="dialog=true"><v-icon left>mdi-account-plus</v-icon>Invite</v-btn></v-col>
    </v-row>

    <v-card outlined>
      <v-data-table :headers="headers" :items="invites" :loading="loading" class="elevation-0">
        <template v-slot:item.status="{ item }">
          <v-chip small :color="statusColor(item.status)" dark>{{ item.status }}</v-chip>
        </template>
        <template v-slot:item.expires_at="{ item }">
          <span :class="isExpired(item) ? 'red--text' : ''">{{ new Date(item.expires_at).toLocaleDateString() }}</span>
        </template>
        <template v-slot:item.created_at="{ item }">{{ new Date(item.created_at).toLocaleDateString() }}</template>
        <template v-slot:item.actions="{ item }">
          <v-btn v-if="item.status === 'pending'" icon small color="blue" @click="resend(item)" title="Resend"><v-icon small>mdi-email-sync</v-icon></v-btn>
          <v-btn icon small color="error" @click="del(item)" title="Cancel"><v-icon small>mdi-delete</v-icon></v-btn>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="480">
      <v-card>
        <v-card-title>Invite Staff Member</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-text-field v-model="form.email" label="Email Address *" outlined dense type="email" class="mb-2"></v-text-field>
          <v-select v-model="form.role" :items="roles" label="Role" outlined dense class="mb-2"></v-select>
          <v-select v-model="form.department_id" :items="departments" item-text="name" item-value="id" label="Department (optional)" outlined dense clearable></v-select>
          <v-alert v-if="err" type="error" dense class="mt-2">{{ err }}</v-alert>
          <v-alert v-if="newLink" type="success" dense class="mt-2">
            Invitation link: <code>{{ newLink }}</code>
          </v-alert>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="closeDialog">Close</v-btn><v-btn color="red lighten-1" dark :loading="saving" @click="invite">Send Invitation</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>
<script>
import { faGetInvitations, faCreateInvitation, faResendInvitation, faDeleteInvitation, faGetDepartments } from '@/services/firmadminApi';
export default {
  name: 'StaffInvitations',
  data() {
    return {
      invites: [], departments: [], loading: true, dialog: false, saving: false, err: '', newLink: '',
      form: { email: '', role: 'lawyer', department_id: null },
      roles: ['lawyer', 'senior_lawyer', 'paralegal', 'accountant', 'firm_admin'],
      snack: false, snackMsg: '', snackColor: 'success',
      headers: [
        { text: 'Email', value: 'email' },
        { text: 'Role', value: 'role' },
        { text: 'Department', value: 'department_name' },
        { text: 'Invited By', value: 'invited_by_name' },
        { text: 'Status', value: 'status' },
        { text: 'Expires', value: 'expires_at' },
        { text: 'Sent', value: 'created_at' },
        { text: '', value: 'actions', sortable: false, align: 'end' },
      ],
    };
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { [this.invites, this.departments] = await Promise.all([faGetInvitations(), faGetDepartments()]); }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.loading = false; }
    },
    async invite() {
      if (!this.form.email) { this.err = 'Email required.'; return; }
      this.saving = true; this.err = ''; this.newLink = '';
      try {
        const r = await faCreateInvitation({ ...this.form, invited_by: 1 });
        this.newLink = r.invite_link;
        this.notify('Invitation sent.');
        this.load();
      } catch (e) { this.err = e.message; }
      finally { this.saving = false; }
    },
    async resend(inv) {
      try { await faResendInvitation(inv.id); this.notify('Invitation resent.'); this.load(); }
      catch (e) { this.notify(e.message, 'error'); }
    },
    async del(inv) {
      if (!confirm('Cancel this invitation?')) return;
      try { await faDeleteInvitation(inv.id); this.notify('Cancelled.', 'warning'); this.load(); }
      catch (e) { this.notify(e.message, 'error'); }
    },
    closeDialog() { this.dialog = false; this.newLink = ''; this.form = { email: '', role: 'lawyer', department_id: null }; },
    isExpired(inv) { return new Date(inv.expires_at) < new Date(); },
    statusColor(s) { return s === 'pending' ? 'orange' : s === 'accepted' ? 'success' : 'grey'; },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
