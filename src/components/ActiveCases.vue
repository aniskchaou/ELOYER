<template>
  <v-container>
    <h1 class="text-3xl font-bold mb-6">Active Cases</h1>
    <!-- Search & Filters -->
    <v-row class="mb-4">
      <v-col cols="12" md="6">
        <v-text-field v-model="search" label="Search by Client or Case ID" prepend-inner-icon="mdi-magnify"></v-text-field>
      </v-col>
      <v-col cols="12" md="3">
        <v-select v-model="filterStatus" :items="statuses" label="Filter by Status"></v-select>
      </v-col>
    </v-row>
    <!-- Active Cases Table -->
    <v-data-table
      :headers="headers"
      :items="filteredCases"
      :search="search"
      class="elevation-1"
    >
      <template v-slot:item.status="{ item }">
        <v-chip :color="statusColor(item.status)" dark>{{ item.status }}</v-chip>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-btn icon color="primary" @click="viewCase(item.id)">
          <v-icon>mdi-eye</v-icon>
        </v-btn>
        <v-btn icon color="secondary" @click="editCase(item.id)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
export default {
  name: "ActiveCases",
  data() {
    return {
      search: "",
      filterStatus: null,
      statuses: ["In Progress", "Pending Hearing", "Awaiting Docs"],
      headers: [
        { text: "Case ID", value: "id" },
        { text: "Case Name", value: "name" },
        { text: "Client", value: "client" },
        { text: "Type", value: "type" },
        { text: "Next Hearing", value: "hearing" },
        { text: "Assigned Lawyer", value: "lawyer" },
        { text: "Status", value: "status" },
        { text: "Actions", value: "actions", sortable: false },
      ],
      cases: [
        { id: "C-101", name: "Corporate Merger", client: "ABC Ltd", type: "Corporate", hearing: "2025-10-01", lawyer: "John Doe", status: "In Progress" },
        { id: "C-102", name: "Criminal Appeal", client: "Jane Smith", type: "Criminal", hearing: "2025-09-25", lawyer: "Emily Clark", status: "Pending Hearing" },
        { id: "C-103", name: "IP Dispute", client: "TechCorp", type: "Intellectual Property", hearing: "2025-10-10", lawyer: "Michael Lee", status: "Awaiting Docs" },
      ],
    };
  },
  computed: {
    filteredCases() {
      if (!this.filterStatus) return this.cases;
      return this.cases.filter(c => c.status === this.filterStatus);
    }
  },
  methods: {
    statusColor(status) {
      switch (status) {
        case "In Progress": return "green";
        case "Pending Hearing": return "orange";
        case "Awaiting Docs": return "red";
        default: return "grey";
      }
    },
    viewCase(id) {
      this.$router.push(`/cases/${id}`);
    },
    editCase(id) {
      this.$router.push(`/cases/${id}/edit`);
    }
  }
};
</script>

<style scoped>
h1 {
  font-family: 'Poppins', sans-serif;
}
</style>
