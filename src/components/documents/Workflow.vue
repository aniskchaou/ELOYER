<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col>
        <h1 class="text-h5 font-weight-bold">Document Workflow &amp; Approvals</h1>
        <p class="body-2 grey--text">Track document review and approval stages</p>
      </v-col>
      <v-col cols="auto">
        <v-btn color="primary" @click="openNew">
          <v-icon left>mdi-plus</v-icon> New Workflow
        </v-btn>
      </v-col>
    </v-row>

    <!-- Stats -->
    <v-row class="mb-4">
      <v-col v-for="s in statusStats" :key="s.label" cols="6" md="3">
        <v-card outlined class="pa-3 text-center">
          <div class="overline">{{ s.label }}</div>
          <p class="text-h5 font-weight-bold" :class="s.color">{{ s.count }}</p>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filters -->
    <v-card outlined class="mb-4 pa-3">
      <v-row>
        <v-col cols="12" md="3">
          <v-select v-model="filterStatus" :items="statusOptions" label="Status" outlined dense clearable></v-select>
        </v-col>
        <v-col cols="12" md="3">
          <v-select v-model="filterAssignee" :items="approvers" label="Approver" outlined dense clearable></v-select>
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="Search" outlined dense></v-text-field>
        </v-col>
      </v-row>
    </v-card>

    <!-- Workflow list -->
    <v-data-table :headers="headers" :items="filteredWorkflows" :search="search" class="elevation-1">
      <template v-slot:item.status="{ item }">
        <v-chip small :color="statusColor(item.status)" dark>{{ item.status }}</v-chip>
      </template>
      <template v-slot:item.priority="{ item }">
        <v-chip small :color="priorityColor(item.priority)" outlined>{{ item.priority }}</v-chip>
      </template>
      <template v-slot:item.stage="{ item }">
        <v-progress-linear :value="stageProgress(item.stage, item.totalStages)" height="18" rounded
          :color="statusColor(item.status)">
          <span class="caption white--text">{{ item.stage }}/{{ item.totalStages }}</span>
        </v-progress-linear>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-btn icon small color="primary" @click="viewWorkflow(item)"><v-icon small>mdi-eye</v-icon></v-btn>
        <v-btn icon small color="green" @click="approve(item)" :disabled="item.status === 'Approved'"><v-icon small>mdi-check</v-icon></v-btn>
        <v-btn icon small color="red" @click="reject(item)" :disabled="item.status === 'Rejected' || item.status === 'Approved'"><v-icon small>mdi-close</v-icon></v-btn>
      </template>
    </v-data-table>

    <!-- Detail/Approve Dialog -->
    <v-dialog v-model="detailDialog" max-width="680px">
      <v-card v-if="selected">
        <v-card-title>{{ selected.document }}
          <v-spacer></v-spacer>
          <v-chip small :color="statusColor(selected.status)" dark>{{ selected.status }}</v-chip>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-row>
            <v-col cols="6"><strong>Case:</strong> {{ selected.case }}</v-col>
            <v-col cols="6"><strong>Submitted By:</strong> {{ selected.submittedBy }}</v-col>
            <v-col cols="6"><strong>Submitted:</strong> {{ selected.submitted }}</v-col>
            <v-col cols="6"><strong>Deadline:</strong> {{ selected.deadline }}</v-col>
          </v-row>
          <!-- Stages -->
          <v-card outlined class="mt-4">
            <v-card-title class="body-2">Approval Stages</v-card-title>
            <v-divider></v-divider>
            <v-list dense>
              <v-list-item v-for="(stage, i) in selected.stages" :key="i">
                <v-list-item-icon>
                  <v-icon :color="stageIcon(stage.status).color">{{ stageIcon(stage.status).icon }}</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>{{ stage.label }}</v-list-item-title>
                  <v-list-item-subtitle>{{ stage.assignee }} &mdash; {{ stage.date || 'Pending' }}</v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <v-chip x-small :color="stageIcon(stage.status).color" dark>{{ stage.status }}</v-chip>
                </v-list-item-action>
              </v-list-item>
            </v-list>
          </v-card>
          <v-textarea v-model="comment" label="Approval / Rejection Comment" outlined rows="3" class="mt-4"></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="detailDialog = false">Close</v-btn>
          <v-btn color="red" dark @click="rejectSelected" :disabled="selected.status === 'Approved' || selected.status === 'Rejected'">Reject</v-btn>
          <v-btn color="green" dark @click="approveSelected" :disabled="selected.status === 'Approved' || selected.status === 'Rejected'">Approve</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- New Workflow Dialog -->
    <v-dialog v-model="newDialog" max-width="520px">
      <v-card>
        <v-card-title>New Workflow</v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pt-4">
          <v-text-field v-model="newForm.document" label="Document Name" outlined dense></v-text-field>
          <v-text-field v-model="newForm.case" label="Case" outlined dense class="mt-3"></v-text-field>
          <v-select v-model="newForm.priority" :items="['High','Medium','Low']" label="Priority" outlined dense class="mt-3"></v-select>
          <v-select v-model="newForm.approvers" :items="approvers" label="Approvers" multiple outlined dense class="mt-3"></v-select>
          <v-text-field v-model="newForm.deadline" label="Deadline" outlined dense class="mt-3" type="date"></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="newDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="createWorkflow">Create</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
