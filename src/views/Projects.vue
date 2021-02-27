<template>
  <div class="projects">
    <Hero title="Projects" />

    <div
      class="container grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 px-3 sm:px-0"
      style="min-width: 60vw; min-height: 80vh"
      v-if="repos.length > 0"
    >
      <Repository
        class="row-span-5"
        v-for="repo in repos"
        v-bind:key="repo.id"
        :name="repo.name"
        :full_name="repo.fullname"
        :created_at="repo.created_at"
        :updated_at="repo.updated_at"
        :description="repo.description"
        :html_url="repo.html_url"
        :language="repo.language"
        :license="repo.license"
      />
    </div>
  </div>
</template>

<script>
import Github from "@/services/github";
import Repository from "@/components/Repository";
import Hero from "@/components/Hero";

export default {
  name: "Projects",
  components: { Hero, Repository },
  data: () => ({
    repos: [],
  }),
  mounted() {
    document.title = "Projects | Juul";
    document
      .querySelector('meta[name="description"]')
      .setAttribute("content", "Personal projects");
    Github.userRepos().then((res) => {
      res.json().then(
        (parsed) =>
          (this.repos = parsed.map((item) => {
            item.updated_at = new Date(item.updated_at);
            if (!item.description) {
              item.description = "No description";
            }
            if (!item.language) {
              item.language = "Misc";
            }
            return item;
          }))
      );
    });
  },
};
</script>
