<template>
  <app-layout hide-back-button>
    <v-sheet class="overflow-hidden mx-auto mt-4" :elevation="8" rounded="lg" max-width="500px">
      <v-list>
        <v-list-item
          v-for="(item, i) in listItems"
          :key="i"
          :to="item.to"
          @click="typeof item.onclick === 'function' ? item.onclick(item) : null"
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>{{ item.text }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-sheet>
  </app-layout>
</template>

<script>
import AppLayout from '@layouts/AppLayout';
import { mdiCog, mdiHelpCircle, mdiPower, mdiTools } from '@mdi/js';
const { ipcRenderer } = window.require('electron');

export default {
  components: {
    AppLayout,
  },

  data() {
    return {
      listItems: [
        {
          text: 'Tools',
          icon: mdiTools,
          to: '/tools'
        }, {
          text: 'Settings',
          icon: mdiCog,
          to: '/settings',
        }, {
          text: 'Help',
          icon: mdiHelpCircle,
          to: '/help',
        }, {
          text: 'Quit',
          icon: mdiPower,
          onclick: () => {
            ipcRenderer.invoke('quit');
          }
        },
      ],
    }
  },
}
</script>
