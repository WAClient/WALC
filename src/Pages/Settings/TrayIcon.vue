<template>
  <base-renderer title="Tray Icon" :settings="settings"></base-renderer>
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
      group: 'trayIcon',
    }
  },
}
</script>
