<template functional>
  <div class="mx-1 p-1 bg-yellow-600 rounded">
    <span>{{ $options.text }}</span>
  </div>
</template>

<script>
export default {
  name: "Badge",
  props: {
    text: String,
  },
};
</script>
