<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Case Law Search</h1><p class="body-2 grey--text">Search and bookmark relevant case law and judicial decisions</p></v-col>
    </v-row>

    <v-row class="mb-4">
      <v-col cols="12" md="8">
        <v-text-field v-model="search" append-icon="mdi-magnify" label="Search case law..." outlined dense hide-details @click:append="doSearch"></v-text-field>
      </v-col>
      <v-col cols="6" md="2">
        <v-select v-model="filterJurisdiction" :items="jurisdictions" label="Jurisdiction" outlined dense clearable hide-details></v-select>
      </v-col>
      <v-col cols="6" md="2">
        <v-select v-model="filterYear" :items="years" label="Year" outlined dense clearable hide-details></v-select>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="8">
        <div v-if="results.length === 0" class="text-center grey--text py-8">
          <v-icon large>mdi-gavel</v-icon><br>Search for case law above
        </div>
        <v-card v-for="r in results" :key="r.id" outlined class="mb-3">
          <v-card-title class="subtitle-1 pb-1">
            {{ r.title }}
            <v-spacer></v-spacer>
            <v-btn icon @click="toggleSave(r)"><v-icon :color="r.saved ? 'amber' : 'grey'">{{ r.saved ? 'mdi-bookmark' : 'mdi-bookmark-outline' }}</v-icon></v-btn>
          </v-card-title>
          <v-card-subtitle class="pb-1">
            <v-chip x-small class="mr-1" color="blue" dark>{{ r.jurisdiction }}</v-chip>
            <v-chip x-small class="mr-1" color="teal" dark>{{ r.year }}</v-chip>
            <v-chip x-small :color="r.type === 'Civil' ? 'green' : r.type === 'Criminal' ? 'red' : 'orange'" dark>{{ r.type }}</v-chip>
          </v-card-subtitle>
          <v-card-text class="py-1 caption">{{ r.summary }}</v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card outlined class="pa-3">
          <v-card-title class="subtitle-1">Saved Cases <v-badge :content="saved.length" inline color="blue" v-if="saved.length"></v-badge></v-card-title>
          <v-divider class="mb-2"></v-divider>
          <div v-if="saved.length === 0" class="caption grey--text text-center py-4">No saved cases yet</div>
          <div v-for="c in saved" :key="c.id" class="mb-2">
            <div class="caption font-weight-bold">{{ c.title }}</div>
            <v-chip x-small class="mr-1" color="blue" dark>{{ c.jurisdiction }}</v-chip>
            <v-chip x-small color="teal" dark>{{ c.year }}</v-chip>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
export default {
  name: 'CaseLaw',
  data() {
    return {
      search: '', filterJurisdiction: null, filterYear: null,
      jurisdictions: ['Tunis Court of Appeal', 'Sousse First Instance', 'Sfax Civil Court', 'Supreme Court'],
      years: ['2020', '2021', '2022', '2023', '2024', '2025'],
      allCases: [
        { id: 1, title: 'Ben Ali v. Société Nationale – Wrongful Termination', jurisdiction: 'Tunis Court of Appeal', year: '2023', type: 'Civil', summary: 'Upheld wrongful termination claim; employer failed to follow procedural dismissal requirements. Key precedent for employment contract disputes.', saved: false },
        { id: 2, title: 'State v. Hamdi – Criminal Fraud', jurisdiction: 'Sousse First Instance', year: '2022', type: 'Criminal', summary: 'Conviction for financial fraud upheld. Digital evidence from bank records deemed admissible. Sets precedent for cyber-financial cases.', saved: false },
        { id: 3, title: 'Mansour v. Construction Co. – Property Damage', jurisdiction: 'Sfax Civil Court', year: '2024', type: 'Civil', summary: 'Contractor held liable for structural damage resulting from negligent construction practices. Compensation awarded.', saved: false },
        { id: 4, title: 'State v. Karim – Administrative Abuse', jurisdiction: 'Supreme Court', year: '2021', type: 'Administrative', summary: 'Supreme Court ruling on limits of administrative discretion. Officials held personally liable for abuse of power.', saved: false },
      ],
    };
  },
  computed: {
    results() {
      let list = this.allCases;
      if (this.filterJurisdiction) list = list.filter(c => c.jurisdiction === this.filterJurisdiction);
      if (this.filterYear) list = list.filter(c => c.year === this.filterYear);
      if (this.search) list = list.filter(c => c.title.toLowerCase().includes(this.search.toLowerCase()) || c.summary.toLowerCase().includes(this.search.toLowerCase()));
      return list;
    },
    saved() { return this.allCases.filter(c => c.saved); },
  },
  methods: {
    doSearch() { /* filter is reactive */ },
    toggleSave(c) { c.saved = !c.saved; },
  },
};
</script>
