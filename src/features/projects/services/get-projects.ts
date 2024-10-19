import { ProjectItemModel } from '../models/project-item-model';

export async function getProjects(language: string): Promise<ProjectItemModel[]> {
  return new Promise((resolve) => {
    import(`../assets/projects/${language}.json`).then((res) => {
      resolve(res as ProjectItemModel[]);
    }).catch((err) => {
      console.error(err);
      resolve([]);
    });
  });
}
