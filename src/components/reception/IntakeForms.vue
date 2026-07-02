<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Client Intake Forms</h1><p class="body-2 grey--text">Digital intake for new and existing clients</p></v-col>
      <v-col cols="auto"><v-btn color="teal" dark @click="openNew"><v-icon left>mdi-clipboard-plus</v-icon>New Intake</v-btn></v-col>
    </v-row>

    <v-card outlined :loading="loading">
      <v-data-table :headers="headers" :items="forms" dense class="elevation-0">
        <template v-slot:item.status="{ item }"><v-chip x-small :color="item.status==='submitted'?'success':'orange'" dark>{{ item.status }}</v-chip></template>
        <template v-slot:item.form_type="{ item }"><v-chip x-small outlined>{{ item.form_type }}</v-chip></template>
        <template v-slot:item.created_at="{ item }">{{ new Date(item.created_at).toLocaleDateString() }}</template>
        <template v-slot:item.actions="{ item }"><v-btn icon small @click="view(item)"><v-icon small>mdi-eye</v-icon></v-btn></template>
      </v-data-table>
    </v-card>

    <!-- New Intake Dialog -->
    <v-dialog v-model="dialog" max-width="620">
      <v-card>
        <v-card-title>New Client Intake</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-select v-model="form.form_type" :items="['new_client','case_inquiry','appointment_request','document_submission']" label="Form Type" outlined dense class="mb-3"></v-select>
          <v-divider class="mb-3"></v-divider>
          <v-row dense>
            <v-col cols="6"><v-text-field v-model="form.data.full_name" label="Full Name *" outlined dense></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model="form.data.id_number" label="National ID / Passport" outlined dense></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model="form.data.phone" label="Phone" outlined dense></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model="form.data.email" label="Email" outlined dense type="email"></v-text-field></v-col>
            <v-col cols="12"><v-text-field v-model="form.data.address" label="Address" outlined dense></v-text-field></v-col>
            <v-col cols="6"><v-select v-model="form.data.matter_type" :items="['Civil','Corporate','Family','Criminal','Labor','Real Estate','Other']" label="Matter Type" outlined dense></v-select></v-col>
            <v-col cols="6"><v-select v-model="form.data.urgency" :items="['routine','urgent','emergency']" label="Urgency" outlined dense></v-select></v-col>
            <v-col cols="12"><v-textarea v-model="form.data.description" label="Brief Description" outlined rows="3" auto-grow></v-textarea></v-col>
            <v-col cols="12"><v-checkbox v-model="form.data.consent" label="Client consents to data processing per firm's privacy policy" dense></v-checkbox></v-col>
          </v-row>
          <v-alert v-if="err" type="error" dense>{{ err }}</v-alert>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="dialog=false">Cancel</v-btn><v-btn color="teal" dark :loading="saving" @click="submit">Submit</v-btn></v-card-actions>
      </v-card>
    </v-dialog>

    <!-- View Dialog -->
    <v-dialog v-model="viewDialog" max-width="520">
      <v-card v-if="selected">
        <v-card-title>Intake Form #{{ selected.id }}</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-3">
          <v-list dense>
            <v-list-item v-for="(val, key) in (selected.data || {})" :key="key">
              <v-list-item-content>
                <v-list-item-title class="text-capitalize">{{ key.replace(/_/g,' ') }}</v-list-item-title>
                <v-list-item-subtitle>{{ val }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="viewDialog=false">Close</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>
<script>
import { stGetIntakeForms, stSubmitIntakeForm } from '@/services/staffApi';
export default {
  name: 'IntakeForms',
  data() {
    return {
      forms: [], loading: true, dialog: false, viewDialog: false, saving: false, err: '', selected: null,
      form: { form_type: 'new_client', submitted_by: 1, data: { full_name: '', id_number: '', phone: '', email: '', address: '', matter_type: '', urgency: 'routine', description: '', consent: false } },
      snack: false, snackMsg: '', snackColor: 'success',
      headers: [
        { text: '#', value: 'id', width: 60 },
        { text: 'Client', value: 'client_name' },
        { text: 'Type', value: 'form_type' },
        { text: 'Status', value: 'status' },
        { text: 'Date', value: 'created_at' },
        { text: '', value: 'actions', sortable: false },
      ],
    };
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.forms = await stGetIntakeForms(); }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.loading = false; }
    },
    openNew() {
      this.form.data = { full_name: '', id_number: '', phone: '', email: '', address: '', matter_type: '', urgency: 'routine', description: '', consent: false };
      this.err = ''; this.dialog = true;
    },
    async submit() {
      if (!this.form.data.full_name) { this.err = 'Full name required.'; return; }
      this.saving = true;
      try { await stSubmitIntakeForm(this.form); this.notify('Intake form submitted.'); this.dialog = false; this.load(); }
      catch (e) { this.err = e.message; }
      finally { this.saving = false; }
    },
    view(f) { this.selected = { ...f, data: typeof f.data === 'string' ? JSON.parse(f.data) : (f.data || {}) }; this.viewDialog = true; },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
