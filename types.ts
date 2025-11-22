export interface Experience {
  company: string;
  role: string;
  location: string;
  period: string;
  description: string[];
  tech?: string[];
}

export interface Project {
  title: string;
  techStack: string[];
  description: string[];
  link?: string;
}

export interface Education {
  institution: string;
  degree: string;
  gpa: string;
  period: string;
  courses: string[];
}

export interface Contact {
  phone: string;
  email: string;
  linkedin: string;
  github: string;
  location: string;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export enum SectionId {
  ABOUT = 'about',
  EXPERIENCE = 'experience',
  PROJECTS = 'projects',
  SKILLS = 'skills',
}