<template functional>
  <a
    class="repository rounded-xl shadow-md p-4 flex flex-col hover:bg-yellow-50 hover:bg-opacity-80 ease-in-out"
    :href="props.html_url"
    target="_blank"
    rel="noopener nofollow"
  >
    <div class="flex font-bold justify-between">
      {{ props.name }}
      <span>{{ props.updated_at.toLocaleDateString() }}</span>
    </div>
    <div class="font-normal my-4">{{ props.description }}</div>
    <div class="mt-auto">
      <div class="flex text-black">
        <div class="mx-1 px-2 py-1 font-black rounded border border-red-300">
          <span>{{ props.language }}</span>
        </div>
      </div>
    </div>
  </a>
</template>

<script>
export default {
  name: "Repository",
  props: {
    name: String,
    description: String,
    full_name: String,
    html_url: String,
    updated_at: Date,
    language: String,
  },
};
</script>
