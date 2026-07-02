<template>
  <v-container>
    <h1 class="text-3xl font-bold mb-6">Case Success Reports</h1>

    <!-- Summary Widgets -->
    <v-row class="mb-6">
      <v-col cols="12" md="3">
        <v-card class="pa-4" outlined>
          <h2 class="text-lg font-semibold">Cases Closed</h2>
          <p class="text-blue-600 text-2xl font-bold">{{ totalCases }}</p>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="pa-4" outlined>
          <h2 class="text-lg font-semibold">Cases Won</h2>
          <p class="text-green-600 text-2xl font-bold">{{ wonCases }}</p>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="pa-4" outlined>
          <h2 class="text-lg font-semibold">Cases Lost</h2>
          <p class="text-red-600 text-2xl font-bold">{{ lostCases }}</p>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="pa-4" outlined>
          <h2 class="text-lg font-semibold">Success Rate</h2>
          <p class="text-purple-600 text-2xl font-bold">{{ successRate }}%</p>
        </v-card>
      </v-col>
    </v-row>

    <!-- Charts -->
    <v-row class="mb-6">
      <v-col cols="12" md="6">
        <v-card class="pa-4" outlined>
          <h2 class="text-lg font-semibold mb-2">Case Outcomes</h2>
          <canvas id="outcomesChart"></canvas>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card class="pa-4" outlined>
          <h2 class="text-lg font-semibold mb-2">Success Rate Over Time</h2>
          <canvas id="successTrendChart"></canvas>
        </v-card>
      </v-col>
    </v-row>

    <!-- Table by Case Type -->
    <v-card outlined>
      <v-card-title>
        <span class="text-xl font-semibold">Case Success by Type</span>
      </v-card-title>
      <v-data-table :headers="headers" :items="caseStats" class="elevation-1">
        <template v-slot:item.successRate="{ item }">
          <v-chip :color="item.successRate >= 70 ? 'green' : 'orange'" dark>
            {{ item.successRate }}%
          </v-chip>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script>
import Chart from "chart.js/auto";

export default {
  name: "CaseSuccessReports",
  data() {
    return {
      totalCases: 120,
      wonCases: 85,
      lostCases: 25,
      settledCases: 10,
      headers: [
        { text: "Case Type", value: "type" },
        { text: "Cases Closed", value: "closed" },
        { text: "Won", value: "won" },
        { text: "Lost", value: "lost" },
        { text: "Settled", value: "settled" },
        { text: "Success Rate", value: "successRate" },
      ],
      caseStats: [
        { type: "Criminal", closed: 40, won: 28, lost: 10, settled: 2, successRate: 70 },
        { type: "Corporate", closed: 30, won: 24, lost: 4, settled: 2, successRate: 80 },
        { type: "Civil", closed: 25, won: 16, lost: 6, settled: 3, successRate: 64 },
        { type: "Intellectual Property", closed: 25, won: 17, lost: 5, settled: 3, successRate: 68 },
      ]
    };
  },
  computed: {
    successRate() {
      return ((this.wonCases / this.totalCases) * 100).toFixed(1);
    }
  },
  mounted() {
    this.renderOutcomesChart();
    this.renderSuccessTrendChart();
  },
  methods: {
    renderOutcomesChart() {
      const ctx = document.getElementById("outcomesChart");
      new Chart(ctx, {
        type: "pie",
        data: {
          labels: ["Won", "Lost", "Settled"],
          datasets: [
            {
              data: [this.wonCases, this.lostCases, this.settledCases],
              backgroundColor: ["#4CAF50", "#F44336", "#FFC107"]
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: "bottom" }
          }
        }
      });
    },
    renderSuccessTrendChart() {
      const ctx = document.getElementById("successTrendChart");
      new Chart(ctx, {
        type: "line",
        data: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"],
          datasets: [
            {
              label: "Success Rate %",
              data: [60, 65, 70, 68, 72, 75, 78, 80, parseFloat(this.successRate)],
              borderColor: "#8e24aa",
              backgroundColor: "rgba(142,36,170,0.1)",
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: { beginAtZero: true, max: 100 }
          }
        }
      });
    }
  }
};
</script>

<style scoped>
h1 {
  font-family: 'Poppins', sans-serif;
}
</style>
