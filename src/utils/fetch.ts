export async function fetchData<T = object>(url: string): Promise<T> {
  return new Promise((resolve, reject) => {
    fetch(url)
      .then(res => res.json())
      .then((res) => resolve(res))
      .catch(reject);
  })
}
