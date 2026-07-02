<template>
  <v-container fluid>
    <v-row>
      <!-- Left: Filters -->
      <v-col cols="12" md="3">
        <v-card class="pa-3">
          <v-card-title>Filters</v-card-title>
          <v-divider></v-divider>

          <v-select
            v-model="selectedCase"
            :items="cases"
            label="Select Case"
            dense
            outlined
          ></v-select>

          <v-select
            v-model="selectedLawyer"
            :items="lawyers"
            label="Assigned Lawyer"
            dense
            outlined
            class="mt-3"
          ></v-select>

          <v-btn class="mt-3" color="primary" @click="analyzeCase">
            Analyze Case
          </v-btn>
        </v-card>
      </v-col>

      <!-- Right: Prediction Results -->
      <v-col cols="12" md="9">
        <v-card class="pa-3 mb-3">
          <v-card-title>
            Predictive Outcomes
            <span class="font-weight-bold ml-2">{{ selectedCase || 'All Cases' }}</span>
          </v-card-title>
          <v-divider></v-divider>

          <!-- Outcome Chart -->
          <v-row>
            <v-col cols="12" md="6">
              <v-card outlined class="pa-3">
                <v-card-title>Win / Lose Probability</v-card-title>
                <v-progress-circular
                  :value="outcome.winProbability"
                  size="100"
                  width="15"
                  color="green"
                >
                  {{ outcome.winProbability }}%
                </v-progress-circular>
                <v-progress-circular
                  :value="outcome.loseProbability"
                  size="100"
                  width="15"
                  color="red"
                  class="ml-3"
                >
                  {{ outcome.loseProbability }}%
                </v-progress-circular>
              </v-card>
            </v-col>

            <v-col cols="12" md="6">
              <v-card outlined class="pa-3">
                <v-card-title>Key Factors</v-card-title>
                <v-list>
                  <v-list-item v-for="factor in outcome.factors" :key="factor">
                    <v-list-item-content>
                      <v-list-item-title>{{ factor }}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-col>
          </v-row>

          <!-- Outcome Summary -->
          <v-card class="mt-4" outlined>
            <v-card-title>Outcome Summary</v-card-title>
            <v-card-text>{{ outcome.summary }}</v-card-text>
          </v-card>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      selectedCase: null,
      selectedLawyer: null,
      cases: ['Case A', 'Case B', 'Case C'],
      lawyers: ['Alice', 'Bob', 'Charlie'],
      outcome: {
        winProbability: 65,
        loseProbability: 35,
        factors: ['Strong evidence', 'Experienced lawyer', 'Favorable judge'],
        summary: 'Based on the selected case and lawyer, the probability of winning is high due to strong evidence and legal representation.'
      }
    }
  },
  methods: {
    analyzeCase() {
      // Stub: In a real app, this would call an API or ML model
      this.outcome = {
        winProbability: Math.floor(Math.random() * 50) + 50,
        loseProbability: 100 - (Math.floor(Math.random() * 50) + 50),
        factors: ['Strong evidence', 'Experienced lawyer', 'Favorable judge'],
        summary: 'Prediction updated. Factors considered: evidence, lawyer experience, judge history.'
      }
    }
  }
}
</script>

<style scoped>
.v-progress-circular {
  margin-bottom: 16px;
}
</style>
