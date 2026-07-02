<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Contact Management</h1><p class="body-2 grey--text">Firm's address book — clients, courts, notaries and partners</p></v-col>
      <v-col cols="auto"><v-btn color="pink darken-1" dark @click="open()"><v-icon left>mdi-plus</v-icon>Add Contact</v-btn></v-col>
    </v-row>

    <v-card outlined>
      <v-card-title>
        <v-text-field v-model="search" append-icon="mdi-magnify" label="Search name, company, email…" dense outlined single-line hide-details @input="searchContacts" style="max-width:300px"></v-text-field>
        <v-spacer></v-spacer>
        <v-btn icon @click="showStarred=!showStarred" :color="showStarred?'yellow darken-2':'grey'"><v-icon>mdi-star</v-icon></v-btn>
      </v-card-title>
      <v-data-table :headers="headers" :items="filtered" :loading="loading" class="elevation-0">
        <template v-slot:item.is_starred="{ item }">
          <v-btn icon small @click="toggleStar(item)"><v-icon small :color="item.is_starred?'yellow darken-2':'grey lighten-1'">mdi-star</v-icon></v-btn>
        </template>
        <template v-slot:item.role="{ item }"><v-chip x-small outlined>{{ item.role }}</v-chip></template>
        <template v-slot:item.actions="{ item }">
          <v-btn icon small @click="open(item)"><v-icon small>mdi-pencil</v-icon></v-btn>
          <v-btn icon small color="error" @click="del(item)"><v-icon small>mdi-delete</v-icon></v-btn>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="560">
      <v-card>
        <v-card-title>{{ editing ? 'Edit Contact' : 'New Contact' }}</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-row dense>
            <v-col cols="12"><v-text-field v-model="form.full_name" label="Full Name *" outlined dense></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model="form.company" label="Company / Firm" outlined dense></v-text-field></v-col>
            <v-col cols="6"><v-select v-model="form.role" :items="['client','lawyer','judge','notary','court_clerk','partner','vendor','other']" label="Role" outlined dense></v-select></v-col>
            <v-col cols="6"><v-text-field v-model="form.email" label="Email" outlined dense type="email"></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model="form.phone" label="Phone" outlined dense></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model="form.mobile" label="Mobile" outlined dense></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model="form.address" label="Address" outlined dense></v-text-field></v-col>
            <v-col cols="12"><v-textarea v-model="form.notes" label="Notes" outlined rows="2" auto-grow></v-textarea></v-col>
          </v-row>
          <v-alert v-if="err" type="error" dense>{{ err }}</v-alert>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="dialog=false">Cancel</v-btn><v-btn color="pink darken-1" dark :loading="saving" @click="save">{{ editing ? 'Update' : 'Add' }}</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>
<script>
import { stGetContacts, stCreateContact, stUpdateContact, stDeleteContact } from '@/services/staffApi';
export default {
  name: 'ContactManagement',
  data() {
    return {
      contacts: [], loading: true, dialog: false, editing: null, saving: false, err: '',
      search: '', showStarred: false,
      form: { full_name: '', company: '', email: '', phone: '', mobile: '', role: 'contact', address: '', notes: '' },
      snack: false, snackMsg: '', snackColor: 'success',
      headers: [
        { text: '★', value: 'is_starred', width: 40, sortable: false },
        { text: 'Name', value: 'full_name' },
        { text: 'Company', value: 'company' },
        { text: 'Role', value: 'role' },
        { text: 'Email', value: 'email' },
        { text: 'Phone', value: 'phone' },
        { text: '', value: 'actions', sortable: false, align: 'end' },
      ],
    };
  },
  computed: {
    filtered() { return this.showStarred ? this.contacts.filter(c => c.is_starred) : this.contacts; },
  },
  created() { this.load(); },
  methods: {
    async load(q) {
      this.loading = true;
      try { this.contacts = await stGetContacts(q); }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.loading = false; }
    },
    searchContacts() {
      clearTimeout(this._searchTimer);
      this._searchTimer = setTimeout(() => this.load(this.search || undefined), 400);
    },
    open(c = null) {
      this.editing = c;
      this.form = c ? { full_name: c.full_name, company: c.company, email: c.email, phone: c.phone, mobile: c.mobile, role: c.role, address: c.address, notes: c.notes } : { full_name: '', company: '', email: '', phone: '', mobile: '', role: 'contact', address: '', notes: '' };
      this.err = ''; this.dialog = true;
    },
    async save() {
      if (!this.form.full_name) { this.err = 'Name required.'; return; }
      this.saving = true;
      try {
        if (this.editing) await stUpdateContact(this.editing.id, this.form);
        else await stCreateContact(this.form);
        this.notify(this.editing ? 'Updated.' : 'Contact added.');
        this.dialog = false; this.load();
      } catch (e) { this.err = e.message; }
      finally { this.saving = false; }
    },
    async del(c) {
      if (!confirm(`Delete "${c.full_name}"?`)) return;
      try { await stDeleteContact(c.id); this.notify('Deleted.', 'warning'); this.load(); }
      catch (e) { this.notify(e.message, 'error'); }
    },
    async toggleStar(c) {
      try { await stUpdateContact(c.id, { is_starred: !c.is_starred }); c.is_starred = !c.is_starred; }
      catch (e) { this.notify(e.message, 'error'); }
    },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
