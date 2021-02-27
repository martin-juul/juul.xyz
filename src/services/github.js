class Github {
  userRepos() {
    return fetch("https://api.github.com/users/martin-juul/repos", {
      cache: "force-cache",
    });
  }
}

export default new Github();
