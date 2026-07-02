<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Workload Distribution</h1><p class="body-2 grey--text">Monitor and balance case loads across team members</p></v-col>
    </v-row>

    <v-row class="mb-4">
      <v-col v-for="s in summary" :key="s.label" cols="6" md="3">
        <v-card outlined class="pa-3 text-center">
          <v-icon :color="s.color">{{ s.icon }}</v-icon>
          <div class="overline mt-1">{{ s.label }}</div>
          <p class="text-h5 font-weight-bold" :class="s.color+'--text'">{{ s.value }}</p>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col v-for="m in team" :key="m.id" cols="12" md="6">
        <v-card outlined class="pa-4">
          <div class="d-flex align-center mb-3">
            <v-avatar :color="m.color" size="40" class="mr-3">
              <span class="white--text caption font-weight-bold">{{ m.name.split(' ').map(n => n[0]).join('') }}</span>
            </v-avatar>
            <div>
              <div class="subtitle-2 font-weight-bold">{{ m.name }}</div>
              <div class="caption grey--text">{{ m.role }}</div>
            </div>
            <v-spacer></v-spacer>
            <v-chip small :color="workloadColor(m.caseLoad)" dark>{{ workloadLabel(m.caseLoad) }}</v-chip>
          </div>
          <div class="caption mb-1">Active Cases: <strong>{{ m.caseLoad }}</strong> / {{ m.capacity }}</div>
          <v-progress-linear :value="(m.caseLoad / m.capacity) * 100" height="12" rounded :color="workloadColor(m.caseLoad, m.capacity)" class="mb-3"></v-progress-linear>
          <div class="d-flex caption grey--text">
            <span class="mr-4"><v-icon x-small>mdi-clock</v-icon> {{ m.hours }}h this month</span>
            <span class="mr-4"><v-icon x-small>mdi-check</v-icon> {{ m.tasksOpen }} open tasks</span>
            <span><v-icon x-small>mdi-calendar</v-icon> {{ m.hearings }} hearings</span>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
export default {
  name: 'Workload',
  data() {
    return {
      team: [
        { id: 1, name: 'Ahmed Cherni', role: 'Senior Lawyer', caseLoad: 9, capacity: 12, hours: 142, tasksOpen: 8, hearings: 5, color: 'blue darken-2' },
        { id: 2, name: 'Karim Slim', role: 'Associate Lawyer', caseLoad: 7, capacity: 10, hours: 118, tasksOpen: 12, hearings: 3, color: 'teal darken-1' },
        { id: 3, name: 'Leila Mansour', role: 'Paralegal', caseLoad: 5, capacity: 8, hours: 88, tasksOpen: 20, hearings: 0, color: 'green darken-1' },
        { id: 4, name: 'Nadia Chaker', role: 'Accountant', caseLoad: 0, capacity: 5, hours: 65, tasksOpen: 6, hearings: 0, color: 'orange darken-1' },
        { id: 5, name: 'Sami Ghorbel', role: 'Associate Lawyer', caseLoad: 4, capacity: 8, hours: 74, tasksOpen: 7, hearings: 2, color: 'purple darken-1' },
      ],
    };
  },
  computed: {
    summary() {
      const totalCases = this.team.reduce((s, m) => s + m.caseLoad, 0);
      const overloaded = this.team.filter(m => m.caseLoad / m.capacity > 0.85).length;
      const avgHours = Math.round(this.team.reduce((s, m) => s + m.hours, 0) / this.team.length);
      return [
        { label: 'Total Active Cases', value: totalCases, color: 'blue', icon: 'mdi-briefcase' },
        { label: 'Overloaded Staff', value: overloaded, color: 'red', icon: 'mdi-alert' },
        { label: 'Avg Hours/Month', value: avgHours + 'h', color: 'orange', icon: 'mdi-clock' },
        { label: 'Team Size', value: this.team.length, color: 'green', icon: 'mdi-account-group' },
      ];
    },
  },
  methods: {
    workloadColor(load, capacity) {
      const ratio = capacity ? load / capacity : load / 12;
      return ratio > 0.85 ? 'red' : ratio > 0.65 ? 'orange' : 'green';
    },
    workloadLabel(load, capacity) {
      const ratio = capacity ? load / capacity : load / 12;
      return ratio > 0.85 ? 'Overloaded' : ratio > 0.65 ? 'Busy' : 'Available';
    },
  },
};
</script>
