<template>
  <figure class="c-photo" :class="{'photo--hover': hover}">
    <img :src="src">

    <p v-if="$slots.default" class="photo__label">
      <slot />
    </p>
  </figure>
</template>

<script>
export default {
  props: {
    src: {
      type: String,
      required: true,
    },

    hover: {
      type: Boolean,
      default: true,
    },
  },
}
</script>

<style lang="scss" scoped>
.c-photo {
  @apply relative flex flex-col z-50;
  box-sizing: content-box;
  transition: all 0.2s ease-in-out;
  max-width: 200px;

  &.photo--hover:hover {
    transform: scale(1.5);

    img {
      @apply rounded;
    }
  }

  img {
    @apply w-full rounded-t shadow-md;
    height: auto;
  }

  .photo__label {
    @apply p-2 rounded-b bg-dark-500;
    @apply text-generic-300 text-sm font-semibold text-center;
  }
}
</style>
