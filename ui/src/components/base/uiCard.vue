<template>
  <v-card :flat="flat">
    <v-hover
      v-slot="{ hover }"
    >
      <v-btn
        class="helpButton"
        :color="hover ? 'primary' : undefined"
        icon
        @click="show = true"
      >
        <v-icon>
          {{ hover ? icons.mdiHelpCircle : icons.mdiHelpCircleOutline }}
        </v-icon>
      </v-btn>
    </v-hover>
    <slot />
    <v-dialog
      v-model="show"
      max-width="80%"
      max-height="80%"
    >
      <v-card>
        <v-card-title
          class="headline primary d-flex justify-space-between"
        >
          <span>Help</span>
          <v-btn
            icon
            @click="show = false"
          >
            <v-icon>{{ icons.mdiClose }}</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="mt-3">
          <slot name="help" />
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
  import { mdiHelpCircleOutline, mdiHelpCircle, mdiClose } from '@mdi/js'

  export default {
    name: 'UiCard',
    props: {
      flat: {
        type: Boolean,
        default: false
      }
    },
    data: () => ({
      icons: {
        mdiHelpCircleOutline: mdiHelpCircleOutline,
        mdiHelpCircle: mdiHelpCircle,
        mdiClose: mdiClose
      },
      show: false
    })
  }
</script>

<style scoped>
.helpButton {
  position: absolute;
  right: 10px;
}
</style>
