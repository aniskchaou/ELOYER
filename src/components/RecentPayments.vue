<template>
  <v-container>
    <h1 class="text-3xl font-bold mb-6">Recent Payments</h1>

    <!-- Summary Cards -->
    <v-row class="mb-6">
      <v-col cols="12" md="3">
        <v-card class="pa-4" outlined>
          <h2 class="text-xl font-semibold">Total This Month</h2>
          <p class="text-green-600 text-2xl font-bold">${{ totalThisMonth }}</p>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="pa-4" outlined>
          <h2 class="text-xl font-semibold">Pending</h2>
          <p class="text-yellow-600 text-2xl font-bold">${{ pendingAmount }}</p>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="pa-4" outlined>
          <h2 class="text-xl font-semibold">Refunded</h2>
          <p class="text-red-600 text-2xl font-bold">${{ refundedAmount }}</p>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="pa-4" outlined>
          <h2 class="text-xl font-semibold">Avg Payment</h2>
          <p class="text-blue-600 text-2xl font-bold">${{ avgPayment }}</p>
        </v-card>
      </v-col>
    </v-row>

    <!-- Search & Filters -->
    <v-row class="mb-4">
      <v-col cols="12" md="6">
        <v-text-field v-model="search" label="Search by Client or Case" prepend-inner-icon="mdi-magnify"></v-text-field>
      </v-col>
      <v-col cols="12" md="3">
        <v-select v-model="statusFilter" :items="statusOptions" label="Filter by Status"></v-select>
      </v-col>
    </v-row>

    <!-- Payments Table -->
    <v-data-table
      :headers="headers"
      :items="filteredPayments"
      :search="search"
      class="elevation-1"
    >
      <template v-slot:item.status="{ item }">
        <v-chip :color="statusColor(item.status)" dark>{{ item.status }}</v-chip>
      </template>

      <template v-slot:item.actions="{ item }">
        <v-btn icon color="primary" @click="viewInvoice(item.invoiceId)">
          <v-icon>mdi-file-document</v-icon>
        </v-btn>
        <v-btn icon color="green" @click="downloadReceipt(item.id)">
          <v-icon>mdi-download</v-icon>
        </v-btn>
      </template>
    </v-data-table>
  </v-container>
</template>

<script>
export default {
  name: "RecentPayments",
  data() {
    return {
      search: "",
      statusFilter: null,
      statusOptions: ["Completed", "Pending", "Failed", "Refunded"],
      headers: [
        { text: "Payment ID", value: "id" },
        { text: "Invoice ID", value: "invoiceId" },
        { text: "Client", value: "client" },
        { text: "Case ID", value: "caseId" },
        { text: "Amount", value: "amount" },
        { text: "Method", value: "method" },
        { text: "Date", value: "date" },
        { text: "Status", value: "status" },
        { text: "Actions", value: "actions", sortable: false },
      ],
      payments: [
        { id: "P-1001", invoiceId: "INV-5001", client: "ABC Ltd", caseId: "C-101", amount: 1500, method: "Bank Transfer", date: "2025-09-12", status: "Completed" },
        { id: "P-1002", invoiceId: "INV-5002", client: "Jane Smith", caseId: "C-102", amount: 800, method: "Credit Card", date: "2025-09-14", status: "Pending" },
        { id: "P-1003", invoiceId: "INV-5003", client: "TechCorp", caseId: "C-103", amount: 2200, method: "PayPal", date: "2025-09-15", status: "Refunded" },
      ],
    };
  },
  computed: {
    filteredPayments() {
      if (!this.statusFilter) return this.payments;
      return this.payments.filter(p => p.status === this.statusFilter);
    },
    totalThisMonth() {
      return this.payments
        .filter(p => new Date(p.date).getMonth() === new Date().getMonth())
        .reduce((sum, p) => sum + p.amount, 0);
    },
    pendingAmount() {
      return this.payments
        .filter(p => p.status === "Pending")
        .reduce((sum, p) => sum + p.amount, 0);
    },
    refundedAmount() {
      return this.payments
        .filter(p => p.status === "Refunded")
        .reduce((sum, p) => sum + p.amount, 0);
    },
    avgPayment() {
      return (this.payments.reduce((sum, p) => sum + p.amount, 0) / this.payments.length).toFixed(2);
    }
  },
  methods: {
    statusColor(status) {
      switch (status) {
        case "Completed": return "green";
        case "Pending": return "orange";
        case "Refunded": return "red";
        case "Failed": return "grey";
        default: return "blue";
      }
    },
    viewInvoice(invoiceId) {
      this.$router.push(`/billing/invoices/${invoiceId}`);
    },
    downloadReceipt(paymentId) {
      alert(`Downloading receipt for Payment ID: ${paymentId}`);
    }
  }
};
</script>

<style scoped>
h1 {
  font-family: 'Poppins', sans-serif;
}
</style>
