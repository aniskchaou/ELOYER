<template>
  <v-container fluid>
    <v-row>
      <!-- Left: Client Filters / Actions -->
      <v-col cols="12" md="3">
        <v-card class="pa-3">
          <v-card-title>Clients</v-card-title>
          <v-divider></v-divider>

          <v-select
            v-model="selectedCase"
            :items="cases"
            label="Filter by Case"
            dense
            outlined
          ></v-select>

          <v-btn class="mt-3" color="primary" @click="addClientDialog = true">
            Add Client
          </v-btn>
        </v-card>
      </v-col>

      <!-- Right: Client List & Documents -->
      <v-col cols="12" md="9">
        <v-card class="pa-3 mb-3">
          <v-card-title>
            Client List
            <span class="font-weight-bold ml-2">{{ selectedCase || 'All Cases' }}</span>
          </v-card-title>
          <v-divider></v-divider>

          <v-data-table
            :headers="headers"
            :items="filteredClients"
            item-key="id"
            class="elevation-1"
          >
            <template v-slot:item.actions="{ item }">
              <v-btn icon color="primary" @click="viewDocuments(item)">
                <v-icon>mdi-file-document</v-icon>
              </v-btn>
              <v-btn icon color="red" @click="deleteClient(item.id)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </template>
          </v-data-table>
        </v-card>

        <!-- Documents Panel -->
        <v-card v-if="selectedClient">
          <v-card-title>Documents for {{ selectedClient.name }}</v-card-title>
          <v-divider></v-divider>
          <v-file-input
            v-model="newDocuments"
            label="Upload Documents"
            multiple
            show-size
            prepend-icon="mdi-upload"
          ></v-file-input>
          <v-btn color="primary" class="mt-2" @click="uploadDocuments">Upload</v-btn>

          <v-list two-line>
            <v-list-item
              v-for="doc in selectedClient.documents"
              :key="doc.id"
            >
              <v-list-item-content>
                <v-list-item-title>{{ doc.name }}</v-list-item-title>
                <v-list-item-subtitle>{{ doc.size }} KB</v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-btn icon @click="downloadDocument(doc)">
                  <v-icon>mdi-download</v-icon>
                </v-btn>
                <v-btn icon color="red" @click="deleteDocument(doc.id)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <!-- Add Client Dialog -->
    <v-dialog v-model="addClientDialog" max-width="500px">
      <v-card>
        <v-card-title>Add Client</v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <v-text-field v-model="newClient.name" label="Client Name"></v-text-field>
          <v-text-field v-model="newClient.email" label="Email"></v-text-field>
          <v-text-field v-model="newClient.phone" label="Phone"></v-text-field>
          <v-select
            v-model="newClient.case"
            :items="cases"
            label="Assign Case"
          ></v-select>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="closeClientDialog">Cancel</v-btn>
          <v-btn color="primary" @click="saveClient">Save</v-btn>
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
      addClientDialog: false,
      selectedClient: null,
      newDocuments: [],
      newClient: {
        id: null,
        name: '',
        email: '',
        phone: '',
        case: '',
        documents: []
      },
      cases: ['Case A', 'Case B', 'Case C'],
      clients: [
        { id: 1, name: 'John Doe', email: 'john@example.com', phone: '123456789', case: 'Case A', documents: [] },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '987654321', case: 'Case B', documents: [] },
      ],
      headers: [
        { text: 'Name', value: 'name' },
        { text: 'Email', value: 'email' },
        { text: 'Phone', value: 'phone' },
        { text: 'Case', value: 'case' },
        { text: 'Actions', value: 'actions', sortable: false },
      ]
    }
  },
  computed: {
    filteredClients() {
      if (!this.selectedCase) return this.clients
      return this.clients.filter(c => c.case === this.selectedCase)
    }
  },
  methods: {
    closeClientDialog() {
      this.addClientDialog = false
      this.newClient = { id: null, name: '', email: '', phone: '', case: '', documents: [] }
    },
    saveClient() {
      const id = this.clients.length + 1
      this.clients.push({ ...this.newClient, id, documents: [] })
      this.closeClientDialog()
    },
    deleteClient(id) {
      if (this.selectedClient && this.selectedClient.id === id) this.selectedClient = null
      this.clients = this.clients.filter(c => c.id !== id)
    },
    viewDocuments(client) {
      this.selectedClient = client
    },
    uploadDocuments() {
      if (!this.selectedClient) return
      this.newDocuments.forEach((file, index) => {
        this.selectedClient.documents.push({
          id: this.selectedClient.documents.length + index + 1,
          name: file.name,
          size: Math.round(file.size / 1024)
        })
      })
      this.newDocuments = []
    },
    downloadDocument(doc) {
      alert(`Downloading ${doc.name}`)
    },
    deleteDocument(docId) {
      if (!this.selectedClient) return
      this.selectedClient.documents = this.selectedClient.documents.filter(d => d.id !== docId)
    }
  }
}
</script>

<style scoped>
.v-data-table {
  cursor: pointer;
}
</style>
