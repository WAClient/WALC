<template>
  <div>
    <sheet-list :list-items="listItems"></sheet-list>

    <v-dialog v-model="openChatModal" max-width="350px">
      <v-card>
        <v-card-title>Open Chat</v-card-title>
        <v-card-text>
          <vue-tel-input-vuetify
            v-model="phone"
            :error-messages="phoneErrors"
            label="Phone number"
            mode="international"
            autofocus
            @enter="openChat"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="openChatModal = false">Close</v-btn>
          <v-btn color="primary" @click="openChat">Open</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="confirmArchive" max-width="350px">
      <v-card>
        <v-card-title>Are you sure?</v-card-title>
        <v-card-text>You are about to archive all of your chats</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="$exec('main.archiveAllChats');">Proceed</v-btn>
          <v-btn color="primary" autofocus @click="confirmArchive = false">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import SheetList from '@layouts/SheetList';
import { mdiArchive, mdiChat, mdiCheckAll, mdiMonitor } from '@mdi/js';

export default {
  components: {
    SheetList,
  },
  data() {
    return {
      openChatModal: false,
      phone: null,
      phoneErrors: [],
      confirmArchive: false,
      listItems: [
        {
          title: 'Open Chat',
          icon: mdiChat,
          onclick: () => {
            this.openChatModal = true;
          },
        }, {
          title: 'Mark All As Read',
          icon: mdiCheckAll,
          onclick: () => {
            this.$exec('main.markAllChatsAsRead');
          },
        }, {
          title: 'Archive All Chats',
          icon: mdiArchive,
          onclick: () => {
            this.confirmArchive = true;
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
  methods: {
    async openChat() {
      const result = await this.$exec('main.openChat', this.phone);
      if (result && result.success) {
        this.openChatModal = false;
        this.$exec('closeDashboard');
        return;
      }
      if (result) {
        this.phoneErrors = [result.message];
        return
      }
      this.phoneErrors = ['Something went wrong'];
    },
  },
}
</script>
