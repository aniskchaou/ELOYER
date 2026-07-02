<template>
  <v-container fluid>
    <v-row class="mb-4"><v-col><h1 class="text-h5 font-weight-bold">Advanced RBAC</h1><p class="body-2 grey--text">Fine-grained role-based access control with custom permission sets</p></v-col>
    <v-col cols="auto"><v-btn color="indigo darken-2" dark to="/firmadmin/permissions"><v-icon left>mdi-arrow-right</v-icon>Open Permission Matrix</v-btn></v-col></v-row>
    <v-row>
      <v-col cols="12" md="7">
        <v-card outlined class="pa-4 mb-4">
          <v-card-title class="subtitle-1 pb-2">Role Hierarchy</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-treeview :items="roleTree" item-key="id" item-text="label" dense>
            <template v-slot:prepend="{ item }">
              <v-icon small :color="item.color">{{ item.icon }}</v-icon>
            </template>
            <template v-slot:append="{ item }">
              <v-chip x-small :color="item.color" dark>{{ item.access }}</v-chip>
            </template>
          </v-treeview>
        </v-card>
      </v-col>
      <v-col cols="12" md="5">
        <v-card outlined class="pa-4">
          <v-card-title class="subtitle-1 pb-2">RBAC Capabilities</v-card-title>
          <v-divider class="mb-3"></v-divider>
          <v-list dense>
            <v-list-item v-for="c in capabilities" :key="c"><v-list-item-icon><v-icon small color="indigo">mdi-check-circle</v-icon></v-list-item-icon><v-list-item-content><v-list-item-title>{{ c }}</v-list-item-title></v-list-item-content></v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
export default {
  name: 'AdvancedRBAC',
  data() {
    return {
      roleTree: [
        { id:1, label:'Super Admin', icon:'mdi-shield-star', color:'deep-purple', access:'Full Platform', children:[
          { id:2, label:'Admin', icon:'mdi-shield-crown', color:'red', access:'All Firm Data', children:[
            { id:3, label:'Firm Admin', icon:'mdi-office-building', color:'red lighten-1', access:'Firm Settings' },
            { id:4, label:'Senior Lawyer', icon:'mdi-account-tie', color:'indigo', access:'All Cases', children:[
              { id:5, label:'Attorney', icon:'mdi-gavel', color:'blue', access:'Assigned Cases', children:[
                { id:6, label:'Junior Associate', icon:'mdi-school', color:'cyan', access:'Limited Cases' },
              ]},
            ]},
            { id:7, label:'Paralegal', icon:'mdi-file-document-multiple', color:'green', access:'Documents & Tasks' },
          ]},
        ]},
      ],
      capabilities: [
        '18 pre-built roles', 'Custom role creation', 'Permission-level granularity',
        'Row-level security', 'Field-level access control', 'IP allowlisting per role',
        'Time-based access (business hours)', 'Audit trail for all role changes',
      ],
    };
  },
};
</script>
