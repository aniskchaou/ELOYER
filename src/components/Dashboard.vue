<template>
  <v-container>
    <h1 class="text-3xl font-bold mb-6">Dashboard</h1>

    <!-- Summary Widgets -->
    <v-row class="mb-6">
      <v-col cols="12" md="3">
        <v-card class="pa-4" outlined>
          <h2 class="text-lg font-semibold">Active Cases</h2>
          <p class="text-blue-600 text-2xl font-bold">{{ activeCases }}</p>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="pa-4" outlined>
          <h2 class="text-lg font-semibold">Upcoming Hearings</h2>
          <p class="text-purple-600 text-2xl font-bold">{{ upcomingHearings }}</p>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="pa-4" outlined>
          <h2 class="text-lg font-semibold">Pending Tasks</h2>
          <p class="text-yellow-600 text-2xl font-bold">{{ pendingTasks }}</p>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="pa-4" outlined>
          <h2 class="text-lg font-semibold">Recent Payments</h2>
          <p class="text-green-600 text-2xl font-bold">${{ recentPayments }}</p>
        </v-card>
      </v-col>
    </v-row>

    <!-- Charts Section -->
    <v-row class="mb-6">
      <v-col cols="12" md="6">
        <v-card class="pa-4" outlined>
          <h2 class="text-lg font-semibold mb-2">Task Progress</h2>
          <canvas id="taskChart"></canvas>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card class="pa-4" outlined>
          <h2 class="text-lg font-semibold mb-2">Payment Trends</h2>
          <canvas id="paymentChart"></canvas>
        </v-card>
      </v-col>
    </v-row>

    <!-- Activity Feed -->
    <v-card outlined class="pa-4">
      <h2 class="text-lg font-semibold mb-3">Recent Activity</h2>
      <v-list dense>
        <v-list-item v-for="(activity, i) in activities" :key="i">
          <v-list-item-icon><v-icon>{{ activity.icon }}</v-icon></v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ activity.text }}</v-list-item-title>
            <v-list-item-subtitle>{{ activity.date }}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-card>
  </v-container>
</template>

<script>
import Chart from "chart.js/auto";

export default {
  name: "Dashboard",
  data() {
    return {
      activeCases: 24,
      upcomingHearings: 5,
      pendingTasks: 12,
      recentPayments: 8200,
      activities: [
        { icon: "mdi-gavel", text: "New case added: Corporate Merger", date: "Sep 15, 2025" },
        { icon: "mdi-cash", text: "Payment received from Jane Smith - $800", date: "Sep 14, 2025" },
        { icon: "mdi-clipboard-check", text: "Task completed: File Appeal Document", date: "Sep 14, 2025" },
        { icon: "mdi-calendar", text: "Hearing scheduled for TechCorp", date: "Sep 13, 2025" },
      ]
    };
  },
  mounted() {
    this.renderTaskChart();
    this.renderPaymentChart();
  },
  methods: {
    renderTaskChart() {
      const ctx = document.getElementById("taskChart");
      new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: ["Completed", "Pending", "Overdue"],
          datasets: [
            {
              data: [15, 8, 3],
              backgroundColor: ["#22c55e", "#facc15", "#ef4444"]
            }
          ]
        }
      });
    },
    renderPaymentChart() {
      const ctx = document.getElementById("paymentChart");
      new Chart(ctx, {
        type: "bar",
        data: {
          labels: ["May", "Jun", "Jul", "Aug", "Sep"],
          datasets: [
            {
              label: "Payments ($)",
              data: [5000, 7000, 6500, 9000, 8200],
              backgroundColor: "#3b82f6"
            }
          ]
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
