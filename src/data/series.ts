export type Series = {
  id: string;
  title: string;
  description?: string;
  coverCaseId?: string;
  show?: boolean;
  showOnHome?: boolean;
  homeOrder?: number;
};

export { SERIES } from "./series.generated";
