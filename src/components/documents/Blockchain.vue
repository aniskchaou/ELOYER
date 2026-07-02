<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col>
        <h1 class="text-h5 font-weight-bold">E-Signature &amp; Blockchain Verification</h1>
        <p class="body-2 grey--text">Sign documents digitally and verify integrity via blockchain</p>
      </v-col>
      <v-col cols="auto">
        <v-btn color="primary" @click="signDialog = true">
          <v-icon left>mdi-draw</v-icon> Sign Document
        </v-btn>
      </v-col>
    </v-row>

    <!-- Stats -->
    <v-row class="mb-4">
      <v-col cols="6" md="3" v-for="s in stats" :key="s.label">
        <v-card outlined class="pa-3 text-center">
          <v-icon :color="s.color" class="mb-1">{{ s.icon }}</v-icon>
          <div class="overline">{{ s.label }}</div>
          <p class="text-h5 font-weight-bold" :class="s.color + '--text'">{{ s.value }}</p>
        </v-card>
      </v-col>
    </v-row>

    <!-- Signed Documents Table -->
    <v-card outlined class="mb-5">
      <v-card-title>Signed Documents
        <v-spacer></v-spacer>
        <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" single-line hide-details dense></v-text-field>
      </v-card-title>
      <v-divider></v-divider>
      <v-data-table :headers="headers" :items="documents" :search="search" class="elevation-0">
        <template v-slot:item.status="{ item }">
          <v-chip small :color="item.status === 'Verified' ? 'green' : item.status === 'Pending' ? 'orange' : 'red'" dark>
            <v-icon x-small left>{{ item.status === 'Verified' ? 'mdi-shield-check' : item.status === 'Pending' ? 'mdi-clock' : 'mdi-alert' }}</v-icon>
            {{ item.status }}
          </v-chip>
        </template>
        <template v-slot:item.hash="{ item }">
          <code class="caption" style="font-size:11px;">{{ item.hash }}</code>
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn icon small color="blue" @click="viewDoc(item)"><v-icon small>mdi-eye</v-icon></v-btn>
          <v-btn icon small color="green" @click="verify(item)"><v-icon small>mdi-shield-check</v-icon></v-btn>
          <v-btn icon small color="grey" @click="downloadDoc(item)"><v-icon small>mdi-download</v-icon></v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Blockchain Ledger -->
    <v-card outlined>
      <v-card-title><v-icon left color="teal">mdi-link-variant</v-icon> Blockchain Ledger</v-card-title>
      <v-divider></v-divider>
      <v-timeline dense align-top>
        <v-timeline-item v-for="entry in ledger" :key="entry.id" :color="entry.color" small>
          <v-card outlined class="pa-3">
            <div class="caption font-weight-bold">{{ entry.action }}</div>
            <div class="caption grey--text">{{ entry.document }} &mdash; {{ entry.signer }}</div>
            <div class="caption"><code>{{ entry.txHash }}</code></div>
            <div class="caption grey--text">{{ entry.timestamp }}</div>
          </v-card>
        </v-timeline-item>
      </v-timeline>
    </v-card>

    <!-- Sign Document Dialog -->
    <v-dialog v-model="signDialog" max-width="560px">
      <v-card>
        <v-card-title><v-icon left color="primary">mdi-draw</v-icon> Sign Document</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-select v-model="signForm.docName" :items="availableDocs" label="Document" outlined dense></v-select>
          <v-text-field v-model="signForm.signer" label="Signer Name" outlined dense class="mt-3"></v-text-field>
          <v-text-field v-model="signForm.role" label="Role / Title" outlined dense class="mt-3"></v-text-field>
          <v-text-field v-model="signForm.email" label="Email" outlined dense class="mt-3" type="email"></v-text-field>
          <v-card outlined class="mt-4 pa-3 text-center">
            <p class="caption grey--text mb-2">Signature Preview</p>
            <p style="font-family:cursive;font-size:28px;color:#1976D2;">{{ signForm.signer || 'Your Name' }}</p>
          </v-card>
          <v-checkbox v-model="signForm.agreed" label="I agree to sign this document electronically and acknowledge the blockchain record." class="mt-3"></v-checkbox>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="signDialog = false">Cancel</v-btn>
          <v-btn color="primary" :disabled="!signForm.agreed || !signForm.signer || !signForm.docName" @click="submitSignature">Sign &amp; Submit</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Verify Result Snackbar -->
    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="3000">{{ snackbarMsg }}</v-snackbar>

    <!-- View Dialog -->
    <v-dialog v-model="viewDialog" max-width="600px">
      <v-card v-if="selectedDoc">
        <v-card-title>{{ selectedDoc.name }}
          <v-spacer></v-spacer>
          <v-btn icon @click="viewDialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-row>
            <v-col cols="6"><strong>Signed By:</strong> {{ selectedDoc.signedBy }}</v-col>
            <v-col cols="6"><strong>Role:</strong> {{ selectedDoc.role }}</v-col>
            <v-col cols="6"><strong>Date:</strong> {{ selectedDoc.date }}</v-col>
            <v-col cols="6"><strong>Case:</strong> {{ selectedDoc.case }}</v-col>
            <v-col cols="12"><strong>Hash:</strong><br><code>{{ selectedDoc.hash }}</code></v-col>
            <v-col cols="12"><strong>Block ID:</strong><br><code>{{ selectedDoc.blockId }}</code></v-col>
          </v-row>
          <v-alert v-if="selectedDoc.status === 'Verified'" type="success" outlined class="mt-4">
            Document integrity verified on the blockchain.
          </v-alert>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
