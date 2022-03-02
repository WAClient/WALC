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
        this.props = route.meta.layoutProps || null;
        if(!route.meta.layout) {
          this.layout = AppLayout;
          return;
        }

        try {
          const component = await import(`../Layouts/${route.meta.layout}`);
          this.layout = (component || {}).default || AppLayout;
        } catch {
          this.layout = AppLayout;
        }
      },
    },
  },
}
</script>
