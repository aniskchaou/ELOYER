<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col>
        <h1 class="text-h5 font-weight-bold">AI Case Strategy</h1>
        <p class="body-2 grey--text">AI-powered strategy recommendations and risk assessments</p>
      </v-col>
    </v-row>

    <!-- Case selector & analyze -->
    <v-card class="mb-5 pa-4" outlined>
      <v-row align="center">
        <v-col cols="12" md="5">
          <v-select v-model="selectedCase" :items="cases" item-text="name" item-value="id"
            label="Select Case" outlined dense return-object></v-select>
        </v-col>
        <v-col cols="12" md="3">
          <v-btn color="primary" :loading="analyzing" @click="analyze" block>
            <v-icon left>mdi-brain</v-icon> Analyze
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <template v-if="result">
      <!-- Risk Score -->
      <v-row class="mb-4">
        <v-col cols="12" md="3">
          <v-card outlined class="pa-4 text-center">
            <div class="overline">Win Probability</div>
            <v-progress-circular :value="result.winProb" size="80" width="8" color="green">
              <span class="font-weight-bold">{{ result.winProb }}%</span>
            </v-progress-circular>
          </v-card>
        </v-col>
        <v-col cols="12" md="3">
          <v-card outlined class="pa-4 text-center">
            <div class="overline">Settlement Probability</div>
            <v-progress-circular :value="result.settlementProb" size="80" width="8" color="orange">
              <span class="font-weight-bold">{{ result.settlementProb }}%</span>
            </v-progress-circular>
          </v-card>
        </v-col>
        <v-col cols="12" md="3">
          <v-card outlined class="pa-4 text-center">
            <div class="overline">Risk Level</div>
            <v-chip large :color="riskColor(result.risk)" dark class="mt-3">{{ result.risk }}</v-chip>
          </v-card>
        </v-col>
        <v-col cols="12" md="3">
          <v-card outlined class="pa-4 text-center">
            <div class="overline">Est. Duration</div>
            <p class="text-h6 mt-3 font-weight-bold">{{ result.duration }}</p>
          </v-card>
        </v-col>
      </v-row>

      <!-- Strategy Recommendations -->
      <v-card outlined class="mb-4">
        <v-card-title><v-icon left color="primary">mdi-lightbulb</v-icon> Strategy Recommendations</v-card-title>
        <v-divider></v-divider>
        <v-list>
          <v-list-item v-for="(rec, i) in result.recommendations" :key="i">
            <v-list-item-icon><v-icon color="primary">mdi-check-circle</v-icon></v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>{{ rec.title }}</v-list-item-title>
              <v-list-item-subtitle>{{ rec.detail }}</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-chip small :color="priorityColor(rec.priority)">{{ rec.priority }}</v-chip>
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </v-card>

      <!-- Precedent Cases -->
      <v-card outlined class="mb-4">
        <v-card-title><v-icon left color="teal">mdi-gavel</v-icon> Similar Precedent Cases</v-card-title>
        <v-divider></v-divider>
        <v-data-table :headers="precedentHeaders" :items="result.precedents" class="elevation-0">
          <template v-slot:item.outcome="{ item }">
            <v-chip small :color="item.outcome === 'Won' ? 'green' : 'red'" dark>{{ item.outcome }}</v-chip>
          </template>
        </v-data-table>
      </v-card>

      <!-- Key Risks -->
      <v-card outlined>
        <v-card-title><v-icon left color="red">mdi-alert</v-icon> Key Risks</v-card-title>
        <v-divider></v-divider>
        <v-list>
          <v-list-item v-for="(risk, i) in result.risks" :key="i">
            <v-list-item-icon><v-icon :color="riskColor(risk.level)">mdi-alert-circle</v-icon></v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>{{ risk.title }}</v-list-item-title>
              <v-list-item-subtitle>{{ risk.mitigation }}</v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-chip small :color="riskColor(risk.level)" dark>{{ risk.level }}</v-chip>
            </v-list-item-action>
          </v-list-item>
        </v-list>
      </v-card>
    </template>

    <v-card v-else outlined class="pa-12 text-center">
      <v-icon size="64" color="grey lighten-2">mdi-brain</v-icon>
      <p class="mt-4 grey--text">Select a case and click Analyze to get AI strategy recommendations.</p>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: 'AIStrategy',
  data() {
    return {
      selectedCase: null,
      analyzing: false,
      result: null,
      cases: [
        { id: 1, name: 'Corporate Merger – ABC Ltd', type: 'Corporate' },
        { id: 2, name: 'Criminal Appeal – Jane Smith', type: 'Criminal' },
        { id: 3, name: 'IP Dispute – TechCorp', type: 'IP' },
      ],
      precedentHeaders: [
        { text: 'Case Name', value: 'name' },
        { text: 'Court', value: 'court' },
        { text: 'Year', value: 'year' },
        { text: 'Outcome', value: 'outcome' },
        { text: 'Similarity', value: 'similarity' },
      ],
    };
  },
  methods: {
    analyze() {
      if (!this.selectedCase) return;
      this.analyzing = true;
      setTimeout(() => {
        this.result = {
          winProb: 72,
          settlementProb: 18,
          risk: 'Medium',
          duration: '7 months',
          recommendations: [
            { title: 'File for Summary Judgment', detail: 'Strong documentary evidence supports early dismissal.', priority: 'High' },
            { title: 'Request Expert Testimony', detail: 'Technical complexity requires an expert witness.', priority: 'High' },
            { title: 'Explore Settlement', detail: 'Opposing counsel has shown openness to negotiation.', priority: 'Medium' },
            { title: 'Gather Additional Documents', detail: 'Missing exhibit C may weaken the claim.', priority: 'Low' },
          ],
          precedents: [
            { name: 'Smith v. Jones Corp', court: 'High Court', year: 2022, outcome: 'Won', similarity: '87%' },
            { name: 'TechStart v. MegaCorp', court: 'District Court', year: 2021, outcome: 'Won', similarity: '74%' },
            { name: 'Alpha Ltd v. Beta Inc', court: 'Supreme Court', year: 2020, outcome: 'Lost', similarity: '61%' },
          ],
          risks: [
            { title: 'Key witness unavailability', level: 'High', mitigation: 'Obtain affidavit before trial date.' },
            { title: 'Document authentication issues', level: 'Medium', mitigation: 'Certify all digital evidence via notary.' },
            { title: 'Jurisdictional challenge', level: 'Low', mitigation: 'File motion to confirm jurisdiction early.' },
          ],
        };
        this.analyzing = false;
      }, 1200);
    },
    riskColor(level) {
      return { High: 'red', Medium: 'orange', Low: 'green' }[level] || 'grey';
    },
    priorityColor(p) {
      return { High: 'red', Medium: 'orange', Low: 'blue' }[p] || 'grey';
    },
  },
};
</script>
