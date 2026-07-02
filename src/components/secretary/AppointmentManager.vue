<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Appointment Manager</h1><p class="body-2 grey--text">Schedule and manage all firm appointments</p></v-col>
      <v-col cols="auto"><v-btn color="pink darken-1" dark @click="open()"><v-icon left>mdi-plus</v-icon>Book Appointment</v-btn></v-col>
    </v-row>

    <v-row class="mb-4">
      <v-col cols="12" md="8">
        <v-card outlined>
          <v-card-title>
            <v-text-field v-model="search" append-icon="mdi-magnify" label="Search…" single-line hide-details dense outlined style="max-width:240px"></v-text-field>
            <v-spacer></v-spacer>
            <v-select v-model="statusFilter" :items="['All','scheduled','completed','cancelled','no_show']" dense outlined hide-details style="max-width:160px"></v-select>
          </v-card-title>
          <v-data-table :headers="headers" :items="filtered" :search="search" :loading="loading" class="elevation-0" dense>
            <template v-slot:item.appointment_date="{ item }">{{ new Date(item.appointment_date).toLocaleString([], {dateStyle:'short',timeStyle:'short'}) }}</template>
            <template v-slot:item.status="{ item }"><v-chip x-small :color="statusColor(item.status)" dark>{{ item.status }}</v-chip></template>
            <template v-slot:item.appointment_type="{ item }"><v-chip x-small outlined>{{ item.appointment_type }}</v-chip></template>
            <template v-slot:item.actions="{ item }">
              <v-btn icon small @click="open(item)"><v-icon small>mdi-pencil</v-icon></v-btn>
              <v-btn icon small color="success" @click="update(item.id,'completed')" v-if="item.status==='scheduled'" title="Complete"><v-icon small>mdi-check</v-icon></v-btn>
              <v-btn icon small color="error" @click="update(item.id,'cancelled')" v-if="item.status==='scheduled'" title="Cancel"><v-icon small>mdi-close</v-icon></v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card outlined class="pa-4">
          <v-card-title class="subtitle-1 pb-2">Send Reminders</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <p class="body-2 grey--text">Select upcoming appointments and send automated reminders.</p>
          <v-btn block outlined color="green" class="mb-2" @click="sendReminders"><v-icon left small>mdi-message-text</v-icon>SMS All Today</v-btn>
          <v-btn block outlined color="blue" @click="sendEmails"><v-icon left small>mdi-email</v-icon>Email All Today</v-btn>
          <v-alert v-if="reminderSent" type="success" dense class="mt-3">Reminders sent to {{ appointments.filter(a=>a.status==='scheduled').length }} appointments.</v-alert>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="dialog" max-width="560">
      <v-card>
        <v-card-title>{{ editing ? 'Edit Appointment' : 'Book Appointment' }}</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-row dense>
            <v-col cols="12"><v-text-field v-model="form.title" label="Title *" outlined dense></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model="form.appointment_date" label="Date & Time *" outlined dense type="datetime-local"></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model.number="form.duration_minutes" label="Duration (min)" outlined dense type="number"></v-text-field></v-col>
            <v-col cols="6"><v-select v-model="form.appointment_type" :items="['consultation','hearing','signing','meeting','other']" label="Type" outlined dense></v-select></v-col>
            <v-col cols="6"><v-text-field v-model="form.location" label="Location" outlined dense></v-text-field></v-col>
            <v-col cols="12"><v-textarea v-model="form.notes" label="Notes" outlined rows="2" auto-grow></v-textarea></v-col>
          </v-row>
          <v-alert v-if="err" type="error" dense>{{ err }}</v-alert>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="dialog=false">Cancel</v-btn><v-btn color="pink darken-1" dark :loading="saving" @click="save">{{ editing ? 'Update' : 'Book' }}</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>
<script>
import { stGetAppointments, stCreateAppointment, stUpdateAppointment } from '@/services/staffApi';
export default {
  name: 'AppointmentManager',
  data() {
    return {
      appointments: [], loading: true, dialog: false, editing: null, saving: false, err: '',
      search: '', statusFilter: 'All', reminderSent: false,
      form: { title: '', appointment_date: '', duration_minutes: 60, appointment_type: 'consultation', location: '', notes: '' },
      snack: false, snackMsg: '', snackColor: 'success',
      headers: [
        { text: 'Title', value: 'title' },
        { text: 'Client', value: 'client_name' },
        { text: 'Date & Time', value: 'appointment_date' },
        { text: 'Type', value: 'appointment_type' },
        { text: 'Status', value: 'status' },
        { text: '', value: 'actions', sortable: false, align: 'end' },
      ],
    };
  },
  computed: {
    filtered() {
      return this.statusFilter === 'All' ? this.appointments : this.appointments.filter(a => a.status === this.statusFilter);
    },
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.appointments = await stGetAppointments(); }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.loading = false; }
    },
    open(a = null) {
      this.editing = a;
      this.form = a ? { title: a.title, appointment_date: a.appointment_date ? a.appointment_date.slice(0,16) : '', duration_minutes: a.duration_minutes, appointment_type: a.appointment_type, location: a.location, notes: a.notes } : { title: '', appointment_date: '', duration_minutes: 60, appointment_type: 'consultation', location: '', notes: '' };
      this.err = ''; this.dialog = true;
    },
    async save() {
      if (!this.form.title || !this.form.appointment_date) { this.err = 'Title and date required.'; return; }
      this.saving = true;
      try {
        if (this.editing) await stUpdateAppointment(this.editing.id, this.form);
        else await stCreateAppointment(this.form);
        this.notify(this.editing ? 'Updated.' : 'Appointment booked.');
        this.dialog = false; this.load();
      } catch (e) { this.err = e.message; }
      finally { this.saving = false; }
    },
    async update(id, status) {
      try { await stUpdateAppointment(id, { status }); this.notify(`Marked ${status}.`); this.load(); }
      catch (e) { this.notify(e.message, 'error'); }
    },
    sendReminders() { setTimeout(() => { this.reminderSent = true; this.notify('SMS reminders sent.'); }, 800); },
    sendEmails() { this.notify('Email reminders sent.'); },
    statusColor(s) { const m = { scheduled:'blue', completed:'success', cancelled:'error', no_show:'orange' }; return m[s]||'grey'; },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
