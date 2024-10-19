import { ProjectItemModel } from '../models/project-item-model';
import { fetchData } from '../../../utils/fetch.ts';

export async function getProjects(language: string): Promise<ProjectItemModel[]> {
  return new Promise((resolve) => {
    fetchData<ProjectItemModel[]>(`/assets/projects/${language}.json`)
      .then(res => {
        resolve(res);
      }).catch(err => {
      console.error(err);
      resolve([]);
    });
  });
}
