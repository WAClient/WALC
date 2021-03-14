<template>
  <app-layout back-url="/settings" title="Settings">
    <v-container class="d-flex justify-center">
      <v-col cols="8" sm="6" md="4" lg="3">
        <v-sheet class="overflow-hidden" :elevation="8" rounded="lg">
          <v-list subheader>
            <v-subheader>Tray Icon</v-subheader>
            <v-list-item
              v-for="(setting, key) in settings"
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
                <v-switch v-model="setting.value"></v-switch>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </v-sheet>
      </v-col>
    </v-container>
  </app-layout>
</template>

<script>
import AppLayout from '@layouts/AppLayout';
import SettingsMixin from '@mixins/SettingsMixin';

export default {
  components: {
    AppLayout,
  },

  mixins: [SettingsMixin],

  // async created() {
  //   this.settings = await ipcRenderer.invoke('getSettings', this.group);
  //   Object.keys(this.settings).forEach((key) => {
  //     this.$watch(`settings.${key}.value`, (value) => {
  //       ipcRenderer.invoke('setSettings', { [`${key}.value`]: value })
  //     });
  //   })
  // },

  data() {
    return {
      group: 'trayIcon',
      // settings: {},
    }
  },
}
</script>
