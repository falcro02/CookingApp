export interface IdeaItem {
  name: string;
  story: string;
  icon: string;
}

export interface IdeasState {
  ideas: IdeaItem[];
}

export interface GenerateIdeasRequest {
  extra: string;
}
