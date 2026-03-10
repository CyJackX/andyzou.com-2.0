export type Series = {
  id: string;
  title: string;
  description?: string;
  tags: string[];
  coverCaseId?: string;
  show?: boolean;
  showOnHome?: boolean;
  homeOrder?: number;
};

export { SERIES } from "./series.generated";
