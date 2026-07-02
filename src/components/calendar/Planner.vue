<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Legal Planner</h1><p class="body-2 grey--text">Plan and organize all legal activities, tasks, and milestones</p></v-col>
      <v-col cols="auto">
        <v-btn color="primary" @click="openAdd"><v-icon left>mdi-plus</v-icon> Add Plan Item</v-btn>
      </v-col>
    </v-row>

    <!-- Week view header -->
    <v-card outlined class="mb-4 pa-3">
      <div class="d-flex align-center justify-space-between mb-3">
        <v-btn icon @click="prevWeek"><v-icon>mdi-chevron-left</v-icon></v-btn>
        <span class="subtitle-1 font-weight-bold">Week of {{ weekLabel }}</span>
        <v-btn icon @click="nextWeek"><v-icon>mdi-chevron-right</v-icon></v-btn>
        <v-btn text small color="primary" @click="goToday" class="ml-2">Today</v-btn>
      </div>
      <v-row>
        <v-col v-for="day in weekDays" :key="day.date" cols>
          <v-card outlined :color="day.isToday ? 'blue lighten-5' : ''" class="pa-2" style="min-height:100px">
            <div class="caption font-weight-bold mb-1" :class="day.isToday ? 'primary--text' : ''">{{ day.label }}</div>
            <div v-for="item in dayItems(day.date)" :key="item.id" class="mb-1">
              <v-chip x-small :color="typeColor(item.type)" dark style="width:100%" class="caption" truncate>{{ item.title }}</v-chip>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-card>

    <!-- All items list -->
    <v-card outlined>
      <v-card-title>Plan Items
        <v-spacer></v-spacer>
        <v-select v-model="filterType" :items="planTypes" label="Type" outlined dense clearable style="max-width:180px" class="mr-2"></v-select>
        <v-select v-model="filterAssignee" :items="team" label="Assignee" outlined dense clearable style="max-width:180px"></v-select>
      </v-card-title>
      <v-divider></v-divider>
      <v-data-table :headers="headers" :items="filteredItems">
        <template v-slot:item.type="{ item }">
          <v-chip small :color="typeColor(item.type)" dark>{{ item.type }}</v-chip>
        </template>
        <template v-slot:item.priority="{ item }">
          <v-chip small :color="item.priority === 'High' ? 'red' : item.priority === 'Medium' ? 'orange' : 'green'" outlined>{{ item.priority }}</v-chip>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn icon small color="orange" @click="editItem(item)"><v-icon small>mdi-pencil</v-icon></v-btn>
          <v-btn icon small color="red" @click="deleteItem(item.id)"><v-icon small>mdi-delete</v-icon></v-btn>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="560px">
      <v-card>
        <v-card-title>{{ editMode ? 'Edit Plan Item' : 'New Plan Item' }}</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-text-field v-model="form.title" label="Title" outlined dense></v-text-field>
          <v-row class="mt-3">
            <v-col cols="6"><v-select v-model="form.type" :items="planTypes" label="Type" outlined dense></v-select></v-col>
            <v-col cols="6"><v-select v-model="form.priority" :items="['High','Medium','Low']" label="Priority" outlined dense></v-select></v-col>
          </v-row>
          <v-row class="mt-3">
            <v-col cols="6"><v-text-field v-model="form.date" label="Date" outlined dense type="date"></v-text-field></v-col>
            <v-col cols="6"><v-select v-model="form.assignee" :items="team" label="Assignee" outlined dense></v-select></v-col>
          </v-row>
          <v-select v-model="form.case" :items="caseNames" label="Related Case" outlined dense clearable class="mt-3"></v-select>
          <v-textarea v-model="form.notes" label="Notes" outlined rows="2" class="mt-3"></v-textarea>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="dialog=false">Cancel</v-btn><v-btn color="primary" @click="save">Save</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script>
export default {
  name: 'Planner',
  data() {
    return {
      filterType: null, filterAssignee: null, dialog: false, editMode: false,
      weekOffset: 0,
      form: { id: null, title: '', type: 'Task', priority: 'Medium', date: '', assignee: '', case: '', notes: '' },
      planTypes: ['Task', 'Hearing', 'Deadline', 'Meeting', 'Research', 'Filing'],
      team: ['Ahmed Cherni', 'Karim Slim', 'Leila Mansour'],
      caseNames: ['Corporate Merger – ABC Ltd', 'Property Dispute – Ben Ali', 'Criminal Appeal – Smith'],
      items: [
        { id: 1, title: 'File appeal documents', type: 'Filing', priority: 'High', date: '2026-05-10', assignee: 'Ahmed Cherni', case: 'Criminal Appeal – Smith', notes: '' },
        { id: 2, title: 'Court hearing', type: 'Hearing', priority: 'High', date: '2026-05-05', assignee: 'Karim Slim', case: 'Property Dispute – Ben Ali', notes: 'Room 3A, 9:30am' },
        { id: 3, title: 'Review merger contracts', type: 'Research', priority: 'Medium', date: '2026-05-07', assignee: 'Ahmed Cherni', case: 'Corporate Merger – ABC Ltd', notes: '' },
        { id: 4, title: 'Client follow-up call', type: 'Task', priority: 'Low', date: '2026-05-09', assignee: 'Leila Mansour', case: '', notes: '' },
      ],
      headers: [
        { text: 'Title', value: 'title' }, { text: 'Type', value: 'type' }, { text: 'Priority', value: 'priority' },
        { text: 'Date', value: 'date' }, { text: 'Assignee', value: 'assignee' }, { text: 'Actions', value: 'actions', sortable: false },
      ],
    };
  },
  computed: {
    weekStart() {
      const d = new Date(); d.setDate(d.getDate() - d.getDay() + 1 + this.weekOffset * 7); d.setHours(0,0,0,0); return d;
    },
    weekDays() {
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(this.weekStart); d.setDate(d.getDate() + i);
        const iso = d.toISOString().split('T')[0];
        const today = new Date().toISOString().split('T')[0];
        return { date: iso, label: d.toLocaleDateString('en', { weekday: 'short', day: 'numeric' }), isToday: iso === today };
      });
    },
    weekLabel() { const s = this.weekDays[0]; const e = this.weekDays[6]; return s.label + ' – ' + e.label; },
    filteredItems() {
      let list = this.items;
      if (this.filterType) list = list.filter(i => i.type === this.filterType);
      if (this.filterAssignee) list = list.filter(i => i.assignee === this.filterAssignee);
      return list;
    },
  },
  methods: {
    dayItems(date) { return this.items.filter(i => i.date === date); },
    typeColor(t) { return { Task: 'blue', Hearing: 'purple', Deadline: 'red', Meeting: 'teal', Research: 'orange', Filing: 'green' }[t] || 'grey'; },
    prevWeek() { this.weekOffset--; },
    nextWeek() { this.weekOffset++; },
    goToday() { this.weekOffset = 0; },
    openAdd() { this.editMode = false; this.form = { id: null, title: '', type: 'Task', priority: 'Medium', date: '', assignee: '', case: '', notes: '' }; this.dialog = true; },
    editItem(item) { this.editMode = true; this.form = { ...item }; this.dialog = true; },
    deleteItem(id) { this.items = this.items.filter(i => i.id !== id); },
    save() {
      if (this.editMode) { const i = this.items.findIndex(x => x.id === this.form.id); if (i !== -1) this.items.splice(i, 1, { ...this.form }); }
      else this.items.push({ ...this.form, id: Date.now() });
      this.dialog = false;
    },
  },
};
</script>
