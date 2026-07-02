<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Court Hearings</h1><p class="body-2 grey--text">Schedule and track all court hearing dates and proceedings</p></v-col>
      <v-col cols="auto"><v-btn color="primary" @click="openAdd"><v-icon left>mdi-plus</v-icon> Add Hearing</v-btn></v-col>
    </v-row>

    <v-card outlined class="mb-4 pa-3">
      <v-row>
        <v-col cols="12" md="3"><v-select v-model="filterStatus" :items="statuses" label="Status" outlined dense clearable></v-select></v-col>
        <v-col cols="12" md="3"><v-select v-model="filterCourt" :items="courtNames" label="Court" outlined dense clearable></v-select></v-col>
        <v-col cols="12" md="4"><v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="Search" outlined dense></v-text-field></v-col>
      </v-row>
    </v-card>

    <v-data-table :headers="headers" :items="filteredHearings" class="elevation-1">
      <template v-slot:item.status="{ item }">
        <v-chip small :color="statusColor(item.status)" dark>{{ item.status }}</v-chip>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-btn icon small color="primary" @click="view(item)"><v-icon small>mdi-eye</v-icon></v-btn>
        <v-btn icon small color="orange" @click="editH(item)"><v-icon small>mdi-pencil</v-icon></v-btn>
        <v-btn icon small color="red" @click="deleteH(item.id)"><v-icon small>mdi-delete</v-icon></v-btn>
      </template>
    </v-data-table>

    <v-dialog v-model="dialog" max-width="580px">
      <v-card>
        <v-card-title>{{ editMode ? 'Edit Hearing' : 'New Hearing' }}</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-select v-model="form.case" :items="caseNames" label="Case" outlined dense></v-select>
          <v-row class="mt-3">
            <v-col cols="6"><v-text-field v-model="form.date" label="Date" outlined dense type="date"></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model="form.time" label="Time" outlined dense type="time"></v-text-field></v-col>
          </v-row>
          <v-select v-model="form.court" :items="courtNames" label="Court" outlined dense class="mt-3"></v-select>
          <v-text-field v-model="form.room" label="Courtroom / Room" outlined dense class="mt-3"></v-text-field>
          <v-select v-model="form.judge" :items="judges" label="Presiding Judge" outlined dense class="mt-3"></v-select>
          <v-select v-model="form.type" :items="hearingTypes" label="Hearing Type" outlined dense class="mt-3"></v-select>
          <v-select v-model="form.status" :items="statuses" label="Status" outlined dense class="mt-3"></v-select>
          <v-textarea v-model="form.notes" label="Notes" outlined rows="2" class="mt-3"></v-textarea>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="dialog=false">Cancel</v-btn><v-btn color="primary" @click="save">Save</v-btn></v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="viewDialog" max-width="520px">
      <v-card v-if="selected">
        <v-card-title>{{ selected.case }}<v-spacer></v-spacer><v-chip small :color="statusColor(selected.status)" dark>{{ selected.status }}</v-chip></v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-row>
            <v-col cols="6"><strong>Date:</strong> {{ selected.date }}</v-col>
            <v-col cols="6"><strong>Time:</strong> {{ selected.time }}</v-col>
            <v-col cols="6"><strong>Court:</strong> {{ selected.court }}</v-col>
            <v-col cols="6"><strong>Room:</strong> {{ selected.room }}</v-col>
            <v-col cols="6"><strong>Judge:</strong> {{ selected.judge }}</v-col>
            <v-col cols="6"><strong>Type:</strong> {{ selected.type }}</v-col>
            <v-col cols="12" v-if="selected.notes"><strong>Notes:</strong> {{ selected.notes }}</v-col>
          </v-row>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="viewDialog=false">Close</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script>
export default {
  name: 'CourtHearings',
  data() {
    return {
      search: '', filterStatus: null, filterCourt: null, dialog: false, viewDialog: false, editMode: false, selected: null,
      form: { id: null, case: '', date: '', time: '', court: '', room: '', judge: '', type: '', status: 'Scheduled', notes: '' },
      statuses: ['Scheduled', 'Completed', 'Postponed', 'Cancelled'],
      courtNames: ['Commercial Court – Tunis', 'Civil Court – Sousse', 'Administrative Court', 'Criminal Court – Tunis'],
      judges: ['Hon. Samir Belhaj', 'Hon. Fatma Trabelsi', 'Hon. Mounir Ayari'],
      hearingTypes: ['Initial Hearing', 'Evidence Session', 'Pleadings', 'Verdict', 'Sentencing', 'Appeal'],
      caseNames: ['Corporate Merger – ABC Ltd', 'Property Dispute – Ben Ali', 'Criminal Appeal – Smith'],
      hearings: [
        { id: 1, case: 'Property Dispute – Ben Ali', date: '2026-05-05', time: '09:30', court: 'Civil Court – Sousse', room: '3A', judge: 'Hon. Fatma Trabelsi', type: 'Evidence Session', status: 'Scheduled', notes: 'Bring property survey documents.' },
        { id: 2, case: 'Criminal Appeal – Smith', date: '2026-05-12', time: '11:00', court: 'Criminal Court – Tunis', room: '1B', judge: 'Hon. Samir Belhaj', type: 'Appeal', status: 'Scheduled', notes: '' },
        { id: 3, case: 'Corporate Merger – ABC Ltd', date: '2026-04-20', time: '14:00', court: 'Commercial Court – Tunis', room: '5C', judge: 'Hon. Mounir Ayari', type: 'Pleadings', status: 'Completed', notes: 'Favorable ruling expected.' },
      ],
      headers: [
        { text: 'Case', value: 'case' }, { text: 'Date', value: 'date' }, { text: 'Time', value: 'time' },
        { text: 'Court', value: 'court' }, { text: 'Judge', value: 'judge' }, { text: 'Type', value: 'type' },
        { text: 'Status', value: 'status' }, { text: 'Actions', value: 'actions', sortable: false },
      ],
    };
  },
  computed: {
    filteredHearings() {
      let list = this.hearings;
      if (this.filterStatus) list = list.filter(h => h.status === this.filterStatus);
      if (this.filterCourt) list = list.filter(h => h.court === this.filterCourt);
      return list;
    },
  },
  methods: {
    statusColor(s) { return { Scheduled: 'blue', Completed: 'green', Postponed: 'orange', Cancelled: 'red' }[s] || 'grey'; },
    openAdd() { this.editMode = false; this.form = { id: null, case: '', date: '', time: '', court: '', room: '', judge: '', type: '', status: 'Scheduled', notes: '' }; this.dialog = true; },
    editH(h) { this.editMode = true; this.form = { ...h }; this.dialog = true; },
    view(h) { this.selected = h; this.viewDialog = true; },
    deleteH(id) { this.hearings = this.hearings.filter(h => h.id !== id); },
    save() {
      if (this.editMode) { const i = this.hearings.findIndex(h => h.id === this.form.id); if (i !== -1) this.hearings.splice(i, 1, { ...this.form }); }
      else this.hearings.push({ ...this.form, id: Date.now() });
      this.dialog = false;
    },
  },
};
</script>
