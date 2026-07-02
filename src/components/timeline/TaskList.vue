<template>
  <v-card>
    <v-card-title>Case Tasks</v-card-title>
    <v-divider></v-divider>
    <v-form @submit.prevent="addTask">
      <v-row>
        <v-col cols="12" md="3">
          <v-text-field v-model="newTask.title" label="Title" required></v-text-field>
        </v-col>
        <v-col cols="12" md="2">
          <v-select v-model="newTask.status" :items="statusOptions" label="Status" required></v-select>
        </v-col>
        <v-col cols="12" md="2">
          <v-select v-model="newTask.priority" :items="priorityOptions" label="Priority" required></v-select>
        </v-col>
        <v-col cols="12" md="2">
          <v-menu ref="menu" v-model="menu" :close-on-content-click="false" transition="scale-transition" offset-y>
            <template v-slot:activator="{ on, attrs }">
              <v-text-field v-model="newTask.dueDate" label="Due Date" readonly v-bind="attrs" v-on="on"></v-text-field>
            </template>
            <v-date-picker v-model="newTask.dueDate" @input="menu = false"></v-date-picker>
          </v-menu>
        </v-col>
        <v-col cols="12" md="2">
          <v-select v-model="newTask.caseId" :items="caseOptions" label="Case" required></v-select>
        </v-col>
        <v-col cols="12" md="1">
          <v-btn color="primary" type="submit">Add Task</v-btn>
        </v-col>
      </v-row>
    </v-form>
    <v-list>
      <v-list-item v-for="task in filteredTasks" :key="task.id">
        <v-list-item-content>
          <v-list-item-title>{{ task.title }}</v-list-item-title>
          <v-list-item-subtitle>
            Assigned to: {{ task.assignedTo }} | Due: {{ task.dueDate }} | Priority: {{ task.priority }}
          </v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-action>
          <v-chip :color="statusColor(task.status)" small>{{ task.status }}</v-chip>
        </v-list-item-action>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script>
import tasks from '../../models/task.js';
import cases from '../../models/case.js';
export default {
  name: 'TaskList',
  data() {
    return {
      tasks: [...tasks],
      newTask: { title: '', status: '', priority: '', dueDate: '', caseId: null, assignedTo: '' },
      statusOptions: ['Open', 'In Progress', 'Completed'],
      priorityOptions: ['High', 'Medium', 'Low'],
      caseOptions: cases.map(c => ({ text: c.name, value: c.id })),
      menu: false
    };
  },
  props: {
    filter: Object
  },
  computed: {
    filteredTasks() {
      if (!this.filter) return this.tasks;
      return this.tasks.filter(t => {
        let ok = true;
        if (this.filter.caseId) ok = ok && t.caseId === this.filter.caseId;
        if (this.filter.status) ok = ok && t.status === this.filter.status;
        if (this.filter.priority) ok = ok && t.priority === this.filter.priority;
        return ok;
      });
    }
  },
  methods: {
    statusColor(status) {
      if (status === 'Open') return 'red';
      if (status === 'In Progress') return 'orange';
      if (status === 'Completed') return 'green';
      return 'grey';
    },
    addTask() {
      if (!this.newTask.title || !this.newTask.status || !this.newTask.priority || !this.newTask.dueDate || !this.newTask.caseId) return;
      const caseObj = cases.find(c => c.id === this.newTask.caseId);
      this.tasks.push({
        id: Date.now(),
        caseId: this.newTask.caseId,
        title: this.newTask.title,
        assignedTo: this.newTask.assignedTo,
        dueDate: this.newTask.dueDate,
        status: this.newTask.status,
        priority: this.newTask.priority,
        description: '',
        caseName: caseObj ? caseObj.name : ''
      });
      this.newTask = { title: '', status: '', priority: '', dueDate: '', caseId: null, assignedTo: '' };
    }
  }
};
</script>
