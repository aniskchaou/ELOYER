<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Attendance</h1><p class="body-2 grey--text">Daily attendance tracker with check-in/out</p></v-col>
      <v-col cols="auto"><v-text-field v-model="date" type="date" outlined dense hide-details @change="load" style="max-width:170px"></v-text-field></v-col>
    </v-row>
    <v-row class="mb-4">
      <v-col cols="6" md="3" v-for="s in stats" :key="s.label">
        <v-card outlined class="pa-3 text-center" :loading="loading">
          <v-icon :color="s.color">{{ s.icon }}</v-icon>
          <div class="overline mt-1">{{ s.label }}</div>
          <div class="text-h5 font-weight-bold" :class="s.color+'--text'">{{ s.value }}</div>
        </v-card>
      </v-col>
    </v-row>
    <v-card outlined :loading="loading">
      <v-data-table :headers="headers" :items="records" dense class="elevation-0">
        <template v-slot:item.status="{ item }"><v-chip x-small :color="statusColor(item.status)" dark>{{ item.status }}</v-chip></template>
        <template v-slot:item.check_in="{ item }">{{ item.check_in ? new Date(item.check_in).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) : '—' }}</template>
        <template v-slot:item.check_out="{ item }">{{ item.check_out ? new Date(item.check_out).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) : '—' }}</template>
        <template v-slot:item.hours="{ item }">
          <span v-if="item.check_in && item.check_out">{{ calcHours(item) }}h</span>
          <span v-else class="grey--text">—</span>
        </template>
      </v-data-table>
    </v-card>

    <v-card outlined class="pa-4 mt-4">
      <v-card-title class="subtitle-1 pb-2">Manual Entry</v-card-title>
      <v-divider class="mb-3"></v-divider>
      <v-row align="end">
        <v-col cols="12" md="3"><v-select v-model="manualUserId" :items="users" item-text="full_name" item-value="id" label="Employee" outlined dense></v-select></v-col>
        <v-col cols="12" md="2"><v-btn color="green" dark @click="checkin" :loading="submitting">Check In</v-btn></v-col>
        <v-col cols="12" md="2"><v-btn outlined color="orange" @click="checkout" :loading="submitting">Check Out</v-btn></v-col>
      </v-row>
    </v-card>
    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>
<script>
import { hrGetAttendance, hrCheckIn, hrCheckOut } from '@/services/hrApi';
export default {
  name: 'AttendanceManagement',
  data() {
    return {
      records: [], loading: true, submitting: false, manualUserId: 1,
      date: new Date().toISOString().slice(0,10),
      users: [{ id: 1, full_name: 'Ahmed Cherni' }, { id: 2, full_name: 'System Admin' }],
      snack: false, snackMsg: '', snackColor: 'success',
      headers: [
        { text: 'Employee', value: 'full_name' }, { text: 'Role', value: 'role' },
        { text: 'Status', value: 'status' }, { text: 'Check In', value: 'check_in' },
        { text: 'Check Out', value: 'check_out' }, { text: 'Hours', value: 'hours' },
      ],
    };
  },
  computed: {
    stats() {
      return [
        { label: 'Present', value: this.records.filter(r => r.status === 'present').length, icon: 'mdi-account-check', color: 'green' },
        { label: 'Absent', value: this.records.filter(r => r.status === 'absent').length, icon: 'mdi-account-remove', color: 'red' },
        { label: 'Late', value: this.records.filter(r => r.status === 'late').length, icon: 'mdi-clock-alert', color: 'orange' },
        { label: 'On Leave', value: this.records.filter(r => r.status === 'on_leave').length, icon: 'mdi-beach', color: 'blue' },
      ];
    },
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.records = await hrGetAttendance(this.date); }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.loading = false; }
    },
    async checkin() {
      this.submitting = true;
      try { await hrCheckIn({ user_id: this.manualUserId }); this.notify('Checked in.'); this.load(); }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.submitting = false; }
    },
    async checkout() {
      this.submitting = true;
      try { await hrCheckOut({ user_id: this.manualUserId }); this.notify('Checked out.'); this.load(); }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.submitting = false; }
    },
    calcHours(r) {
      if (!r.check_in || !r.check_out) return '—';
      return ((new Date(r.check_out) - new Date(r.check_in)) / 3600000).toFixed(1);
    },
    statusColor(s) { const m = { present:'success', absent:'error', late:'orange', on_leave:'blue' }; return m[s]||'grey'; },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
