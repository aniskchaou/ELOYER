<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">E-Signature Integration</h1><p class="body-2 grey--text">Send, track, and manage electronic signatures on legal documents</p></v-col>
      <v-col cols="auto"><v-btn color="primary" @click="sendDialog=true"><v-icon left>mdi-file-sign</v-icon> Send for Signature</v-btn></v-col>
    </v-row>

    <!-- Stats -->
    <v-row class="mb-4">
      <v-col v-for="s in stats" :key="s.label" cols="6" md="3">
        <v-card outlined class="pa-3 text-center">
          <v-icon :color="s.color" class="mb-1">{{ s.icon }}</v-icon>
          <div class="overline">{{ s.label }}</div>
          <p class="text-h5 font-weight-bold" :class="s.color+'--text'">{{ s.value }}</p>
        </v-card>
      </v-col>
    </v-row>

    <v-card outlined>
      <v-card-title>Signature Requests
        <v-spacer></v-spacer>
        <v-select v-model="filterStatus" :items="statuses" label="Filter" outlined dense clearable style="max-width:180px" class="mr-2"></v-select>
        <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line hide-details dense style="max-width:200px"></v-text-field>
      </v-card-title>
      <v-divider></v-divider>
      <v-data-table :headers="headers" :items="filteredRequests" :search="search">
        <template v-slot:item.status="{ item }">
          <v-chip small :color="statusColor(item.status)" dark>{{ item.status }}</v-chip>
        </template>
        <template v-slot:item.signers="{ item }">
          <v-chip v-for="(s,i) in item.signers" :key="i" x-small :color="s.signed ? 'green' : 'orange'" dark class="mr-1">{{ s.name }}</v-chip>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn icon small color="primary" @click="view(item)"><v-icon small>mdi-eye</v-icon></v-btn>
          <v-btn icon small color="orange" @click="remind(item)"><v-icon small>mdi-bell-ring</v-icon></v-btn>
          <v-btn icon small color="green" v-if="item.status==='Completed'" @click="download(item)"><v-icon small>mdi-download</v-icon></v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Send Dialog -->
    <v-dialog v-model="sendDialog" max-width="560px">
      <v-card>
        <v-card-title><v-icon left color="primary">mdi-file-sign</v-icon> Send for Signature</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-text-field v-model="sendForm.docName" label="Document Name" outlined dense></v-text-field>
          <v-select v-model="sendForm.signers" :items="signerOptions" label="Signers" multiple chips outlined dense class="mt-3"></v-select>
          <v-select v-model="sendForm.order" :items="['Sequential','Parallel']" label="Signing Order" outlined dense class="mt-3"></v-select>
          <v-select v-model="sendForm.deadline" :items="deadlineOptions" label="Deadline" outlined dense class="mt-3"></v-select>
          <v-textarea v-model="sendForm.message" label="Message to signers (optional)" outlined rows="2" class="mt-3"></v-textarea>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="sendDialog=false">Cancel</v-btn><v-btn color="primary" @click="sendRequest">Send</v-btn></v-card-actions>
      </v-card>
    </v-dialog>

    <!-- View Dialog -->
    <v-dialog v-model="viewDialog" max-width="500px">
      <v-card v-if="selected">
        <v-card-title>{{ selected.docName }}</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <p><strong>Status:</strong> <v-chip small :color="statusColor(selected.status)" dark>{{ selected.status }}</v-chip></p>
          <p><strong>Sent:</strong> {{ selected.sent }}</p>
          <p><strong>Deadline:</strong> {{ selected.deadline }}</p>
          <div class="mt-3"><strong>Signers:</strong>
            <v-list dense>
              <v-list-item v-for="s in selected.signers" :key="s.name">
                <v-list-item-icon><v-icon :color="s.signed ? 'green' : 'orange'">{{ s.signed ? 'mdi-check-circle' : 'mdi-clock' }}</v-icon></v-list-item-icon>
                <v-list-item-content><v-list-item-title>{{ s.name }}</v-list-item-title><v-list-item-subtitle>{{ s.signed ? 'Signed' : 'Pending' }}</v-list-item-subtitle></v-list-item-content>
              </v-list-item>
            </v-list>
          </div>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="viewDialog=false">Close</v-btn></v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar" timeout="3000" color="success">Signature request sent!</v-snackbar>
  </v-container>
</template>
<script>
export default {
  name: 'ESignature',
  data() {
    return {
      search: '', filterStatus: null, sendDialog: false, viewDialog: false, snackbar: false, selected: null,
      sendForm: { docName: '', signers: [], order: 'Sequential', deadline: '7 days', message: '' },
      statuses: ['Pending', 'Partially Signed', 'Completed', 'Expired'],
      signerOptions: ['Ahmed Ben Ali', 'Société ABC SARL', 'Leila Mansour', 'Maître Ahmed Cherni'],
      deadlineOptions: ['3 days', '7 days', '14 days', '30 days'],
      requests: [
        { id: 1, docName: 'Retainer Agreement – ABC SARL', sent: '2026-04-20', deadline: '2026-04-27', status: 'Completed', signers: [{name:'Ahmed Cherni', signed:true},{name:'ABC SARL', signed:true}] },
        { id: 2, docName: 'Employment Contract – K. Slim', sent: '2026-05-01', deadline: '2026-05-08', status: 'Pending', signers: [{name:'Karim Slim', signed:false},{name:'Law Firm', signed:true}] },
        { id: 3, docName: 'Settlement Agreement – Ben Ali', sent: '2026-04-10', deadline: '2026-04-17', status: 'Expired', signers: [{name:'Ahmed Ben Ali', signed:false},{name:'Ahmed Cherni', signed:true}] },
      ],
      headers: [
        { text: 'Document', value: 'docName' },
        { text: 'Sent', value: 'sent' },
        { text: 'Deadline', value: 'deadline' },
        { text: 'Status', value: 'status' },
        { text: 'Signers', value: 'signers', sortable: false },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
    };
  },
  computed: {
    stats() {
      return [
        { label: 'Total Requests', value: this.requests.length, color: 'blue', icon: 'mdi-file-multiple' },
        { label: 'Pending', value: this.requests.filter(r => r.status === 'Pending').length, color: 'orange', icon: 'mdi-clock' },
        { label: 'Completed', value: this.requests.filter(r => r.status === 'Completed').length, color: 'green', icon: 'mdi-check-circle' },
        { label: 'Expired', value: this.requests.filter(r => r.status === 'Expired').length, color: 'red', icon: 'mdi-alert-circle' },
      ];
    },
    filteredRequests() { return this.filterStatus ? this.requests.filter(r => r.status === this.filterStatus) : this.requests; },
  },
  methods: {
    statusColor(s) { return { Completed: 'green', Pending: 'orange', 'Partially Signed': 'blue', Expired: 'red' }[s] || 'grey'; },
    view(item) { this.selected = item; this.viewDialog = true; },
    remind(item) { void item; },
    download(item) { void item; },
    sendRequest() { this.requests.push({ id: Date.now(), docName: this.sendForm.docName, sent: new Date().toISOString().split('T')[0], deadline: this.sendForm.deadline, status: 'Pending', signers: this.sendForm.signers.map(s => ({ name: s, signed: false })) }); this.sendDialog = false; this.snackbar = true; },
  },
};
</script>
