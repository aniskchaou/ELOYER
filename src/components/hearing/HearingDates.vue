<template>
  <v-container fluid>
    <v-row>
      <!-- Left: Filters / Actions -->
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

          <v-btn class="mt-3" color="primary" @click="addHearingDialog = true">
            Add Hearing
          </v-btn>
        </v-card>
      </v-col>

      <!-- Right: Hearing List & Calendar -->
      <v-col cols="12" md="9">
        <v-card class="pa-3 mb-3">
          <v-card-title>
            Hearings
            <span class="font-weight-bold ml-2">{{ selectedCase || 'All Cases' }}</span>
          </v-card-title>
          <v-divider></v-divider>

          <!-- Hearing List -->
          <v-data-table
            :headers="headers"
            :items="filteredHearings"
            item-key="id"
            class="elevation-1"
          >
            <template v-slot:item.actions="{ item }">
              <v-btn icon color="primary" @click="editHearing(item)">
                <v-icon>mdi-pencil</v-icon>
              </v-btn>
              <v-btn icon color="red" @click="deleteHearing(item.id)">
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </template>
          </v-data-table>
        </v-card>

        <!-- Calendar View -->
        <v-card>
          <v-card-title>Calendar View</v-card-title>
          <v-divider></v-divider>
          <v-sheet height="400">
            <v-calendar
              v-model="calendarFocus"
              :events="hearingsForCalendar"
              color="primary"
            ></v-calendar>
          </v-sheet>
        </v-card>
      </v-col>
    </v-row>

    <!-- Add / Edit Hearing Dialog -->
    <v-dialog v-model="addHearingDialog" max-width="500px">
      <v-card>
        <v-card-title>{{ editMode ? 'Edit Hearing' : 'Add Hearing' }}</v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <v-select
            v-model="newHearing.caseName"
            :items="cases"
            label="Case"
          ></v-select>
          <v-text-field v-model="newHearing.court" label="Court"></v-text-field>
          <v-text-field v-model="newHearing.judge" label="Judge"></v-text-field>
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
                v-model="newHearing.date"
                label="Hearing Date"
                readonly
                v-bind="attrs"
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker v-model="newHearing.date" @input="menu = false"></v-date-picker>
          </v-menu>
          <v-textarea v-model="newHearing.notes" label="Notes"></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="closeDialog">Cancel</v-btn>
          <v-btn color="primary" @click="saveHearing">Save</v-btn>
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
      addHearingDialog: false,
      editMode: false,
      menu: false,
      calendarFocus: new Date().toISOString().substr(0, 10),
      newHearing: {
        id: null,
        caseName: '',
        court: '',
        judge: '',
        date: '',
        notes: ''
      },
      cases: ['Case A', 'Case B', 'Case C'],
      hearings: [
        { id: 1, caseName: 'Case A', court: 'Court 1', judge: 'Judge Alice', date: '2025-09-20', notes: 'Initial hearing' },
        { id: 2, caseName: 'Case B', court: 'Court 2', judge: 'Judge Bob', date: '2025-09-22', notes: 'Evidence submission' },
        { id: 3, caseName: 'Case C', court: 'Court 3', judge: 'Judge Charlie', date: '2025-09-25', notes: 'Final arguments' },
      ],
      headers: [
        { text: 'Case', value: 'caseName' },
        { text: 'Court', value: 'court' },
        { text: 'Judge', value: 'judge' },
        { text: 'Date', value: 'date' },
        { text: 'Notes', value: 'notes' },
        { text: 'Actions', value: 'actions', sortable: false },
      ],
    }
  },
  computed: {
    filteredHearings() {
      if (!this.selectedCase) return this.hearings
      return this.hearings.filter(h => h.caseName === this.selectedCase)
    },
    hearingsForCalendar() {
      return this.hearings.map(h => ({
        name: `${h.caseName} - ${h.court}`,
        start: h.date,
        color: 'blue'
      }))
    }
  },
  methods: {
    closeDialog() {
      this.addHearingDialog = false
      this.editMode = false
      this.newHearing = { id: null, caseName: '', court: '', judge: '', date: '', notes: '' }
    },
    saveHearing() {
      if (this.editMode) {
        const index = this.hearings.findIndex(h => h.id === this.newHearing.id)
        this.hearings.splice(index, 1, { ...this.newHearing })
      } else {
        const id = this.hearings.length + 1
        this.hearings.push({ ...this.newHearing, id })
      }
      this.closeDialog()
    },
    editHearing(item) {
      this.editMode = true
      this.newHearing = { ...item }
      this.addHearingDialog = true
    },
    deleteHearing(id) {
      this.hearings = this.hearings.filter(h => h.id !== id)
    }
  }
}
</script>

<style scoped>
.v-data-table {
  cursor: pointer;
}
</style>