export default {
  name: 'Workflow',
  data() {
    return {
      search: '',
      filterStatus: null,
      filterAssignee: null,
      detailDialog: false,
      newDialog: false,
      selected: null,
      comment: '',
      newForm: { document: '', case: '', priority: 'Medium', approvers: [], deadline: '' },
      approvers: ['John Doe', 'Emily Clark', 'Michael Lee', 'Sara Lee', 'David Kim'],
      statusOptions: ['Pending', 'In Review', 'Approved', 'Rejected'],
      workflows: [
        {
          id: 1, document: 'Merger Agreement v3.pdf', case: 'C-101: Corporate Merger',
          submittedBy: 'John Doe', submitted: '2025-09-01', deadline: '2025-09-15',
          status: 'In Review', priority: 'High', stage: 2, totalStages: 3,
          stages: [
            { label: 'Legal Review', assignee: 'Emily Clark', status: 'Approved', date: '2025-09-05' },
            { label: 'Partner Review', assignee: 'John Doe', status: 'In Review', date: null },
            { label: 'Client Signature', assignee: 'ABC Ltd', status: 'Pending', date: null },
          ],
        },
        {
          id: 2, document: 'NDA_TechCorp.docx', case: 'C-103: IP Dispute',
          submittedBy: 'Michael Lee', submitted: '2025-09-08', deadline: '2025-09-20',
          status: 'Pending', priority: 'Medium', stage: 0, totalStages: 2,
          stages: [
            { label: 'Legal Review', assignee: 'Michael Lee', status: 'Pending', date: null },
            { label: 'Client Signature', assignee: 'TechCorp', status: 'Pending', date: null },
          ],
        },
        {
          id: 3, document: 'Settlement_SmithCase.pdf', case: 'C-102: Criminal Appeal',
          submittedBy: 'Emily Clark', submitted: '2025-08-20', deadline: '2025-09-01',
          status: 'Approved', priority: 'Low', stage: 2, totalStages: 2,
          stages: [
            { label: 'Legal Review', assignee: 'Emily Clark', status: 'Approved', date: '2025-08-22' },
            { label: 'Client Signature', assignee: 'Jane Smith', status: 'Approved', date: '2025-08-28' },
          ],
        },
      ],
      headers: [
        { text: 'Document', value: 'document' },
        { text: 'Case', value: 'case' },
        { text: 'Priority', value: 'priority' },
        { text: 'Status', value: 'status' },
        { text: 'Progress', value: 'stage' },
        { text: 'Deadline', value: 'deadline' },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
    };
  },
  computed: {
    filteredWorkflows() {
      let list = this.workflows;
      if (this.filterStatus) list = list.filter(w => w.status === this.filterStatus);
      if (this.filterAssignee) list = list.filter(w => w.stages.some(s => s.assignee === this.filterAssignee));
      return list;
    },
    statusStats() {
      return [
        { label: 'Pending', count: this.workflows.filter(w => w.status === 'Pending').length, color: 'orange--text' },
        { label: 'In Review', count: this.workflows.filter(w => w.status === 'In Review').length, color: 'blue--text' },
        { label: 'Approved', count: this.workflows.filter(w => w.status === 'Approved').length, color: 'green--text' },
        { label: 'Rejected', count: this.workflows.filter(w => w.status === 'Rejected').length, color: 'red--text' },
      ];
    },
  },
  methods: {
    stageProgress(stage, total) { return total ? (stage / total) * 100 : 0; },
    statusColor(s) { return { Pending: 'orange', 'In Review': 'blue', Approved: 'green', Rejected: 'red' }[s] || 'grey'; },
    priorityColor(p) { return { High: 'red', Medium: 'orange', Low: 'blue' }[p] || 'grey'; },
    stageIcon(s) {
      const map = { Approved: { icon: 'mdi-check-circle', color: 'green' }, Rejected: { icon: 'mdi-close-circle', color: 'red' }, 'In Review': { icon: 'mdi-clock', color: 'blue' }, Pending: { icon: 'mdi-circle-outline', color: 'grey' } };
      return map[s] || { icon: 'mdi-circle-outline', color: 'grey' };
    },
    viewWorkflow(item) { this.selected = item; this.comment = ''; this.detailDialog = true; },
    approve(item) { item.status = 'Approved'; item.stage = item.totalStages; },
    reject(item) { item.status = 'Rejected'; },
    approveSelected() { if (this.selected) { this.approve(this.selected); this.detailDialog = false; } },
    rejectSelected() { if (this.selected) { this.reject(this.selected); this.detailDialog = false; } },
    openNew() { this.newForm = { document: '', case: '', priority: 'Medium', approvers: [], deadline: '' }; this.newDialog = true; },
    createWorkflow() {
      this.workflows.push({
        id: Date.now(),
        document: this.newForm.document,
        case: this.newForm.case,
        submittedBy: 'Me',
        submitted: new Date().toISOString().split('T')[0],
        deadline: this.newForm.deadline,
        status: 'Pending',
        priority: this.newForm.priority,
        stage: 0,
        totalStages: this.newForm.approvers.length,
        stages: this.newForm.approvers.map(a => ({ label: 'Review', assignee: a, status: 'Pending', date: null })),
      });
      this.newDialog = false;
    },
  },
};
</script>
