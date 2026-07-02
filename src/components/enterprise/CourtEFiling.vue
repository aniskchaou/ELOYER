<template>
  <v-container fluid>
    <v-row class="mb-4"><v-col><h1 class="text-h5 font-weight-bold">Court E-Filing Integration</h1><p class="body-2 grey--text">Electronic filing with supported courts and tribunals</p></v-col></v-row>
    <v-row>
      <v-col v-for="court in courts" :key="court.name" cols="12" md="6">
        <v-card outlined class="pa-4">
          <div class="d-flex align-center mb-2">
            <v-avatar :color="court.available ? 'indigo darken-1' : 'grey lighten-2'" size="40" class="mr-3">
              <v-icon :color="court.available ? 'white' : 'grey'" small>mdi-bank</v-icon>
            </v-avatar>
            <div>
              <div class="subtitle-2 font-weight-bold">{{ court.name }}</div>
              <div class="caption grey--text">{{ court.jurisdiction }}</div>
            </div>
            <v-spacer></v-spacer>
            <v-chip small :color="court.available ? 'success' : 'grey'" dark>{{ court.available ? 'Live' : 'Planned' }}</v-chip>
          </div>
          <p class="caption grey--text mb-0">{{ court.desc }}</p>
          <div v-if="court.available" class="mt-2">
            <v-btn x-small outlined color="indigo" class="mr-1">File Document</v-btn>
            <v-btn x-small outlined color="blue">Check Status</v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
    <v-card outlined class="pa-4 mt-4">
      <v-card-title class="subtitle-1 pb-2">Supported Filing Types</v-card-title>
      <v-divider class="mb-3"></v-divider>
      <v-chip v-for="f in filingTypes" :key="f" outlined class="ma-1">{{ f }}</v-chip>
    </v-card>
  </v-container>
</template>
<script>
export default {
  name: 'CourtEFiling',
  data() {
    return {
      courts: [
        { name: 'Tribunal de Première Instance de Tunis', jurisdiction: 'Civil & Commercial – Tunis', available: true, desc: 'E-filing for motions, briefs and evidence bundles.' },
        { name: 'Tribunal du Travail de Tunis', jurisdiction: 'Labour Disputes – Tunis', available: true, desc: 'Labour dispute filings and hearing requests.' },
        { name: 'Tribunal de Commerce de Sfax', jurisdiction: 'Commercial – Sfax', available: false, desc: 'Commercial court e-filing — integration in progress.' },
        { name: 'Cour d\'Appel de Tunis', jurisdiction: 'Appeals – National', available: false, desc: 'Appellate court e-filing — planned for Q1 2027.' },
      ],
      filingTypes: ['Motions', 'Briefs', 'Petitions', 'Evidence Bundles', 'Expert Reports', 'Settlement Agreements', 'Judgments', 'Appeals', 'Summons', 'Counter-Claims'],
    };
  },
};
</script>
