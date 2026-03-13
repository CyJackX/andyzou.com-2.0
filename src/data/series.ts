export type Series = {
  id: string;
  title: string;
  description?: string;
  coverCaseId?: string;
  showOnHome?: boolean;
  homeOrder?: number;
};

export { SERIES } from "./series.generated";
