<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col>
        <h1 class="text-h5 font-weight-bold">Evidence Attachments</h1>
      </v-col>
      <v-col cols="auto">
        <v-btn color="primary" @click="dialog = true">
          <v-icon left>mdi-upload</v-icon> Upload Evidence
        </v-btn>
      </v-col>
    </v-row>

    <!-- Filters -->
    <v-card class="mb-4 pa-4" outlined>
      <v-row>
        <v-col cols="12" md="3">
          <v-select v-model="filterCase" :items="cases" label="Filter by Case" outlined dense clearable></v-select>
        </v-col>
        <v-col cols="12" md="3">
          <v-select v-model="filterType" :items="mediaTypes" label="Filter by Type" outlined dense clearable></v-select>
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="Search" outlined dense></v-text-field>
        </v-col>
        <v-col cols="12" md="2">
          <v-btn-toggle v-model="viewMode" mandatory dense>
            <v-btn value="table"><v-icon>mdi-view-list</v-icon></v-btn>
            <v-btn value="grid"><v-icon>mdi-view-grid</v-icon></v-btn>
          </v-btn-toggle>
        </v-col>
      </v-row>
    </v-card>

    <!-- Grid view -->
    <v-row v-if="viewMode === 'grid'">
      <v-col v-for="item in filteredEvidence" :key="item.id" cols="12" sm="6" md="3">
        <v-card outlined class="pa-2">
          <v-img v-if="item.type === 'Image'" :src="item.thumbnail" height="140" class="rounded"></v-img>
          <div v-else class="d-flex align-center justify-center" style="height:140px;background:#f5f5f5;border-radius:4px">
            <v-icon size="48" :color="typeColor(item.type)">{{ typeIcon(item.type) }}</v-icon>
          </div>
          <v-card-subtitle class="pa-1 text-truncate font-weight-medium">{{ item.name }}</v-card-subtitle>
          <v-card-text class="pa-1">
            <v-chip x-small :color="typeColor(item.type)" dark>{{ item.type }}</v-chip>
            <span class="ml-2 caption grey--text">{{ item.caseId }}</span>
          </v-card-text>
          <v-card-actions class="pa-1">
            <v-btn x-small icon color="blue" @click="preview(item)"><v-icon small>mdi-eye</v-icon></v-btn>
            <v-btn x-small icon color="green" @click="download(item)"><v-icon small>mdi-download</v-icon></v-btn>
            <v-btn x-small icon color="red" @click="remove(item.id)"><v-icon small>mdi-delete</v-icon></v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Table view -->
    <v-card v-else outlined>
      <v-data-table :headers="headers" :items="filteredEvidence" :search="search" class="elevation-0">
        <template v-slot:item.type="{ item }">
          <v-chip small :color="typeColor(item.type)" dark>
            <v-icon small left>{{ typeIcon(item.type) }}</v-icon>{{ item.type }}
          </v-chip>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn icon small color="blue" @click="preview(item)"><v-icon small>mdi-eye</v-icon></v-btn>
          <v-btn icon small color="green" @click="download(item)"><v-icon small>mdi-download</v-icon></v-btn>
          <v-btn icon small color="red" @click="remove(item.id)"><v-icon small>mdi-delete</v-icon></v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Upload dialog -->
    <v-dialog v-model="dialog" max-width="520px">
      <v-card>
        <v-card-title>Upload Evidence</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-select v-model="form.caseId" :items="cases" label="Case" outlined dense></v-select>
          <v-text-field v-model="form.name" label="Evidence Title" outlined dense class="mt-3"></v-text-field>
          <v-select v-model="form.type" :items="mediaTypes" label="Type" outlined dense class="mt-3"></v-select>
          <v-file-input v-model="form.file" label="Select File" outlined dense prepend-icon="mdi-paperclip" class="mt-3"></v-file-input>
          <v-textarea v-model="form.description" label="Description" outlined rows="3" class="mt-3"></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="dialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="saveEvidence">Upload</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Preview dialog -->
    <v-dialog v-model="previewDialog" max-width="640px">
      <v-card v-if="previewItem">
        <v-card-title>{{ previewItem.name }}
          <v-spacer></v-spacer>
          <v-btn icon @click="previewDialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="text-center pa-6">
          <v-icon size="80" :color="typeColor(previewItem.type)">{{ typeIcon(previewItem.type) }}</v-icon>
          <p class="mt-4">{{ previewItem.description }}</p>
          <p class="caption grey--text">Uploaded by {{ previewItem.uploadedBy }} on {{ previewItem.date }}</p>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
