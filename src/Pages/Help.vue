<template>
  <app-layout title="Help">
    <v-sheet class="overflow-hidden mx-auto mt-4 d-flex align-center" :elevation="8" rounded="lg" max-width="500px">
      <div class="pl-4">
        <v-img src="icons/logo360x360.png" width="100px" height="100px"></v-img>
      </div>
      <v-container>
        <v-row dense>
          <v-col :cols="12">
            <h2>WALC</h2>
          </v-col>
          <v-col :cols="5">Installation type:</v-col>
          <v-col :cols="7">{{ about.installType }}</v-col>
          <v-col :cols="5">Version:</v-col>
          <v-col :cols="7">{{ about.version }}</v-col>
          <v-col :cols="5">OS:</v-col>
          <v-col :cols="7">{{ about.os }}</v-col>
        </v-row>
      </v-container>
    </v-sheet>

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
  created() {
    this.$exec('about').then((info) => {
      this.about.installType = info.installType;
      this.about.version = info.version;
      this.about.os = info.os;
    });
  },
  data() {
    return {
      about: {
        installType: null,
        version: null,
        os: null,
      },
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
