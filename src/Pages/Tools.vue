<template>
  <app-layout title="Tools">
    <sheet-list :list-items="listItems"></sheet-list>
  </app-layout>
</template>

<script>
import AppLayout from '@layouts/AppLayout';
import SheetList from '@layouts/SheetList';
import { mdiArchive, mdiCheckAll, mdiMonitor } from '@mdi/js';

export default {
  components: {
    AppLayout,
    SheetList,
  },
  data() {
    return {
      listItems: [
        {
          title: 'Archive All Chats',
          icon: mdiArchive,
          onclick: () => {
            this.$instance.exec('main.archiveAllChats');
          },
        }, {
          title: 'Mark All As Read',
          icon: mdiCheckAll,
          onclick: () => {
			      console.log(this.$instance);
            this.$instance.exec('main.markAllChatsAsRead');
          },
        }, {
          title: 'Update Desktop Integration',
          icon: mdiMonitor,
          onclick: () => {
            this.$instance.exec('main.integrateToDesktop');
          },
          visible: this.$instance.isAppImage,
        },
      ],
    }
  },
}
</script>
