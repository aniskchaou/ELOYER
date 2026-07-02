<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">Video Meetings</h1><p class="body-2 grey--text">Join or schedule video consultations with your lawyer</p></v-col>
      <v-col cols="auto"><v-btn color="teal" dark @click="dialog=true"><v-icon left>mdi-video-plus</v-icon>Schedule Meeting</v-btn></v-col>
    </v-row>

    <v-row>
      <v-col v-for="m in meetings" :key="m.id" cols="12" md="6">
        <v-card outlined class="pa-4">
          <div class="d-flex align-center mb-2">
            <v-icon :color="m.status==='scheduled'?'teal':'grey'" class="mr-2">mdi-video</v-icon>
            <div>
              <div class="subtitle-2 font-weight-bold">{{ m.title }}</div>
              <div class="caption grey--text">With {{ m.lawyer_name }}</div>
            </div>
            <v-spacer></v-spacer>
            <v-chip x-small :color="m.status==='scheduled'?'teal':'grey'" dark>{{ m.status }}</v-chip>
          </div>
          <div class="body-2 mb-2">{{ new Date(m.scheduled_at).toLocaleString([], {dateStyle:'medium',timeStyle:'short'}) }}</div>
          <div class="caption grey--text mb-3">{{ m.duration_minutes }} minutes</div>
          <v-btn v-if="m.status==='scheduled'" color="teal" dark small block :href="m.meeting_url" target="_blank">
            <v-icon left small>mdi-video</v-icon>Join Meeting
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
    <v-alert v-if="!loading && !meetings.length" type="info" outlined class="mt-4">No meetings scheduled yet.</v-alert>

    <v-dialog v-model="dialog" max-width="480">
      <v-card>
        <v-card-title>Schedule Video Meeting</v-card-title><v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-text-field v-model="form.title" label="Meeting Title *" outlined dense class="mb-2"></v-text-field>
          <v-text-field v-model="form.scheduled_at" label="Date & Time *" outlined dense type="datetime-local" class="mb-2"></v-text-field>
          <v-select v-model="form.duration_minutes" :items="[30,60,90,120]" label="Duration (minutes)" outlined dense class="mb-2"></v-select>
          <v-textarea v-model="form.notes" label="Notes / Agenda" outlined rows="2" auto-grow></v-textarea>
          <v-alert v-if="err" type="error" dense class="mt-2">{{ err }}</v-alert>
        </v-card-text>
        <v-card-actions><v-spacer></v-spacer><v-btn text @click="dialog=false">Cancel</v-btn><v-btn color="teal" dark :loading="saving" @click="schedule">Request Meeting</v-btn></v-card-actions>
      </v-card>
    </v-dialog>
    <v-snackbar v-model="snack" :color="snackColor" top>{{ snackMsg }}</v-snackbar>
  </v-container>
</template>
<script>
import { cpGetMeetings, cpBookMeeting } from '@/services/portalApi';
const CLIENT_ID = 1;
export default {
  name: 'ClientMeetings',
  data() {
    return {
      meetings: [], loading: true, dialog: false, saving: false, err: '',
      form: { lawyer_id: 1, client_id: CLIENT_ID, title: '', scheduled_at: '', duration_minutes: 60, notes: '' },
      snack: false, snackMsg: '', snackColor: 'success',
    };
  },
  created() { this.load(); },
  methods: {
    async load() {
      this.loading = true;
      try { this.meetings = await cpGetMeetings(CLIENT_ID); }
      catch (e) { console.error(e); }
      finally { this.loading = false; }
    },
    async schedule() {
      if (!this.form.title || !this.form.scheduled_at) { this.err = 'Title and date required.'; return; }
      this.saving = true;
      try { await cpBookMeeting(this.form); this.notify('Meeting requested.'); this.dialog = false; this.load(); }
      catch (e) { this.err = e.message; }
      finally { this.saving = false; }
    },
    notify(msg, color = 'success') { this.snackMsg = msg; this.snackColor = color; this.snack = true; },
  },
};
</script>
