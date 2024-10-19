import { ProjectItemModel } from '../models/project-item-model';
import { fetchData } from '../../../utils/fetch.ts';

export async function getProjects(language: string): Promise<ProjectItemModel[]> {
  return await fetchData<ProjectItemModel[]>(`/assets/projects/${language}.json`);
}
