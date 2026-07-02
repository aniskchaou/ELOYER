<template>
  <v-container fluid>
    <v-row>
      <!-- Left: Case Filter / Actions -->
      <v-col cols="12" md="3">
        <v-card class="pa-3">
          <v-card-title>Filter Cases</v-card-title>
          <v-divider></v-divider>
          <v-select
            v-model="selectedCase"
            :items="cases"
            label="Select Case"
            dense
            outlined
          ></v-select>

          <v-btn class="mt-3" color="primary" @click="addCaseDialog = true">
            Add Case Study
          </v-btn>
        </v-card>
      </v-col>

      <!-- Right: Case Study List -->
      <v-col cols="12" md="9">
        <v-card class="pa-3 mb-3">
          <v-card-title>
            Case Studies
            <span class="font-weight-bold ml-2">{{ selectedCase || 'All Cases' }}</span>
          </v-card-title>
          <v-divider></v-divider>

          <v-data-table
            :headers="headers"
            :items="filteredCaseStudies"
            item-key="id"
            class="elevation-1"
          >
            <template v-slot:item.actions="{ item }">
              <v-btn icon color="primary" @click="editCase(item)">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn icon color="red" @click="deleteCase(item.id)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
              <v-btn icon color="green" @click="viewDocuments(item)">
                <v-icon>mdi-file-document</v-icon>
              </v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Add / Edit Case Study Dialog -->
    <v-dialog v-model="addCaseDialog" max-width="600px">
      <v-card>
        <v-card-title>{{ editMode ? 'Edit Case Study' : 'Add Case Study' }}</v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <v-text-field v-model="newCase.title" label="Case Title"></v-text-field>
          <v-select
            v-model="newCase.assignedLawyer"
            :items="lawyers"
            label="Assigned Lawyer"
          ></v-select>
          <v-textarea v-model="newCase.summary" label="Case Summary"></v-textarea>
          <v-menu
            ref="menu"
            v-model="menu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="newCase.dueDate"
                label="Due Date"
                readonly
                v-bind="attrs"
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker v-model="newCase.dueDate" @input="menu = false"></v-date-picker>
          </v-menu>
          <v-file-input
            v-model="newCase.documents"
            label="Upload Documents"
            multiple
            show-size
          ></v-file-input>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="closeDialog">Cancel</v-btn>
          <v-btn color="primary" @click="saveCase">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      selectedCase: null,
      addCaseDialog: false,
      editMode: false,
      menu: false,
      newCase: {
        id: null,
        title: '',
        assignedLawyer: '',
        summary: '',
        dueDate: '',
        documents: [],
        caseName: ''
      },
      cases: ['Case A', 'Case B', 'Case C'],
      lawyers: ['Alice', 'Bob', 'Charlie'],
      caseStudies: [
        { id: 1, caseName: 'Case A', title: 'Contract Dispute', assignedLawyer: 'Alice', summary: 'Analysis of contract breach...', dueDate: '2025-09-20', documents: [] },
        { id: 2, caseName: 'Case B', title: 'Property Claim', assignedLawyer: 'Bob', summary: 'Review of property documents...', dueDate: '2025-09-25', documents: [] },
      ],
      headers: [
        { text: 'Case', value: 'caseName' },
        { text: 'Title', value: 'title' },
        { text: 'Assigned Lawyer', value: 'assignedLawyer' },
        { text: 'Due Date', value: 'dueDate' },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
    }
  },
  computed: {
    filteredCaseStudies() {
      if (!this.selectedCase) return this.caseStudies
      return this.caseStudies.filter(c => c.caseName === this.selectedCase)
    }
  },
  methods: {
    closeDialog() {
      this.addCaseDialog = false
      this.editMode = false
      this.newCase = { id: null, title: '', assignedLawyer: '', summary: '', dueDate: '', documents: [], caseName: '' }
    },
    saveCase() {
      if (this.editMode) {
        const index = this.caseStudies.findIndex(c => c.id === this.newCase.id)
        this.caseStudies.splice(index, 1, { ...this.newCase })
      } else {
        const id = this.caseStudies.length + 1
        this.caseStudies.push({ ...this.newCase, id })
      }
      this.closeDialog()
    },
    editCase(item) {
      this.editMode = true
      this.newCase = { ...item }
      this.addCaseDialog = true
    },
    deleteCase(id) {
      this.caseStudies = this.caseStudies.filter(c => c.id !== id)
    },
    viewDocuments(item) {
      alert(`Documents for ${item.title}: ${item.documents.length} files`)
    }
  }
}
</script>

<style scoped>
.v-data-table {
  cursor: pointer;
}
</style>
