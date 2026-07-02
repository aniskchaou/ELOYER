<template>
  <v-container>
    <h1 class="text-3xl font-bold mb-6">Evidence</h1>

    <!-- Upload Evidence -->
    <v-btn color="primary" class="mb-4" @click="dialog = true">
      <v-icon left>mdi-upload</v-icon> Upload Evidence
    </v-btn>

    <!-- Search & Filter -->
    <v-row class="mb-4">
      <v-col cols="12" md="6">
        <v-text-field v-model="search" label="Search Evidence" prepend-inner-icon="mdi-magnify"></v-text-field>
      </v-col>
      <v-col cols="12" md="3">
        <v-select v-model="filterType" :items="types" label="Filter by Type"></v-select>
      </v-col>
    </v-row>

    <!-- Evidence Table -->
    <v-data-table
      :headers="headers"
      :items="filteredEvidence"
      :search="search"
      class="elevation-1"
    >
      <template v-slot:item.type="{ item }">
        <v-chip :color="typeColor(item.type)" dark>{{ item.type }}</v-chip>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-btn icon color="blue" @click="viewEvidence(item)">
          <v-icon>mdi-eye</v-icon>
        </v-btn>
        <v-btn icon color="red" @click="deleteEvidence(item.id)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-data-table>

    <!-- Upload Dialog -->
    <v-dialog v-model="dialog" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="text-xl font-bold">Upload Evidence</span>
        </v-card-title>
        <v-card-text>
          <v-text-field v-model="newEvidence.title" label="Title"></v-text-field>
          <v-select v-model="newEvidence.type" :items="types" label="Type"></v-select>
          <v-text-field v-model="newEvidence.caseId" label="Case ID"></v-text-field>
          <v-file-input v-model="newEvidence.file" label="Select File" prepend-icon="mdi-paperclip"></v-file-input>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="dialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="saveEvidence">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
export default {
  name: "Evidence",
  data() {
    return {
      dialog: false,
      search: "",
      filterType: null,
      types: ["Document", "Image", "Video", "Audio", "Witness Statement", "Forensic Report"],
      headers: [
        { text: "Title", value: "title" },
        { text: "Type", value: "type" },
        { text: "Case ID", value: "caseId" },
        { text: "Uploaded By", value: "uploadedBy" },
        { text: "Date", value: "date" },
        { text: "Actions", value: "actions", sortable: false },
      ],
      evidence: [
        { id: 1, title: "Signed Contract", type: "Document", caseId: "C-101", uploadedBy: "John Doe", date: "2025-09-10" },
        { id: 2, title: "Crime Scene Photo", type: "Image", caseId: "C-102", uploadedBy: "Emily Clark", date: "2025-09-12" },
        { id: 3, title: "Witness Testimony", type: "Witness Statement", caseId: "C-103", uploadedBy: "Michael Lee", date: "2025-09-14" },
      ],
      newEvidence: { title: "", type: "", caseId: "", file: null },
    };
  },
  computed: {
    filteredEvidence() {
      let data = this.evidence;
      if (this.filterType) {
        data = data.filter(e => e.type === this.filterType);
      }
      return data;
    }
  },
  methods: {
    typeColor(type) {
      switch (type) {
        case "Document": return "blue";
        case "Image": return "purple";
        case "Video": return "red";
        case "Audio": return "green";
        case "Witness Statement": return "orange";
        case "Forensic Report": return "grey";
        default: return "grey";
      }
    },
    viewEvidence(item) {
      alert(`Viewing evidence: ${item.title}`);
    },
    deleteEvidence(id) {
      this.evidence = this.evidence.filter(e => e.id !== id);
    },
    saveEvidence() {
      this.evidence.push({
        ...this.newEvidence,
        id: Date.now(),
        uploadedBy: "Current User", // Replace with actual user
        date: new Date().toISOString().slice(0, 10)
      });
      this.resetForm();
    },
    resetForm() {
      this.newEvidence = { title: "", type: "", caseId: "", file: null };
      this.dialog = false;
    }
  }
};
</script>

<style scoped>
h1 {
  font-family: 'Poppins', sans-serif;
}
</style>