export default {
  name: 'Blockchain',
  data() {
    return {
      search: '',
      signDialog: false,
      viewDialog: false,
      selectedDoc: null,
      snackbar: false,
      snackbarMsg: '',
      snackbarColor: 'success',
      signForm: { docName: '', signer: '', role: '', email: '', agreed: false },
      availableDocs: ['Merger Agreement v3.pdf', 'NDA_TechCorp.docx', 'Service Agreement v2.pdf', 'Power of Attorney.pdf'],
      documents: [
        { id: 1, name: 'Merger Agreement v3.pdf', signedBy: 'John Doe', role: 'Partner', case: 'C-101', date: '2025-09-02', status: 'Verified', hash: '0x3a7f...d4c2', blockId: '#892341' },
        { id: 2, name: 'NDA_TechCorp.docx', signedBy: 'Michael Lee', role: 'Associate', case: 'C-103', date: '2025-09-09', status: 'Verified', hash: '0x1b2e...89fa', blockId: '#892398' },
        { id: 3, name: 'Settlement_Smith.pdf', signedBy: 'Emily Clark', role: 'Counsel', case: 'C-102', date: '2025-08-28', status: 'Pending', hash: '0xf74a...22c1', blockId: 'Pending' },
      ],
      ledger: [
        { id: 1, action: 'Document Signed', document: 'Merger Agreement v3.pdf', signer: 'John Doe', txHash: '0x3a7f...d4c2', timestamp: '2025-09-02 14:32:01', color: 'green' },
        { id: 2, action: 'Signature Verified', document: 'Merger Agreement v3.pdf', signer: 'System', txHash: '0x3a7f...d4c2', timestamp: '2025-09-02 14:32:05', color: 'teal' },
        { id: 3, action: 'Document Signed', document: 'NDA_TechCorp.docx', signer: 'Michael Lee', txHash: '0x1b2e...89fa', timestamp: '2025-09-09 09:15:22', color: 'green' },
        { id: 4, action: 'Signature Submitted', document: 'Settlement_Smith.pdf', signer: 'Emily Clark', txHash: '0xf74a...22c1', timestamp: '2025-08-28 11:00:44', color: 'orange' },
      ],
      headers: [
        { text: 'Document', value: 'name' },
        { text: 'Signed By', value: 'signedBy' },
        { text: 'Role', value: 'role' },
        { text: 'Case', value: 'case' },
        { text: 'Date', value: 'date' },
        { text: 'Blockchain Hash', value: 'hash' },
        { text: 'Status', value: 'status' },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
    };
  },
  computed: {
    stats() {
      return [
        { label: 'Total Signed', value: this.documents.length, color: 'blue', icon: 'mdi-file-sign' },
        { label: 'Verified', value: this.documents.filter(d => d.status === 'Verified').length, color: 'green', icon: 'mdi-shield-check' },
        { label: 'Pending', value: this.documents.filter(d => d.status === 'Pending').length, color: 'orange', icon: 'mdi-clock' },
        { label: 'Transactions', value: this.ledger.length, color: 'teal', icon: 'mdi-link-variant' },
      ];
    },
  },
  methods: {
    submitSignature() {
      const hash = '0x' + Math.random().toString(16).substr(2, 8) + '...' + Math.random().toString(16).substr(2, 4);
      const doc = {
        id: Date.now(), name: this.signForm.docName, signedBy: this.signForm.signer,
        role: this.signForm.role, case: 'New', date: new Date().toISOString().split('T')[0],
        status: 'Pending', hash, blockId: 'Pending',
      };
      this.documents.push(doc);
      this.ledger.unshift({ id: Date.now(), action: 'Document Signed', document: this.signForm.docName, signer: this.signForm.signer, txHash: hash, timestamp: new Date().toLocaleString(), color: 'green' });
      this.signForm = { docName: '', signer: '', role: '', email: '', agreed: false };
      this.signDialog = false;
      this.snackbarMsg = 'Signature submitted and recorded on blockchain.';
      this.snackbarColor = 'success';
      this.snackbar = true;
    },
    verify(item) {
      item.status = 'Verified';
      item.blockId = '#' + Math.floor(Math.random() * 900000 + 100000);
      this.ledger.unshift({ id: Date.now(), action: 'Signature Verified', document: item.name, signer: 'System', txHash: item.hash, timestamp: new Date().toLocaleString(), color: 'teal' });
      this.snackbarMsg = 'Document verified on blockchain!';
      this.snackbarColor = 'success';
      this.snackbar = true;
    },
    viewDoc(item) { this.selectedDoc = item; this.viewDialog = true; },
    downloadDoc(item) { void item; },
  },
};
</script>
