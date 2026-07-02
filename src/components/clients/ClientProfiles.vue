<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col>
        <h1 class="text-h5 font-weight-bold">Client Profiles & History</h1>
        <p class="body-2 grey--text">Detailed client records, contact info, and case history</p>
      </v-col>
    </v-row>

    <v-row>
      <!-- Search / filter -->
      <v-col cols="12" md="4">
        <v-text-field v-model="search" outlined dense prepend-inner-icon="mdi-magnify" label="Search clients" clearable></v-text-field>
      </v-col>
      <v-col cols="12" md="3">
        <v-select v-model="filterType" :items="clientTypes" label="Client Type" outlined dense clearable></v-select>
      </v-col>
    </v-row>

    <v-row>
      <v-col v-for="client in filteredClients" :key="client.id" cols="12" md="4">
        <v-card outlined class="pa-0">
          <v-card-title class="pb-1">
            <v-avatar color="primary" size="40" class="mr-3">
              <span class="white--text font-weight-bold">{{ initials(client.name) }}</span>
            </v-avatar>
            <div>
              <div class="body-1 font-weight-bold">{{ client.name }}</div>
              <v-chip x-small :color="typeColor(client.type)" dark>{{ client.type }}</v-chip>
            </div>
          </v-card-title>
          <v-divider></v-divider>
          <v-card-text class="pb-1">
            <div class="caption"><v-icon x-small class="mr-1">mdi-email</v-icon>{{ client.email }}</div>
            <div class="caption mt-1"><v-icon x-small class="mr-1">mdi-phone</v-icon>{{ client.phone }}</div>
            <div class="caption mt-1"><v-icon x-small class="mr-1">mdi-map-marker</v-icon>{{ client.address }}</div>
            <v-row class="mt-2">
              <v-col cols="6" class="pb-0">
                <div class="overline grey--text">Cases</div>
                <p class="font-weight-bold mb-0">{{ client.totalCases }}</p>
              </v-col>
              <v-col cols="6" class="pb-0">
                <div class="overline grey--text">Since</div>
                <p class="font-weight-bold mb-0">{{ client.since }}</p>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-btn text small color="primary" @click="viewProfile(client)">
              <v-icon small left>mdi-eye</v-icon> View
            </v-btn>
            <v-btn text small color="orange" @click="editClient(client)">
              <v-icon small left>mdi-pencil</v-icon> Edit
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn icon small :color="client.starred ? 'amber' : 'grey'" @click="toggleStar(client)">
              <v-icon small>{{ client.starred ? 'mdi-star' : 'mdi-star-outline' }}</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Profile Dialog -->
    <v-dialog v-model="profileDialog" max-width="700px">
      <v-card v-if="selected">
        <v-card-title class="primary white--text">
          <v-avatar color="white" size="40" class="mr-3">
            <span class="primary--text font-weight-bold">{{ initials(selected.name) }}</span>
          </v-avatar>
          {{ selected.name }}
          <v-spacer></v-spacer>
          <v-btn icon dark @click="profileDialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-tabs v-model="tab">
          <v-tab>Profile</v-tab>
          <v-tab>Case History</v-tab>
          <v-tab>Documents</v-tab>
          <v-tab>Payments</v-tab>
        </v-tabs>
        <v-divider></v-divider>
        <v-tab-item>
          <v-card-text>
            <v-row>
              <v-col cols="6"><strong>Email:</strong> {{ selected.email }}</v-col>
              <v-col cols="6"><strong>Phone:</strong> {{ selected.phone }}</v-col>
              <v-col cols="6"><strong>Address:</strong> {{ selected.address }}</v-col>
              <v-col cols="6"><strong>Type:</strong> <v-chip small :color="typeColor(selected.type)" dark>{{ selected.type }}</v-chip></v-col>
              <v-col cols="6"><strong>Assigned Lawyer:</strong> {{ selected.lawyer }}</v-col>
              <v-col cols="6"><strong>Client Since:</strong> {{ selected.since }}</v-col>
              <v-col cols="12"><strong>Notes:</strong> {{ selected.notes }}</v-col>
            </v-row>
          </v-card-text>
        </v-tab-item>
        <v-tab-item>
          <v-data-table :headers="caseHeaders" :items="selected.cases || []" class="elevation-0"></v-data-table>
        </v-tab-item>
        <v-tab-item>
          <v-list dense>
            <v-list-item v-for="d in selected.documents || []" :key="d">
              <v-list-item-icon><v-icon small>mdi-file-document</v-icon></v-list-item-icon>
              <v-list-item-content><v-list-item-title>{{ d }}</v-list-item-title></v-list-item-content>
            </v-list-item>
          </v-list>
        </v-tab-item>
        <v-tab-item>
          <v-card-text>
            <v-alert type="info" outlined>Total paid: <strong>{{ selected.totalPaid }}</strong></v-alert>
          </v-card-text>
        </v-tab-item>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
