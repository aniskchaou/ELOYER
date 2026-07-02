<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col>
        <h1 class="text-h5 font-weight-bold">Lawyer Daily Workspace</h1>
        <p class="body-2 grey--text">Open case, review/update evidence, log time, collaborate with client, bill work, and use AI assistance.</p>
      </v-col>
      <v-col cols="auto">
        <v-btn outlined class="mr-2" @click="$router.push('/lawyer/portal')">Back to Portal</v-btn>
        <v-btn color="primary" :loading="loading" @click="refreshAll">Refresh</v-btn>
      </v-col>
    </v-row>

    <v-alert v-if="error" type="error" outlined dense>{{ error }}</v-alert>

    <v-card outlined class="mb-4" v-if="workspace.case">
      <v-card-title>{{ workspace.case.title }}</v-card-title>
      <v-card-subtitle>
        {{ workspace.case.case_type }} · status: {{ workspace.case.status }} · clients: {{ (workspace.case.clients || []).join(', ') || 'None' }}
      </v-card-subtitle>
      <v-divider></v-divider>
      <v-card-text>
        <v-row>
          <v-col cols="12" md="8">
            <p class="mb-0">{{ workspace.case.description }}</p>
          </v-col>
          <v-col cols="12" md="4">
            <v-select v-model="caseStatus" :items="statuses" label="Case Status" outlined dense></v-select>
            <v-btn color="primary" :loading="updatingStatus" @click="saveStatus">Update Status</v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-tabs v-model="tab" background-color="transparent" class="mb-4">
      <v-tab v-for="item in tabs" :key="item">{{ item }}</v-tab>
    </v-tabs>

    <v-tabs-items v-model="tab" style="background:transparent">
      <v-tab-item>
        <v-row>
          <v-col cols="12" md="6">
            <v-card outlined class="mb-4">
              <v-card-title>Create Document From Template</v-card-title>
              <v-divider></v-divider>
              <v-card-text class="pt-4">
                <v-select v-model="docForm.templateId" :items="templateItems" item-text="name" item-value="id" label="Template" outlined dense></v-select>
                <v-text-field v-model="docForm.templateTitle" label="Document title" outlined dense class="mt-2"></v-text-field>
                <v-switch v-model="premiumEnabled" label="Premium enabled" class="mt-0"></v-switch>
                <v-btn color="primary" @click="createFromTemplate">Create (Auto-fill client data)</v-btn>
              </v-card-text>
            </v-card>

            <v-card outlined>
              <v-card-title>Edit Contract / Save New Version</v-card-title>
              <v-divider></v-divider>
              <v-card-text class="pt-4">
                <v-select v-model="docForm.editDocumentId" :items="documentItems" item-text="title" item-value="id" label="Document" outlined dense></v-select>
                <v-textarea v-model="docForm.versionContent" label="Updated contract content" outlined rows="4" class="mt-2"></v-textarea>
                <v-text-field v-model="docForm.changeSummary" label="Change summary" outlined dense class="mt-2"></v-text-field>
                <v-btn color="primary" @click="saveVersion">Save Version</v-btn>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card outlined class="mb-4">
              <v-card-title>Upload External Document</v-card-title>
              <v-divider></v-divider>
              <v-card-text class="pt-4">
                <v-text-field v-model="docForm.externalTitle" label="Title" outlined dense></v-text-field>
                <v-text-field v-model="docForm.externalUrl" label="External URL" outlined dense class="mt-2"></v-text-field>
                <v-btn color="primary" @click="uploadExternal">Upload</v-btn>
              </v-card-text>
            </v-card>

            <v-card outlined class="mb-4">
              <v-card-title>Compare Versions</v-card-title>
              <v-divider></v-divider>
              <v-card-text class="pt-4">
                <v-select v-model="docForm.compareDocumentId" :items="documentItems" item-text="title" item-value="id" label="Document" outlined dense></v-select>
                <v-row class="mt-1">
                  <v-col cols="6"><v-text-field v-model.number="docForm.fromVersion" type="number" min="1" label="From version" outlined dense></v-text-field></v-col>
                  <v-col cols="6"><v-text-field v-model.number="docForm.toVersion" type="number" min="1" label="To version" outlined dense></v-text-field></v-col>
                </v-row>
                <v-btn color="primary" @click="compareVersions">Compare</v-btn>
                <v-alert v-if="docCompare.summary" type="info" outlined dense class="mt-3">{{ docCompare.summary }}</v-alert>
              </v-card-text>
            </v-card>

            <v-card outlined>
              <v-card-title>E-Sign & AI Summarize</v-card-title>
              <v-divider></v-divider>
              <v-card-text class="pt-4">
                <v-select v-model="docForm.esignDocumentId" :items="documentItems" item-text="title" item-value="id" label="Document for e-sign" outlined dense></v-select>
                <v-select v-model="docForm.clientId" :items="caseClients" item-text="full_name" item-value="id" label="Client" outlined dense class="mt-2"></v-select>
                <v-btn color="primary" class="mr-2" @click="sendESign">Send for E-signature</v-btn>
                <v-btn outlined @click="aiSummarize">AI Summarize</v-btn>
                <v-alert v-if="docSummary" type="success" outlined dense class="mt-3">{{ docSummary }}</v-alert>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-tab-item>

      <v-tab-item>
        <v-row>
          <v-col cols="12" md="6">
            <v-card outlined class="mb-4">
              <v-card-title>Log Billable Hours</v-card-title>
              <v-divider></v-divider>
              <v-card-text class="pt-4">
                <v-text-field v-model.number="timeForm.hours" type="number" min="0.1" step="0.1" label="Hours" outlined dense></v-text-field>
                <v-textarea v-model="timeForm.description" label="Description" outlined rows="2" class="mt-2"></v-textarea>
                <v-btn color="primary" class="mr-2" @click="logTime">Log Time</v-btn>
                <v-btn outlined @click="loadTimeSuggestions">Premium suggestions</v-btn>
                <v-list dense v-if="timeSuggestions.length" class="mt-2">
                  <v-list-item v-for="(s, i) in timeSuggestions" :key="`ts-${i}`" class="px-0">
                    <v-list-item-icon><v-icon small color="blue">mdi-lightbulb-on</v-icon></v-list-item-icon>
                    <v-list-item-content><v-list-item-title class="body-2">{{ s }}</v-list-item-title></v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>

            <v-card outlined>
              <v-card-title>Start / Stop Timer</v-card-title>
              <v-divider></v-divider>
              <v-card-text class="pt-4">
                <v-text-field v-model="timeForm.timerNote" label="Activity note" outlined dense></v-text-field>
                <v-btn color="primary" class="mr-2" @click="startTimer">Start</v-btn>
                <v-btn color="warning" dark @click="stopTimer">Stop</v-btn>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card outlined class="mb-4">
              <v-card-title>Assign Tasks & Deadlines</v-card-title>
              <v-divider></v-divider>
              <v-card-text class="pt-4">
                <v-text-field v-model="taskForm.title" label="Task title" outlined dense></v-text-field>
                <v-row class="mt-1">
                  <v-col cols="6"><v-select v-model="taskForm.assignedTo" :items="['self', 'assistant']" label="Assign to" outlined dense></v-select></v-col>
                  <v-col cols="6"><v-select v-model="taskForm.priority" :items="['low', 'normal', 'high']" label="Priority" outlined dense></v-select></v-col>
                </v-row>
                <v-text-field v-model="taskForm.dueDate" type="datetime-local" label="Deadline" outlined dense></v-text-field>
                <v-btn color="primary" @click="addTask">Add Task</v-btn>
              </v-card-text>
            </v-card>

            <v-card outlined>
              <v-card-title>Track Task Progress</v-card-title>
              <v-divider></v-divider>
              <v-list dense>
                <v-list-item v-for="task in workspace.tasks" :key="task.id" class="py-2">
                  <v-list-item-content>
                    <v-list-item-title>{{ task.title }}</v-list-item-title>
                    <v-list-item-subtitle>{{ task.assigned_to || 'self' }} · {{ task.priority }} · {{ task.status }}</v-list-item-subtitle>
                    <v-slider :value="task.progress_pct || 0" min="0" max="100" step="10" thumb-label @change="(val) => setTaskProgress(task.id, val)"></v-slider>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
        </v-row>
      </v-tab-item>

      <v-tab-item>
        <v-row>
          <v-col cols="12" md="6">
            <v-card outlined class="mb-4">
              <v-card-title>Add Hearing & Link to Case</v-card-title>
              <v-divider></v-divider>
              <v-card-text class="pt-4">
                <v-text-field v-model="courtForm.hearingDate" type="datetime-local" label="Hearing date" outlined dense></v-text-field>
                <v-text-field v-model="courtForm.courtName" label="Court" outlined dense class="mt-2"></v-text-field>
                <v-select v-model="courtForm.status" :items="hearingStatuses" label="Status" outlined dense class="mt-2"></v-select>
                <v-switch v-model="courtForm.reminderEnabled" label="Enable reminders"></v-switch>
                <v-btn color="primary" @click="addHearing">Add Hearing</v-btn>
              </v-card-text>
            </v-card>

            <v-card outlined>
              <v-card-title>Upload Court Document & Decision</v-card-title>
              <v-divider></v-divider>
              <v-card-text class="pt-4">
                <v-text-field v-model="courtForm.docTitle" label="Court document title" outlined dense></v-text-field>
                <v-text-field v-model="courtForm.docUrl" label="Document URL" outlined dense class="mt-2"></v-text-field>
                <v-btn color="primary" class="mb-3" @click="uploadCourtDoc">Upload Court Doc</v-btn>

                <v-divider class="mb-3"></v-divider>
                <v-text-field v-model="courtForm.decisionDate" type="datetime-local" label="Decision date" outlined dense></v-text-field>
                <v-text-field v-model="courtForm.outcome" label="Outcome" outlined dense class="mt-2"></v-text-field>
                <v-textarea v-model="courtForm.summary" label="Decision summary" outlined rows="2" class="mt-2"></v-textarea>
                <v-btn color="primary" @click="addDecision">Track Decision</v-btn>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card outlined class="mb-4">
              <v-card-title>Auto Sync Calendar (Premium)</v-card-title>
              <v-divider></v-divider>
              <v-list dense>
                <v-list-item v-for="h in workspace.hearings" :key="h.id">
                  <v-list-item-content>
                    <v-list-item-title>{{ h.court_name }}</v-list-item-title>
                    <v-list-item-subtitle>{{ formatDate(h.hearing_date) }} · synced: {{ h.calendar_synced ? 'yes' : 'no' }}</v-list-item-subtitle>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-btn x-small color="primary" @click="syncCalendar(h.id)">Sync</v-btn>
                  </v-list-item-action>
                </v-list-item>
              </v-list>
            </v-card>

            <v-card outlined>
              <v-card-title>Deadline Alerts (Critical)</v-card-title>
              <v-divider></v-divider>
              <v-card-text>
                <v-btn x-small color="primary" @click="loadAlerts">Refresh Alerts</v-btn>
                <div class="subtitle-2 mt-3">Hearings</div>
                <v-list dense>
                  <v-list-item v-for="item in alerts.hearings" :key="`ah-${item.id}`" class="px-0">
                    <v-list-item-content><v-list-item-title>{{ item.court_name }} · {{ formatDate(item.hearing_date) }}</v-list-item-title></v-list-item-content>
                  </v-list-item>
                </v-list>
                <div class="subtitle-2 mt-2">Tasks</div>
                <v-list dense>
                  <v-list-item v-for="item in alerts.tasks" :key="`at-${item.id}`" class="px-0">
                    <v-list-item-content><v-list-item-title>{{ item.title }} · {{ formatDate(item.due_date) }}</v-list-item-title></v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-tab-item>

      <v-tab-item>
        <v-row>
          <v-col cols="12" md="6">
            <v-card outlined class="mb-4">
              <v-card-title>Send Messages / Share Updates</v-card-title>
              <v-divider></v-divider>
              <v-card-text class="pt-4">
                <v-select v-model="clientForm.clientId" :items="caseClients" item-text="full_name" item-value="id" label="Client" outlined dense></v-select>
                <v-text-field v-model="clientForm.subject" label="Subject" outlined dense class="mt-2"></v-text-field>
                <v-textarea v-model="clientForm.body" label="Message" outlined rows="3" class="mt-2"></v-textarea>
                <v-btn color="primary" class="mr-2" @click="sendMessage">Send Message</v-btn>
                <v-btn outlined @click="shareUpdate">Share Case Update</v-btn>
              </v-card-text>
            </v-card>

            <v-card outlined>
              <v-card-title>Request Documents & Meetings</v-card-title>
              <v-divider></v-divider>
              <v-card-text class="pt-4">
                <v-textarea v-model="clientForm.requestDocs" label="Requested documents" outlined rows="2"></v-textarea>
                <v-btn color="primary" class="mb-3" @click="requestDocuments">Request Documents</v-btn>
                <v-divider class="mb-3"></v-divider>
                <v-text-field v-model="clientForm.meetingTitle" label="Meeting title" outlined dense></v-text-field>
                <v-text-field v-model="clientForm.meetingDate" type="datetime-local" label="Meeting date" outlined dense class="mt-2"></v-text-field>
                <v-btn color="primary" @click="scheduleMeeting">Schedule Meeting</v-btn>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card outlined>
              <v-card-title>Conversation History (Linked to Case)</v-card-title>
              <v-divider></v-divider>
              <v-list dense>
                <v-list-item v-for="msg in workspace.conversations" :key="msg.id">
                  <v-list-item-content>
                    <v-list-item-title>{{ msg.subject }}</v-list-item-title>
                    <v-list-item-subtitle>{{ msg.client_name || 'Client' }} · {{ msg.message_type }} · {{ formatDate(msg.created_at) }}</v-list-item-subtitle>
                    <div class="caption">{{ msg.body }}</div>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
        </v-row>
      </v-tab-item>

      <v-tab-item>
        <v-row>
          <v-col cols="12" md="6">
            <v-card outlined class="mb-4">
              <v-card-title>Convert Time Logs to Invoice</v-card-title>
              <v-divider></v-divider>
              <v-card-text class="pt-4">
                <v-text-field v-model.number="billingForm.hourlyRate" type="number" min="1" label="Hourly rate" outlined dense></v-text-field>
                <v-text-field v-model="billingForm.dueDate" type="datetime-local" label="Invoice due date" outlined dense class="mt-2"></v-text-field>
                <v-btn color="primary" @click="createInvoice">Create Invoice</v-btn>
              </v-card-text>
            </v-card>

            <v-card outlined>
              <v-card-title>Manage Retainer</v-card-title>
              <v-divider></v-divider>
              <v-card-text class="pt-4">
                <v-select v-model="billingForm.clientId" :items="caseClients" item-text="full_name" item-value="id" label="Client" outlined dense></v-select>
                <v-text-field v-model.number="billingForm.retainerAmount" type="number" min="1" label="Retainer amount" outlined dense class="mt-2"></v-text-field>
                <v-btn color="primary" @click="addCaseRetainer">Add Retainer</v-btn>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card outlined>
              <v-card-title>Invoices & Payments</v-card-title>
              <v-divider></v-divider>
              <v-list dense>
                <v-list-item v-for="invoice in workspace.invoices" :key="invoice.id">
                  <v-list-item-content>
                    <v-list-item-title>€{{ Number(invoice.amount).toFixed(2) }} · {{ invoice.status }}</v-list-item-title>
                    <v-list-item-subtitle>Due {{ formatDate(invoice.due_date) }} · paid €{{ Number(invoice.paid_amount || 0).toFixed(2) }}</v-list-item-subtitle>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-btn x-small color="primary" class="mb-1" @click="sendInvoiceNow(invoice.id)">Send</v-btn>
                    <v-btn x-small color="success" class="mb-1" @click="markPayment(invoice.id)">Pay €100</v-btn>
                    <v-btn x-small outlined @click="remindInvoice(invoice.id)">Remind</v-btn>
                  </v-list-item-action>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
        </v-row>
      </v-tab-item>

      <v-tab-item>
        <v-row>
          <v-col cols="12" md="6">
            <v-card outlined class="mb-4">
              <v-card-title>Search Case Law</v-card-title>
              <v-divider></v-divider>
              <v-card-text class="pt-4">
                <v-text-field v-model="researchForm.query" label="Search terms" outlined dense></v-text-field>
                <v-btn color="primary" @click="searchLaw">Search</v-btn>
                <v-list dense class="mt-3">
                  <v-list-item v-for="(item, i) in researchResults" :key="`r-${i}`" class="px-0">
                    <v-list-item-content>
                      <v-list-item-title>{{ item.title }}</v-list-item-title>
                      <v-list-item-subtitle>{{ item.citation }}</v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-action>
                      <v-btn x-small color="primary" @click="attachResearchRef(item)">Attach</v-btn>
                    </v-list-item-action>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>

            <v-card outlined>
              <v-card-title>Premium Research AI Suggestions</v-card-title>
              <v-divider></v-divider>
              <v-card-text>
                <v-btn x-small color="primary" @click="loadResearchAi">Suggest Laws</v-btn>
                <v-list dense class="mt-2">
                  <v-list-item v-for="(s, i) in researchSuggestions" :key="`rs-${i}`" class="px-0">
                    <v-list-item-icon><v-icon small color="purple">mdi-brain</v-icon></v-list-item-icon>
                    <v-list-item-content><v-list-item-title class="body-2">{{ s }}</v-list-item-title></v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card outlined>
              <v-card-title>Attached Research</v-card-title>
              <v-divider></v-divider>
              <v-list dense>
                <v-list-item v-for="ref in workspace.research" :key="ref.id">
                  <v-list-item-content>
                    <v-list-item-title>{{ ref.title }}</v-list-item-title>
                    <v-list-item-subtitle>{{ ref.citation }} · {{ ref.url }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
        </v-row>
      </v-tab-item>

      <v-tab-item>
        <v-row>
          <v-col cols="12" md="6">
            <v-card outlined>
              <v-card-title>Performance Analytics</v-card-title>
              <v-divider></v-divider>
              <v-card-text>
                <div class="text-h6 mb-2">Win Rate: {{ performance.winRate }}%</div>
                <div class="subtitle-2">Revenue per Case</div>
                <v-list dense>
                  <v-list-item v-for="item in performance.revenuePerCase" :key="`rev-${item.id}`" class="px-0">
                    <v-list-item-content>
                      <v-list-item-title>{{ item.title }}</v-list-item-title>
                      <v-list-item-subtitle>€{{ Number(item.revenue).toFixed(2) }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="6">
            <v-card outlined>
              <v-card-title>Billable Hours per Case</v-card-title>
              <v-divider></v-divider>
              <v-list dense>
                <v-list-item v-for="item in performance.billableHoursPerCase" :key="`hrs-${item.id}`">
                  <v-list-item-content>
                    <v-list-item-title>{{ item.title }}</v-list-item-title>
                    <v-list-item-subtitle>{{ Number(item.billable_hours).toFixed(2) }} hours</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
        </v-row>
      </v-tab-item>

      <v-tab-item>
        <v-row>
          <v-col cols="12" md="6">
            <v-card outlined class="mb-4">
              <v-card-title>Case Outcome Prediction</v-card-title>
              <v-divider></v-divider>
              <v-card-text>
                <v-btn x-small color="primary" @click="loadAiAdvanced">Refresh AI</v-btn>
                <div class="mt-3">Predicted Outcome: <strong>{{ aiAdvanced.predictedOutcome || '-' }}</strong></div>
                <div>Confidence: {{ aiAdvanced.confidence || 0 }}%</div>
                <div>Risk Score: {{ aiAdvanced.riskScore || 0 }}</div>
                <v-alert v-if="aiAdvanced.riskScore >= 60" type="warning" outlined dense class="mt-3">
                  AI insight: This case has high risk.
                </v-alert>
              </v-card-text>
            </v-card>

            <v-card outlined>
              <v-card-title>Strategy Suggestions</v-card-title>
              <v-divider></v-divider>
              <v-list dense>
                <v-list-item v-for="(s, i) in aiAdvanced.strategySuggestions || []" :key="`as-${i}`" class="px-0">
                  <v-list-item-icon><v-icon small color="indigo">mdi-target</v-icon></v-list-item-icon>
                  <v-list-item-content><v-list-item-title class="body-2">{{ s }}</v-list-item-title></v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card outlined>
              <v-card-title>Auto-generate Legal Draft</v-card-title>
              <v-divider></v-divider>
              <v-card-text>
                <v-textarea :value="aiAdvanced.draftGeneratorPreview || ''" outlined rows="12" readonly></v-textarea>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-tab-item>
    </v-tabs-items>

    <v-snackbar v-model="snackbar" :color="snackbarColor" timeout="2800">{{ snackbarMessage }}</v-snackbar>
  </v-container>
</template>

<script>
import {
  addCaseDocument,
  addCaseEvidence,
  addCaseEvent,
  addCaseHearing,
  addCaseNote,
  addCaseTask,
  addCourtDecision,
  addRetainer,
  attachResearch,
  compareDocumentVersions,
  createDocumentFromTemplate,
  createInvoiceFromTime,
  getCaseAiAdvanced,
  getCaseAiSuggestions,
  getCaseWorkspace,
  getDeadlineAlerts,
  getLawyerPerformance,
  getLawyerTemplates,
  getResearchAiSuggestions,
  getTimeSuggestions,
  listClients,
  logCaseTime,
  requestClientDocuments,
  registerInvoicePayment,
  scheduleCaseMeeting,
  searchCaseLaw,
  sendCaseMessage,
  sendDocumentForESign,
  sendInvoice,
  sendPaymentReminder,
  shareCaseUpdate,
  startCaseTimer,
  stopCaseTimer,
  summarizeDocument,
  syncHearingCalendar,
  updateCaseStatus,
  updateTaskProgress,
  saveDocumentVersion,
} from '@/services/lawyerApi';

export default {
  name: 'LawyerCaseWorkspace',
  data() {
    return {
      tab: 0,
      tabs: ['Documents', 'Time & Tasks', 'Court & Hearings', 'Clients', 'Billing', 'Research', 'Performance', 'AI Advanced'],
      lawyerId: 1,
      premiumEnabled: true,
      loading: false,
      updatingStatus: false,
      error: '',
      caseStatus: 'open',
      statuses: ['open', 'in_progress', 'closed'],
      hearingStatuses: ['scheduled', 'adjourned', 'completed', 'cancelled'],
      workspace: {
        case: null,
        notes: [],
        evidence: [],
        timeline: [],
        documents: [],
        hearings: [],
        timeLogs: [],
        meetings: [],
        tasks: [],
        decisions: [],
        conversations: [],
        invoices: [],
        retainers: [],
        research: [],
        timers: [],
      },
      allClients: [],
      templates: [],
      docCompare: {},
      docSummary: '',
      timeSuggestions: [],
      alerts: { hearings: [], tasks: [] },
      researchResults: [],
      researchSuggestions: [],
      performance: { winRate: 0, revenuePerCase: [], billableHoursPerCase: [] },
      ai: { suggestions: [], riskFlags: [] },
      aiAdvanced: {},
      docForm: {
        templateId: null,
        templateTitle: '',
        editDocumentId: null,
        versionContent: '',
        changeSummary: '',
        externalTitle: '',
        externalUrl: '',
        compareDocumentId: null,
        fromVersion: 1,
        toVersion: 2,
        esignDocumentId: null,
        clientId: null,
      },
      timeForm: {
        hours: 1,
        description: '',
        timerNote: '',
      },
      taskForm: {
        title: '',
        assignedTo: 'self',
        priority: 'normal',
        dueDate: '',
      },
      courtForm: {
        hearingDate: '',
        courtName: '',
        status: 'scheduled',
        reminderEnabled: true,
        docTitle: '',
        docUrl: '',
        decisionDate: '',
        outcome: '',
        summary: '',
      },
      clientForm: {
        clientId: null,
        subject: '',
        body: '',
        requestDocs: '',
        meetingTitle: '',
        meetingDate: '',
      },
      billingForm: {
        hourlyRate: 120,
        dueDate: '',
        clientId: null,
        retainerAmount: 0,
      },
      researchForm: {
        query: '',
      },
      snackbar: false,
      snackbarMessage: '',
      snackbarColor: 'success',
    };
  },
  computed: {
    caseId() {
      return Number.parseInt(this.$route.params.id, 10);
    },
    caseClients() {
      const names = this.workspace.case && this.workspace.case.clients ? this.workspace.case.clients : [];
      return this.allClients.filter(client => names.includes(client.full_name));
    },
    templateItems() {
      return this.templates;
    },
    documentItems() {
      return this.workspace.documents || [];
    },
  },
  created() {
    this.refreshAll();
  },
  methods: {
    formatDate(value) {
      if (!value) return '-';
      return new Date(value).toLocaleString();
    },
    notify(message, color = 'success') {
      this.snackbarMessage = message;
      this.snackbarColor = color;
      this.snackbar = true;
    },
    async refreshAll() {
      this.loading = true;
      this.error = '';
      try {
        const [workspace, clients, templates, perf, aiBasic, aiAdv] = await Promise.all([
          getCaseWorkspace(this.caseId),
          listClients(),
          getLawyerTemplates(),
          getLawyerPerformance(this.lawyerId),
          getCaseAiSuggestions(this.caseId),
          getCaseAiAdvanced(this.caseId),
        ]);
        this.workspace = workspace;
        this.caseStatus = workspace.case.status;
        this.allClients = clients.clients;
        this.templates = templates.templates;
        this.performance = perf;
        this.ai = aiBasic;
        this.aiAdvanced = aiAdv;
        await this.loadAlerts();
      } catch (err) {
        this.error = err.message || 'Failed to load workspace.';
      } finally {
        this.loading = false;
      }
    },
    async saveStatus() {
      this.updatingStatus = true;
      try {
        await updateCaseStatus(this.caseId, this.caseStatus);
        this.notify('Case status updated.');
        await this.refreshAll();
      } catch (err) {
        this.notify(err.message || 'Could not update case status.', 'error');
      } finally {
        this.updatingStatus = false;
      }
    },

    async createFromTemplate() {
      try {
        await createDocumentFromTemplate(this.caseId, {
          templateId: this.docForm.templateId,
          title: this.docForm.templateTitle,
          lawyerId: this.lawyerId,
          premium: this.premiumEnabled,
        });
        this.notify('Document created from template.');
        await this.refreshAll();
      } catch (err) {
        this.notify(err.message || 'Failed to create document.', 'error');
      }
    },
    async saveVersion() {
      try {
        await saveDocumentVersion(this.caseId, this.docForm.editDocumentId, {
          lawyerId: this.lawyerId,
          contentText: this.docForm.versionContent,
          changeSummary: this.docForm.changeSummary,
        });
        this.notify('Document version saved.');
      } catch (err) {
        this.notify(err.message || 'Failed to save version.', 'error');
      }
    },
    async uploadExternal() {
      try {
        await addCaseDocument(this.caseId, {
          title: this.docForm.externalTitle,
          documentUrl: this.docForm.externalUrl,
          sourceType: 'uploaded',
          isExternal: true,
        });
        this.notify('External document uploaded.');
        await this.refreshAll();
      } catch (err) {
        this.notify(err.message || 'Upload failed.', 'error');
      }
    },
    async compareVersions() {
      try {
        const result = await compareDocumentVersions(
          this.caseId,
          this.docForm.compareDocumentId,
          this.docForm.fromVersion,
          this.docForm.toVersion
        );
        this.docCompare = result.compare || {};
      } catch (err) {
        this.notify(err.message || 'Compare failed.', 'error');
      }
    },
    async sendESign() {
      try {
        await sendDocumentForESign(this.caseId, this.docForm.esignDocumentId, {
          clientId: this.docForm.clientId,
        });
        this.notify('E-sign request sent.');
      } catch (err) {
        this.notify(err.message || 'E-sign request failed.', 'error');
      }
    },
    async aiSummarize() {
      try {
        const target = this.workspace.documents.find(d => d.id === this.docForm.esignDocumentId);
        const summary = await summarizeDocument(this.caseId, {
          contentText: (target && target.content_text) || this.docForm.versionContent || '',
          premium: this.premiumEnabled,
        });
        this.docSummary = summary.summary;
      } catch (err) {
        this.notify(err.message || 'AI summary failed.', 'error');
      }
    },

    async logTime() {
      try {
        await logCaseTime(this.caseId, {
          lawyerId: this.lawyerId,
          hours: this.timeForm.hours,
          description: this.timeForm.description,
          source: 'manual',
        });
        this.notify('Time logged.');
        await this.refreshAll();
      } catch (err) {
        this.notify(err.message || 'Could not log time.', 'error');
      }
    },
    async startTimer() {
      try {
        await startCaseTimer(this.caseId, {
          lawyerId: this.lawyerId,
          activityNote: this.timeForm.timerNote,
        });
        this.notify('Timer started.');
        await this.refreshAll();
      } catch (err) {
        this.notify(err.message || 'Could not start timer.', 'error');
      }
    },
    async stopTimer() {
      try {
        await stopCaseTimer(this.caseId, {
          lawyerId: this.lawyerId,
          description: this.timeForm.description,
        });
        this.notify('Timer stopped and logged.');
        await this.refreshAll();
      } catch (err) {
        this.notify(err.message || 'Could not stop timer.', 'error');
      }
    },
    async loadTimeSuggestions() {
      try {
        const payload = await getTimeSuggestions(this.caseId);
        this.timeSuggestions = payload.suggestions || [];
      } catch (err) {
        this.notify(err.message || 'Could not load suggestions.', 'error');
      }
    },
    async addTask() {
      try {
        await addCaseTask(this.caseId, {
          lawyerId: this.lawyerId,
          title: this.taskForm.title,
          dueDate: this.taskForm.dueDate,
          priority: this.taskForm.priority,
          assignedTo: this.taskForm.assignedTo,
        });
        this.notify('Task added.');
        this.taskForm.title = '';
        await this.refreshAll();
      } catch (err) {
        this.notify(err.message || 'Could not add task.', 'error');
      }
    },
    async setTaskProgress(taskId, progress) {
      try {
        await updateTaskProgress(taskId, { progressPct: progress });
        await this.refreshAll();
      } catch (err) {
        this.notify(err.message || 'Could not update progress.', 'error');
      }
    },

    async addHearing() {
      try {
        await addCaseHearing(this.caseId, {
          hearingDate: this.courtForm.hearingDate,
          courtName: this.courtForm.courtName,
          status: this.courtForm.status,
          notes: '',
          reminderEnabled: this.courtForm.reminderEnabled,
        });
        this.notify('Hearing added.');
        await this.refreshAll();
      } catch (err) {
        this.notify(err.message || 'Could not add hearing.', 'error');
      }
    },
    async uploadCourtDoc() {
      try {
        await addCaseDocument(this.caseId, {
          title: this.courtForm.docTitle,
          documentUrl: this.courtForm.docUrl,
          sourceType: 'court',
          isExternal: true,
        });
        this.notify('Court document uploaded.');
        await this.refreshAll();
      } catch (err) {
        this.notify(err.message || 'Could not upload court document.', 'error');
      }
    },
    async addDecision() {
      try {
        await addCourtDecision(this.caseId, {
          decisionDate: this.courtForm.decisionDate,
          outcome: this.courtForm.outcome,
          summary: this.courtForm.summary,
        });
        this.notify('Court decision tracked.');
        await this.refreshAll();
      } catch (err) {
        this.notify(err.message || 'Could not add decision.', 'error');
      }
    },
    async syncCalendar(hearingId) {
      try {
        await syncHearingCalendar(this.caseId, hearingId);
        this.notify('Hearing synced with calendar.');
        await this.refreshAll();
      } catch (err) {
        this.notify(err.message || 'Could not sync calendar.', 'error');
      }
    },
    async loadAlerts() {
      try {
        const payload = await getDeadlineAlerts(this.caseId);
        this.alerts = payload.alerts || { hearings: [], tasks: [] };
      } catch (err) {
        this.alerts = { hearings: [], tasks: [] };
      }
    },

    async sendMessage() {
      try {
        await sendCaseMessage(this.caseId, {
          lawyerId: this.lawyerId,
          clientId: this.clientForm.clientId,
          subject: this.clientForm.subject,
          body: this.clientForm.body,
          messageType: 'message',
        });
        this.notify('Message sent.');
        await this.refreshAll();
      } catch (err) {
        this.notify(err.message || 'Could not send message.', 'error');
      }
    },
    async requestDocuments() {
      try {
        await requestClientDocuments(this.caseId, {
          lawyerId: this.lawyerId,
          clientId: this.clientForm.clientId,
          documentsNeeded: this.clientForm.requestDocs,
        });
        this.notify('Document request sent.');
        await this.refreshAll();
      } catch (err) {
        this.notify(err.message || 'Could not request documents.', 'error');
      }
    },
    async shareUpdate() {
      try {
        await shareCaseUpdate(this.caseId, {
          lawyerId: this.lawyerId,
          clientId: this.clientForm.clientId,
          updateText: this.clientForm.body,
        });
        this.notify('Case update shared.');
        await this.refreshAll();
      } catch (err) {
        this.notify(err.message || 'Could not share update.', 'error');
      }
    },
    async scheduleMeeting() {
      try {
        await scheduleCaseMeeting(this.caseId, {
          lawyerId: this.lawyerId,
          title: this.clientForm.meetingTitle,
          meetingDate: this.clientForm.meetingDate,
          notes: '',
        });
        this.notify('Meeting scheduled.');
        await this.refreshAll();
      } catch (err) {
        this.notify(err.message || 'Could not schedule meeting.', 'error');
      }
    },

    async createInvoice() {
      try {
        await createInvoiceFromTime(this.caseId, {
          hourlyRate: this.billingForm.hourlyRate,
          dueDate: this.billingForm.dueDate,
          billingRule: 'standard_time_rule',
        });
        this.notify('Invoice created from time logs.');
        await this.refreshAll();
      } catch (err) {
        this.notify(err.message || 'Could not create invoice.', 'error');
      }
    },
    async sendInvoiceNow(invoiceId) {
      try {
        await sendInvoice(invoiceId);
        this.notify('Invoice sent to client.');
        await this.refreshAll();
      } catch (err) {
        this.notify(err.message || 'Could not send invoice.', 'error');
      }
    },
    async markPayment(invoiceId) {
      try {
        await registerInvoicePayment(invoiceId, { amount: 100 });
        this.notify('Payment recorded.');
        await this.refreshAll();
      } catch (err) {
        this.notify(err.message || 'Could not record payment.', 'error');
      }
    },
    async remindInvoice(invoiceId) {
      try {
        await sendPaymentReminder(invoiceId);
        this.notify('Payment reminder sent.');
        await this.refreshAll();
      } catch (err) {
        this.notify(err.message || 'Could not send reminder.', 'error');
      }
    },
    async addCaseRetainer() {
      try {
        await addRetainer(this.caseId, {
          clientId: this.billingForm.clientId,
          amount: this.billingForm.retainerAmount,
        });
        this.notify('Retainer added.');
        await this.refreshAll();
      } catch (err) {
        this.notify(err.message || 'Could not add retainer.', 'error');
      }
    },

    async searchLaw() {
      try {
        const payload = await searchCaseLaw(this.researchForm.query);
        this.researchResults = payload.results || [];
      } catch (err) {
        this.notify(err.message || 'Case law search failed.', 'error');
      }
    },
    async attachResearchRef(item) {
      try {
        await attachResearch(this.caseId, {
          title: item.title,
          citation: item.citation,
          url: item.url,
          notes: 'Attached from search',
        });
        this.notify('Research attached to case.');
        await this.refreshAll();
      } catch (err) {
        this.notify(err.message || 'Could not attach research.', 'error');
      }
    },
    async loadResearchAi() {
      try {
        const payload = await getResearchAiSuggestions(this.caseId);
        this.researchSuggestions = payload.suggestions || [];
      } catch (err) {
        this.notify(err.message || 'Could not load research AI suggestions.', 'error');
      }
    },

    async loadAiAdvanced() {
      try {
        this.aiAdvanced = await getCaseAiAdvanced(this.caseId);
      } catch (err) {
        this.notify(err.message || 'Could not refresh AI advanced.', 'error');
      }
    },

    async seedQuickNoteEvidence() {
      try {
        await addCaseNote(this.caseId, {
          lawyerId: this.lawyerId,
          noteContent: 'Initial legal strategy note.',
          strategy: 'Preserve evidence chain and prepare hearing brief.',
        });
        await addCaseEvidence(this.caseId, {
          title: 'Survey map',
          fileUrl: 'https://docs.example/survey-map.pdf',
          description: 'Initial property layout map.',
        });
        await addCaseEvent(this.caseId, {
          eventType: 'case_update',
          eventDate: new Date().toISOString(),
          description: 'Initial workspace setup completed.',
        });
      } catch (_err) {
        // Non-blocking helper.
      }
    },
  },
};
</script>
