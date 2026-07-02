<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Attendance Tracker</h1><p class="body-2 grey--text">Monthly attendance records for all staff</p></v-col>
      <v-col cols="auto">
        <v-select v-model="selectedMonth" :items="months" label="Month" outlined dense hide-details style="max-width:180px"></v-select>
      </v-col>
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
      <v-card-title class="subtitle-1">Attendance Records – {{ selectedMonth }}</v-card-title>
      <v-divider></v-divider>
      <v-data-table :headers="headers" :items="records" dense>
        <template v-slot:item.status="{ item }">
          <v-chip small :color="statusColor(item.status)" dark>{{ item.status }}</v-chip>
        </template>
        <template v-slot:item.rate="{ item }">
          <v-progress-linear :value="item.rate" height="10" rounded :color="item.rate >= 90 ? 'green' : item.rate >= 75 ? 'orange' : 'red'"></v-progress-linear>
          <span class="caption">{{ item.rate }}%</span>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn icon small color="primary" @click="view(item)"><v-icon small>mdi-calendar</v-icon></v-btn>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="560px">
      <v-card v-if="selected">
        <v-card-title>{{ selected.name }} – {{ selectedMonth }}</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-row>
            <v-col cols="3" v-for="(d, i) in selected.days" :key="i">
              <v-chip x-small :color="d === 'P' ? 'green' : d === 'A' ? 'red' : d === 'L' ? 'orange' : 'grey'" dark class="mb-1">
                Day {{ i + 1 }}: {{ d }}
              </v-chip>
            </v-col>
          </v-row>
          <div class="mt-3 caption">P = Present, A = Absent, L = Leave, H = Holiday</div>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="dialog=false">Close</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script>
export default {
  name: 'Attendance',
  data() {
    return {
      selectedMonth: 'May 2026', dialog: false, selected: null,
      months: ['January 2026', 'February 2026', 'March 2026', 'April 2026', 'May 2026'],
      records: [
        { name: 'Ahmed Cherni', role: 'Senior Lawyer', present: 20, absent: 0, leave: 2, total: 22, rate: 91, status: 'Good', days: Array(22).fill(0).map((_, i) => i >= 20 ? 'L' : 'P') },
        { name: 'Karim Slim', role: 'Associate Lawyer', present: 19, absent: 1, leave: 2, total: 22, rate: 86, status: 'Good', days: Array(22).fill(0).map((_, i) => i === 5 ? 'A' : i >= 20 ? 'L' : 'P') },
        { name: 'Leila Mansour', role: 'Paralegal', present: 22, absent: 0, leave: 0, total: 22, rate: 100, status: 'Excellent', days: Array(22).fill('P') },
        { name: 'Nadia Chaker', role: 'Accountant', present: 17, absent: 3, leave: 2, total: 22, rate: 77, status: 'Warning', days: Array(22).fill(0).map((_, i) => [2, 8, 12].includes(i) ? 'A' : [20, 21].includes(i) ? 'L' : 'P') },
        { name: 'Sami Ghorbel', role: 'Junior Lawyer', present: 21, absent: 1, leave: 0, total: 22, rate: 95, status: 'Excellent', days: Array(22).fill(0).map((_, i) => i === 10 ? 'A' : 'P') },
      ],
      headers: [
        { text: 'Name', value: 'name' }, { text: 'Role', value: 'role' }, { text: 'Present', value: 'present' },
        { text: 'Absent', value: 'absent' }, { text: 'Leave', value: 'leave' }, { text: 'Rate', value: 'rate' },
        { text: 'Status', value: 'status' }, { text: 'Detail', value: 'actions', sortable: false },
      ],
    };
  },
  computed: {
    stats() {
      const avgRate = Math.round(this.records.reduce((s, r) => s + r.rate, 0) / this.records.length);
      return [
        { label: 'Avg Attendance', value: avgRate + '%', color: 'blue', icon: 'mdi-percent' },
        { label: 'Excellent', value: this.records.filter(r => r.status === 'Excellent').length, color: 'green', icon: 'mdi-star' },
        { label: 'Warnings', value: this.records.filter(r => r.status === 'Warning').length, color: 'orange', icon: 'mdi-alert' },
        { label: 'Total Staff', value: this.records.length, color: 'purple', icon: 'mdi-account-group' },
      ];
    },
  },
  methods: {
    statusColor(s) { return { Excellent: 'green', Good: 'blue', Warning: 'orange', Poor: 'red' }[s] || 'grey'; },
    view(r) { this.selected = r; this.dialog = true; },
  },
};
</script>
