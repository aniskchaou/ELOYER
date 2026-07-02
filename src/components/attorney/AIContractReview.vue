<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">AI Contract Review</h1><p class="body-2 grey--text">Analyze contracts for risks, missing clauses and compliance issues</p></v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="5">
        <v-card outlined class="pa-4">
          <v-card-title class="subtitle-1 pb-2">Upload Contract</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-select v-model="contractType" :items="contractTypes" label="Contract Type" outlined dense class="mb-3"></v-select>
          <v-textarea v-model="contractText" label="Paste contract text" outlined rows="10" placeholder="Paste the full contract text here…"></v-textarea>
          <v-btn color="blue darken-2" dark block class="mt-3" :loading="analyzing" @click="analyze">
            <v-icon left>mdi-magnify-scan</v-icon>Analyze Contract
          </v-btn>
        </v-card>
      </v-col>

      <v-col cols="12" md="7">
        <v-skeleton-loader v-if="analyzing" type="card, list-item-three-line, list-item-three-line"></v-skeleton-loader>
        <template v-else-if="result">
          <!-- Risk Score -->
          <v-card outlined class="pa-4 mb-4">
            <div class="d-flex align-center">
              <div>
                <div class="overline grey--text">Overall Risk Score</div>
                <div class="text-h3 font-weight-bold" :class="riskColor(result.score) + '--text'">{{ result.score }}/10</div>
              </div>
              <v-spacer></v-spacer>
              <v-progress-circular :value="result.score * 10" :color="riskColor(result.score)" size="72" width="8">
                <span class="caption font-weight-bold">{{ riskLabel(result.score) }}</span>
              </v-progress-circular>
            </div>
          </v-card>

          <!-- Issues -->
          <v-card outlined class="pa-4 mb-4">
            <v-card-title class="subtitle-1 pb-2">Issues Found</v-card-title>
            <v-divider class="mb-3"></v-divider>
            <v-list dense>
              <v-list-item v-for="issue in result.issues" :key="issue.id">
                <v-list-item-icon><v-icon :color="severityColor(issue.severity)" small>{{ severityIcon(issue.severity) }}</v-icon></v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>{{ issue.title }}</v-list-item-title>
                  <v-list-item-subtitle>{{ issue.detail }}</v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action><v-chip x-small :color="severityColor(issue.severity)" dark>{{ issue.severity }}</v-chip></v-list-item-action>
              </v-list-item>
            </v-list>
          </v-card>

          <!-- Missing Clauses -->
          <v-card outlined class="pa-4">
            <v-card-title class="subtitle-1 pb-2">Missing / Recommended Clauses</v-card-title>
            <v-divider class="mb-3"></v-divider>
            <v-chip v-for="clause in result.missing" :key="clause" outlined class="mr-1 mb-1" color="orange">{{ clause }}</v-chip>
          </v-card>
        </template>
        <div v-else class="text-center grey--text mt-12">
          <v-icon x-large>mdi-file-search</v-icon>
          <p class="mt-2 body-2">Paste a contract and click Analyze to get an AI-powered risk assessment.</p>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
export default {
  name: 'AIContractReview',
  data() {
    return {
      contractType: 'service', contractText: '', analyzing: false, result: null,
      contractTypes: ['service', 'employment', 'sale', 'lease', 'nda', 'partnership', 'loan'],
    };
  },
  methods: {
    analyze() {
      if (!this.contractText.trim()) return;
      this.analyzing = true;
      setTimeout(() => {
        this.result = {
          score: 6,
          issues: [
            { id: 1, title: 'Missing termination notice period', detail: 'Contract does not specify required notice before termination.', severity: 'high' },
            { id: 2, title: 'Ambiguous payment terms', detail: 'Payment schedule references "reasonable time" without definition.', severity: 'medium' },
            { id: 3, title: 'No dispute resolution clause', detail: 'Contract lacks arbitration or mediation clause.', severity: 'medium' },
            { id: 4, title: 'Intellectual property ownership unclear', detail: 'IP clause does not specify who retains ownership of deliverables.', severity: 'high' },
            { id: 5, title: 'No force majeure clause', detail: 'Contract does not address circumstances beyond parties\' control.', severity: 'low' },
          ],
          missing: ['Governing Law', 'Data Protection (GDPR)', 'Confidentiality', 'Limitation of Liability', 'Non-Solicitation'],
        };
        this.analyzing = false;
      }, 2000);
    },
    riskColor(s) { return s >= 7 ? 'error' : s >= 4 ? 'orange' : 'success'; },
    riskLabel(s) { return s >= 7 ? 'HIGH' : s >= 4 ? 'MED' : 'LOW'; },
    severityColor(s) { return s === 'high' ? 'error' : s === 'medium' ? 'warning' : 'success'; },
    severityIcon(s) { return s === 'high' ? 'mdi-alert-circle' : s === 'medium' ? 'mdi-alert' : 'mdi-information'; },
  },
};
</script>