export default {
  name: 'EvidenceAttachments',
  data() {
    return {
      dialog: false,
      previewDialog: false,
      previewItem: null,
      viewMode: 'table',
      search: '',
      filterCase: null,
      filterType: null,
      cases: ['C-101: Corporate Merger', 'C-102: Criminal Appeal', 'C-103: IP Dispute'],
      mediaTypes: ['Document', 'Image', 'Video', 'Audio', 'Forensic Report', 'Witness Statement'],
      form: { caseId: null, name: '', type: '', file: null, description: '' },
      evidence: [
        { id: 1, name: 'Signed Contract.pdf', type: 'Document', caseId: 'C-101: Corporate Merger', uploadedBy: 'John Doe', date: '2025-09-01', description: 'Original signed merger contract.', thumbnail: '' },
        { id: 2, name: 'Crime Scene Photo.jpg', type: 'Image', caseId: 'C-102: Criminal Appeal', uploadedBy: 'Emily Clark', date: '2025-09-05', description: 'Crime scene documentation.', thumbnail: 'https://via.placeholder.com/200x140?text=Image' },
        { id: 3, name: 'Expert Report.docx', type: 'Forensic Report', caseId: 'C-103: IP Dispute', uploadedBy: 'Michael Lee', date: '2025-09-10', description: 'Technical forensic analysis.', thumbnail: '' },
        { id: 4, name: 'Deposition Recording.mp4', type: 'Video', caseId: 'C-102: Criminal Appeal', uploadedBy: 'Emily Clark', date: '2025-09-12', description: 'Recorded deposition of witness.', thumbnail: '' },
      ],
      headers: [
        { text: 'Name', value: 'name' },
        { text: 'Type', value: 'type' },
        { text: 'Case', value: 'caseId' },
        { text: 'Uploaded By', value: 'uploadedBy' },
        { text: 'Date', value: 'date' },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
    };
  },
  computed: {
    filteredEvidence() {
      let list = this.evidence;
      if (this.filterCase) list = list.filter(e => e.caseId === this.filterCase);
      if (this.filterType) list = list.filter(e => e.type === this.filterType);
      if (this.search) list = list.filter(e => e.name.toLowerCase().includes(this.search.toLowerCase()));
      return list;
    },
  },
  methods: {
    saveEvidence() {
      this.evidence.push({ id: Date.now(), ...this.form, caseId: this.form.caseId || '', uploadedBy: 'Me', date: new Date().toISOString().split('T')[0], thumbnail: '' });
      this.form = { caseId: null, name: '', type: '', file: null, description: '' };
      this.dialog = false;
    },
    remove(id) { this.evidence = this.evidence.filter(e => e.id !== id); },
    preview(item) { this.previewItem = item; this.previewDialog = true; },
    download(item) { console.log('download', item.name); },
    typeIcon(type) {
      const map = { Document: 'mdi-file-document', Image: 'mdi-image', Video: 'mdi-video', Audio: 'mdi-music', 'Forensic Report': 'mdi-flask', 'Witness Statement': 'mdi-account-voice' };
      return map[type] || 'mdi-file';
    },
    typeColor(type) {
      const map = { Document: 'blue', Image: 'green', Video: 'purple', Audio: 'orange', 'Forensic Report': 'teal', 'Witness Statement': 'indigo' };
      return map[type] || 'grey';
    },
  },
};
</script>
