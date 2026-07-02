
<template>
  <v-container fluid>
    <v-row>
      <!-- Left: Filters / Cases -->
      <v-col cols="12" md="3">
        <v-card class="pa-3">
          <v-card-title>Filters</v-card-title>
          <v-divider></v-divider>
          <v-select
            v-model="selectedCase"
            :items="cases"
            label="Select Case"
            dense
            outlined
          ></v-select>

          <v-select
            v-model="taskStatus"
            :items="['All', 'Pending', 'In Progress', 'Completed']"
            label="Task Status"
            dense
            outlined
            class="mt-3"
          ></v-select>

          <v-btn class="mt-3" color="primary" @click="addTaskDialog = true">
            Add Task
          </v-btn>
        </v-card>
      </v-col>

      <!-- Right: Timeline & Task List -->
      <v-col cols="12" md="9">
        <v-card class="pa-3 mb-3">
          <v-card-title>
            Timeline & Tasks for
            <span class="font-weight-bold ml-2">{{ selectedCase || 'All Cases' }}</span>
          </v-card-title>
          <v-divider></v-divider>

          <!-- Task List -->
          <v-list two-line>
            <v-list-item
              v-for="task in filteredTasks"
              :key="task.id"
              :class="{'grey lighten-4': task.status === 'Completed'}"
            >
              <v-list-item-content>
                <v-list-item-title>{{ task.title }}</v-list-item-title>
                <v-list-item-subtitle>
                  Due: {{ task.dueDate }} | Assigned: {{ task.assignedTo }}
                </v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-btn
                  icon
                  :color="task.status === 'Completed' ? 'green' : 'grey'"
                  @click="toggleComplete(task)"
                >
                  <v-icon>{{ task.status === 'Completed' ? 'mdi-check-circle' : 'mdi-checkbox-blank-circle-outline' }}</v-icon>
                </v-btn>
                <v-btn icon color="red" @click="deleteTask(task.id)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-card>

        <!-- Calendar -->
        <v-card>
          <v-card-title>Calendar View</v-card-title>
          <v-divider></v-divider>
          <v-sheet height="400">
            <v-calendar
              v-model="calendarFocus"
              :events="tasksForCalendar"
              color="primary"
            ></v-calendar>
          </v-sheet>
        </v-card>
      </v-col>
    </v-row>

    <!-- Add Task Dialog -->
    <v-dialog v-model="addTaskDialog" max-width="500px">
      <v-card>
        <v-card-title>Add New Task</v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <v-text-field v-model="newTask.title" label="Task Title"></v-text-field>
          <v-text-field v-model="newTask.assignedTo" label="Assigned To"></v-text-field>
          <v-menu
            ref="menu"
            v-model="menu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-text-field
                v-model="newTask.dueDate"
                label="Due Date"
                readonly
                v-bind="attrs"
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker v-model="newTask.dueDate" @input="menu = false"></v-date-picker>
          </v-menu>
          <v-select
            v-model="newTask.status"
            :items="['Pending', 'In Progress', 'Completed']"
            label="Status"
          ></v-select>
          <v-select
            v-model="newTask.case"
            :items="cases"
            label="Case"
          ></v-select>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="addTaskDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="saveTask">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>


<script>
export default {
  data() {
    return {
      selectedCase: null,
      taskStatus: 'All',
      calendarFocus: new Date().toISOString().substr(0, 10),
      addTaskDialog: false,
      menu: false,
      newTask: {
        title: '',
        assignedTo: '',
        dueDate: '',
        status: 'Pending',
        case: '',
      },
      cases: ['Case A', 'Case B', 'Case C'],
      tasks: [
        { id: 1, title: 'Prepare contract', assignedTo: 'Alice', dueDate: '2025-09-20', status: 'Pending', case: 'Case A' },
        { id: 2, title: 'Court filing', assignedTo: 'Bob', dueDate: '2025-09-22', status: 'In Progress', case: 'Case B' },
        { id: 3, title: 'Client meeting', assignedTo: 'Alice', dueDate: '2025-09-18', status: 'Completed', case: 'Case C' },
      ],
    }
  },
  computed: {
    filteredTasks() {
      return this.tasks.filter(task => {
        const caseMatch = !this.selectedCase || task.case === this.selectedCase
        const statusMatch = this.taskStatus === 'All' || task.status === this.taskStatus
        return caseMatch && statusMatch
      })
    },
    tasksForCalendar() {
      return this.tasks.map(task => ({
        name: task.title,
        start: task.dueDate,
        color: task.status === 'Completed' ? 'green' : task.status === 'In Progress' ? 'orange' : 'red'
      }))
    }
  },
  methods: {
    toggleComplete(task) {
      task.status = task.status === 'Completed' ? 'Pending' : 'Completed'
    },
    deleteTask(id) {
      this.tasks = this.tasks.filter(task => task.id !== id)
    },
    saveTask() {
      const id = this.tasks.length + 1
      this.tasks.push({ ...this.newTask, id })
      this.newTask = { title: '', assignedTo: '', dueDate: '', status: 'Pending', case: '' }
      this.addTaskDialog = false
    }
  }
}
</script>


<style scoped>
  .v-list-item {
    cursor: pointer;
  }
</style>
