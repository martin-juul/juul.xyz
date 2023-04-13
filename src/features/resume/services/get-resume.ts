import { ResumeItem } from '../models';

export async function getResume(language: string): Promise<ResumeItem[]> {
  try {
    return require(`../assets/resume/${language}.json`) as ResumeItem[];
  } catch (e) {
    console.error(e);
    return [];
  }
}