<template>
  <div>
    <BaseRenderer title="App Lock" :settings="settings" @click:password="passwordDialog = true" />
    <v-dialog v-model="passwordDialog" width="400px">
      <v-card>
        <v-card-title>Change Password</v-card-title>
        <v-card-text>
          <v-text-field
            v-if="hasPassword"
            v-model="oldPassword"
            label="Old Password"
            type="password"
          ></v-text-field>
          <v-text-field
            v-model="newPassword"
            :label="hasPassword ? 'New Password' : 'Password'"
            type="password"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="passwordDialog = false">
            Cancel
          </v-btn>
          <v-btn color="primary" @click="savePassword">
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import SettingsMixin from '@mixins/SettingsMixin';
import BaseRenderer from './BaseRenderer';

export default {
  components: {
    BaseRenderer,
  },

  mixins: [SettingsMixin],

  data() {
    return {
      group: 'appLock',
      passwordDialog: false,
      oldPassword: null,
      newPassword: null,
    }
  },

  computed: {
    /** @returns {boolean} */
    hasPassword() {
      return !!this.settings?.password?.value;
    },
  },

  methods: {
    savePassword() {
      //
    },
  },
}
</script>
