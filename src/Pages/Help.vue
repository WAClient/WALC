<template>
  <app-layout title="Help">
    <sheet-list :list-items="listItems"></sheet-list>
  </app-layout>
</template>

<script>
import AppLayout from '@layouts/AppLayout';
import SheetList from '@layouts/SheetList';
import { mdiBug, mdiHelpCircle, mdiStar } from '@mdi/js';
// const walcinfo = window.require('../../package.json');

export default {
  components: {
    AppLayout,
    SheetList,
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
