<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Case Assignment</h1><p class="body-2 grey--text">Assign lawyers to cases and balance workload</p></v-col>
    </v-row>
    <v-card outlined>
      <v-card-title>
        <v-text-field v-model="search" append-icon="mdi-magnify" label="Search cases…" dense outlined single-line hide-details style="max-width:280px"></v-text-field>
      </v-card-title>
      <v-data-table :headers="headers" :items="cases" :loading="loading" :search="search" class="elevation-0">
        <template v-slot:item.status="{ item }">
          <v-chip small :color="statusColor(item.status)" dark>{{ item.status }}</v-chip>
        </template>
        <template v-slot:item.lawyer="{ item }">
          <v-chip small color="indigo" dark>{{ item.lawyer_name || 'Unassigned' }}</v-chip>
        </template>
        <template v-slot:item.risk_level="{ item }">
          <v-chip x-small :color="riskColor(item.risk_level)">{{ item.risk_level }}</v-chip>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn small outlined color="indigo" @click="openAssign(item)"><v-icon left small>mdi-account-switch</v-icon>Assign</v-btn>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="440">
      <v-card v-if="selected">
        <v-card-title>Assign Lawyer – {{ selected.title }}</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-select v-model="assignTo" :items="lawyers" item-text="full_name" item-value="id" label="Select Lawyer *" outlined dense></v-select>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="dialog=false">Cancel</v-btn><v-btn color="indigo" dark :loading="saving" @click="assign">Assign</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>
<script>
export default {
  name: 'CaseAssignment',
  data() {
    return {
      search: '', loading: false, dialog: false, saving: false, selected: null, assignTo: null,
      snack: false, snackMsg: '', snackColor: 'success',
      cases: [
        { id: 1, title: 'Property Dispute - Ben Ali', status: 'in_progress', risk_level: 'high', lawyer_name: 'Ahmed Cherni' },
        { id: 2, title: 'Corporate Merger - ABC SARL', status: 'open', risk_level: 'medium', lawyer_name: null },
        { id: 3, title: 'Labor Dispute - Mansour', status: 'open', risk_level: 'low', lawyer_name: null },
      ],
      lawyers: [
        { id: 1, full_name: 'Ahmed Cherni' },
        { id: 2, full_name: 'Sonia Belhaj' },
        { id: 3, full_name: 'Karim Ferjani' },
      ],
      headers: [
        { text: 'Case', value: 'title' },
        { text: 'Status', value: 'status' },
        { text: 'Risk', value: 'risk_level' },
        { text: 'Assigned To', value: 'lawyer' },
        { text: '', value: 'actions', sortable: false, align: 'end' },
      ],
    };
  },
  methods: {
    openAssign(item) { this.selected = item; this.assignTo = null; this.dialog = true; },
    async assign() {
      if (!this.assignTo) { this.notify('Select a lawyer.', 'error'); return; }
      this.saving = true;
      setTimeout(() => {
        const lawyer = this.lawyers.find(l => l.id === this.assignTo);
        this.selected.lawyer_name = lawyer ? lawyer.full_name : null;
        this.dialog = false; this.saving = false;
        this.notify(`Case assigned to ${lawyer.full_name}.`);
      }, 500);
    },
    statusColor(s) { const m = { open:'blue', in_progress:'orange', closed:'grey' }; return m[s] || 'grey'; },
    riskColor(r) { return r === 'high' ? 'error' : r === 'medium' ? 'warning' : 'success'; },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
