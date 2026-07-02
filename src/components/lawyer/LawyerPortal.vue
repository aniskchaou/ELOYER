<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col>
        <h1 class="text-h5 font-weight-bold">Lawyer Portal</h1>
        <p class="body-2 grey--text">Start your day, prioritize work, and execute case actions fast.</p>
      </v-col>
      <v-col cols="auto">
        <v-btn color="primary" :loading="loading" @click="loadPortalData">
          <v-icon left>mdi-refresh</v-icon>
          Refresh
        </v-btn>
      </v-col>
    </v-row>

    <v-alert v-if="error" type="error" outlined dense class="mb-4">{{ error }}</v-alert>

    <v-row class="mb-4">
      <v-col cols="12" md="8">
        <v-card outlined>
          <v-card-title>Start the Day</v-card-title>
          <v-divider></v-divider>
          <v-card-text class="pt-4">
            <v-row>
              <v-col cols="12" md="6">
                <div class="subtitle-2 mb-2">Priority Cases</div>
                <v-list dense>
                  <v-list-item v-for="item in dashboard.priorityCases" :key="item.id" class="px-0">
                    <v-list-item-content>
                      <v-list-item-title>{{ item.title }}</v-list-item-title>
                      <v-list-item-subtitle>{{ item.case_type }} · {{ item.status }}</v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action>
                      <v-btn x-small color="primary" @click="openCase(item.id)">Open Case</v-btn>
                    </v-list-item-action>
                  </v-list-item>
                </v-list>
              </v-col>

              <v-col cols="12" md="6">
                <div class="subtitle-2 mb-2">Urgent Deadlines / Hearings</div>
                <v-list dense>
                  <v-list-item v-for="item in dashboard.urgentDeadlinesHearings" :key="item.id" class="px-0">
                    <v-list-item-content>
                      <v-list-item-title>{{ item.case_title }}</v-list-item-title>
                      <v-list-item-subtitle>{{ formatDate(item.hearing_date) }} · {{ item.court_name }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <div class="subtitle-2 mb-2">Today's Tasks</div>
                <v-list dense>
                  <v-list-item v-for="task in dashboard.todayTasks" :key="task.id" class="px-0">
                    <v-list-item-content>
                      <v-list-item-title>{{ task.title }}</v-list-item-title>
                      <v-list-item-subtitle>{{ task.priority }} priority · {{ task.status }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-col>
              <v-col cols="12" md="6">
                <div class="subtitle-2 mb-2">New Client Messages</div>
                <v-list dense>
                  <v-list-item v-for="msg in dashboard.newClientMessages" :key="msg.id" class="px-0">
                    <v-list-item-content>
                      <v-list-item-title>{{ msg.subject || 'Message' }}</v-list-item-title>
                      <v-list-item-subtitle>{{ msg.client_name || 'Client' }} · {{ msg.body }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card outlined class="mb-4">
          <v-card-title>Quick Actions</v-card-title>
          <v-divider></v-divider>
          <v-card-text>
            <v-select
              v-model="selectedCaseId"
              :items="caseSelectItems"
              label="Select Case"
              outlined
              dense
            ></v-select>

            <v-btn block color="primary" class="mb-2" :disabled="!selectedCaseId" @click="openCase(selectedCaseId)">
              <v-icon left>mdi-folder-open</v-icon>
              Open Case
            </v-btn>
            <v-btn block outlined class="mb-2" :disabled="!selectedCaseId" @click="quickDialogs.note = true">
              <v-icon left>mdi-note-plus</v-icon>
              Add Note
            </v-btn>
            <v-btn block outlined class="mb-2" :disabled="!selectedCaseId" @click="quickDialogs.time = true">
              <v-icon left>mdi-timer-plus</v-icon>
              Log Time
            </v-btn>
            <v-btn block outlined :disabled="!selectedCaseId" @click="quickDialogs.meeting = true">
              <v-icon left>mdi-calendar-plus</v-icon>
              Schedule Meeting
            </v-btn>
          </v-card-text>
        </v-card>

        <v-card outlined>
          <v-card-title>Pending Invoices / Payments</v-card-title>
          <v-divider></v-divider>
          <v-list dense>
            <v-list-item v-for="invoice in dashboard.pendingInvoicesPayments" :key="invoice.id">
              <v-list-item-content>
                <v-list-item-title>{{ invoice.case_title }}</v-list-item-title>
                <v-list-item-subtitle>
                  {{ invoice.status }} · €{{ Number(invoice.amount).toFixed(2) }} · due {{ formatDate(invoice.due_date) }}
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>

        <v-card outlined class="mt-4">
          <v-card-title>Real Daily Workflow</v-card-title>
          <v-divider></v-divider>
          <v-list dense>
            <v-list-item
              v-for="(step, index) in dashboard.realDailyWorkflow || []"
              :key="`workflow-${index}`"
            >
              <v-list-item-icon>
                <v-icon small color="indigo">mdi-check-circle-outline</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title class="body-2">{{ step }}</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="6">
        <v-card outlined>
          <v-card-title>Create New Case</v-card-title>
          <v-divider></v-divider>
          <v-card-text class="pt-4">
            <v-text-field v-model="newCase.title" label="Case title" outlined dense></v-text-field>
            <v-row class="mt-3">
              <v-col cols="6">
                <v-select v-model="newCase.caseType" :items="caseTypes" label="Case type" outlined dense></v-select>
              </v-col>
              <v-col cols="6">
                <v-select v-model="newCase.status" :items="caseStatuses" label="Status" outlined dense></v-select>
              </v-col>
            </v-row>
            <v-select
              v-model="newCase.clientIds"
              :items="clientOptions"
              item-text="full_name"
              item-value="id"
              label="Assign client(s)"
              outlined
              dense
              multiple
              chips
              class="mt-3"
            ></v-select>
            <v-textarea v-model="newCase.description" label="Case description" outlined rows="3" class="mt-3"></v-textarea>
            <v-btn color="primary" class="mt-2" :loading="creatingCase" @click="createNewCase">
              Create Case
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card outlined>
          <v-card-title>Your Cases</v-card-title>
          <v-divider></v-divider>
          <v-data-table :headers="caseHeaders" :items="cases" dense>
            <template v-slot:item.actions="{ item }">
              <v-btn x-small color="primary" @click="openCase(item.id)">Open Case</v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="quickDialogs.note" max-width="520px">
      <v-card>
        <v-card-title>Add Note</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-textarea v-model="quickForms.noteContent" label="Legal note" outlined rows="3"></v-textarea>
          <v-textarea v-model="quickForms.strategy" label="Strategy" outlined rows="2" class="mt-3"></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="quickDialogs.note = false">Cancel</v-btn>
          <v-btn color="primary" @click="submitQuickNote">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="quickDialogs.time" max-width="520px">
      <v-card>
        <v-card-title>Log Time</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-text-field v-model.number="quickForms.hours" type="number" min="0.1" step="0.1" label="Hours" outlined dense></v-text-field>
          <v-textarea v-model="quickForms.timeDescription" label="Work description" outlined rows="2" class="mt-3"></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="quickDialogs.time = false">Cancel</v-btn>
          <v-btn color="primary" @click="submitQuickTime">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="quickDialogs.meeting" max-width="520px">
      <v-card>
        <v-card-title>Schedule Meeting</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-text-field v-model="quickForms.meetingTitle" label="Meeting title" outlined dense></v-text-field>
          <v-text-field v-model="quickForms.meetingDate" type="datetime-local" label="Meeting date" outlined dense class="mt-3"></v-text-field>
          <v-textarea v-model="quickForms.meetingNotes" label="Notes" outlined rows="2" class="mt-3"></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="quickDialogs.meeting = false">Cancel</v-btn>
          <v-btn color="primary" @click="submitQuickMeeting">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="2500">{{ snackbarMessage }}</v-snackbar>
  </v-container>
</template>

<script>
import {
  addCaseNote,
  createCase,
  getLawyerDashboard,
  listClients,
  listLawyerCases,
  logCaseTime,
  scheduleCaseMeeting,
} from '@/services/lawyerApi';

export default {
  name: 'LawyerPortal',
  data() {
    return {
      lawyerId: 1,
      loading: false,
      creatingCase: false,
      error: '',
      cases: [],
      clients: [],
      selectedCaseId: null,
      dashboard: {
        priorityCases: [],
        urgentDeadlinesHearings: [],
        todayTasks: [],
        newClientMessages: [],
        pendingInvoicesPayments: [],
      },
      caseTypes: ['Civil', 'Criminal', 'Corporate', 'Administrative', 'General'],
      caseStatuses: ['open', 'in_progress', 'closed'],
      newCase: {
        title: '',
        description: '',
        caseType: 'General',
        status: 'open',
        clientIds: [],
      },
      caseHeaders: [
        { text: 'Title', value: 'title' },
        { text: 'Type', value: 'case_type' },
        { text: 'Status', value: 'status' },
        { text: 'Clients', value: 'clients' },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
      quickDialogs: {
        note: false,
        time: false,
        meeting: false,
      },
      quickForms: {
        noteContent: '',
        strategy: '',
        hours: 1,
        timeDescription: '',
        meetingTitle: '',
        meetingDate: '',
        meetingNotes: '',
      },
      snackbar: false,
      snackbarMessage: '',
      snackbarColor: 'success',
    };
  },
  computed: {
    clientOptions() {
      return this.clients;
    },
    caseSelectItems() {
      return this.cases.map(item => ({ text: item.title, value: item.id }));
    },
  },
  created() {
    this.loadPortalData();
  },
  methods: {
    formatDate(value) {
      if (!value) {
        return '-';
      }
      return new Date(value).toLocaleString();
    },
    showSnack(message, color = 'success') {
      this.snackbarMessage = message;
      this.snackbarColor = color;
      this.snackbar = true;
    },
    openCase(caseId) {
      this.$router.push({ path: `/lawyer/cases/${caseId}` });
    },
    async loadPortalData() {
      this.loading = true;
      this.error = '';
      try {
        const [dashboardData, caseData, clientData] = await Promise.all([
          getLawyerDashboard(this.lawyerId),
          listLawyerCases(this.lawyerId),
          listClients(),
        ]);

        this.dashboard = dashboardData;
        this.cases = caseData.cases;
        this.clients = clientData.clients;

        if (!this.selectedCaseId && this.cases.length) {
          this.selectedCaseId = this.cases[0].id;
        }
      } catch (err) {
        this.error = err.message || 'Unable to load portal data.';
      } finally {
        this.loading = false;
      }
    },
    async createNewCase() {
      if (!this.newCase.title.trim()) {
        this.showSnack('Case title is required.', 'error');
        return;
      }

      this.creatingCase = true;
      try {
        await createCase({
          title: this.newCase.title,
          description: this.newCase.description,
          caseType: this.newCase.caseType,
          status: this.newCase.status,
          lawyerId: this.lawyerId,
          clientIds: this.newCase.clientIds,
        });

        this.newCase = {
          title: '',
          description: '',
          caseType: 'General',
          status: 'open',
          clientIds: [],
        };

        this.showSnack('Case created successfully.');
        await this.loadPortalData();
      } catch (err) {
        this.showSnack(err.message || 'Failed to create case.', 'error');
      } finally {
        this.creatingCase = false;
      }
    },
    async submitQuickNote() {
      try {
        await addCaseNote(this.selectedCaseId, {
          lawyerId: this.lawyerId,
          noteContent: this.quickForms.noteContent,
          strategy: this.quickForms.strategy,
        });
        this.quickForms.noteContent = '';
        this.quickForms.strategy = '';
        this.quickDialogs.note = false;
        this.showSnack('Note added.');
      } catch (err) {
        this.showSnack(err.message || 'Could not add note.', 'error');
      }
    },
    async submitQuickTime() {
      try {
        await logCaseTime(this.selectedCaseId, {
          lawyerId: this.lawyerId,
          hours: this.quickForms.hours,
          description: this.quickForms.timeDescription,
        });
        this.quickForms.hours = 1;
        this.quickForms.timeDescription = '';
        this.quickDialogs.time = false;
        this.showSnack('Time logged.');
      } catch (err) {
        this.showSnack(err.message || 'Could not log time.', 'error');
      }
    },
    async submitQuickMeeting() {
      try {
        await scheduleCaseMeeting(this.selectedCaseId, {
          lawyerId: this.lawyerId,
          title: this.quickForms.meetingTitle,
          meetingDate: this.quickForms.meetingDate,
          notes: this.quickForms.meetingNotes,
        });
        this.quickForms.meetingTitle = '';
        this.quickForms.meetingDate = '';
        this.quickForms.meetingNotes = '';
        this.quickDialogs.meeting = false;
        this.showSnack('Meeting scheduled.');
      } catch (err) {
        this.showSnack(err.message || 'Could not schedule meeting.', 'error');
      }
    },
  },
};
</script>
