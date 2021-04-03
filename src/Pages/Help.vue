<template>
  <app-layout title="Help">
    <v-sheet class="overflow-hidden mx-auto mt-4" :elevation="8" rounded="lg" max-width="500px">
      <v-list>
        <v-list-item
          v-for="(item, i) in listItems"
          :key="i"
          :to="item.to"
          :two-line="!!item.description"
          @click="typeof item.onclick === 'function' ? item.onclick(item) : null"
          :href="item.href"
          :target="(item.href ? '_blank' : null)"
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
            <v-list-item-subtitle v-if="!item.subtitle">{{ item.description }}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-sheet>
  </app-layout>
</template>

<script>
import AppLayout from '@layouts/AppLayout';
import { mdiBug, mdiHelpCircle, mdiStar } from '@mdi/js';
// const walcinfo = window.require('../../package.json');

export default {
  components: {
    AppLayout,
  },
  data() {
    return {
      listItems: [
        {
          icon: mdiHelpCircle,
          title: 'Find Help',
          description: 'Get Help on WALC Troubleshooting Board',
          href: 'https://github.com/cstayyab/WALC/discussions/categories/troubleshooting',
        }, {
          icon: mdiBug,
          title: 'Report Problem',
          description: 'Create an Bug Report on GitHub',
          href: '/new/?template=bug_report.md&labels=bug&title=[Bug+Report]',
        }, {
          icon: mdiStar,
          title: 'Request a Feature',
          description: 'Create a new feature request on GitHub',
          href: 'https://github.com/cstayyab/WALC/discussions/categories/feature-requests',
        },
      ],
    }
  },
}
</script>
