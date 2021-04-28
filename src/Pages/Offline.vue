<template>
  <v-app>
    <v-main>
      <v-card max-width="500px" class="mx-auto mt-16">
        <v-card-title>Not Connected</v-card-title>
        <v-card-text>
          Cannot access WhatsApp Web Service. This page will reload as soon as you are back online.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="retry">Retry now</v-btn>
        </v-card-actions>
      </v-card>
    </v-main>
  </v-app>
</template>

<script>
export default {
  created() {
    let timeout;
    window.addEventListener('online', () => {
      timeout = setTimeout(this.retry, 5000)
    });
    window.addEventListener('offline', () => clearTimeout(timeout));
  },
  methods: {
    retry() {
      window.WALC.load();
    }
  }
}
</script>
