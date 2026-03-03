export enum ThemeId {
  FOOD = 'food',
  LIGHT = 'light',
  CLOTHING = 'clothing',
  LANGUAGE = 'language',
  CELEBRATION = 'celebration',
}

export interface Community {
  id: string;
  name: string;
  themeId: ThemeId;
  objectName: string; // The shared object for this theme context
  emoji: string; // Specific visual icon for this story
  backgroundAudioUrl?: string; // URL for royalty-free cultural background music
  staticStory?: string; // Pre-defined story from the document
}

export interface ThemeDef {
  id: ThemeId;
  title: string;
  icon: string;
  color: string;
  colorClass: string;
  description: string;
  sharedObject: string;
  visualSubject: string; // e.g. "Rice", "Fire"
  bouncingIcon: string; // Animated icon to display in header
  quote: string; // Inspirational quote for transition
  quoteAuthor: string; // Author of the quote
}

export interface GeneratedStory {
  title: string;
  content: string;
  audioBase64?: string;    // Cache audio if AI-generated
  audioUrl?: string;       // Firebase Storage URL for custom (admin-uploaded) audio
  imageBase64?: string;    // Generated illustration
  isCustom?: boolean;      // Flag to indicate if this is user-uploaded
  customAudioType?: string; // Mime type for custom audio (e.g. audio/mpeg)
}