<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">AI Legal Insights</h1><p class="body-2 grey--text">AI-powered analysis and predictions for your active cases</p></v-col>
      <v-col cols="auto"><v-btn color="primary" :loading="analyzing" @click="analyze"><v-icon left>mdi-brain</v-icon> Run Analysis</v-btn></v-col>
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

    <v-row>
      <v-col v-for="insight in insights" :key="insight.id" cols="12" md="6">
        <v-card outlined class="mb-3">
          <v-card-title class="subtitle-2 pb-1 d-flex align-center">
            <v-icon small :color="confidenceColor(insight.confidence)" class="mr-2">mdi-robot</v-icon>
            {{ insight.title }}
            <v-spacer></v-spacer>
            <v-chip x-small :color="confidenceColor(insight.confidence)" dark>{{ insight.confidence }}% confidence</v-chip>
          </v-card-title>
          <v-card-subtitle class="caption pb-0">
            <v-chip x-small class="mr-1" color="blue" dark>{{ insight.case }}</v-chip>
            <v-chip x-small class="mr-1" color="grey" dark>{{ insight.type }}</v-chip>
          </v-card-subtitle>
          <v-card-text class="caption pt-2">
            {{ insight.content }}
            <div class="mt-2">
              <strong>Related Precedents:</strong>
              <v-chip v-for="p in insight.precedents" :key="p" x-small class="ml-1 mt-1" outlined>{{ p }}</v-chip>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-btn x-small text color="primary">View Full Analysis</v-btn>
            <v-btn x-small text @click="dismiss(insight.id)">Dismiss</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
export default {
  name: 'AIInsights',
  data() {
    return {
      analyzing: false,
      stats: [
        { label: 'Insights Generated', value: 8, color: 'blue', icon: 'mdi-lightbulb' },
        { label: 'High Confidence', value: 5, color: 'green', icon: 'mdi-check-circle' },
        { label: 'Avg. Confidence', value: '76%', color: 'orange', icon: 'mdi-percent' },
        { label: 'Cases Analyzed', value: 6, color: 'purple', icon: 'mdi-briefcase' },
      ],
      insights: [
        { id: 1, title: 'Strong Precedent Match – Wrongful Termination', case: 'Property Dispute – Ben Ali', type: 'Strategy', confidence: 87, content: 'Three similar cases ruled in plaintiff\'s favor when employer failed to document procedural warnings. Evidence gaps in opponent\'s documentation increase win probability.', precedents: ['Ben Ali v. Nationale 2023', 'Hamdi Employment 2021'] },
        { id: 2, title: 'Digital Evidence Admissibility Risk', case: 'Criminal Appeal – Smith', type: 'Risk', confidence: 72, content: 'Court may challenge authenticity of digital bank records. Recommend obtaining certified copies and chain-of-custody documentation before next hearing.', precedents: ['State v. Hamdi 2022'] },
        { id: 3, title: 'Merger Agreement Clause 7.3 – Liability Exposure', case: 'Corporate Merger – ABC Ltd', type: 'Compliance', confidence: 91, content: 'Clause 7.3 as drafted may expose client to unlimited liability on warranty breaches. Recommend adding a liability cap equal to 12 months of contract value.', precedents: ['Commercial Code Art. 214'] },
        { id: 4, title: 'Settlement Favorable – Statistical Analysis', case: 'Property Dispute – Ben Ali', type: 'Prediction', confidence: 65, content: 'Based on 42 similar civil property cases, early settlement offers have a 68% acceptance rate. Client may benefit from initiating dialogue before Q3 hearing.', precedents: ['Statistical model: Civil Cases 2020-2024'] },
      ],
    };
  },
  methods: {
    confidenceColor(c) { return c >= 80 ? 'green' : c >= 60 ? 'orange' : 'red'; },
    analyze() { this.analyzing = true; setTimeout(() => { this.analyzing = false; }, 2000); },
    dismiss(id) { this.insights = this.insights.filter(i => i.id !== id); },
  },
};
</script>
