<template>
  <v-sheet class="overflow-hidden mx-auto mt-4" :elevation="8" rounded="lg" max-width="500px">
    <v-list>
      <v-list-item
        v-for="(item, i) in listItems"
        :key="i"
        v-show="typeof item.visible === 'function' ? item.visible(item) : item.visible !== false"
        :disabled="typeof item.disabled === 'function' ? item.disabled(item) : item.disabled"
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
</template>

<script>
export default {
  props: {
    listItems: {
      type: Array,
      required: true,
    }
  }
}
</script>
