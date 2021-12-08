<template>
  <app-layout hide-back-button>
    <sheet-list :list-items="listItems"></sheet-list>
  </app-layout>
</template>

<script>
import AppLayout from '@layouts/AppLayout';
import SheetList from '@layouts/SheetList';
import { mdiCog, mdiHelpCircle, mdiPower, mdiTools } from '@mdi/js';
const { ipcRenderer } = window.require('electron');

export default {
  components: {
    AppLayout,
    SheetList,
  },

  data() {
    return {
      listItems: [
        {
          title: 'Tools',
          icon: mdiTools,
          to: '/tools',
          disabled: () => !this.$instance.whatsappConnected,
        }, {
          title: 'Settings',
          icon: mdiCog,
          to: '/settings',
        }, {
          title: 'Help',
          icon: mdiHelpCircle,
          to: '/help',
        }, {
          title: 'Quit',
          icon: mdiPower,
          onclick: () => {
            ipcRenderer.invoke('quit', this.$instance.id);
          }
        },
      ],
    }
  },
}
</script>
