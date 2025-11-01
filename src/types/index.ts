
import type { LucideIcon } from "lucide-react";

export interface Paper {
    id: string;
    title: string;
    subject: string;
    grade: string;
    lastUpdated: string;
}

export interface Stat {
    name: string;
    value: string;
    Icon: LucideIcon;
    color: string;
    bgColor: string;
}

export interface Project {
  id: string;
  name: string;
  class: string;
  subject: string;
  lastUpdated: string;
}
