<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold"><v-icon left color="brown darken-1">mdi-account-hard-hat</v-icon>HR Dashboard</h1><p class="body-2 grey--text">Workforce overview — staff, attendance, leave and reviews</p></v-col>
    </v-row>
    <v-row class="mb-4">
      <v-col cols="6" md="3" v-for="s in kpis" :key="s.label">
        <v-card outlined class="pa-4 text-center" :loading="loading">
          <v-icon :color="s.color" large>{{ s.icon }}</v-icon>
          <div class="overline mt-1">{{ s.label }}</div>
          <div class="text-h4 font-weight-bold" :class="s.color+'--text'">{{ s.value }}</div>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="6">
        <v-card outlined class="pa-4">
          <v-card-title class="subtitle-1 pb-2">Staff by Role</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-list dense>
            <v-list-item v-for="s in data.staff" :key="s.role">
              <v-list-item-icon><v-icon small color="brown">mdi-account</v-icon></v-list-item-icon>
              <v-list-item-content><v-list-item-title class="text-capitalize">{{ s.role.replace(/_/g,' ') }}</v-list-item-title></v-list-item-content>
              <v-list-item-action><v-chip small color="brown" dark>{{ s.total }}</v-chip></v-list-item-action>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card outlined class="pa-4">
          <v-card-title class="subtitle-1 pb-2">Quick Actions</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-btn block outlined color="brown darken-1" class="mb-2" to="/hr/leave"><v-icon left small>mdi-calendar-clock</v-icon>Review Leave Requests</v-btn>
          <v-btn block outlined color="blue" class="mb-2" to="/hr/attendance"><v-icon left small>mdi-account-check</v-icon>Attendance Today</v-btn>
          <v-btn block outlined color="green" class="mb-2" to="/hr/recruitment"><v-icon left small>mdi-briefcase-search</v-icon>Recruitment</v-btn>
          <v-btn block outlined color="purple" to="/hr/performance"><v-icon left small>mdi-star</v-icon>Performance Reviews</v-btn>
        </v-card>
      </v-col>
      <v-col cols="12">
        <v-card outlined>
          <v-card-title class="subtitle-1">Leave Status</v-card-title>
          <v-list dense>
            <v-list-item v-for="l in data.leave" :key="l.status">
              <v-list-item-icon><v-icon :color="leaveColor(l.status)" small>mdi-calendar</v-icon></v-list-item-icon>
              <v-list-item-content><v-list-item-title class="text-capitalize">{{ l.status }}</v-list-item-title></v-list-item-content>
              <v-list-item-action><v-chip small :color="leaveColor(l.status)" dark>{{ l.count }}</v-chip></v-list-item-action>
            </v-list-item>
            <v-list-item v-if="!data.leave || !data.leave.length"><v-list-item-content><v-list-item-subtitle>No leave data yet.</v-list-item-subtitle></v-list-item-content></v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import { hrGetDashboard } from '@/services/hrApi';
export default {
  name: 'HRDashboard',
  data() { return { data: { staff: [], leave: [], postings: [], todayAttendance: [] }, loading: true }; },
  computed: {
    kpis() {
      const totalStaff = this.data.staff.reduce((s, r) => s + Number(r.total), 0);
      const pending = (this.data.leave.find(l => l.status === 'pending') || {}).count || 0;
      const present = (this.data.todayAttendance.find(a => a.status === 'present') || {}).count || 0;
      const openJobs = (this.data.postings.find(p => p.status === 'open') || {}).count || 0;
      return [
        { label: 'Total Staff', value: totalStaff, icon: 'mdi-account-group', color: 'brown' },
        { label: 'Present Today', value: present, icon: 'mdi-account-check', color: 'green' },
        { label: 'Leave Pending', value: pending, icon: 'mdi-calendar-clock', color: 'orange' },
        { label: 'Open Positions', value: openJobs, icon: 'mdi-briefcase-search', color: 'blue' },
      ];
    },
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.data = await hrGetDashboard(); }
      catch (e) { console.error(e); }
      finally { this.loading = false; }
    },
    leaveColor(s) { return s === 'approved' ? 'success' : s === 'pending' ? 'orange' : 'error'; },
  },
};
</script>
