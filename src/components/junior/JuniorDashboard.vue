<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col>
        <h1 class="text-h5 font-weight-bold"><v-icon left color="cyan darken-1">mdi-school</v-icon>Task Dashboard</h1>
        <p class="body-2 grey--text">Your assigned tasks, deadlines and case workload</p>
      </v-col>
    </v-row>

    <v-row class="mb-4">
      <v-col cols="6" md="3" v-for="s in stats" :key="s.label">
        <v-card outlined class="pa-4 text-center">
          <v-icon :color="s.color" large>{{ s.icon }}</v-icon>
          <div class="overline mt-1">{{ s.label }}</div>
          <div class="text-h4 font-weight-bold" :class="s.color+'--text'">{{ s.value }}</div>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <!-- Assigned Tasks -->
      <v-col cols="12" md="7">
        <v-card outlined>
          <v-card-title class="subtitle-1">
            Assigned Tasks
            <v-spacer></v-spacer>
            <v-chip-group v-model="taskFilter" mandatory active-class="cyan darken-1 white--text">
              <v-chip value="">All</v-chip>
              <v-chip value="pending">Pending</v-chip>
              <v-chip value="in_progress">In Progress</v-chip>
              <v-chip value="done">Done</v-chip>
            </v-chip-group>
          </v-card-title>
          <v-divider></v-divider>
          <v-list dense>
            <v-list-item v-for="task in filteredTasks" :key="task.id">
              <v-list-item-icon>
                <v-icon :color="priorityColor(task.priority)" small>mdi-circle</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ task.title }}</v-list-item-title>
                <v-list-item-subtitle>
                  {{ task.case_title || 'General' }}
                  <span v-if="task.due_date" class="ml-2" :class="isPast(task.due_date) ? 'red--text' : 'grey--text'">
                    · Due {{ new Date(task.due_date).toLocaleDateString() }}
                  </span>
                </v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-chip x-small :color="statusColor(task.status)" dark>{{ task.status }}</v-chip>
              </v-list-item-action>
            </v-list-item>
            <v-list-item v-if="!filteredTasks.length">
              <v-list-item-content><v-list-item-subtitle>No tasks found.</v-list-item-subtitle></v-list-item-content>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Quick Links + Research Notes -->
      <v-col cols="12" md="5">
        <v-card outlined class="pa-4 mb-4">
          <v-card-title class="subtitle-1 pb-2">Quick Actions</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-btn block outlined color="cyan darken-1" class="mb-2" to="/junior/research">
            <v-icon left small>mdi-magnify</v-icon>Research Workspace
          </v-btn>
          <v-btn block outlined color="blue" class="mb-2" to="/attorney/pleadings">
            <v-icon left small>mdi-file-document-edit</v-icon>Draft a Pleading
          </v-btn>
          <v-btn block outlined color="teal" class="mb-2" to="/attorney/billable-hours">
            <v-icon left small>mdi-clock</v-icon>Log Time
          </v-btn>
          <v-btn block outlined color="purple" to="/senior/collaboration">
            <v-icon left small>mdi-forum</v-icon>Team Chat
          </v-btn>
        </v-card>

        <v-card outlined class="pa-4">
          <v-card-title class="subtitle-1 pb-2">Recent Research Notes</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-list dense>
            <v-list-item v-for="note in notes.slice(0,4)" :key="note.id">
              <v-list-item-icon><v-icon small color="cyan">mdi-note-text</v-icon></v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title>{{ note.title }}</v-list-item-title>
                <v-list-item-subtitle>{{ new Date(note.updated_at).toLocaleDateString() }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-list-item v-if="!notes.length">
              <v-list-item-content><v-list-item-subtitle>No notes yet.</v-list-item-subtitle></v-list-item-content>
            </v-list-item>
          </v-list>
          <v-btn x-small text color="cyan darken-1" to="/junior/research">View all →</v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import { stGetResearchNotes } from '@/services/staffApi';
export default {
  name: 'JuniorDashboard',
  data() {
    return {
      tasks: [], notes: [], loading: true, taskFilter: '',
      mockTasks: [
        { id: 1, title: 'Review property deed bundle', case_title: 'Property Dispute - Ben Ali', status: 'pending', priority: 'high', due_date: new Date(Date.now() + 2*86400000) },
        { id: 2, title: 'Research adverse possession precedents', case_title: 'Property Dispute - Ben Ali', status: 'in_progress', priority: 'normal', due_date: new Date(Date.now() + 5*86400000) },
        { id: 3, title: 'Prepare motion draft', case_title: 'Corporate Merger', status: 'pending', priority: 'high', due_date: new Date(Date.now() - 1*86400000) },
        { id: 4, title: 'Upload evidence scan', case_title: 'Labor Dispute', status: 'done', priority: 'low', due_date: null },
      ],
    };
  },
  computed: {
    filteredTasks() {
      return this.taskFilter
        ? this.mockTasks.filter(t => t.status === this.taskFilter)
        : this.mockTasks;
    },
    stats() {
      return [
        { label: 'Total Tasks', value: this.mockTasks.length, icon: 'mdi-clipboard-list', color: 'cyan' },
        { label: 'Pending', value: this.mockTasks.filter(t => t.status === 'pending').length, icon: 'mdi-clock', color: 'orange' },
        { label: 'In Progress', value: this.mockTasks.filter(t => t.status === 'in_progress').length, icon: 'mdi-progress-clock', color: 'blue' },
        { label: 'Overdue', value: this.mockTasks.filter(t => t.due_date && this.isPast(t.due_date) && t.status !== 'done').length, icon: 'mdi-alert', color: 'red' },
      ];
    },
  },
  created() { this.load(); },
  methods: {
    async load() {
      try { this.notes = await stGetResearchNotes(1); }
      catch (e) { console.error(e); }
    },
    isPast(d) { return new Date(d) < new Date(); },
    priorityColor(p) { return p === 'high' ? 'red' : p === 'normal' ? 'orange' : 'grey'; },
    statusColor(s) { return s === 'done' ? 'success' : s === 'in_progress' ? 'blue' : 'orange'; },
  },
};
</script>
