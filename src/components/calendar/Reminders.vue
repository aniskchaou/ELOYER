<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Reminders</h1><p class="body-2 grey--text">Never miss a deadline — manage all legal reminders and alerts</p></v-col>
      <v-col cols="auto"><v-btn color="primary" @click="openAdd"><v-icon left>mdi-plus</v-icon> New Reminder</v-btn></v-col>
    </v-row>

    <v-row class="mb-4">
      <v-col v-for="s in stats" :key="s.label" cols="6" md="3">
        <v-card outlined class="pa-3 text-center">
          <v-icon :color="s.color">{{ s.icon }}</v-icon>
          <div class="overline mt-1">{{ s.label }}</div>
          <p class="text-h5 font-weight-bold" :class="s.color+'--text'">{{ s.value }}</p>
        </v-card>
      </v-col>
    </v-row>

    <v-card outlined>
      <v-card-title>All Reminders
        <v-spacer></v-spacer>
        <v-select v-model="filterType" :items="reminderTypes" label="Type" outlined dense clearable style="max-width:170px" class="mr-2"></v-select>
        <v-select v-model="filterStatus" :items="['Upcoming','Overdue','Done']" label="Status" outlined dense clearable style="max-width:160px"></v-select>
      </v-card-title>
      <v-divider></v-divider>
      <v-data-table :headers="headers" :items="filteredReminders">
        <template v-slot:item.type="{ item }">
          <v-chip small :color="typeColor(item.type)" dark>{{ item.type }}</v-chip>
        </template>
        <template v-slot:item.status="{ item }">
          <v-chip small :color="item.status === 'Done' ? 'green' : item.status === 'Overdue' ? 'red' : 'orange'" dark>{{ item.status }}</v-chip>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn icon small color="green" @click="markDone(item)" :disabled="item.status === 'Done'"><v-icon small>mdi-check</v-icon></v-btn>
          <v-btn icon small color="orange" @click="editReminder(item)"><v-icon small>mdi-pencil</v-icon></v-btn>
          <v-btn icon small color="red" @click="deleteReminder(item.id)"><v-icon small>mdi-delete</v-icon></v-btn>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="520px">
      <v-card>
        <v-card-title>{{ editMode ? 'Edit Reminder' : 'New Reminder' }}</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-text-field v-model="form.title" label="Reminder Title" outlined dense></v-text-field>
          <v-select v-model="form.type" :items="reminderTypes" label="Type" outlined dense class="mt-3"></v-select>
          <v-row class="mt-3">
            <v-col cols="6"><v-text-field v-model="form.dueDate" label="Due Date" outlined dense type="date"></v-text-field></v-col>
            <v-col cols="6"><v-text-field v-model="form.dueTime" label="Time" outlined dense type="time"></v-text-field></v-col>
          </v-row>
          <v-select v-model="form.assignedTo" :items="teamMembers" label="Assigned To" outlined dense class="mt-3"></v-select>
          <v-select v-model="form.case" :items="caseNames" label="Related Case (optional)" outlined dense clearable class="mt-3"></v-select>
          <v-select v-model="form.notifyBefore" :items="['15 min','30 min','1 hour','1 day','2 days']" label="Notify Before" outlined dense class="mt-3"></v-select>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="dialog=false">Cancel</v-btn><v-btn color="primary" @click="save">Save</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script>
export default {
  name: 'Reminders',
  data() {
    return {
      filterType: null, filterStatus: null, dialog: false, editMode: false,
      form: { id: null, title: '', type: 'Deadline', dueDate: '', dueTime: '', assignedTo: '', case: '', notifyBefore: '1 hour', status: 'Upcoming' },
      reminderTypes: ['Deadline', 'Hearing', 'Meeting', 'Payment', 'Renewal', 'Follow-up'],
      teamMembers: ['Ahmed Cherni', 'Karim Slim', 'Leila Mansour'],
      caseNames: ['Corporate Merger – ABC Ltd', 'Property Dispute – Ben Ali', 'Criminal Appeal – Smith'],
      reminders: [
        { id: 1, title: 'Submit appeal brief', type: 'Deadline', dueDate: '2026-05-10', dueTime: '17:00', assignedTo: 'Ahmed Cherni', case: 'Criminal Appeal – Smith', notifyBefore: '1 day', status: 'Upcoming' },
        { id: 2, title: 'Court hearing – Property case', type: 'Hearing', dueDate: '2026-05-05', dueTime: '09:30', assignedTo: 'Karim Slim', case: 'Property Dispute – Ben Ali', notifyBefore: '2 hours', status: 'Upcoming' },
        { id: 3, title: 'Client invoice payment due', type: 'Payment', dueDate: '2026-04-30', dueTime: '12:00', assignedTo: 'Ahmed Cherni', case: '', notifyBefore: '1 day', status: 'Overdue' },
        { id: 4, title: 'Contract renewal – ABC SARL', type: 'Renewal', dueDate: '2026-03-15', dueTime: '09:00', assignedTo: 'Ahmed Cherni', case: '', notifyBefore: '7 days', status: 'Done' },
      ],
      headers: [
        { text: 'Title', value: 'title' },
        { text: 'Type', value: 'type' },
        { text: 'Due Date', value: 'dueDate' },
        { text: 'Time', value: 'dueTime' },
        { text: 'Assigned To', value: 'assignedTo' },
        { text: 'Status', value: 'status' },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
    };
  },
  computed: {
    stats() {
      return [
        { label: 'Total', value: this.reminders.length, color: 'blue', icon: 'mdi-bell' },
        { label: 'Upcoming', value: this.reminders.filter(r => r.status === 'Upcoming').length, color: 'orange', icon: 'mdi-clock-outline' },
        { label: 'Overdue', value: this.reminders.filter(r => r.status === 'Overdue').length, color: 'red', icon: 'mdi-alert-circle' },
        { label: 'Done', value: this.reminders.filter(r => r.status === 'Done').length, color: 'green', icon: 'mdi-check-circle' },
      ];
    },
    filteredReminders() {
      let list = this.reminders;
      if (this.filterType) list = list.filter(r => r.type === this.filterType);
      if (this.filterStatus) list = list.filter(r => r.status === this.filterStatus);
      return list;
    },
  },
  methods: {
    typeColor(t) { return { Deadline: 'red', Hearing: 'blue', Meeting: 'teal', Payment: 'orange', Renewal: 'purple', 'Follow-up': 'green' }[t] || 'grey'; },
    openAdd() { this.editMode = false; this.form = { id: null, title: '', type: 'Deadline', dueDate: '', dueTime: '', assignedTo: '', case: '', notifyBefore: '1 hour', status: 'Upcoming' }; this.dialog = true; },
    editReminder(r) { this.editMode = true; this.form = { ...r }; this.dialog = true; },
    markDone(r) { r.status = 'Done'; },
    deleteReminder(id) { this.reminders = this.reminders.filter(r => r.id !== id); },
    save() {
      if (this.editMode) { const i = this.reminders.findIndex(r => r.id === this.form.id); if (i !== -1) this.reminders.splice(i, 1, { ...this.form }); }
      else this.reminders.push({ ...this.form, id: Date.now() });
      this.dialog = false;
    },
  },
};
</script>
