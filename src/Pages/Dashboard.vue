<template>
  <app-layout hide-back-button>
    <v-container class="d-flex justify-center">
      <v-btn icon x-large>
        <v-icon x-large>{{ icons.mdiTools }}</v-icon>
      </v-btn>
      <v-btn icon x-large to="/settings">
        <v-icon x-large>{{ icons.mdiCog }}</v-icon>
      </v-btn>
    </v-container>
  </app-layout>
</template>

<script>
import AppLayout from '@layouts/AppLayout';
import { mdiCog, mdiTools } from '@mdi/js';

export default {
  components: {
    AppLayout,
  },

  data() {
    return {
      icons: {
        mdiTools,
        mdiCog,
      }
    }
  },
}
</script>