export default {
  name: 'ClientProfiles',
  data() {
    return {
      search: '',
      filterType: null,
      profileDialog: false,
      selected: null,
      tab: 0,
      clientTypes: ['Individual', 'Corporate', 'NGO', 'Government'],
      clients: [
        { id: 1, name: 'Ahmed Ben Ali', email: 'ahmed@corp.tn', phone: '+216 71 000 001', address: 'Tunis, Tunisia', type: 'Individual', lawyer: 'John Doe', since: '2022', totalCases: 3, starred: true, notes: 'Long-term client, priority service.', totalPaid: '€12,500', cases: [{ name: 'Divorce Case', status: 'Closed', date: '2022-01' }, { name: 'Property Dispute', status: 'Active', date: '2024-03' }], documents: ['Engagement Letter.pdf', 'ID Copy.pdf'] },
        { id: 2, name: 'Société ABC SARL', email: 'contact@abc.tn', phone: '+216 71 000 002', address: 'Sfax, Tunisia', type: 'Corporate', lawyer: 'Emily Clark', since: '2021', totalCases: 7, starred: false, notes: 'Corporate retainer client.', totalPaid: '€48,000', cases: [{ name: 'Corporate Merger', status: 'Active', date: '2025-01' }], documents: ['Retainer Agreement.pdf', 'MOA.pdf'] },
        { id: 3, name: 'Leila Mansour', email: 'leila@mail.com', phone: '+216 71 000 003', address: 'Sousse, Tunisia', type: 'Individual', lawyer: 'Sara Lee', since: '2023', totalCases: 1, starred: false, notes: '', totalPaid: '€3,200', cases: [{ name: 'Labor Dispute', status: 'Active', date: '2023-06' }], documents: ['Contract.pdf'] },
        { id: 4, name: 'ONG HelpAid', email: 'admin@helpaid.org', phone: '+216 71 000 004', address: 'Bizerte, Tunisia', type: 'NGO', lawyer: 'Michael Lee', since: '2024', totalCases: 2, starred: true, notes: 'Pro-bono arrangement.', totalPaid: '€0', cases: [], documents: [] },
      ],
      caseHeaders: [
        { text: 'Case', value: 'name' },
        { text: 'Status', value: 'status' },
        { text: 'Date', value: 'date' },
      ],
    };
  },
  computed: {
    filteredClients() {
      let list = this.clients;
      if (this.filterType) list = list.filter(c => c.type === this.filterType);
      if (this.search) list = list.filter(c => c.name.toLowerCase().includes(this.search.toLowerCase()) || c.email.toLowerCase().includes(this.search.toLowerCase()));
      return list;
    },
  },
  methods: {
    initials(name) { return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase(); },
    typeColor(t) { return { Individual: 'blue', Corporate: 'green', NGO: 'purple', Government: 'teal' }[t] || 'grey'; },
    viewProfile(c) { this.selected = c; this.tab = 0; this.profileDialog = true; },
    editClient(c) { this.selected = c; },
    toggleStar(c) { c.starred = !c.starred; },
  },
};
</script>
