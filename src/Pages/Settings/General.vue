<template>
  <base-renderer title="General" :settings="settings"></base-renderer>
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
      group: 'general',
    }
  },
}
</script>
