<template>
  <div>
    <v-app-bar app>
      <v-btn icon @click="goBack()" v-show="!hideBackButton">
        <v-icon>{{ icons.mdiArrowLeft }}</v-icon>
      </v-btn>

      <v-toolbar-title>{{ title }}</v-toolbar-title>
    </v-app-bar>

    <v-main>
      <slot></slot>
    </v-main>
  </div>
</template>

<script>
import { mdiArrowLeft } from '@mdi/js'
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
