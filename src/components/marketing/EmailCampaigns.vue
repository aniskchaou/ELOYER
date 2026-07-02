<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Email Campaigns</h1><p class="body-2 grey--text">Create and track marketing email campaigns</p></v-col>
      <v-col cols="auto"><v-btn color="primary" @click="openAdd"><v-icon left>mdi-plus</v-icon> New Campaign</v-btn></v-col>
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

    <v-data-table :headers="headers" :items="campaigns" class="elevation-1">
      <template v-slot:item.status="{ item }">
        <v-chip small :color="statusColor(item.status)" dark>{{ item.status }}</v-chip>
      </template>
      <template v-slot:item.openRate="{ item }">
        <v-progress-linear :value="item.openRate" height="10" rounded color="blue"></v-progress-linear>
        <span class="caption">{{ item.openRate }}%</span>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-btn icon small color="primary" @click="view(item)"><v-icon small>mdi-eye</v-icon></v-btn>
        <v-btn icon small color="green" @click="send(item)" v-if="item.status === 'Draft'"><v-icon small>mdi-send</v-icon></v-btn>
        <v-btn icon small color="red" @click="del(item.id)"><v-icon small>mdi-delete</v-icon></v-btn>
      </template>
    </v-data-table>

    <v-dialog v-model="dialog" max-width="560px">
      <v-card>
        <v-card-title>{{ editMode ? 'Edit Campaign' : 'New Campaign' }}</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-text-field v-model="form.name" label="Campaign Name" outlined dense></v-text-field>
          <v-text-field v-model="form.subject" label="Email Subject" outlined dense class="mt-3"></v-text-field>
          <v-row class="mt-3">
            <v-col cols="6"><v-select v-model="form.audience" :items="audiences" label="Audience" outlined dense></v-select></v-col>
            <v-col cols="6"><v-text-field v-model="form.scheduledDate" label="Schedule Date" outlined dense type="date"></v-text-field></v-col>
          </v-row>
          <v-textarea v-model="form.body" label="Email Body" outlined rows="4" class="mt-3"></v-textarea>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="dialog=false">Cancel</v-btn><v-btn color="primary" @click="save">Save</v-btn></v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="viewDialog" max-width="520px">
      <v-card v-if="selected">
        <v-card-title>{{ selected.name }} <v-spacer></v-spacer><v-chip small :color="statusColor(selected.status)" dark>{{ selected.status }}</v-chip></v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <p><strong>Subject:</strong> {{ selected.subject }}</p>
          <p><strong>Audience:</strong> {{ selected.audience }}</p>
          <p><strong>Sent:</strong> {{ selected.sent }} | <strong>Opened:</strong> {{ selected.opened }} | <strong>Open Rate:</strong> {{ selected.openRate }}%</p>
          <p class="mt-2"><strong>Body:</strong><br>{{ selected.body }}</p>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="viewDialog=false">Close</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script>
export default {
  name: 'EmailCampaigns',
  data() {
    return {
      dialog: false, viewDialog: false, editMode: false, selected: null,
      form: { id: null, name: '', subject: '', audience: '', scheduledDate: '', body: '', status: 'Draft' },
      audiences: ['All Clients', 'Active Cases', 'Leads', 'Corporate Clients', 'Newsletter Subscribers'],
      campaigns: [
        { id: 1, name: 'Q2 Newsletter', subject: 'Legal Updates – Spring 2026', audience: 'Newsletter Subscribers', scheduledDate: '2026-04-01', sent: 420, opened: 189, openRate: 45, status: 'Sent', body: 'Dear clients, here are the key legal updates for Q2...' },
        { id: 2, name: 'Corporate Law Update', subject: 'New Commercial Code Amendments', audience: 'Corporate Clients', scheduledDate: '2026-04-20', sent: 85, opened: 62, openRate: 73, status: 'Sent', body: 'Important changes to Commercial Code affecting your business...' },
        { id: 3, name: 'Summer Retainer Offer', subject: 'Exclusive Retainer Packages', audience: 'Leads', scheduledDate: '2026-06-01', sent: 0, opened: 0, openRate: 0, status: 'Scheduled', body: 'We are pleased to offer exclusive summer retainer packages...' },
        { id: 4, name: 'Welcome Back Campaign', subject: 'Reconnect With Our Firm', audience: 'All Clients', scheduledDate: '', sent: 0, opened: 0, openRate: 0, status: 'Draft', body: '' },
      ],
      headers: [
        { text: 'Campaign', value: 'name' }, { text: 'Subject', value: 'subject' }, { text: 'Audience', value: 'audience' },
        { text: 'Sent', value: 'sent' }, { text: 'Open Rate', value: 'openRate' }, { text: 'Status', value: 'status' },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
    };
  },
  computed: {
    stats() {
      return [
        { label: 'Campaigns', value: this.campaigns.length, color: 'blue', icon: 'mdi-email-multiple' },
        { label: 'Total Sent', value: this.campaigns.reduce((s, c) => s + c.sent, 0), color: 'green', icon: 'mdi-send' },
        { label: 'Avg Open Rate', value: (this.campaigns.filter(c => c.sent > 0).reduce((s, c) => s + c.openRate, 0) / Math.max(this.campaigns.filter(c => c.sent > 0).length, 1)).toFixed(0) + '%', color: 'orange', icon: 'mdi-email-open' },
        { label: 'Scheduled', value: this.campaigns.filter(c => c.status === 'Scheduled').length, color: 'purple', icon: 'mdi-calendar-clock' },
      ];
    },
  },
  methods: {
    statusColor(s) { return { Draft: 'grey', Scheduled: 'orange', Sent: 'green', Paused: 'red' }[s] || 'grey'; },
    openAdd() { this.editMode = false; this.form = { id: null, name: '', subject: '', audience: '', scheduledDate: '', body: '', status: 'Draft' }; this.dialog = true; },
    view(c) { this.selected = c; this.viewDialog = true; },
    send(c) { c.status = 'Sent'; c.sent = Math.floor(Math.random() * 300) + 50; c.opened = Math.floor(c.sent * 0.4); c.openRate = Math.floor((c.opened / c.sent) * 100); },
    del(id) { this.campaigns = this.campaigns.filter(c => c.id !== id); },
    save() {
      if (this.editMode) { const i = this.campaigns.findIndex(c => c.id === this.form.id); if (i !== -1) this.campaigns.splice(i, 1, { ...this.form, sent: this.campaigns[i].sent, opened: this.campaigns[i].opened, openRate: this.campaigns[i].openRate }); }
      else this.campaigns.push({ ...this.form, id: Date.now(), sent: 0, opened: 0, openRate: 0 });
      this.dialog = false;
    },
  },
};
</script>
