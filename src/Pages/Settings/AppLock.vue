<template>
  <div>
    <BaseRenderer title="App Lock" :settings="settings" @click:password="passwordDialog = true" />
    <v-dialog v-model="passwordDialog" width="400px">
      <v-form :disabled="loading" @submit.prevent="savePassword">
        <v-card>
          <v-card-title>Change Password</v-card-title>
          <v-card-text>
            <v-alert v-show="passwordMessage" type="error">
              {{ passwordMessage }}
            </v-alert>
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
            <v-btn color="primary" type="submit">
              Save
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-form>
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
      loading: false,
      passwordDialog: false,
      passwordMessage: '',
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
    async savePassword() {
      this.loading = true;
      try {
        const result = await this.$exec('appLock.setPassword', this.newPassword, this.oldPassword);
        if(result.status) {
          this.passwordDialog = false;
          this.$set(this.settings.password, 'value', true);
          this.oldPassword = null;
          this.newPassword = null;
          this.passwordMessage = '';
        } else {
          this.passwordMessage = result.message;
        }
      } finally {
        this.loading = false;
      }
    },
  },
}
</script>
