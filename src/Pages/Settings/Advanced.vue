<template>
  <base-renderer title="Advanced" :settings="settings"></base-renderer>
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
      group: 'advanced',
    }
  },
}
</script>
