<template>
  <app-layout title="Settings">
    <v-sheet class="overflow-hidden mx-auto mt-4" :elevation="8" rounded="lg" max-width="500px">
      <v-list>
        <v-list-item
          v-for="(group, i) in settingGroups"
          :key="i"
          :to="group.to"
        >
          <v-list-item-action>
            <v-icon>{{ group.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>{{ group.text }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-sheet>
  </app-layout>
</template>

<script>
import AppLayout from '@layouts/AppLayout';
import { mdiBell, mdiCog, mdiTrayFull, mdiTune } from '@mdi/js';

export default {
  components: {
    AppLayout,
  },

  data() {
    return {
      settingGroups: [
        {
          text: 'General',
          icon: mdiCog,
          to: '/settings/general',
        }, {
          text: 'Notification',
          icon: mdiBell,
          to: '/settings/notification',
        }, {
          text: 'Tray Icon',
          icon: mdiTrayFull,
          to: '/settings/tray-icon',
        }, {
          text: 'Advanced',
          icon: mdiTune,
          to: '/settings/advanced',
        },
      ],
    }
  },
}
</script>
