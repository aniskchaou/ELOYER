<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Employee Performance</h1><p class="body-2 grey--text">Staff KPIs, case loads, and performance ratings</p></v-col>
    </v-row>

    <v-data-table :headers="headers" :items="staff" class="elevation-1">
      <template v-slot:item.avatar="{ item }">
        <v-avatar color="blue darken-2" size="32">
          <span class="caption white--text">{{ item.name.split(' ').map(n => n[0]).join('') }}</span>
        </v-avatar>
      </template>
      <template v-slot:item.rating="{ item }">
        <v-rating :value="item.rating" readonly dense length="5" color="amber" background-color="grey lighten-1" size="16"></v-rating>
      </template>
      <template v-slot:item.caseLoad="{ item }">
        <v-progress-linear :value="(item.caseLoad / 15) * 100" height="10" rounded :color="item.caseLoad > 12 ? 'red' : item.caseLoad > 8 ? 'orange' : 'green'"></v-progress-linear>
        <span class="caption">{{ item.caseLoad }} cases</span>
      </template>
      <template v-slot:item.billableHours="{ item }">
        <span :class="item.billableHours >= 120 ? 'green--text' : item.billableHours >= 80 ? 'orange--text' : 'red--text'" class="font-weight-bold">{{ item.billableHours }}h</span>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-btn icon small color="primary" @click="view(item)"><v-icon small>mdi-eye</v-icon></v-btn>
      </template>
    </v-data-table>

    <v-dialog v-model="dialog" max-width="520px">
      <v-card v-if="selected">
        <v-card-title>{{ selected.name }}
          <v-spacer></v-spacer>
          <v-chip small color="blue" dark>{{ selected.role }}</v-chip>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-row>
            <v-col cols="6"><strong>Cases:</strong> {{ selected.caseLoad }}</v-col>
            <v-col cols="6"><strong>Billable Hours:</strong> {{ selected.billableHours }}h</v-col>
            <v-col cols="6"><strong>Tasks Done:</strong> {{ selected.tasksDone }}</v-col>
            <v-col cols="6"><strong>Avg Response:</strong> {{ selected.avgResponse }}h</v-col>
          </v-row>
          <div class="mt-3"><strong>Rating:</strong></div>
          <v-rating :value="selected.rating" readonly dense length="5" color="amber" background-color="grey lighten-1"></v-rating>
          <div class="mt-3"><strong>Manager Notes:</strong></div>
          <p class="caption mt-1">{{ selected.notes }}</p>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="dialog=false">Close</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script>
export default {
  name: 'EmployeePerformance',
  data() {
    return {
      dialog: false, selected: null,
      staff: [
        { name: 'Ahmed Cherni', role: 'Senior Lawyer', caseLoad: 9, billableHours: 142, tasksDone: 28, avgResponse: 2, rating: 5, notes: 'Consistently excellent performance. Top biller this quarter.' },
        { name: 'Karim Slim', role: 'Associate Lawyer', caseLoad: 7, billableHours: 118, tasksDone: 22, avgResponse: 3, rating: 4, notes: 'Strong in corporate law. Needs to improve client communication.' },
        { name: 'Leila Mansour', role: 'Paralegal', caseLoad: 5, billableHours: 88, tasksDone: 35, avgResponse: 1, rating: 4, notes: 'Excellent document management. Highly reliable on deadlines.' },
        { name: 'Nadia Chaker', role: 'Accountant', caseLoad: 0, billableHours: 65, tasksDone: 18, avgResponse: 4, rating: 3, notes: 'Tax filing late this quarter. Improving in billing accuracy.' },
        { name: 'Sami Ghorbel', role: 'Junior Lawyer', caseLoad: 4, billableHours: 74, tasksDone: 15, avgResponse: 5, rating: 3, notes: 'Still developing courtroom skills. Good research output.' },
      ],
      headers: [
        { text: '', value: 'avatar', sortable: false }, { text: 'Name', value: 'name' }, { text: 'Role', value: 'role' },
        { text: 'Case Load', value: 'caseLoad' }, { text: 'Billable Hours', value: 'billableHours' },
        { text: 'Tasks Done', value: 'tasksDone' }, { text: 'Rating', value: 'rating' }, { text: 'Actions', value: 'actions', sortable: false },
      ],
    };
  },
  methods: {
    view(s) { this.selected = s; this.dialog = true; },
  },
};
</script>
