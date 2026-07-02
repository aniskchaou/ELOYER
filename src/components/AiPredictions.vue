<template>
  <v-container>
    <h1 class="text-3xl font-bold mb-6">AI Predictions</h1>

    <!-- Insights Cards -->
    <v-row class="mb-6">
      <v-col cols="12" md="4">
        <v-card class="pa-4" outlined>
          <h2 class="text-xl font-semibold">Win Probability</h2>
          <p class="text-green-600 text-2xl font-bold">{{ winRate }}%</p>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="pa-4" outlined>
          <h2 class="text-xl font-semibold">Settlement Probability</h2>
          <p class="text-yellow-600 text-2xl font-bold">{{ settlementRate }}%</p>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="pa-4" outlined>
          <h2 class="text-xl font-semibold">Lose Probability</h2>
          <p class="text-red-600 text-2xl font-bold">{{ loseRate }}%</p>
        </v-card>
      </v-col>
    </v-row>

    <!-- Predictions Table -->
    <v-data-table
      :headers="headers"
      :items="predictions"
      class="elevation-1"
    >
      <template v-slot:item.outcome="{ item }">
        <v-chip :color="outcomeColor(item.outcome)" dark>{{ item.outcome }}</v-chip>
      </template>

      <template v-slot:item.confidence="{ item }">
        <v-progress-linear :value="item.confidence" height="10" :color="confidenceColor(item.confidence)" rounded></v-progress-linear>
      </template>

      <template v-slot:item.risk="{ item }">
        <v-chip :color="riskColor(item.risk)" dark>{{ item.risk }}</v-chip>
      </template>

      <template v-slot:item.actions="{ item }">
        <v-btn icon color="primary" @click="viewDetails(item.caseId)">
          <v-icon>mdi-eye</v-icon>
        </v-btn>
        <v-btn icon color="blue" @click="generateReport(item.caseId)">
          <v-icon>mdi-file-pdf</v-icon>
        </v-btn>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
export default {
  name: "AiPredictions",
  data() {
    return {
      winRate: 65,
      settlementRate: 20,
      loseRate: 15,
      headers: [
        { text: "Case ID", value: "caseId" },
        { text: "Client", value: "client" },
        { text: "Predicted Outcome", value: "outcome" },
        { text: "Confidence", value: "confidence" },
        { text: "Duration", value: "duration" },
        { text: "Predicted Cost", value: "cost" },
        { text: "Risk", value: "risk" },
        { text: "Actions", value: "actions", sortable: false },
      ],
      predictions: [
        { caseId: "C-101", client: "ABC Ltd", outcome: "Win", confidence: 78, duration: "6 months", cost: "$15,000", risk: "Low" },
        { caseId: "C-102", client: "Jane Smith", outcome: "Settlement", confidence: 65, duration: "3 months", cost: "$8,000", risk: "Medium" },
        { caseId: "C-103", client: "TechCorp", outcome: "Lose", confidence: 55, duration: "9 months", cost: "$25,000", risk: "High" },
      ],
    };
  },
  methods: {
    outcomeColor(outcome) {
      switch (outcome) {
        case "Win": return "green";
        case "Settlement": return "orange";
        case "Lose": return "red";
        default: return "grey";
      }
    },
    confidenceColor(value) {
      if (value >= 75) return "green";
      if (value >= 50) return "orange";
      return "red";
    },
    riskColor(risk) {
      switch (risk) {
        case "Low": return "green";
        case "Medium": return "orange";
        case "High": return "red";
        default: return "grey";
      }
    },
    viewDetails(caseId) {
      this.$router.push(`/cases/${caseId}/prediction`);
    },
    generateReport(caseId) {
      alert(`Generating AI Prediction Report for Case ${caseId}`);
    }
  }
};
</script>

<style scoped>
h1 {
  font-family: 'Poppins', sans-serif;
}
</style>
