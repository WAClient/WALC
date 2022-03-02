<template>
  <sheet-list :list-items="listItems"></sheet-list>
</template>

<script>
import SheetList from '@layouts/SheetList';
import { mdiArchive, mdiCheckAll, mdiMonitor } from '@mdi/js';

export default {
  components: {
    SheetList,
  },
  data() {
    return {
      listItems: [
        {
          title: 'Archive All Chats',
          icon: mdiArchive,
          onclick: () => {
            this.$exec('main.archiveAllChats');
          },
        }, {
          title: 'Mark All As Read',
          icon: mdiCheckAll,
          onclick: () => {
            this.$exec('main.markAllChatsAsRead');
          },
        }, {
          title: 'Update Desktop Integration',
          icon: mdiMonitor,
          onclick: () => {
            this.$exec('main.integrateToDesktop');
          },
          visible: () => this.$store.state.isAppImage,
        },
      ],
    }
  },
}
</script>
