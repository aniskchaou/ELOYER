<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Deadline Tracker</h1><p class="body-2 grey--text">Track all critical legal deadlines with reminders</p></v-col>
      <v-col cols="auto"><v-btn color="blue darken-2" dark @click="open()"><v-icon left>mdi-plus</v-icon>Add Deadline</v-btn></v-col>
    </v-row>

    <!-- Overdue Alert -->
    <v-alert v-if="overdue.length" type="error" outlined dense class="mb-4">
      <strong>{{ overdue.length }} overdue deadline{{ overdue.length > 1 ? 's' : '' }}</strong> — immediate attention required.
    </v-alert>

    <v-row class="mb-4">
      <v-col cols="6" md="3" v-for="s in stats" :key="s.label">
        <v-card outlined class="pa-3 text-center">
          <v-icon :color="s.color">{{ s.icon }}</v-icon>
          <div class="overline mt-1">{{ s.label }}</div>
          <div class="text-h4 font-weight-bold" :class="s.color+'--text'">{{ s.value }}</div>
        </v-card>
      </v-col>
    </v-row>

    <v-card outlined>
      <v-card-title>
        <v-chip-group v-model="filter" mandatory active-class="blue darken-2 white--text">
          <v-chip value="">All</v-chip><v-chip value="upcoming">Upcoming</v-chip><v-chip value="overdue">Overdue</v-chip><v-chip value="completed">Completed</v-chip>
        </v-chip-group>
      </v-card-title>
      <v-data-table :headers="headers" :items="filtered" :loading="loading" class="elevation-0" sort-by="deadline_date">
        <template v-slot:item.priority="{ item }"><v-chip x-small :color="priorityColor(item.priority)" dark>{{ item.priority }}</v-chip></template>
        <template v-slot:item.status="{ item }"><v-chip x-small :color="statusColor(item.status)" dark>{{ item.status }}</v-chip></template>
        <template v-slot:item.deadline_date="{ item }">
          <span :class="isPast(item) && item.status !== 'completed' ? 'red--text font-weight-bold' : ''">
            {{ new Date(item.deadline_date).toLocaleDateString() }}
          </span>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn icon small @click="open(item)"><v-icon small>mdi-pencil</v-icon></v-btn>
          <v-btn icon small color="success" @click="complete(item)" v-if="item.status !== 'completed'"><v-icon small>mdi-check</v-icon></v-btn>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="520">
      <v-card>
        <v-card-title>{{ editing ? 'Edit Deadline' : 'New Deadline' }}</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-text-field v-model="form.title" label="Title *" outlined dense class="mb-2"></v-text-field>
          <v-text-field v-model="form.deadline_date" label="Deadline Date *" outlined dense type="date" class="mb-2"></v-text-field>
          <v-row dense>
            <v-col cols="6"><v-select v-model="form.priority" :items="['low','normal','high','critical']" label="Priority" outlined dense></v-select></v-col>
            <v-col cols="6"><v-text-field v-model.number="form.reminder_days" label="Remind X days before" outlined dense type="number"></v-text-field></v-col>
          </v-row>
          <v-textarea v-model="form.notes" label="Notes" outlined rows="2" auto-grow></v-textarea>
          <v-alert v-if="err" type="error" dense>{{ err }}</v-alert>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="dialog=false">Cancel</v-btn><v-btn color="blue darken-2" dark :loading="saving" @click="save">{{ editing ? 'Update' : 'Add' }}</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>
<script>
import { faGetDeadlines, faCreateDeadline, faUpdateDeadline } from '@/services/firmadminApi';
export default {
  name: 'DeadlineTracker',
  data() {
    return {
      deadlines: [], loading: true, dialog: false, editing: null, saving: false, err: '', filter: '',
      form: { lawyer_id: 1, title: '', deadline_date: '', priority: 'normal', reminder_days: 3, notes: '' },
      snack: false, snackMsg: '', snackColor: 'success',
      headers: [
        { text: 'Title', value: 'title' },
        { text: 'Case', value: 'case_title' },
        { text: 'Deadline', value: 'deadline_date' },
        { text: 'Priority', value: 'priority' },
        { text: 'Status', value: 'status' },
        { text: '', value: 'actions', sortable: false, align: 'end' },
      ],
    };
  },
  computed: {
    overdue() { return this.deadlines.filter(d => this.isPast(d) && d.status !== 'completed'); },
    filtered() {
      if (!this.filter) return this.deadlines;
      if (this.filter === 'overdue') return this.deadlines.filter(d => this.isPast(d) && d.status !== 'completed');
      return this.deadlines.filter(d => d.status === this.filter);
    },
    stats() {
      return [
        { label: 'Total', value: this.deadlines.length, icon: 'mdi-calendar', color: 'blue' },
        { label: 'Upcoming', value: this.deadlines.filter(d => d.status === 'upcoming').length, icon: 'mdi-clock', color: 'orange' },
        { label: 'Overdue', value: this.overdue.length, icon: 'mdi-alert', color: 'red' },
        { label: 'Completed', value: this.deadlines.filter(d => d.status === 'completed').length, icon: 'mdi-check-circle', color: 'green' },
      ];
    },
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.deadlines = await faGetDeadlines(1); }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.loading = false; }
    },
    open(d = null) {
      this.editing = d;
      this.form = d ? { lawyer_id: d.lawyer_id, title: d.title, deadline_date: d.deadline_date ? d.deadline_date.slice(0, 10) : '', priority: d.priority, reminder_days: d.reminder_days, notes: d.notes } : { lawyer_id: 1, title: '', deadline_date: '', priority: 'normal', reminder_days: 3, notes: '' };
      this.err = ''; this.dialog = true;
    },
    async save() {
      if (!this.form.title || !this.form.deadline_date) { this.err = 'Title and date required.'; return; }
      this.saving = true;
      try {
        if (this.editing) await faUpdateDeadline(this.editing.id, this.form);
        else await faCreateDeadline(this.form);
        this.notify(this.editing ? 'Updated.' : 'Deadline added.');
        this.dialog = false; this.load();
      } catch (e) { this.err = e.message; }
      finally { this.saving = false; }
    },
    async complete(d) {
      try { await faUpdateDeadline(d.id, { status: 'completed', completed_at: new Date().toISOString() }); this.notify('Marked completed.', 'success'); this.load(); }
      catch (e) { this.notify(e.message, 'error'); }
    },
    isPast(d) { return new Date(d.deadline_date) < new Date(); },
    priorityColor(p) { return p === 'critical' ? 'error' : p === 'high' ? 'orange' : p === 'normal' ? 'blue' : 'grey'; },
    statusColor(s) { return s === 'completed' ? 'success' : s === 'overdue' ? 'error' : 'orange'; },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
