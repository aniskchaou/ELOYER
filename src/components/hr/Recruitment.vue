<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Recruitment</h1><p class="body-2 grey--text">Job postings, applicants and hiring pipeline</p></v-col>
      <v-col cols="auto"><v-btn color="brown darken-1" dark @click="openPost"><v-icon left>mdi-plus</v-icon>New Posting</v-btn></v-col>
    </v-row>

    <v-row>
      <!-- Postings -->
      <v-col cols="12" md="5">
        <v-card outlined>
          <v-card-title class="subtitle-1">Open Positions ({{ postings.length }})</v-card-title>
          <v-list dense>
            <v-list-item v-for="p in postings" :key="p.id" @click="selectPosting(p)" :class="selected && selected.id===p.id ? 'brown lighten-5':''">
              <v-list-item-icon><v-icon small color="brown">mdi-briefcase</v-icon></v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ p.title }}</v-list-item-title>
                <v-list-item-subtitle>{{ p.department_name || 'General' }} · {{ p.applicant_count }} applicants</v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-chip x-small :color="p.status==='open'?'success':'grey'" dark>{{ p.status }}</v-chip>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Applicants -->
      <v-col cols="12" md="7">
        <v-card outlined v-if="selected">
          <v-card-title class="subtitle-1">Applicants — {{ selected.title }}</v-card-title>
          <v-data-table :headers="appHeaders" :items="applicantsForSelected" dense class="elevation-0">
            <template v-slot:item.status="{ item }"><v-chip x-small :color="appColor(item.status)" dark>{{ item.status }}</v-chip></template>
            <template v-slot:item.score="{ item }">{{ item.score || '—' }}/10</template>
            <template v-slot:item.actions="{ item }">
              <v-select v-model="item.status" :items="appStatuses" dense outlined hide-details style="max-width:130px" @change="updateApp(item)"></v-select>
            </template>
          </v-data-table>
          <v-card-actions>
            <v-btn small outlined color="brown" @click="addAppDialog=true"><v-icon left small>mdi-account-plus</v-icon>Add Applicant</v-btn>
          </v-card-actions>
        </v-card>
        <div v-else class="text-center grey--text mt-12"><v-icon x-large>mdi-briefcase-search</v-icon><p class="mt-2">Select a job posting to view applicants</p></div>
      </v-col>
    </v-row>

    <!-- New Posting Dialog -->
    <v-dialog v-model="postDialog" max-width="560">
      <v-card>
        <v-card-title>New Job Posting</v-card-title><v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-text-field v-model="form.title" label="Title *" outlined dense class="mb-2"></v-text-field>
          <v-select v-model="form.job_type" :items="['full_time','part_time','contract','internship']" label="Job Type" outlined dense class="mb-2"></v-select>
          <v-textarea v-model="form.description" label="Description" outlined rows="2" auto-grow class="mb-2"></v-textarea>
          <v-textarea v-model="form.requirements" label="Requirements" outlined rows="2" auto-grow class="mb-2"></v-textarea>
          <v-text-field v-model="form.salary_range" label="Salary Range (e.g. 800–1200 TND)" outlined dense></v-text-field>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="postDialog=false">Cancel</v-btn><v-btn color="brown darken-1" dark :loading="saving" @click="createPost">Post</v-btn></v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Add Applicant Dialog -->
    <v-dialog v-model="addAppDialog" max-width="440">
      <v-card>
        <v-card-title>Add Applicant</v-card-title><v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-text-field v-model="appForm.applicant_name" label="Name *" outlined dense class="mb-2"></v-text-field>
          <v-text-field v-model="appForm.applicant_email" label="Email *" outlined dense type="email" class="mb-2"></v-text-field>
          <v-textarea v-model="appForm.cover_letter" label="Cover Letter" outlined rows="3"></v-textarea>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="addAppDialog=false">Cancel</v-btn><v-btn color="brown darken-1" dark :loading="saving" @click="createApp">Add</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>
<script>
import { hrGetRecruitment, hrCreatePosting, hrCreateApplication, hrUpdateApplication } from '@/services/hrApi';
export default {
  name: 'Recruitment',
  data() {
    return {
      postings: [], applications: [], selected: null,
      loading: true, saving: false, postDialog: false, addAppDialog: false,
      form: { title: '', job_type: 'full_time', description: '', requirements: '', salary_range: '', posted_by: 1 },
      appForm: { applicant_name: '', applicant_email: '', cover_letter: '' },
      appStatuses: ['applied','screening','interviewed','offered','hired','rejected'],
      snack: false, snackMsg: '', snackColor: 'success',
      appHeaders: [
        { text: 'Name', value: 'applicant_name' }, { text: 'Email', value: 'applicant_email' },
        { text: 'Score', value: 'score' }, { text: 'Status', value: 'status' },
        { text: 'Action', value: 'actions', sortable: false, width: 140 },
      ],
    };
  },
  computed: {
    applicantsForSelected() { return this.selected ? this.applications.filter(a => a.posting_id === this.selected.id) : []; },
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { const r = await hrGetRecruitment(); this.postings = r.postings; this.applications = r.applications; }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.loading = false; }
    },
    selectPosting(p) { this.selected = p; },
    openPost() { this.form = { title: '', job_type: 'full_time', description: '', requirements: '', salary_range: '', posted_by: 1 }; this.postDialog = true; },
    async createPost() {
      if (!this.form.title) return;
      this.saving = true;
      try { await hrCreatePosting(this.form); this.notify('Posting created.'); this.postDialog = false; this.load(); }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.saving = false; }
    },
    async createApp() {
      if (!this.appForm.applicant_name || !this.appForm.applicant_email) return;
      this.saving = true;
      try { await hrCreateApplication({ ...this.appForm, posting_id: this.selected.id }); this.notify('Applicant added.'); this.addAppDialog = false; this.load(); }
      catch (e) { this.notify(e.message, 'error'); }
      finally { this.saving = false; }
    },
    async updateApp(item) {
      try { await hrUpdateApplication(item.id, { status: item.status }); this.notify('Status updated.'); }
      catch (e) { this.notify(e.message, 'error'); }
    },
    appColor(s) { const m = { applied:'grey', screening:'blue', interviewed:'orange', offered:'purple', hired:'success', rejected:'error' }; return m[s]||'grey'; },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
