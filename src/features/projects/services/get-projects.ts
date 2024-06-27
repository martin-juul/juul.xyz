import { ProjectItemModel } from '../models/project-item-model';

export async function getProjects(language: string): Promise<ProjectItemModel[]> {
  try {
    return require(`../assets/projects/${language}.json`) as ProjectItemModel[];
  } catch (e) {
    console.error(e);
    return [];
  }
}
