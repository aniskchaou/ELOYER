<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Performance Reviews</h1><p class="body-2 grey--text">Manage employee review cycles and evaluations</p></v-col>
      <v-col cols="auto"><v-btn color="primary" @click="openAdd"><v-icon left>mdi-plus</v-icon> New Review</v-btn></v-col>
    </v-row>

    <v-row class="mb-3">
      <v-col cols="6" md="3"><v-select v-model="filterCycle" :items="cycles" label="Cycle" outlined dense clearable hide-details></v-select></v-col>
      <v-col cols="6" md="3"><v-select v-model="filterStatus" :items="statuses" label="Status" outlined dense clearable hide-details></v-select></v-col>
    </v-row>

    <v-data-table :headers="headers" :items="filteredReviews" class="elevation-1">
      <template v-slot:item.score="{ item }">
        <v-rating :value="item.score" readonly dense length="5" color="amber" background-color="grey lighten-1" size="16"></v-rating>
      </template>
      <template v-slot:item.status="{ item }">
        <v-chip small :color="item.status === 'Completed' ? 'green' : item.status === 'In Progress' ? 'orange' : 'blue'" dark>{{ item.status }}</v-chip>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-btn icon small color="primary" @click="view(item)"><v-icon small>mdi-eye</v-icon></v-btn>
        <v-btn icon small color="orange" @click="edit(item)"><v-icon small>mdi-pencil</v-icon></v-btn>
      </template>
    </v-data-table>

    <v-dialog v-model="dialog" max-width="620px">
      <v-card>
        <v-card-title>{{ editMode ? 'Edit Review' : 'New Review' }}</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-row>
            <v-col cols="6"><v-select v-model="form.employee" :items="employees" label="Employee" outlined dense></v-select></v-col>
            <v-col cols="6"><v-select v-model="form.cycle" :items="cycles" label="Review Cycle" outlined dense></v-select></v-col>
          </v-row>
          <v-select v-model="form.reviewer" :items="reviewers" label="Reviewer" outlined dense class="mt-3"></v-select>
          <div class="mt-3 caption">Overall Score</div>
          <v-rating v-model="form.score" length="5" color="amber" background-color="grey lighten-1"></v-rating>
          <v-textarea v-model="form.strengths" label="Strengths" outlined rows="2" class="mt-3"></v-textarea>
          <v-textarea v-model="form.improvements" label="Areas for improvement" outlined rows="2" class="mt-3"></v-textarea>
          <v-select v-model="form.status" :items="statuses" label="Status" outlined dense class="mt-3"></v-select>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="dialog=false">Cancel</v-btn><v-btn color="primary" @click="save">Save</v-btn></v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="viewDialog" max-width="560px">
      <v-card v-if="selected">
        <v-card-title>{{ selected.employee }} – {{ selected.cycle }}
          <v-spacer></v-spacer>
          <v-chip small :color="selected.status === 'Completed' ? 'green' : selected.status === 'In Progress' ? 'orange' : 'blue'" dark>{{ selected.status }}</v-chip>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <p><strong>Reviewer:</strong> {{ selected.reviewer }}</p>
          <div><strong>Score:</strong></div>
          <v-rating :value="selected.score" readonly dense length="5" color="amber" background-color="grey lighten-1"></v-rating>
          <p class="mt-2"><strong>Strengths:</strong><br>{{ selected.strengths }}</p>
          <p class="mt-2"><strong>Improvements:</strong><br>{{ selected.improvements }}</p>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="viewDialog=false">Close</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script>
export default {
  name: 'PerformanceReviews',
  data() {
    return {
      dialog: false, viewDialog: false, editMode: false, selected: null, filterCycle: null, filterStatus: null,
      form: { id: null, employee: '', cycle: '', reviewer: '', score: 3, strengths: '', improvements: '', status: 'Scheduled' },
      employees: ['Ahmed Cherni', 'Karim Slim', 'Leila Mansour', 'Nadia Chaker', 'Sami Ghorbel'],
      reviewers: ['Managing Partner', 'HR Manager', 'Senior Lawyer'],
      cycles: ['Q1 2026', 'Q2 2026', 'Q3 2026', 'Annual 2025'],
      statuses: ['Scheduled', 'In Progress', 'Completed'],
      reviews: [
        { id: 1, employee: 'Ahmed Cherni', cycle: 'Q1 2026', reviewer: 'Managing Partner', score: 5, strengths: 'Strong courtroom strategy and client trust.', improvements: 'Delegate more to junior team members.', status: 'Completed' },
        { id: 2, employee: 'Karim Slim', cycle: 'Q1 2026', reviewer: 'Senior Lawyer', score: 4, strengths: 'Excellent legal drafting and attention to detail.', improvements: 'Improve hearing preparation speed.', status: 'Completed' },
        { id: 3, employee: 'Leila Mansour', cycle: 'Q2 2026', reviewer: 'HR Manager', score: 4, strengths: 'Reliable and organized documentation.', improvements: 'Develop client communication skills.', status: 'In Progress' },
        { id: 4, employee: 'Sami Ghorbel', cycle: 'Q2 2026', reviewer: 'Managing Partner', score: 3, strengths: 'Good legal research depth.', improvements: 'Needs confidence in court submissions.', status: 'Scheduled' },
      ],
      headers: [
        { text: 'Employee', value: 'employee' }, { text: 'Cycle', value: 'cycle' }, { text: 'Reviewer', value: 'reviewer' },
        { text: 'Score', value: 'score' }, { text: 'Status', value: 'status' }, { text: 'Actions', value: 'actions', sortable: false },
      ],
    };
  },
  computed: {
    filteredReviews() {
      return this.reviews.filter(r => (!this.filterCycle || r.cycle === this.filterCycle) && (!this.filterStatus || r.status === this.filterStatus));
    },
  },
  methods: {
    openAdd() { this.editMode = false; this.form = { id: null, employee: '', cycle: '', reviewer: '', score: 3, strengths: '', improvements: '', status: 'Scheduled' }; this.dialog = true; },
    view(r) { this.selected = r; this.viewDialog = true; },
    edit(r) { this.editMode = true; this.form = { ...r }; this.dialog = true; },
    save() {
      if (this.editMode) { const i = this.reviews.findIndex(r => r.id === this.form.id); if (i !== -1) this.reviews.splice(i, 1, { ...this.form }); }
      else this.reviews.push({ ...this.form, id: Date.now() });
      this.dialog = false;
    },
  },
};
</script>
