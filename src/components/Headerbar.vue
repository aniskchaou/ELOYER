
<template>
  <v-app-bar app flat elevation="0">
    <v-btn icon @click="$emit('toggle-menu')" aria-label="Toggle menu">
      <v-icon>mdi-menu</v-icon>
    </v-btn>
    <v-spacer></v-spacer>
    <!-- Search -->
    <v-text-field
      solo
      flat
      hide-details
      prepend-inner-icon="mdi-magnify"
      placeholder="Search..."
      class="mx-2"
      style="max-width: 250px;"
    ></v-text-field>
    <!-- Notifications Dropdown -->
    <v-menu offset-y>
      <template v-slot:activator="{ on, attrs }">
        <v-btn icon v-bind="attrs" v-on="on">
          <v-icon>mdi-bell-outline</v-icon>
        </v-btn>
      </template>
      <v-list>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title>No new notifications</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-menu>
    <!-- User Menu -->
    <v-menu offset-y>
      <template v-slot:activator="{ on, attrs }">
        <v-btn icon v-bind="attrs" v-on="on">
          <v-icon>mdi-account-circle</v-icon>
        </v-btn>
      </template>
      <v-list>
        <v-list-item>
          <v-list-item-title>Profile</v-list-item-title>
        </v-list-item>
        <v-list-item>
          <v-list-item-title>Settings</v-list-item-title>
        </v-list-item>
        <v-list-item>
          <v-list-item-title>Logout</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<script>
export default {
  name: 'HeaderBar',
};
</script>
