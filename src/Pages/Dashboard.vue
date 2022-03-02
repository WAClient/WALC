<template>
  <sheet-list :list-items="listItems"></sheet-list>
</template>

<script>
import SheetList from '@layouts/SheetList';
import { mdiCog, mdiHelpCircle, mdiPower, mdiTools } from '@mdi/js';
const { ipcRenderer } = window.require('electron');

export default {
  components: {
    SheetList,
  },

  data() {
    return {
      listItems: [
        {
          title: 'Tools',
          icon: mdiTools,
          to: '/tools',
          disabled: () => !this.$store.state.whatsappConnected,
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
            ipcRenderer.invoke('quit', this.$store.state.id);
          }
        },
      ],
    }
  },
}
</script>
