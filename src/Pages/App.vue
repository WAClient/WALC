<template>
  <component :is="layout" v-bind="props">
    <router-view></router-view>
  </component>
</template>

<script>
import AppLayout from '../Layouts/AppLayout.vue'
export default {
  data() {
    return {
      layout: AppLayout,
      props: null,
    }
  },
  watch: {
    $route: {
      immediate: true,
      async handler(route) {
        try {
          const component = await import(`../Layouts/${route.meta.layout}`);
          this.layout = (component || {}).default || AppLayout;
          this.props = route.meta.layoutProps;
        } catch {
          this.layout = AppLayout;
          this.props = null;
        }
      },
    },
  },
}
</script>
