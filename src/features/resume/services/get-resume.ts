import { ResumeItem } from '../models/resume.ts';
import { fetchData } from '../../../utils/fetch.ts';

export async function getResume(language: string): Promise<ResumeItem[]> {
  return new Promise<ResumeItem[]>((resolve) => {
    fetchData<ResumeItem[]>(`/assets/resume/translations/${language}.json`)
      .then(res => {
        resolve(res);
      }).catch((err) => {
      console.error(err);
      resolve([]);
    });
  });
}
