<template>
  <v-container fluid>
    <v-row class="mb-4" align="center">
      <v-col><h1 class="text-h5 font-weight-bold">AI Smart Tasks</h1><p class="body-2 grey--text">Auto-prioritized tasks generated from case activity</p></v-col>
      <v-col cols="auto"><v-btn color="primary" @click="generate"><v-icon left>mdi-auto-fix</v-icon> Generate Tasks</v-btn></v-col>
    </v-row>

    <v-data-table :headers="headers" :items="tasks" class="elevation-1">
      <template v-slot:item.priority="{ item }">
        <v-chip x-small :color="item.priority === 'High' ? 'red' : item.priority === 'Medium' ? 'orange' : 'green'" dark>{{ item.priority }}</v-chip>
      </template>
      <template v-slot:item.status="{ item }">
        <v-chip x-small :color="item.status === 'Done' ? 'green' : 'blue'" dark>{{ item.status }}</v-chip>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-btn icon small color="green" @click="item.status='Done'" v-if="item.status !== 'Done'"><v-icon small>mdi-check</v-icon></v-btn>
      </template>
    </v-data-table>
  </v-container>
</template>
<script>
export default {
  name: 'SmartTasks',
  data() {
    return {
      tasks: [
        { title: 'Prepare evidence index for Smith appeal', case: 'Criminal Appeal – Smith', due: '2026-05-14', priority: 'High', status: 'Open' },
        { title: 'Draft settlement proposal', case: 'Property Dispute – Ben Ali', due: '2026-05-20', priority: 'Medium', status: 'Open' },
        { title: 'Follow up on unsigned contract', case: 'Corporate Merger – ABC Ltd', due: '2026-05-16', priority: 'Low', status: 'Open' },
      ],
      headers: [
        { text: 'Task', value: 'title' },
        { text: 'Case', value: 'case' },
        { text: 'Due Date', value: 'due' },
        { text: 'Priority', value: 'priority' },
        { text: 'Status', value: 'status' },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
    };
  },
  methods: {
    generate() {
      this.tasks.push({ title: 'Review hearing notes and propose next steps', case: 'Property Dispute – Ben Ali', due: '2026-05-18', priority: 'Medium', status: 'Open' });
    },
  },
};
</script>
