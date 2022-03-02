<template>
  <v-sheet class="overflow-hidden mx-auto mt-4" :elevation="8" rounded="lg" max-width="500px">
    <v-list subheader>
      <v-subheader>{{ title }}</v-subheader>
      <v-list-item
        v-for="(setting, key) in visibleSettings"
        :key="key"
        :two-line="!!setting.description"
        :disabled="shouldDisable(setting)"
        v-on="getHandler(key, true)"
      >
        <v-list-item-content>
          <v-list-item-title>{{ setting.name }}</v-list-item-title>
          <v-list-item-subtitle v-if="setting.description">
            {{ setting.description }}
          </v-list-item-subtitle>
        </v-list-item-content>

        <v-list-item-action style="max-width:50%">
          <v-btn
            v-if="setting.type === 'button'"
            :disabled="shouldDisable(setting)"
            @click="$emit(`click:${key}`)"
            v-bind="{ ...defaultProps[setting.type], ...setting.props }"
          >
            {{ setting.text }}
          </v-btn>

          <component
            v-else
            :is="typeMap[setting.type]"
            :disabled="shouldDisable(setting)"
            v-bind="{ ...defaultProps[setting.type], ...setting.props, ...valueAttrs(setting) }"
            v-on="getHandler(key)"
          />
        </v-list-item-action>
      </v-list-item>
    </v-list>
  </v-sheet>
</template>

<script>
import { VSwitch, VCheckbox, VSelect, VBtn } from 'vuetify/lib';

export default {
  props: ['title', 'settings'],

  data() {
    return {
      typeMap: {
        switch: VSwitch,
        checkbox: VCheckbox,
        select: VSelect,
        button: VBtn,
      },
      defaultProps: {
        select: {
          hideDetails: true,
        },
      },
      /** list of type which value changed on list click */
      booleanType: ['switch', 'checkbox'],
    }
  },

  computed: {
    /** @returns {Object} */
    visibleSettings() {
      return Object.keys(this.settings)
        .filter((key) => !this.settings[key].hidden)
        .reduce((settings, key) => {
          settings[key] = this.settings[key];
          return settings;
        }, {});
    },
  },

  methods: {
    /**
     * Check if a setting should be disabled by checking the dependency
     * @param {Object} setting
     */
    shouldDisable(setting) {
      if(!setting.depends) {
        return false;
      }
      const depends = (Array.isArray(setting.depends) ? setting.depends : [setting.depends]);
      return !(depends.length && depends.every((dep) => !!this.settings[dep].value));
    },

    valueAttrs(setting) {
      if(['switch', 'checkbox'].includes(setting.type)) {
        return { inputValue: setting.value };
      }
      return { value: setting.value };
    },

    getHandler(key, isList = false) {
      const setting = this.settings[key];
      const handlers = {};
      const isBoolean = this.booleanType.includes(setting.type);

      if(!isBoolean && !isList) {
        handlers.input = (evt) => this.handleChange(key, evt);
      } else if(isBoolean && isList) {
        handlers.click = () => this.handleChange(key, !setting.value);
      }
      return handlers;
    },

    handleChange(key, value) {
      this.$set(this.settings[key], 'value', value);
    },
  },
}
</script>
