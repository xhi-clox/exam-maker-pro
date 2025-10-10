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
}
