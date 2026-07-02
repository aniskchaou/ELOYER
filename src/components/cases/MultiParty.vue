<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col>
        <h1 class="text-h5 font-weight-bold">Multi-Party Case Tracking</h1>
      </v-col>
      <v-col cols="auto">
        <v-btn color="primary" @click="openAdd">
          <v-icon left>mdi-plus</v-icon> Add Party
        </v-btn>
      </v-col>
    </v-row>

    <!-- Case selector -->
    <v-card class="mb-4 pa-4" outlined>
      <v-row>
        <v-col cols="12" md="4">
          <v-select v-model="selectedCase" :items="cases" item-text="name" item-value="id"
            label="Select Case" outlined dense @change="onCaseChange"></v-select>
        </v-col>
        <v-col cols="12" md="4">
          <v-select v-model="roleFilter" :items="roles" label="Filter by Role" outlined dense clearable></v-select>
        </v-col>
      </v-row>
    </v-card>

    <!-- Parties table -->
    <v-card outlined>
      <v-card-title>Parties
        <v-spacer></v-spacer>
        <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line hide-details></v-text-field>
      </v-card-title>
      <v-data-table :headers="headers" :items="filteredParties" :search="search" class="elevation-0">
        <template v-slot:item.role="{ item }">
          <v-chip small :color="roleColor(item.role)" dark>{{ item.role }}</v-chip>
        </template>
        <template v-slot:item.status="{ item }">
          <v-chip small :color="item.status === 'Active' ? 'green' : 'grey'" dark>{{ item.status }}</v-chip>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn icon small color="primary" @click="editParty(item)"><v-icon small>mdi-pencil</v-icon></v-btn>
          <v-btn icon small color="red" @click="removeParty(item.id)"><v-icon small>mdi-delete</v-icon></v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Add / Edit dialog -->
    <v-dialog v-model="dialog" max-width="520px">
      <v-card>
        <v-card-title>{{ editMode ? 'Edit Party' : 'Add Party' }}</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-select v-model="form.caseId" :items="cases" item-text="name" item-value="id" label="Case" outlined dense></v-select>
          <v-text-field v-model="form.name" label="Full Name" outlined dense class="mt-3"></v-text-field>
          <v-select v-model="form.role" :items="roles" label="Role" outlined dense class="mt-3"></v-select>
          <v-text-field v-model="form.lawyer" label="Representing Lawyer" outlined dense class="mt-3"></v-text-field>
          <v-text-field v-model="form.contact" label="Contact / Email" outlined dense class="mt-3"></v-text-field>
          <v-select v-model="form.status" :items="['Active','Withdrawn','Settled']" label="Status" outlined dense class="mt-3"></v-select>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="dialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="saveParty">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
export default {
  name: 'MultiParty',
  data() {
    return {
      dialog: false,
      editMode: false,
      search: '',
      selectedCase: null,
      roleFilter: null,
      roles: ['Plaintiff', 'Defendant', 'Third Party', 'Witness', 'Expert', 'Intervenor'],
      cases: [
        { id: 1, name: 'Corporate Merger – ABC Ltd' },
        { id: 2, name: 'Criminal Appeal – Jane Smith' },
        { id: 3, name: 'IP Dispute – TechCorp' },
      ],
      parties: [
        { id: 1, caseId: 1, name: 'ABC Ltd', role: 'Plaintiff', lawyer: 'John Doe', contact: 'abc@corp.com', status: 'Active' },
        { id: 2, caseId: 1, name: 'XYZ Inc', role: 'Defendant', lawyer: 'Sara Lee', contact: 'xyz@inc.com', status: 'Active' },
        { id: 3, caseId: 2, name: 'Jane Smith', role: 'Plaintiff', lawyer: 'Emily Clark', contact: 'jane@mail.com', status: 'Active' },
        { id: 4, caseId: 3, name: 'TechCorp', role: 'Plaintiff', lawyer: 'Michael Lee', contact: 'tech@corp.com', status: 'Active' },
        { id: 5, caseId: 3, name: 'Dr. Patel', role: 'Expert', lawyer: '', contact: 'patel@expert.com', status: 'Active' },
      ],
      form: { id: null, caseId: null, name: '', role: '', lawyer: '', contact: '', status: 'Active' },
      headers: [
        { text: 'Name', value: 'name' },
        { text: 'Role', value: 'role' },
        { text: 'Representing Lawyer', value: 'lawyer' },
        { text: 'Contact', value: 'contact' },
        { text: 'Status', value: 'status' },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
    };
  },
  computed: {
    filteredParties() {
      let list = this.parties;
      if (this.selectedCase) list = list.filter(p => p.caseId === this.selectedCase);
      if (this.roleFilter) list = list.filter(p => p.role === this.roleFilter);
      return list;
    },
  },
  methods: {
    onCaseChange() {},
    openAdd() {
      this.editMode = false;
      this.form = { id: null, caseId: this.selectedCase, name: '', role: '', lawyer: '', contact: '', status: 'Active' };
      this.dialog = true;
    },
    editParty(item) {
      this.editMode = true;
      this.form = { ...item };
      this.dialog = true;
    },
    saveParty() {
      if (this.editMode) {
        const idx = this.parties.findIndex(p => p.id === this.form.id);
        if (idx !== -1) this.parties.splice(idx, 1, { ...this.form });
      } else {
        this.parties.push({ ...this.form, id: Date.now() });
      }
      this.dialog = false;
    },
    removeParty(id) {
      this.parties = this.parties.filter(p => p.id !== id);
    },
    roleColor(role) {
      const map = { Plaintiff: 'blue', Defendant: 'red', 'Third Party': 'orange', Witness: 'purple', Expert: 'teal', Intervenor: 'brown' };
      return map[role] || 'grey';
    },
  },
};
</script>
