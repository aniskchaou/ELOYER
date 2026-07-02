<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Roles Management</h1><p class="body-2 grey--text">Define roles and manage associated permissions</p></v-col>
      <v-col cols="auto"><v-btn color="primary" @click="openAdd"><v-icon left>mdi-plus</v-icon> Add Role</v-btn></v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="4">
        <v-list dense outlined rounded>
          <v-subheader>Roles</v-subheader>
          <v-list-item-group v-model="selectedRoleId" color="primary">
            <v-list-item v-for="r in roles" :key="r.id" :value="r.id" @click="selectRole(r)">
              <v-list-item-icon><v-icon small :color="r.color">mdi-shield-account</v-icon></v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ r.name }}</v-list-item-title>
                <v-list-item-subtitle class="caption">{{ r.users }} user(s)</v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-btn icon x-small @click.stop="editRole(r)"><v-icon x-small>mdi-pencil</v-icon></v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-col>
      <v-col cols="12" md="8">
        <v-card outlined v-if="selectedRole">
          <v-card-title class="subtitle-1">
            <v-icon :color="selectedRole.color" class="mr-2">mdi-shield-account</v-icon>
            {{ selectedRole.name }}
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text>
            <v-row>
              <v-col v-for="group in permissionGroups" :key="group.name" cols="12" md="6">
                <div class="overline mb-2">{{ group.name }}</div>
                <div v-for="p in group.permissions" :key="p">
                  <v-checkbox :label="p" dense :input-value="selectedRole.permissions.includes(p)" hide-details class="mt-0" @change="togglePermission(p, $event)"></v-checkbox>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
        <div v-else class="text-center grey--text py-16"><v-icon large>mdi-shield-account</v-icon><br>Select a role to view permissions</div>
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="440px">
      <v-card>
        <v-card-title>{{ editMode ? 'Edit Role' : 'New Role' }}</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-text-field v-model="form.name" label="Role Name" outlined dense></v-text-field>
          <v-select v-model="form.color" :items="colors" label="Color" outlined dense class="mt-3"></v-select>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="dialog=false">Cancel</v-btn><v-btn color="primary" @click="save">Save</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script>
export default {
  name: 'Roles',
  data() {
    return {
      dialog: false, editMode: false, selectedRoleId: null, selectedRole: null,
      form: { id: null, name: '', color: 'blue', users: 0, permissions: [] },
      colors: ['blue', 'green', 'purple', 'orange', 'red', 'teal'],
      roles: [
        { id: 1, name: 'Admin', color: 'red', users: 1, permissions: ['View Cases', 'Edit Cases', 'Delete Cases', 'View Clients', 'Edit Clients', 'View Billing', 'Edit Billing', 'View Reports', 'Manage Users', 'System Settings'] },
        { id: 2, name: 'Lawyer', color: 'blue', users: 3, permissions: ['View Cases', 'Edit Cases', 'View Clients', 'Edit Clients', 'View Billing'] },
        { id: 3, name: 'Paralegal', color: 'green', users: 2, permissions: ['View Cases', 'View Clients', 'View Documents', 'Edit Documents'] },
        { id: 4, name: 'Accountant', color: 'orange', users: 1, permissions: ['View Billing', 'Edit Billing', 'View Reports'] },
        { id: 5, name: 'Client', color: 'purple', users: 15, permissions: ['View Own Cases', 'View Own Documents'] },
      ],
      permissionGroups: [
        { name: 'Cases', permissions: ['View Cases', 'Edit Cases', 'Delete Cases', 'View Own Cases'] },
        { name: 'Clients', permissions: ['View Clients', 'Edit Clients', 'Delete Clients'] },
        { name: 'Documents', permissions: ['View Documents', 'Edit Documents', 'View Own Documents'] },
        { name: 'Billing', permissions: ['View Billing', 'Edit Billing'] },
        { name: 'Admin', permissions: ['View Reports', 'Manage Users', 'System Settings'] },
      ],
    };
  },
  methods: {
    selectRole(r) { this.selectedRole = r; },
    openAdd() { this.editMode = false; this.form = { id: null, name: '', color: 'blue', users: 0, permissions: [] }; this.dialog = true; },
    editRole(r) { this.editMode = true; this.form = { ...r, permissions: [...r.permissions] }; this.dialog = true; },
    togglePermission(p, val) { if (this.selectedRole) { if (val && !this.selectedRole.permissions.includes(p)) this.selectedRole.permissions.push(p); else if (!val) this.selectedRole.permissions = this.selectedRole.permissions.filter(x => x !== p); } },
    save() {
      if (this.editMode) { const i = this.roles.findIndex(r => r.id === this.form.id); if (i !== -1) this.roles.splice(i, 1, { ...this.form }); }
      else this.roles.push({ ...this.form, id: Date.now() });
      this.dialog = false;
    },
  },
};
</script>
