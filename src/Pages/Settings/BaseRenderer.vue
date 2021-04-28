<template>
  <v-sheet class="overflow-hidden mx-auto mt-4" :elevation="8" rounded="lg" max-width="500px">
    <v-list subheader>
      <v-subheader>{{ title }}</v-subheader>
      <v-list-item
        v-for="(setting, key) in visibleSettings"
        :key="key"
        :two-line="!!setting.description"
      >
        <v-list-item-content>
          <v-list-item-title>{{ setting.name }}</v-list-item-title>
          <v-list-item-subtitle v-if="setting.description">
            {{ setting.description }}
          </v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-action>
          <component :is="typeMap[setting.type]" v-model="setting.value"></component>
        </v-list-item-action>
      </v-list-item>
    </v-list>
  </v-sheet>
</template>

<script>
import { VSwitch, VCheckbox } from 'vuetify/lib';

export default {
  props: ['title', 'settings'],

  data() {
    return {
      typeMap: {
        'switch': VSwitch,
        'checkbox': VCheckbox,
      },
    }
  },

  computed: {
    visibleSettings() {
      return Object.keys(this.settings)
        .filter((key) => !this.settings[key].hidden)
        .reduce((settings, key) => {
          settings[key] = this.settings[key];
          return settings;
        }, {});
    },
  },
}
</script>
