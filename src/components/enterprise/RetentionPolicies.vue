<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Document Retention Policies</h1><p class="body-2 grey--text">Define how long documents are kept and what happens on expiry</p></v-col>
      <v-col cols="auto"><v-btn color="amber darken-2" dark @click="open()"><v-icon left>mdi-plus</v-icon>New Policy</v-btn></v-col>
    </v-row>
    <v-card outlined :loading="loading">
      <v-data-table :headers="headers" :items="policies" dense class="elevation-0">
        <template v-slot:item.retention_days="{ item }"><strong>{{ Math.floor(item.retention_days/365) }} years</strong> ({{ item.retention_days }} days)</template>
        <template v-slot:item.action_on_expiry="{ item }"><v-chip x-small :color="item.action_on_expiry==='delete'?'error':item.action_on_expiry==='archive'?'orange':'grey'" dark>{{ item.action_on_expiry }}</v-chip></template>
        <template v-slot:item.is_active="{ item }"><v-chip x-small :color="item.is_active?'success':'grey'" dark>{{ item.is_active ? 'Active' : 'Inactive' }}</v-chip></template>
        <template v-slot:item.actions="{ item }"><v-btn icon small @click="open(item)"><v-icon small>mdi-pencil</v-icon></v-btn></template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="520">
      <v-card>
        <v-card-title>{{ editing ? 'Edit Policy' : 'New Policy' }}</v-card-title><v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-text-field v-model="form.name" label="Policy Name *" outlined dense class="mb-2"></v-text-field>
          <v-select v-model="form.document_type" :items="['Contract','Court Filing','Invoice','Evidence','Case Note','Email','All Documents']" label="Document Type" outlined dense class="mb-2" clearable></v-select>
          <v-text-field v-model.number="form.retention_days" label="Retention Period (days)" outlined dense type="number" class="mb-2" hint="2555 days = 7 years"></v-text-field>
          <v-select v-model="form.action_on_expiry" :items="['archive','delete','review']" label="Action on Expiry" outlined dense></v-select>
          <v-alert v-if="err" type="error" dense class="mt-2">{{ err }}</v-alert>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="dialog=false">Cancel</v-btn><v-btn color="amber darken-2" dark :loading="saving" @click="save">{{ editing ? 'Update' : 'Create' }}</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>
<script>
import { entGetRetention, entCreateRetention, entUpdateRetention } from '@/services/enterpriseApi';
export default {
  name: 'RetentionPolicies',
  data() {
    return {
      policies: [], loading: true, dialog: false, editing: null, saving: false, err: '',
      form: { name: '', document_type: '', retention_days: 2555, action_on_expiry: 'archive' },
      snack: false, snackMsg: '', snackColor: 'success',
      headers: [
        { text: 'Policy Name', value: 'name' }, { text: 'Document Type', value: 'document_type' },
        { text: 'Retention', value: 'retention_days' }, { text: 'On Expiry', value: 'action_on_expiry' },
        { text: 'Status', value: 'is_active' }, { text: '', value: 'actions', sortable: false },
      ],
    };
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.policies = await entGetRetention(); }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.loading = false; }
    },
    open(p = null) {
      this.editing = p;
      this.form = p ? { name: p.name, document_type: p.document_type, retention_days: p.retention_days, action_on_expiry: p.action_on_expiry } : { name: '', document_type: '', retention_days: 2555, action_on_expiry: 'archive' };
      this.err = ''; this.dialog = true;
    },
    async save() {
      if (!this.form.name) { this.err = 'Name required.'; return; }
      this.saving = true;
      try {
        if (this.editing) await entUpdateRetention(this.editing.id, this.form);
        else await entCreateRetention(this.form);
        this.notify(this.editing ? 'Updated.' : 'Policy created.'); this.dialog = false; this.load();
      } catch (e) { this.err = e.message; }
      finally { this.saving = false; }
    },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
