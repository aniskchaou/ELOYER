<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col>
        <h1 class="text-h5 font-weight-bold">Conflict of Interest Check</h1>
        <p class="body-2 grey--text">Detect potential conflicts before accepting new clients or cases</p>
      </v-col>
    </v-row>

    <!-- Check Form -->
    <v-card outlined class="mb-5 pa-4">
      <v-card-title class="pb-2"><v-icon left color="primary">mdi-shield-search</v-icon> Run Conflict Check</v-card-title>
      <v-divider></v-divider>
      <v-row class="mt-3">
        <v-col cols="12" md="4">
          <v-text-field v-model="checkForm.partyName" label="Party Name / Company" outlined dense
            hint="Enter the name of the new client or opposing party"></v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-select v-model="checkForm.role" :items="roleOptions" label="Role" outlined dense></v-select>
        </v-col>
        <v-col cols="12" md="3">
          <v-select v-model="checkForm.lawyer" :items="lawyers" label="Assigning Lawyer" outlined dense></v-select>
        </v-col>
        <v-col cols="12" md="2">
          <v-btn color="primary" block :loading="checking" @click="runCheck">Check</v-btn>
        </v-col>
      </v-row>
    </v-card>

    <!-- Check Result -->
    <v-alert v-if="checkResult === 'clear'" type="success" outlined class="mb-4">
      <strong>No Conflicts Found</strong> — The party "{{ lastChecked }}" has no known conflicts in the system.
    </v-alert>
    <v-alert v-if="checkResult === 'conflict'" type="error" outlined class="mb-4">
      <strong>Conflict Detected!</strong> — The party "{{ lastChecked }}" appears in existing cases. Review the records below.
    </v-alert>

    <!-- Conflict Records Table -->
    <v-card outlined class="mb-5">
      <v-card-title>Conflict Records
        <v-spacer></v-spacer>
        <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line hide-details dense></v-text-field>
      </v-card-title>
      <v-divider></v-divider>
      <v-data-table :headers="conflictHeaders" :items="conflictRecords" :search="search" class="elevation-0">
        <template v-slot:item.severity="{ item }">
          <v-chip small :color="severityColor(item.severity)" dark>{{ item.severity }}</v-chip>
        </template>
        <template v-slot:item.status="{ item }">
          <v-chip small :color="item.status === 'Resolved' ? 'green' : 'orange'" dark>{{ item.status }}</v-chip>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn icon small color="primary" @click="viewConflict(item)"><v-icon small>mdi-eye</v-icon></v-btn>
          <v-btn icon small color="green" @click="resolve(item.id)" :disabled="item.status === 'Resolved'"><v-icon small>mdi-check</v-icon></v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Conflict Detail Dialog -->
    <v-dialog v-model="detailDialog" max-width="600px">
      <v-card v-if="selectedConflict">
        <v-card-title>Conflict Details
          <v-spacer></v-spacer>
          <v-btn icon @click="detailDialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-row>
            <v-col cols="6"><strong>Party:</strong> {{ selectedConflict.party }}</v-col>
            <v-col cols="6"><strong>Existing Case:</strong> {{ selectedConflict.existingCase }}</v-col>
            <v-col cols="6"><strong>Opposing Party:</strong> {{ selectedConflict.opposingParty }}</v-col>
            <v-col cols="6"><strong>Lawyer:</strong> {{ selectedConflict.lawyer }}</v-col>
            <v-col cols="6"><strong>Severity:</strong>
              <v-chip small :color="severityColor(selectedConflict.severity)" dark>{{ selectedConflict.severity }}</v-chip>
            </v-col>
            <v-col cols="6"><strong>Status:</strong>
              <v-chip small :color="selectedConflict.status === 'Resolved' ? 'green' : 'orange'" dark>{{ selectedConflict.status }}</v-chip>
            </v-col>
            <v-col cols="12"><strong>Notes:</strong> {{ selectedConflict.notes }}</v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
export default {
  name: 'ConflictCheck',
  data() {
    return {
      checking: false,
      checkResult: null,
      lastChecked: '',
      search: '',
      detailDialog: false,
      selectedConflict: null,
      checkForm: { partyName: '', role: '', lawyer: '' },
      roleOptions: ['Client', 'Opposing Party', 'Witness', 'Expert', 'Third Party'],
      lawyers: ['John Doe', 'Emily Clark', 'Michael Lee', 'Sara Lee'],
      conflictRecords: [
        { id: 1, party: 'XYZ Inc', existingCase: 'C-101: Corporate Merger', opposingParty: 'ABC Ltd', lawyer: 'John Doe', severity: 'High', status: 'Open', notes: 'Same firm represented XYZ in a prior matter.' },
        { id: 2, party: 'M. Lambert', existingCase: 'C-104: Property Dispute', opposingParty: 'C. Lambert', lawyer: 'Sara Lee', severity: 'Medium', status: 'Resolved', notes: 'Related family members — waiver obtained.' },
        { id: 3, party: 'TechCorp', existingCase: 'C-103: IP Dispute', opposingParty: 'MegaSoft Ltd', lawyer: 'Michael Lee', severity: 'Low', status: 'Open', notes: 'Business relationship history detected.' },
      ],
      conflictHeaders: [
        { text: 'Party', value: 'party' },
        { text: 'Existing Case', value: 'existingCase' },
        { text: 'Opposing Party', value: 'opposingParty' },
        { text: 'Lawyer', value: 'lawyer' },
        { text: 'Severity', value: 'severity' },
        { text: 'Status', value: 'status' },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
    };
  },
  methods: {
    runCheck() {
      if (!this.checkForm.partyName) return;
      this.checking = true;
      this.lastChecked = this.checkForm.partyName;
      setTimeout(() => {
        const match = this.conflictRecords.find(r =>
          r.party.toLowerCase().includes(this.checkForm.partyName.toLowerCase()) ||
          r.opposingParty.toLowerCase().includes(this.checkForm.partyName.toLowerCase())
        );
        this.checkResult = match ? 'conflict' : 'clear';
        this.checking = false;
      }, 900);
    },
    resolve(id) {
      const rec = this.conflictRecords.find(r => r.id === id);
      if (rec) rec.status = 'Resolved';
    },
    viewConflict(item) { this.selectedConflict = item; this.detailDialog = true; },
    severityColor(s) { return { High: 'red', Medium: 'orange', Low: 'blue' }[s] || 'grey'; },
  },
};
</script>
