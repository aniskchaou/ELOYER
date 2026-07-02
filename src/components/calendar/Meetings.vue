<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Meetings</h1><p class="body-2 grey--text">Schedule and manage client meetings, team calls, and consultations</p></v-col>
      <v-col cols="auto"><v-btn color="primary" @click="openAdd"><v-icon left>mdi-plus</v-icon> Schedule Meeting</v-btn></v-col>
    </v-row>

    <v-tabs v-model="tab" class="mb-4">
      <v-tab>Upcoming</v-tab>
      <v-tab>Past</v-tab>
      <v-tab>All</v-tab>
    </v-tabs>

    <v-data-table :headers="headers" :items="tabMeetings" class="elevation-1">
      <template v-slot:item.type="{ item }">
        <v-chip small :color="typeColor(item.type)" dark>{{ item.type }}</v-chip>
      </template>
      <template v-slot:item.status="{ item }">
        <v-chip small :color="item.status === 'Confirmed' ? 'green' : item.status === 'Cancelled' ? 'red' : 'orange'" dark>{{ item.status }}</v-chip>
      </template>
      <template v-slot:item.location="{ item }">
        <v-icon small class="mr-1" :color="item.location === 'Virtual' ? 'blue' : 'grey'">{{ item.location === 'Virtual' ? 'mdi-video' : 'mdi-map-marker' }}</v-icon>
        {{ item.location }}
      </template>
      <template v-slot:item.actions="{ item }">
        <v-btn icon small color="primary" @click="view(item)"><v-icon small>mdi-eye</v-icon></v-btn>
        <v-btn icon small color="orange" @click="editM(item)"><v-icon small>mdi-pencil</v-icon></v-btn>
        <v-btn icon small color="red" @click="cancelM(item)" v-if="item.status !== 'Cancelled'"><v-icon small>mdi-cancel</v-icon></v-btn>
      </template>
    </v-data-table>

    <!-- Add/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-card-title>{{ editMode ? 'Edit Meeting' : 'Schedule Meeting' }}</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-text-field v-model="form.title" label="Meeting Title" outlined dense></v-text-field>
          <v-row class="mt-3">
            <v-col cols="6"><v-text-field v-model="form.date" label="Date" outlined dense type="date"></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model="form.time" label="Time" outlined dense type="time"></v-text-field></v-col>
          </v-row>
          <v-row class="mt-3">
            <v-col cols="6"><v-text-field v-model="form.duration" label="Duration (min)" outlined dense type="number"></v-text-field></v-col>
            <v-col cols="6"><v-select v-model="form.type" :items="meetingTypes" label="Type" outlined dense></v-select></v-col>
          </v-row>
          <v-select v-model="form.location" :items="['Office','Virtual','Client Site','Court']" label="Location" outlined dense class="mt-3"></v-select>
          <v-select v-model="form.participants" :items="allParticipants" label="Participants" multiple chips outlined dense class="mt-3"></v-select>
          <v-select v-model="form.case" :items="caseNames" label="Related Case (optional)" outlined dense clearable class="mt-3"></v-select>
          <v-textarea v-model="form.agenda" label="Agenda" outlined rows="2" class="mt-3"></v-textarea>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="dialog=false">Cancel</v-btn><v-btn color="primary" @click="save">Save</v-btn></v-card-actions>
      </v-card>
    </v-dialog>

    <!-- View Dialog -->
    <v-dialog v-model="viewDialog" max-width="520px">
      <v-card v-if="selected">
        <v-card-title>{{ selected.title }}<v-spacer></v-spacer><v-chip small :color="selected.status === 'Confirmed' ? 'green' : 'red'" dark>{{ selected.status }}</v-chip></v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-row>
            <v-col cols="6"><strong>Date:</strong> {{ selected.date }}</v-col>
            <v-col cols="6"><strong>Time:</strong> {{ selected.time }}</v-col>
            <v-col cols="6"><strong>Duration:</strong> {{ selected.duration }} min</v-col>
            <v-col cols="6"><strong>Location:</strong> {{ selected.location }}</v-col>
            <v-col cols="12"><strong>Participants:</strong> {{ (selected.participants || []).join(', ') }}</v-col>
            <v-col cols="12" v-if="selected.case"><strong>Case:</strong> {{ selected.case }}</v-col>
            <v-col cols="12" v-if="selected.agenda"><strong>Agenda:</strong> {{ selected.agenda }}</v-col>
          </v-row>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="viewDialog=false">Close</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script>
