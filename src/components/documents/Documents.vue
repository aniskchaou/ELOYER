<template>
  <v-container fluid>
    <v-row>
      <!-- Left: Document Filters / Actions -->
      <v-col cols="12" md="3">
        <v-card class="pa-3">
          <v-card-title>Documents</v-card-title>
          <v-divider></v-divider>

          <v-select
            v-model="selectedCase"
            :items="cases"
            label="Filter by Case"
            dense
            outlined
          ></v-select>

          <v-btn class="mt-3" color="primary" @click="addDocumentDialog = true">
            Add Document
          </v-btn>
        </v-card>
      </v-col>

      <!-- Right: Document List -->
      <v-col cols="12" md="9">
        <v-card class="pa-3 mb-3">
          <v-card-title>
            Document List
            <span class="font-weight-bold ml-2">{{ selectedCase || 'All Cases' }}</span>
          </v-card-title>
          <v-divider></v-divider>

          <v-data-table
            :headers="headers"
            :items="filteredDocuments"
            item-key="id"
            class="elevation-1"
          >
            <template v-slot:item.actions="{ item }">
              <v-btn icon @click="downloadDocument(item)">
                <v-icon>mdi-download</v-icon>
              </v-btn>
              <v-btn icon color="red" @click="deleteDocument(item.id)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Add Document Dialog -->
    <v-dialog v-model="addDocumentDialog" max-width="500px">
      <v-card>
        <v-card-title>Add Document</v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <v-text-field v-model="newDocument.name" label="Document Name"></v-text-field>
          <v-file-input
            v-model="newDocument.file"
            label="Select File"
            show-size
            prepend-icon="mdi-upload"
          ></v-file-input>
          <v-select
            v-model="newDocument.case"
            :items="cases"
            label="Assign Case"
          ></v-select>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="closeDocumentDialog">Cancel</v-btn>
          <v-btn color="primary" @click="saveDocument">Save</v-btn>
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
      addDocumentDialog: false,
      newDocument: {
        id: null,
        name: '',
        file: null,
        case: ''
      },
      cases: ['Case A', 'Case B', 'Case C'],
      documents: [
        { id: 1, name: 'Contract.pdf', size: 120, case: 'Case A' },
        { id: 2, name: 'Evidence.docx', size: 80, case: 'Case B' },
      ],
      headers: [
        { text: 'Name', value: 'name' },
        { text: 'Size (KB)', value: 'size' },
        { text: 'Case', value: 'case' },
        { text: 'Actions', value: 'actions', sortable: false },
      ]
    }
  },
  computed: {
    filteredDocuments() {
      if (!this.selectedCase) return this.documents
      return this.documents.filter(d => d.case === this.selectedCase)
    }
  },
  methods: {
    closeDocumentDialog() {
      this.addDocumentDialog = false
      this.newDocument = { id: null, name: '', file: null, case: '' }
    },
    saveDocument() {
      const id = this.documents.length + 1
      const size = this.newDocument.file ? Math.round(this.newDocument.file.size / 1024) : 0
      this.documents.push({ ...this.newDocument, id, size })
      this.closeDocumentDialog()
    },
    downloadDocument(doc) {
      alert(`Downloading ${doc.name}`)
    },
    deleteDocument(id) {
      this.documents = this.documents.filter(d => d.id !== id)
    }
  }
}
</script>

<style scoped>
.v-data-table {
  cursor: pointer;
}
</style>
