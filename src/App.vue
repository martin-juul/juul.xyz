<template>
  <div id="app" class="flex flex-col items-center bg-white pb-20">
    <nav
      class="no-print bg-gray-900 text-gray-200 w-full ease-in-out flex justify-center h-15 block z-50"
    >
      <router-link
        tag="a"
        class="p-4 hover:text-white no-print hover:bg-gray-600"
        aria-label="Go to Home page"
        to="/"
        >Home
      </router-link>

      <router-link
        tag="a"
        class="p-4 hover:text-white no-print hover:bg-gray-600"
        aria-label="Go to projects page"
        to="/projects"
        >Projects
      </router-link>

      <router-link
        tag="a"
        class="p-4 hover:text-white no-print hover:bg-gray-600"
        aria-label="Go to contact page"
        to="/contact"
        >Contact
      </router-link>
    </nav>

    <main class="mt-4">
      <router-view />
    </main>
  </div>
</template>

<style>
body {
  overflow-y: scroll;
}

@media print {
  .no-print {
    display: none;
  }
}
</style>
