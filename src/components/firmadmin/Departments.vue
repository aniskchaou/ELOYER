<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Departments</h1><p class="body-2 grey--text">Organize your firm into practice groups and departments</p></v-col>
      <v-col cols="auto"><v-btn color="red lighten-1" dark @click="open()"><v-icon left>mdi-plus</v-icon>New Department</v-btn></v-col>
    </v-row>
    <v-row>
      <v-col v-for="dept in departments" :key="dept.id" cols="12" md="4">
        <v-card outlined class="pa-4">
          <div class="d-flex align-center mb-2">
            <v-avatar color="red lighten-4" size="38" class="mr-3"><v-icon color="red">mdi-sitemap</v-icon></v-avatar>
            <div>
              <div class="subtitle-2 font-weight-bold">{{ dept.name }}</div>
              <div class="caption grey--text">{{ dept.head_name || 'No head assigned' }}</div>
            </div>
            <v-spacer></v-spacer>
            <v-btn icon small @click="open(dept)"><v-icon small>mdi-pencil</v-icon></v-btn>
            <v-btn icon small color="error" @click="del(dept)"><v-icon small>mdi-delete</v-icon></v-btn>
          </div>
          <v-divider class="my-2"></v-divider>
          <p class="caption grey--text mb-0">{{ dept.description || 'No description' }}</p>
        </v-card>
      </v-col>
    </v-row>
    <v-alert v-if="!loading && !departments.length" type="info" outlined class="mt-4">No departments yet. Create one to organize your team.</v-alert>

    <v-dialog v-model="dialog" max-width="480">
      <v-card>
        <v-card-title>{{ editing ? 'Edit Department' : 'New Department' }}</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-text-field v-model="form.name" label="Name *" outlined dense class="mb-2"></v-text-field>
          <v-textarea v-model="form.description" label="Description" outlined rows="3" auto-grow></v-textarea>
          <v-select v-model="form.head_user_id" :items="users" item-text="full_name" item-value="id" label="Department Head" outlined dense clearable></v-select>
          <v-alert v-if="err" type="error" dense>{{ err }}</v-alert>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="dialog=false">Cancel</v-btn><v-btn color="red lighten-1" dark :loading="saving" @click="save">{{ editing ? 'Update' : 'Create' }}</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>
<script>
import { faGetDepartments, faCreateDepartment, faUpdateDepartment, faDeleteDepartment } from '@/services/firmadminApi';
export default {
  name: 'Departments',
  data() {
    return {
      departments: [], users: [], loading: true, dialog: false, editing: null, saving: false, err: '',
      form: { name: '', description: '', head_user_id: null },
      snack: false, snackMsg: '', snackColor: 'success',
    };
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try {
        [this.departments] = await Promise.all([faGetDepartments()]);
      } catch (e) { this.notify(e.message, 'error'); }
      finally { this.loading = false; }
    },
    open(dept = null) {
      this.editing = dept;
      this.form = dept ? { name: dept.name, description: dept.description, head_user_id: dept.head_user_id } : { name: '', description: '', head_user_id: null };
      this.err = ''; this.dialog = true;
    },
    async save() {
      if (!this.form.name) { this.err = 'Name required.'; return; }
      this.saving = true;
      try {
        if (this.editing) await faUpdateDepartment(this.editing.id, this.form);
        else await faCreateDepartment(this.form);
        this.notify(this.editing ? 'Department updated.' : 'Department created.');
        this.dialog = false; this.load();
      } catch (e) { this.err = e.message; }
      finally { this.saving = false; }
    },
    async del(dept) {
      if (!confirm(`Delete department "${dept.name}"?`)) return;
      try { await faDeleteDepartment(dept.id); this.notify('Deleted.', 'warning'); this.load(); }
      catch (e) { this.notify(e.message, 'error'); }
    },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
