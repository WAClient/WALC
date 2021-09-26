<template>
  <v-app>
    <v-main>
      <v-card max-width="500px" class="mx-auto mt-16">
        <v-card-title>Not Connected</v-card-title>
        <v-card-text>
          Cannot access WhatsApp Web Service. This page will reload as soon as you are back online.
        </v-card-text>
        <v-card-actions>
          <span>{{ retryText }}</span>
          <v-spacer></v-spacer>
          <v-btn dark color="green" :loading="checking" @click="onlineCheck">Retry now</v-btn>
        </v-card-actions>
      </v-card>
    </v-main>
  </v-app>
</template>

<script>
import isOnline from 'is-online';

export default {
  created() {
    this.onlineCheck();
  },
  data() {
    return {
      timeouts: [3, 5, 10, 30, 60],
      timeIdx: 0,
      timeLeft: 0,
      checking: false,
    }
  },
  computed: {
    /** @returns {string} */
    retryText() {
      if(this.timeLeft > 0) {
        return `Retrying in ${this.timeLeft} seconds`;
      } else if(this.checking) {
        return 'Retrying...';
      }
      return '';
    },
  },
  methods: {
    async onlineCheck() {
      this.checking = true;
      const online = await isOnline();
      if(online) {
        this.retry();
        return;
      }

      const timeout = this.timeouts[this.timeIdx];
      setTimeout(() => this.onlineCheck(), timeout * 1000);
      this.setTimeLeft(timeout);
      if(this.timeIdx < this.timeouts.length - 1) {
        this.timeIdx += 1;
      }
      this.checking = false;
    },
    setTimeLeft(number) {
      this.timeLeft = number;
      if(this.timeLeft > 0) {
        setTimeout(() => this.setTimeLeft(number - 1), 1000);
      }
    },
    retry() {
      window.WALC.load();
    }
  }
}
</script>
