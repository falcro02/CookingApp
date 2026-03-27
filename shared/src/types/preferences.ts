export interface Preferences {
  dietary: string;
  allergies: string;
  disliked: string;
}

export interface PreferencesState {
  preferences: Preferences;
}

export interface UpdatePreferencesInput {
  preferences: {
    dietary?: string;
    allergies?: string;
    disliked?: string;
  };
}

export interface UserPreferencesPayload {
  dietary: string;
  allergies: string;
  disliked: string;
}
