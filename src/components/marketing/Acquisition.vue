<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Client Acquisition</h1><p class="body-2 grey--text">Track acquisition channels and conversion performance</p></v-col>
    </v-row>

    <v-row class="mb-4">
      <v-col v-for="s in kpis" :key="s.label" cols="6" md="3">
        <v-card outlined class="pa-3 text-center">
          <v-icon :color="s.color">{{ s.icon }}</v-icon>
          <div class="overline mt-1">{{ s.label }}</div>
          <p class="text-h5 font-weight-bold" :class="s.color+'--text'">{{ s.value }}</p>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <v-card outlined class="pa-4">
          <v-card-title class="subtitle-1">Acquisition by Channel</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <div v-for="c in channels" :key="c.name" class="mb-3">
            <div class="d-flex justify-space-between caption mb-1">
              <span><v-icon small :color="c.color" class="mr-1">{{ c.icon }}</v-icon>{{ c.name }}</span>
              <span class="font-weight-bold">{{ c.clients }} clients ({{ c.pct }}%)</span>
            </div>
            <v-progress-linear :value="c.pct" height="10" rounded :color="c.color"></v-progress-linear>
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card outlined class="pa-4">
          <v-card-title class="subtitle-1">Conversion Funnel</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <div v-for="f in funnel" :key="f.stage" class="mb-3">
            <div class="d-flex justify-space-between caption mb-1">
              <span>{{ f.stage }}</span>
              <span class="font-weight-bold">{{ f.count }} <span class="grey--text">({{ f.rate }}%)</span></span>
            </div>
            <v-progress-linear :value="f.rate" height="12" rounded :color="f.color"></v-progress-linear>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12">
        <v-card outlined>
          <v-card-title class="subtitle-1">Recent Acquisitions</v-card-title>
          <v-divider></v-divider>
          <v-data-table :headers="headers" :items="acquisitions" dense>
            <template v-slot:item.channel="{ item }">
              <v-chip x-small :color="channelColor(item.channel)" dark>{{ item.channel }}</v-chip>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
export default {
  name: 'Acquisition',
  data() {
    return {
      kpis: [
        { label: 'New Clients (Q2)', value: 12, color: 'green', icon: 'mdi-account-plus' },
        { label: 'Avg. Acq. Cost', value: '€280', color: 'orange', icon: 'mdi-cash' },
        { label: 'Conversion Rate', value: '34%', color: 'blue', icon: 'mdi-percent' },
        { label: 'Total Leads', value: 35, color: 'purple', icon: 'mdi-account-group' },
      ],
      channels: [
        { name: 'Referral', clients: 18, pct: 51, color: 'green', icon: 'mdi-account-multiple' },
        { name: 'Website', clients: 8, pct: 23, color: 'blue', icon: 'mdi-web' },
        { name: 'Social Media', clients: 5, pct: 14, color: 'purple', icon: 'mdi-instagram' },
        { name: 'Cold Outreach', clients: 3, pct: 9, color: 'orange', icon: 'mdi-email' },
        { name: 'Partner', clients: 1, pct: 3, color: 'teal', icon: 'mdi-handshake' },
      ],
      funnel: [
        { stage: 'Leads Generated', count: 35, rate: 100, color: 'blue' },
        { stage: 'Initial Contact Made', count: 28, rate: 80, color: 'teal' },
        { stage: 'Consultation Scheduled', count: 20, rate: 57, color: 'green' },
        { stage: 'Proposal Sent', count: 14, rate: 40, color: 'orange' },
        { stage: 'Client Signed', count: 12, rate: 34, color: 'purple' },
      ],
      acquisitions: [
        { name: 'Mounir Jebali', date: '2026-05-02', channel: 'Website', practiceArea: 'Corporate Law', value: '€8,000' },
        { name: 'Faten Ben Salem', date: '2026-04-28', channel: 'Referral', practiceArea: 'Criminal Law', value: '€4,500' },
        { name: 'Youssef Trabelsi', date: '2026-04-15', channel: 'Social Media', practiceArea: 'Civil Law', value: '€3,000' },
      ],
      headers: [
        { text: 'Client', value: 'name' }, { text: 'Date', value: 'date' }, { text: 'Channel', value: 'channel' },
        { text: 'Practice Area', value: 'practiceArea' }, { text: 'Est. Value', value: 'value' },
      ],
    };
  },
  methods: {
    channelColor(c) { return { Referral: 'green', Website: 'blue', 'Social Media': 'purple', 'Cold Outreach': 'orange', Partner: 'teal' }[c] || 'grey'; },
  },
};
</script>
