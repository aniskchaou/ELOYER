<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Document Versioning</h1><p class="body-2 grey--text">Track document revisions, compare versions, and audit changes</p></v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="4">
        <v-card outlined>
          <v-card-title class="subtitle-1">Documents
            <v-spacer></v-spacer>
            <v-text-field v-model="search" append-icon="mdi-magnify" single-line hide-details dense style="max-width:150px"></v-text-field>
          </v-card-title>
          <v-divider></v-divider>
          <v-list>
            <v-list-item v-for="doc in filteredDocs" :key="doc.id" :class="selectedDoc && selectedDoc.id === doc.id ? 'blue lighten-5' : ''" @click="selectedDoc = doc; selectedVersion = null">
              <v-list-item-icon><v-icon color="primary">mdi-file-document-outline</v-icon></v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title class="body-2">{{ doc.name }}</v-list-item-title>
                <v-list-item-subtitle class="caption">{{ doc.versions.length }} version(s) · {{ doc.versions[0].date }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="12" md="8">
        <v-card outlined v-if="selectedDoc">
          <v-card-title>{{ selectedDoc.name }}<v-spacer></v-spacer>
            <v-btn small color="primary" @click="uploadDialog=true"><v-icon left small>mdi-upload</v-icon> Upload New Version</v-btn>
          </v-card-title>
          <v-divider></v-divider>
          <v-timeline dense class="pa-4">
            <v-timeline-item v-for="v in selectedDoc.versions" :key="v.version" :color="v.version === selectedDoc.versions[0].version ? 'primary' : 'grey'" small>
              <v-card outlined class="pa-3" :class="selectedVersion && selectedVersion.version === v.version ? 'blue lighten-5' : ''">
                <div class="d-flex justify-space-between align-center">
                  <div>
                    <span class="font-weight-bold body-2">v{{ v.version }}</span>
                    <v-chip x-small color="primary" dark class="ml-2" v-if="v.version === selectedDoc.versions[0].version">Latest</v-chip>
                    <span class="caption grey--text ml-2">{{ v.date }} by {{ v.author }}</span>
                  </div>
                  <div>
                    <v-btn icon x-small color="primary" @click="selectedVersion = v"><v-icon small>mdi-eye</v-icon></v-btn>
                    <v-btn icon x-small color="green"><v-icon small>mdi-download</v-icon></v-btn>
                    <v-btn icon x-small color="orange" v-if="v.version !== selectedDoc.versions[0].version" @click="restore(v)"><v-icon small>mdi-restore</v-icon></v-btn>
                  </div>
                </div>
                <p class="caption mt-1 mb-0 grey--text">{{ v.summary }}</p>
              </v-card>
            </v-timeline-item>
          </v-timeline>

          <!-- Version detail -->
          <div v-if="selectedVersion" class="pa-4 pt-0">
            <v-divider class="mb-3"></v-divider>
            <div class="overline mb-2">Changes in v{{ selectedVersion.version }}</div>
            <v-list dense>
              <v-list-item v-for="(ch, i) in selectedVersion.changes" :key="i">
                <v-list-item-icon><v-icon small :color="ch.type === 'Added' ? 'green' : ch.type === 'Removed' ? 'red' : 'orange'">{{ ch.type === 'Added' ? 'mdi-plus-circle' : ch.type === 'Removed' ? 'mdi-minus-circle' : 'mdi-pencil-circle' }}</v-icon></v-list-item-icon>
                <v-list-item-content><v-list-item-title class="caption">{{ ch.type }}: {{ ch.description }}</v-list-item-title></v-list-item-content>
              </v-list-item>
            </v-list>
          </div>
        </v-card>
        <v-card outlined class="pa-6 text-center" v-else>
          <v-icon size="56" color="grey lighten-2">mdi-file-document-outline</v-icon>
          <p class="grey--text mt-3">Select a document to view its version history</p>
        </v-card>
      </v-col>
    </v-row>

    <!-- Upload Dialog -->
    <v-dialog v-model="uploadDialog" max-width="480px">
      <v-card>
        <v-card-title>Upload New Version</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-file-input label="Select File" outlined dense prepend-icon="mdi-paperclip" accept=".pdf,.docx,.doc"></v-file-input>
          <v-textarea v-model="uploadNote" label="Change Summary" outlined rows="3" class="mt-3" placeholder="What changed in this version?"></v-textarea>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="uploadDialog=false">Cancel</v-btn><v-btn color="primary" @click="addVersion">Upload</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script>
export default {
  name: 'DocumentVersioning',
  data() {
    return {
      search: '', selectedDoc: null, selectedVersion: null, uploadDialog: false, uploadNote: '',
      documents: [
        { id: 1, name: 'Retainer Agreement – ABC SARL', versions: [
          { version: '3.0', date: '2026-04-15', author: 'A. Cherni', summary: 'Updated fee schedule and termination clause.', changes: [{type:'Modified',description:'Fee schedule updated to €3,000/month'},{type:'Added',description:'New termination notice clause (Article 8)'}] },
          { version: '2.0', date: '2026-01-10', author: 'A. Cherni', summary: 'Added arbitration clause.', changes: [{type:'Added',description:'Arbitration clause (Article 7)'},{type:'Removed',description:'Old dispute resolution paragraph'}] },
          { version: '1.0', date: '2025-09-01', author: 'K. Slim', summary: 'Initial version.', changes: [{type:'Added',description:'Full document created'}] },
        ]},
        { id: 2, name: 'Employment Contract – K. Slim', versions: [
          { version: '2.0', date: '2026-03-01', author: 'A. Cherni', summary: 'Salary increase and remote work policy added.', changes: [{type:'Modified',description:'Salary updated to €2,800/month'},{type:'Added',description:'Remote work policy section'}] },
          { version: '1.0', date: '2025-06-15', author: 'HR', summary: 'Initial employment contract.', changes: [{type:'Added',description:'Full document created'}] },
        ]},
      ],
    };
  },
  computed: {
    filteredDocs() { return this.search ? this.documents.filter(d => d.name.toLowerCase().includes(this.search.toLowerCase())) : this.documents; },
  },
  methods: {
    restore(v) { void v; },
    addVersion() {
      if (this.selectedDoc) {
        const nextVer = (parseFloat(this.selectedDoc.versions[0].version) + 1).toFixed(1);
        this.selectedDoc.versions.unshift({ version: nextVer, date: new Date().toISOString().split('T')[0], author: 'Current User', summary: this.uploadNote || 'New version uploaded.', changes: [{type:'Modified',description:this.uploadNote || 'File updated'}] });
      }
      this.uploadDialog = false; this.uploadNote = '';
    },
  },
};
</script>
