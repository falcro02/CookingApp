export interface Preferences {
  dietary: string;
  allergies: string;
  disliked: string;
}

export interface PreferencesState {
  preferences: Preferences;
}
