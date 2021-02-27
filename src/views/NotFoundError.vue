<template>
  <div
    class="not-found container flex flex-col justify-center items-center mt-20"
  >
    <h1 class="text-5xl mb-10 font-bold">Sorry. This page does not exist.</h1>

    <router-link
      class="hover:underline text-blue-600 hover:text-blue-400 ease-in-out"
      :to="{ name: 'Home' }"
      id="go-to-home-link"
      >Go to home</router-link
    >
  </div>
</template>

<script>
export default {
  name: "NotFoundError",
};
</script>
