import { ResumeItem } from '../models/resume.ts';

export async function getResume(language: string): Promise<ResumeItem[]> {
  return new Promise<ResumeItem[]>((resolve) => {
    import(`../assets/resume/${language}.json`)
      .then((res) => {
        resolve(res as ResumeItem[]);
      })
      .catch((err) => {
        console.error(err);
        resolve([]);
      });
  });
}
