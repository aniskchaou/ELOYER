<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Staff Directory</h1><p class="body-2 grey--text">Browse and contact team members</p></v-col>
      <v-col cols="auto"><v-btn color="primary" @click="openAdd"><v-icon left>mdi-plus</v-icon> Add Member</v-btn></v-col>
    </v-row>

    <v-row class="mb-3">
      <v-col cols="12" md="6">
        <v-text-field v-model="search" append-icon="mdi-magnify" label="Search staff..." outlined dense hide-details></v-text-field>
      </v-col>
      <v-col cols="6" md="3">
        <v-select v-model="filterRole" :items="roleOptions" label="Role" outlined dense clearable hide-details></v-select>
      </v-col>
    </v-row>

    <v-row>
      <v-col v-for="m in filteredStaff" :key="m.id" cols="12" sm="6" md="4" lg="3">
        <v-card outlined class="pa-4 text-center">
          <v-avatar :color="m.color" size="60" class="mb-2">
            <span class="white--text subtitle-1 font-weight-bold">{{ m.name.split(' ').map(n => n[0]).join('') }}</span>
          </v-avatar>
          <div class="subtitle-2 font-weight-bold">{{ m.name }}</div>
          <v-chip x-small :color="m.roleColor" dark class="mt-1 mb-2">{{ m.role }}</v-chip>
          <div class="caption grey--text"><v-icon x-small>mdi-email</v-icon> {{ m.email }}</div>
          <div class="caption grey--text mt-1"><v-icon x-small>mdi-phone</v-icon> {{ m.phone }}</div>
          <div class="caption mt-1"><v-icon x-small>mdi-map-marker</v-icon> {{ m.office }}</div>
          <div class="d-flex justify-center mt-3">
            <v-btn icon small color="primary" @click="view(m)"><v-icon small>mdi-eye</v-icon></v-btn>
            <v-btn icon small color="orange" @click="editM(m)"><v-icon small>mdi-pencil</v-icon></v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>{{ editMode ? 'Edit Member' : 'Add Member' }}</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-text-field v-model="form.name" label="Full Name" outlined dense></v-text-field>
          <v-select v-model="form.role" :items="roleOptions" label="Role" outlined dense class="mt-3"></v-select>
          <v-text-field v-model="form.email" label="Email" outlined dense class="mt-3"></v-text-field>
          <v-text-field v-model="form.phone" label="Phone" outlined dense class="mt-3"></v-text-field>
          <v-text-field v-model="form.office" label="Office / Location" outlined dense class="mt-3"></v-text-field>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="dialog=false">Cancel</v-btn><v-btn color="primary" @click="save">Save</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script>
export default {
  name: 'Directory',
  data() {
    return {
      search: '', filterRole: null, dialog: false, editMode: false,
      form: { id: null, name: '', role: '', email: '', phone: '', office: '' },
      roleOptions: ['Admin', 'Senior Lawyer', 'Associate Lawyer', 'Paralegal', 'Accountant', 'Intern'],
      staff: [
        { id: 1, name: 'Ahmed Cherni', role: 'Senior Lawyer', roleColor: 'blue', color: 'blue darken-2', email: 'a.cherni@eloyer.tn', phone: '+216 71 123 456', office: 'Tunis HQ – Room 3A' },
        { id: 2, name: 'Karim Slim', role: 'Associate Lawyer', roleColor: 'teal', color: 'teal darken-1', email: 'k.slim@eloyer.tn', phone: '+216 71 654 321', office: 'Tunis HQ – Room 3B' },
        { id: 3, name: 'Leila Mansour', role: 'Paralegal', roleColor: 'green', color: 'green darken-1', email: 'l.mansour@eloyer.tn', phone: '+216 71 222 333', office: 'Tunis HQ – Room 2C' },
        { id: 4, name: 'Nadia Chaker', role: 'Accountant', roleColor: 'orange', color: 'orange darken-1', email: 'n.chaker@eloyer.tn', phone: '+216 71 444 555', office: 'Tunis HQ – Room 1A' },
        { id: 5, name: 'Sami Ghorbel', role: 'Associate Lawyer', roleColor: 'teal', color: 'purple darken-1', email: 's.ghorbel@eloyer.tn', phone: '+216 71 777 888', office: 'Sousse Branch' },
      ],
    };
  },
  computed: {
    filteredStaff() {
      return this.staff.filter(m =>
        (!this.filterRole || m.role === this.filterRole) &&
        (!this.search || m.name.toLowerCase().includes(this.search.toLowerCase()))
      );
    },
  },
  methods: {
    view(m) { void m; },
    openAdd() { this.editMode = false; this.form = { id: null, name: '', role: '', email: '', phone: '', office: '' }; this.dialog = true; },
    editM(m) { this.editMode = true; this.form = { ...m }; this.dialog = true; },
    save() {
      if (this.editMode) { const i = this.staff.findIndex(m => m.id === this.form.id); if (i !== -1) this.staff.splice(i, 1, { ...this.form, roleColor: 'blue', color: 'blue darken-2' }); }
      else this.staff.push({ ...this.form, id: Date.now(), roleColor: 'blue', color: 'blue darken-2' });
      this.dialog = false;
    },
  },
};
</script>
