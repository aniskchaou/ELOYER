<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Legal Notices</h1><p class="body-2 grey--text">Track court notices, summons, and official legal communications</p></v-col>
      <v-col cols="auto"><v-btn color="primary" @click="openAdd"><v-icon left>mdi-plus</v-icon> Add Notice</v-btn></v-col>
    </v-row>

    <v-card outlined class="mb-4 pa-3">
      <v-row>
        <v-col cols="12" md="3"><v-select v-model="filterType" :items="noticeTypes" label="Type" outlined dense clearable></v-select></v-col>
        <v-col cols="12" md="3"><v-select v-model="filterStatus" :items="statuses" label="Status" outlined dense clearable></v-select></v-col>
        <v-col cols="12" md="4"><v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="Search" outlined dense></v-text-field></v-col>
      </v-row>
    </v-card>

    <v-data-table :headers="headers" :items="filteredNotices" :search="search" class="elevation-1">
      <template v-slot:item.type="{ item }">
        <v-chip small :color="typeColor(item.type)" dark>{{ item.type }}</v-chip>
      </template>
      <template v-slot:item.status="{ item }">
        <v-chip small :color="item.status === 'Responded' ? 'green' : item.status === 'Overdue' ? 'red' : 'orange'" dark>{{ item.status }}</v-chip>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-btn icon small color="primary" @click="view(item)"><v-icon small>mdi-eye</v-icon></v-btn>
        <v-btn icon small color="green" @click="respond(item)" v-if="item.status === 'Pending'"><v-icon small>mdi-reply</v-icon></v-btn>
        <v-btn icon small color="red" @click="deleteNotice(item.id)"><v-icon small>mdi-delete</v-icon></v-btn>
      </template>
    </v-data-table>

    <v-dialog v-model="dialog" max-width="560px">
      <v-card>
        <v-card-title>{{ editMode ? 'Edit Notice' : 'New Notice' }}</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-text-field v-model="form.title" label="Notice Title" outlined dense></v-text-field>
          <v-row class="mt-3">
            <v-col cols="6"><v-select v-model="form.type" :items="noticeTypes" label="Type" outlined dense></v-select></v-col>
            <v-col cols="6"><v-text-field v-model="form.receivedDate" label="Received Date" outlined dense type="date"></v-text-field></v-col>
          </v-row>
          <v-text-field v-model="form.responseDeadline" label="Response Deadline" outlined dense type="date" class="mt-3"></v-text-field>
          <v-select v-model="form.case" :items="caseNames" label="Related Case" outlined dense clearable class="mt-3"></v-select>
          <v-textarea v-model="form.summary" label="Summary" outlined rows="3" class="mt-3"></v-textarea>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="dialog=false">Cancel</v-btn><v-btn color="primary" @click="save">Save</v-btn></v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="viewDialog" max-width="520px">
      <v-card v-if="selected">
        <v-card-title>{{ selected.title }}<v-spacer></v-spacer><v-chip small :color="typeColor(selected.type)" dark>{{ selected.type }}</v-chip></v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-row>
            <v-col cols="6"><strong>Received:</strong> {{ selected.receivedDate }}</v-col>
            <v-col cols="6"><strong>Deadline:</strong> <span :class="selected.status === 'Overdue' ? 'red--text font-weight-bold' : ''">{{ selected.responseDeadline }}</span></v-col>
            <v-col cols="12"><strong>Case:</strong> {{ selected.case }}</v-col>
            <v-col cols="12"><strong>Summary:</strong> {{ selected.summary }}</v-col>
          </v-row>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="viewDialog=false">Close</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script>
export default {
  name: 'LegalNotices',
  data() {
    return {
      search: '', filterType: null, filterStatus: null, dialog: false, viewDialog: false, editMode: false, selected: null,
      form: { id: null, title: '', type: '', receivedDate: '', responseDeadline: '', case: '', summary: '', status: 'Pending' },
      noticeTypes: ['Summons', 'Court Order', 'Injunction', 'Subpoena', 'Notice to Appear', 'Judgment'],
      statuses: ['Pending', 'Responded', 'Overdue'],
      caseNames: ['Corporate Merger – ABC Ltd', 'Property Dispute – Ben Ali', 'Criminal Appeal – Smith'],
      notices: [
        { id: 1, title: 'Summons – Property Dispute', type: 'Summons', receivedDate: '2026-04-15', responseDeadline: '2026-05-15', case: 'Property Dispute – Ben Ali', summary: 'Defendant summoned to appear before Civil Court – Sousse on May 5, 2026.', status: 'Pending' },
        { id: 2, title: 'Court Order – Evidence Preservation', type: 'Court Order', receivedDate: '2026-03-20', responseDeadline: '2026-04-20', case: 'Corporate Merger – ABC Ltd', summary: 'Order to preserve all merger-related documents and communications.', status: 'Responded' },
        { id: 3, title: 'Subpoena – Expert Witness', type: 'Subpoena', receivedDate: '2026-04-01', responseDeadline: '2026-04-25', case: 'Criminal Appeal – Smith', summary: 'Subpoena for expert witness testimony in appeal proceedings.', status: 'Overdue' },
      ],
      headers: [
        { text: 'Title', value: 'title' }, { text: 'Type', value: 'type' }, { text: 'Received', value: 'receivedDate' },
        { text: 'Deadline', value: 'responseDeadline' }, { text: 'Case', value: 'case' }, { text: 'Status', value: 'status' },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
    };
  },
  computed: {
    filteredNotices() {
      let list = this.notices;
      if (this.filterType) list = list.filter(n => n.type === this.filterType);
      if (this.filterStatus) list = list.filter(n => n.status === this.filterStatus);
      return list;
    },
  },
  methods: {
    typeColor(t) { return { Summons: 'red', 'Court Order': 'purple', Injunction: 'orange', Subpoena: 'blue', 'Notice to Appear': 'teal', Judgment: 'green' }[t] || 'grey'; },
    openAdd() { this.editMode = false; this.form = { id: null, title: '', type: '', receivedDate: '', responseDeadline: '', case: '', summary: '', status: 'Pending' }; this.dialog = true; },
    view(n) { this.selected = n; this.viewDialog = true; },
    respond(n) { n.status = 'Responded'; },
    deleteNotice(id) { this.notices = this.notices.filter(n => n.id !== id); },
    save() {
      if (this.editMode) { const i = this.notices.findIndex(n => n.id === this.form.id); if (i !== -1) this.notices.splice(i, 1, { ...this.form }); }
      else this.notices.push({ ...this.form, id: Date.now() });
      this.dialog = false;
    },
  },
};
</script>
