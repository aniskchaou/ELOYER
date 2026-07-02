<template>
  <v-container>
    <h1 class="text-3xl font-bold mb-6">Upcoming Hearings</h1>
    <!-- Search & Filters -->
    <v-row class="mb-4">
      <v-col cols="12" md="6">
        <v-text-field v-model="search" label="Search by Case or Client" prepend-inner-icon="mdi-magnify"></v-text-field>
      </v-col>
      <v-col cols="12" md="3">
        <v-select v-model="filterRange" :items="dateRanges" label="Filter by Date"></v-select>
      </v-col>
    </v-row>
    <!-- Hearings Table -->
    <v-data-table
      :headers="headers"
      :items="filteredHearings"
      :search="search"
      class="elevation-1"
    >
      <template v-slot:item.date="{ item }">
        <span :class="isUpcomingSoon(item.date) ? 'text-red-600 font-bold' : ''">
          {{ item.date }}
        </span>
      </template>
      <template v-slot:item.status="{ item }">
        <v-chip :color="statusColor(item.status)" dark>{{ item.status }}</v-chip>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-btn icon color="primary" @click="viewCase(item.caseId)">
          <v-icon>mdi-eye</v-icon>
        </v-btn>
        <v-btn icon color="secondary" @click="reschedule(item.id)">
          <v-icon>mdi-calendar-edit</v-icon>
        </v-btn>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
export default {
  name: "UpcomingHearings",
  data() {
    return {
      search: "",
      filterRange: null,
      dateRanges: ["This Week", "This Month", "Next 3 Months"],
      headers: [
        { text: "Case ID", value: "caseId" },
        { text: "Case Name", value: "caseName" },
        { text: "Client", value: "client" },
        { text: "Court", value: "court" },
        { text: "Date & Time", value: "date" },
        { text: "Lawyer", value: "lawyer" },
        { text: "Status", value: "status" },
        { text: "Actions", value: "actions", sortable: false },
      ],
      hearings: [
        { id: 1, caseId: "C-101", caseName: "Corporate Merger", client: "ABC Ltd", court: "High Court", date: "2025-09-20 10:00 AM", lawyer: "John Doe", status: "Scheduled" },
        { id: 2, caseId: "C-102", caseName: "Criminal Appeal", client: "Jane Smith", court: "Supreme Court", date: "2025-09-18 02:00 PM", lawyer: "Emily Clark", status: "Scheduled" },
        { id: 3, caseId: "C-103", caseName: "IP Dispute", client: "TechCorp", court: "District Court", date: "2025-10-05 11:00 AM", lawyer: "Michael Lee", status: "Rescheduled" },
      ],
    };
  },
  computed: {
    filteredHearings() {
      if (!this.filterRange) return this.hearings;
      const now = new Date();
      return this.hearings.filter(h => {
        const hearingDate = new Date(h.date);
        if (this.filterRange === "This Week") {
          const weekAhead = new Date();
          weekAhead.setDate(now.getDate() + 7);
          return hearingDate <= weekAhead;
        }
        if (this.filterRange === "This Month") {
          return hearingDate.getMonth() === now.getMonth();
        }
        if (this.filterRange === "Next 3 Months") {
          const threeMonthsAhead = new Date();
          threeMonthsAhead.setMonth(now.getMonth() + 3);
          return hearingDate <= threeMonthsAhead;
        }
        return true;
      });
    }
  },
  methods: {
    isUpcomingSoon(date) {
      const hearingDate = new Date(date);
      const today = new Date();
      const diffDays = (hearingDate - today) / (1000 * 60 * 60 * 24);
      return diffDays <= 7 && diffDays >= 0;
    },
    statusColor(status) {
      switch (status) {
        case "Scheduled": return "green";
        case "Rescheduled": return "orange";
        case "Completed": return "blue";
        default: return "grey";
      }
    },
    viewCase(caseId) {
      this.$router.push(`/cases/${caseId}`);
    },
    reschedule(id) {
      alert(`Reschedule hearing ID: ${id}`);
    }
  }
};
</script>

<style scoped>
h1 {
  font-family: 'Poppins', sans-serif;
}
</style>
