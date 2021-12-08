<template>
  <v-app>
    <v-app-bar app>
      <v-btn icon @click="goBack()" v-show="!hideBackButton">
        <v-icon>{{ icons.mdiArrowLeft }}</v-icon>
      </v-btn>

      <v-toolbar-title>{{ title }}</v-toolbar-title>

      <v-spacer></v-spacer>

      <v-tooltip v-if="!$store.state.whatsappConnected" left transition="slide-x-reverse-transition">
        <template #activator="{ attr, on }">
          <v-icon color="warning" v-bind="attr" v-on="on">{{ icons.mdiAlertCircle }}</v-icon>
        </template>
        <span>Whatsapp not connected, some features are disabled</span>
      </v-tooltip>
    </v-app-bar>

    <v-main>
      <slot></slot>
    </v-main>
  </v-app>
</template>

<script>
import { mdiArrowLeft, mdiAlertCircle } from '@mdi/js'
export default {
  props: {
    title: {
      type: String,
      default: () => 'WALC',
    },
    backUrl: {
      type: String,
      default: () => null,
    },
    hideBackButton: {
      type: Boolean,
      default: () => false,
    },
  },
  
  data() {
    return {
      icons: {
        mdiArrowLeft,
        mdiAlertCircle,
      },
      drawer: false,
    }
  },

  methods: {
    goBack() {
      if(this.backUrl === null) {
        this.$router.back()
      } else {
        this.$router.push(this.backUrl)
      }
    },
  },
}
</script>
