<template>
  <div>
    <div>
      <a @click="show = !show">Instructional video <v-icon
        color="primary"
        class="chevron"
        :class="{'rotate' : show }"
      >{{ icons.mdiChevronDown }}</v-icon></a>
    </div>
    <img
      class="gif"
      :class="{animate: show, gifHidden: !show}"
      :src="require(`@/assets/${src}`)"
      :alt="alt"
    >
  </div>
</template>

<script>
  import { mdiChevronDown, mdiChevronUp } from '@mdi/js'

  export default {
    name: 'Gif',
    props: {
      src: {
        type: String,
        required: true,
      },
      alt: {
        type: String,
        required: true,
      },
      shown: {
        type: Boolean,
        required: false,
        default: false,
      },
    },
    data: pros => ({
      show: pros.shown,
      icons: {
        mdiChevronDown: mdiChevronDown,
        mdiChevronUp: mdiChevronUp,
      },
    }),
  }
</script>

<style scoped>
.rotate {
  transform: rotate(180deg);
}
.chevron {
  margin-top: -2px;
}

.gif {
  transition: max-height 0.5s;
}
.animate {
  max-height: 500px !important;
}

.gifHidden {
  max-height: 0 !important;
}
</style>
