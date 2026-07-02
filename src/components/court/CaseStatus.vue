<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Case Status Tracker</h1><p class="body-2 grey--text">Real-time status overview for all active court cases</p></v-col>
    </v-row>

    <v-card outlined class="mb-4 pa-3">
      <v-row>
        <v-col cols="12" md="3"><v-select v-model="filterStage" :items="stages" label="Stage" outlined dense clearable></v-select></v-col>
        <v-col cols="12" md="3"><v-select v-model="filterCourt" :items="courtNames" label="Court" outlined dense clearable></v-select></v-col>
        <v-col cols="12" md="4"><v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="Search cases" outlined dense></v-text-field></v-col>
      </v-row>
    </v-card>

    <v-row>
      <v-col v-for="c in filteredCases" :key="c.id" cols="12" md="6">
        <v-card outlined class="pa-4 mb-2">
          <div class="d-flex justify-space-between align-center mb-2">
            <span class="subtitle-2 font-weight-bold">{{ c.name }}</span>
            <v-chip small :color="stageColor(c.stage)" dark>{{ c.stage }}</v-chip>
          </div>
          <div class="d-flex mb-2">
            <v-chip x-small outlined class="mr-2">{{ c.court }}</v-chip>
            <v-chip x-small outlined class="mr-2">{{ c.type }}</v-chip>
          </div>
          <div class="caption grey--text mb-2">Judge: {{ c.judge }} · Next hearing: {{ c.nextHearing }}</div>
          <div class="overline mb-1">Progress</div>
          <v-stepper flat class="elevation-0 pa-0" style="background:transparent">
            <v-stepper-header style="box-shadow:none; flex-wrap:wrap; height:auto">
              <template v-for="(st, i) in allStages">
                <v-stepper-step :key="st" :complete="stageIndex(c.stage) > i" :step="i+1" :color="stageIndex(c.stage) === i ? 'primary' : 'grey'" small style="padding:4px 8px"><span class="caption">{{ st }}</span></v-stepper-step>
                <v-divider :key="'d'+i" v-if="i < allStages.length - 1"></v-divider>
              </template>
            </v-stepper-header>
          </v-stepper>
          <div class="mt-2 d-flex justify-end">
            <v-btn x-small text color="primary" @click="viewDetails(c)">View Details</v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="viewDialog" max-width="540px">
      <v-card v-if="selected">
        <v-card-title>{{ selected.name }}</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-row>
            <v-col cols="6"><strong>Court:</strong> {{ selected.court }}</v-col>
            <v-col cols="6"><strong>Type:</strong> {{ selected.type }}</v-col>
            <v-col cols="6"><strong>Stage:</strong> <v-chip small :color="stageColor(selected.stage)" dark>{{ selected.stage }}</v-chip></v-col>
            <v-col cols="6"><strong>Judge:</strong> {{ selected.judge }}</v-col>
            <v-col cols="6"><strong>Next Hearing:</strong> {{ selected.nextHearing }}</v-col>
            <v-col cols="6"><strong>Lawyer:</strong> {{ selected.lawyer }}</v-col>
            <v-col cols="12"><strong>Last Update:</strong> {{ selected.lastUpdate }}</v-col>
          </v-row>
          <v-timeline dense class="mt-3">
            <v-timeline-item v-for="e in selected.timeline" :key="e.date" small :color="e.current ? 'primary' : 'grey'">
              <div class="caption"><strong>{{ e.date }}</strong> – {{ e.event }}</div>
            </v-timeline-item>
          </v-timeline>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="viewDialog=false">Close</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script>
export default {
  name: 'CaseStatus',
  data() {
    return {
      search: '', filterStage: null, filterCourt: null, viewDialog: false, selected: null,
      stages: ['Filed', 'Under Review', 'Discovery', 'Trial', 'Verdict', 'Appeal', 'Closed'],
      allStages: ['Filed', 'Discovery', 'Trial', 'Verdict', 'Closed'],
      courtNames: ['Commercial Court – Tunis', 'Civil Court – Sousse', 'Criminal Court – Tunis'],
      cases: [
        { id: 1, name: 'Property Dispute – Ben Ali', court: 'Civil Court – Sousse', type: 'Civil', stage: 'Discovery', judge: 'Hon. Fatma Trabelsi', nextHearing: '2026-05-05', lawyer: 'Ahmed Cherni', lastUpdate: '2026-04-28', timeline: [{date:'2025-09-01',event:'Case filed',current:false},{date:'2026-01-15',event:'Documents submitted',current:false},{date:'2026-04-28',event:'Discovery phase started',current:true}] },
        { id: 2, name: 'Criminal Appeal – Smith', court: 'Criminal Court – Tunis', type: 'Criminal', stage: 'Appeal', judge: 'Hon. Samir Belhaj', nextHearing: '2026-05-12', lawyer: 'Karim Slim', lastUpdate: '2026-05-01', timeline: [{date:'2025-06-01',event:'Original verdict',current:false},{date:'2025-07-01',event:'Appeal filed',current:false},{date:'2026-05-01',event:'Appeal hearing scheduled',current:true}] },
        { id: 3, name: 'Corporate Merger – ABC Ltd', court: 'Commercial Court – Tunis', type: 'Commercial', stage: 'Verdict', judge: 'Hon. Mounir Ayari', nextHearing: 'N/A', lawyer: 'Ahmed Cherni', lastUpdate: '2026-04-20', timeline: [{date:'2025-10-01',event:'Complaint filed',current:false},{date:'2026-02-01',event:'Trial session',current:false},{date:'2026-04-20',event:'Verdict delivered',current:true}] },
      ],
    };
  },
  computed: {
    filteredCases() {
      let list = this.cases;
      if (this.filterStage) list = list.filter(c => c.stage === this.filterStage);
      if (this.filterCourt) list = list.filter(c => c.court === this.filterCourt);
      if (this.search) list = list.filter(c => c.name.toLowerCase().includes(this.search.toLowerCase()));
      return list;
    },
  },
  methods: {
    stageColor(s) { return { Filed: 'blue', 'Under Review': 'teal', Discovery: 'orange', Trial: 'purple', Verdict: 'green', Appeal: 'red', Closed: 'grey' }[s] || 'grey'; },
    stageIndex(s) { return this.allStages.indexOf(s); },
    viewDetails(c) { this.selected = c; this.viewDialog = true; },
  },
};
</script>
