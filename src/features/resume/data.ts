import { type ResumeItem } from './types';

export const resumeData: ResumeItem[] = [
  {
    id: 4,
    slug: 'autorola-software-development',
    title: 'Frontend Developer',
    company: 'Autorola Software Development',
    logo: 'assets/resume/autorola-software-development.jpeg',
    duration: { start: 'March 2022', end: 'Current' },
    highlights: [
      'Developing the new autorola marketplace with Angular',
      'Reviewing code across departments, ensuring higher standards',
      'Introduced modern paradigms into the architecture',
    ],
  },
  {
    id: 3,
    slug: 'evercall',
    title: 'Application Developer',
    company: 'evercall',
    logo: 'assets/resume/evercall.png',
    duration: { start: 'June 2020', end: 'February 2022' },
    highlights: [
      'Maintainer of Softphone app on Desktop & Mobile',
      'Working with interesting technologies including React, React Native, Redux, Chakra UI, sip.js & TypeScript',
      'Extensive research of the SIP protocol and VoIP routing',
      'L3 Technical Support',
    ],
  },
  {
    id: 2,
    slug: 'sitetech',
    title: 'Software Developer',
    company: 'SiteTech',
    logo: 'assets/resume/sitetech.jpeg',
    duration: { start: 'July 2018', end: 'March 2020' },
    highlights: [
      'Write modern, maintainable and performant code for multiple clients and internal use',
      'Mentoring and code reviewer',
      'Architected and wrote automated solutions for infra on AWS and operations. Using tools such as Terraform',
      'Operating and extending Gitlab and Kimai for internal usage',
      'Laravel expert and team lead on backend',
    ],
  },
  {
    id: 1,
    slug: 'odense-municipality',
    title: 'Software Developer',
    company: 'Odense Municipality',
    logo: 'assets/resume/odense-municipalty.png',
    duration: { start: 'October 2017', end: 'February 2018' },
    highlights: [
      'Developed web based dashboard for internal administration of Windows AppLocker',
      'C# .NET/Entity Framework backend & Angular frontend',
      'Created AutoHotKey macros for scraping internal systems, increasing case worker performance.',
      'Knowledge of internal test procedures. Inclusive Jobnet.',
    ],
  },
];

// Helper function to check if an item is current
export function isCurrentItem(item: ResumeItem, currentLabel: string): boolean {
  return item.duration.end === currentLabel;
}

export const resumeDataDa: ResumeItem[] = [
  {
    id: 4,
    slug: 'autorola-software-development',
    title: 'Frontend Udvikler',
    company: 'Autorola Software Development',
    logo: 'assets/resume/autorola-software-development.jpeg',
    duration: { start: 'March 2022', end: 'Nuværende' },
    highlights: [
      'Udvikle den nye version af autorola marketplace med Angular',
      'Gennemgang af kode på tværs af afdelinger for at sikre, at standarderne opfylder højere mål',
      'Indførte moderne paradigmer i organisationen, hvilket bidrog til produktiviteten på tværs af afdelinger',
    ],
  },
  {
    id: 3,
    slug: 'evercall',
    title: 'Applikations Udvikler',
    company: 'evercall',
    logo: 'assets/resume/evercall.png',
    duration: { start: 'June 2020', end: 'February 2022' },
    highlights: [
      'Vedligeholder af softphone-app på desktop og mobil',
      'Arbejdet med interessante teknologier, herunder React, React Native, Redux, Chakra UI, sip.js, TypeScript og Asterisk PBX',
      'Stort kendskab til SIP-protokollen og VoIP-routing',
      'L3 Teknisk Support',
    ],
  },
  {
    id: 2,
    slug: 'sitetech',
    title: 'Software Udvikler',
    company: 'SiteTech',
    logo: 'assets/resume/sitetech.jpeg',
    duration: { start: 'July 2018', end: 'March 2020' },
    highlights: [
      'Skrive moderne, vedligeholdelsesvenlig og performant kode til flere klienter og intern brug',
      'Mentorering og kodevedligeholder',
      'Arkitekt og skrev automatiserede løsninger til infrastruktur på AWS og drift. Brug af værktøjer som Terraform',
      'Drift og udvidelse af Gitlab og Kimai til intern brug',
      'Laravel-ekspert og team lead på backend',
    ],
  },
  {
    id: 1,
    slug: 'odense-municipality',
    title: 'Software Udvikler',
    company: 'Odense Kommune',
    logo: 'assets/resume/odense-municipalty.png',
    duration: { start: 'October 2017', end: 'February 2018' },
    highlights: [
      'Udvikling af et webbaseret dashboard til intern administration af Windows AppLocker',
      'C# .NET/Entity Framework backend og Angular frontend',
      'Oprettede AutoHotKey-makroer til at scrape interne systemer, hvilket øgede sagsbehandlerens ydeevne.',
      'Kendskab til interne testprocedurer inklusiv Jobnet.',
    ],
  },
];
