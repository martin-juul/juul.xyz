export interface ResumeItem {
  id: number;
  title: string;
  company: string;
  logo: string;
  duration: {
    start: string;
    end: string;
  };
  highlights: string[];
}