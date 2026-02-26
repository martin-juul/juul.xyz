export type ResumeItem = {
  id: number;
  slug: string;
  title: string;
  company: string;
  logo: string;
  duration: {
    start: string;
    end: string;
  };
  highlights: string[];
};