export default {
  name: 'Meetings',
  data() {
    return {
      tab: 0, dialog: false, viewDialog: false, editMode: false, selected: null,
      form: { id: null, title: '', date: '', time: '', duration: 60, type: 'Client Consultation', location: 'Office', participants: [], case: '', agenda: '', status: 'Confirmed' },
      meetingTypes: ['Client Consultation', 'Court Prep', 'Team Meeting', 'Negotiation', 'Mediation', 'Deposition'],
      allParticipants: ['Ahmed Cherni', 'Karim Slim', 'Ahmed Ben Ali', 'Société ABC SARL', 'Leila Mansour'],
      caseNames: ['Corporate Merger – ABC Ltd', 'Property Dispute – Ben Ali', 'Criminal Appeal – Smith'],
      meetings: [
        { id: 1, title: 'Initial Consultation – Ben Ali', date: '2026-05-10', time: '10:00', duration: 60, type: 'Client Consultation', location: 'Office', participants: ['Ahmed Cherni', 'Ahmed Ben Ali'], case: 'Property Dispute – Ben Ali', agenda: 'Review case documents and strategy.', status: 'Confirmed' },
        { id: 2, title: 'Pre-trial Preparation', date: '2026-05-08', time: '14:00', duration: 90, type: 'Court Prep', location: 'Office', participants: ['Ahmed Cherni', 'Karim Slim'], case: 'Criminal Appeal – Smith', agenda: 'Review evidence and witness list.', status: 'Confirmed' },
        { id: 3, title: 'Team Strategy Meeting', date: '2026-04-25', time: '09:00', duration: 45, type: 'Team Meeting', location: 'Virtual', participants: ['Ahmed Cherni', 'Karim Slim'], case: '', agenda: 'Q2 workload planning.', status: 'Confirmed' },
      ],
      headers: [
        { text: 'Title', value: 'title' },
        { text: 'Date', value: 'date' },
        { text: 'Time', value: 'time' },
        { text: 'Duration', value: 'duration' },
        { text: 'Type', value: 'type' },
        { text: 'Location', value: 'location' },
        { text: 'Status', value: 'status' },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
    };
  },
  computed: {
    today() { return new Date().toISOString().split('T')[0]; },
    tabMeetings() {
      if (this.tab === 0) return this.meetings.filter(m => m.date >= this.today && m.status !== 'Cancelled');
      if (this.tab === 1) return this.meetings.filter(m => m.date < this.today || m.status === 'Cancelled');
      return this.meetings;
    },
  },
  methods: {
    typeColor(t) { return { 'Client Consultation': 'blue', 'Court Prep': 'purple', 'Team Meeting': 'teal', Negotiation: 'orange', Mediation: 'green', Deposition: 'red' }[t] || 'grey'; },
    openAdd() { this.editMode = false; this.form = { id: null, title: '', date: '', time: '', duration: 60, type: 'Client Consultation', location: 'Office', participants: [], case: '', agenda: '', status: 'Confirmed' }; this.dialog = true; },
    editM(m) { this.editMode = true; this.form = { ...m }; this.dialog = true; },
    view(m) { this.selected = m; this.viewDialog = true; },
    cancelM(m) { m.status = 'Cancelled'; },
    save() {
      if (this.editMode) { const i = this.meetings.findIndex(m => m.id === this.form.id); if (i !== -1) this.meetings.splice(i, 1, { ...this.form }); }
      else this.meetings.push({ ...this.form, id: Date.now() });
      this.dialog = false;
    },
  },
};
</script>
