<template>
  <div class="fixed top-1/2 right-3">
    <a
      class="rounded-full bg-black block mt-2 hidden sm:block"
      style="width: 18px; height: 18px"
      v-for="anchor in anchors"
      :key="anchor"
      :href="'#' + anchor"
      :aria-label="'Scroll to' + anchor"
      @click="scrollInto(anchor)"
    >
      <div v-if="$refs"></div>
    </a>
  </div>
</template>

<script>
export default {
  component: "AnchorScroll",
  props: {
    anchors: {
      type: Array,
    },
  },
  methods: {
    scrollInto(ref) {
      this.$refs[ref].scrollIntoView({ behavior: "smooth" });
    },
  },
};
</script>
