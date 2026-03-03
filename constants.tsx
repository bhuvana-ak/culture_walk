import React from 'react';
import { ThemeId, ThemeDef, Community } from './types';
import { Utensils, Sun, Shirt, MessageCircle, PartyPopper } from 'lucide-react';

// Royalty-free MP3s from Wikimedia Commons
const AUDIO_ASSETS = {
  SITAR: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/8/82/Sitar_-_Imdadkhani_Gharana_-_Kishor_Ghosh_-_Raga_Yaman.ogg/Sitar_-_Imdadkhani_Gharana_-_Kishor_Ghosh_-_Raga_Yaman.ogg.mp3',
  FLUTE_NATIVE: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/b/b8/Siyotanka.ogg/Siyotanka.ogg.mp3',
  PIANO_CALM: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/e/ec/Gymnopedie_No_1.ogg/Gymnopedie_No_1.ogg.mp3',
  FOLK_IRISH: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/4/41/04_-_Star_Of_The_County_Down.ogg/04_-_Star_Of_The_County_Down.ogg.mp3',
  JAPANESE_FLUTE: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/b/be/Shika_no_tone.ogg/Shika_no_tone.ogg.mp3',
  CHINESE_INSTRUMENTAL: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/f/f3/Chinese_Music_-_Traditional_Instrumental.ogg/Chinese_Music_-_Traditional_Instrumental.ogg.mp3'
};

export const THEMES: Record<ThemeId, ThemeDef> = {
  [ThemeId.FOOD]: {
    id: ThemeId.FOOD,
    title: 'Food - Rice',
    icon: 'Utensils',
    color: '#F59E0B',
    colorClass: 'text-amber-500 bg-amber-100 border-amber-200 hover:bg-amber-200',
    description: 'How we prepare and share the gifts of the earth.',
    sharedObject: 'Rice',
    visualSubject: 'bowls of steaming rice, grains, and harvest fields',
    bouncingIcon: '🍚',
    quote: "Laughter is brightest where food is best.",
    quoteAuthor: "Irish Proverb"
  },
  [ThemeId.LIGHT]: {
    id: ThemeId.LIGHT,
    title: 'Light - Celebration of Lights',
    icon: 'Sun',
    color: '#8B5CF6',
    colorClass: 'text-violet-500 bg-violet-100 border-violet-200 hover:bg-violet-200',
    description: 'Symbols of hope, guidance, and celebration.',
    sharedObject: 'The Candle / Lamp',
    visualSubject: 'bright fire, candle flames, and glowing lanterns',
    bouncingIcon: '🕯️',
    quote: "There are two ways of spreading light: to be the candle or the mirror that reflects it.",
    quoteAuthor: "Edith Wharton"
  },
  [ThemeId.CLOTHING]: {
    id: ThemeId.CLOTHING,
    title: 'Clothing - Scarf',
    icon: 'Shirt',
    color: '#EC4899',
    colorClass: 'text-pink-500 bg-pink-100 border-pink-200 hover:bg-pink-200',
    description: 'What we wear to express who we are and where we come from.',
    sharedObject: 'Scarf / Head Covering',
    visualSubject: 'woven fabrics, threads, and colorful textile patterns',
    bouncingIcon: '🧣',
    quote: "Style is a way to say who you are without having to speak.",
    quoteAuthor: "Rachel Zoe"
  },
  [ThemeId.LANGUAGE]: {
    id: ThemeId.LANGUAGE,
    title: 'Language - Greeting',
    icon: 'MessageCircle',
    color: '#06B6D4',
    colorClass: 'text-cyan-500 bg-cyan-100 border-cyan-200 hover:bg-cyan-200',
    description: 'The words we use to greet, welcome, and understand each other.',
    sharedObject: 'A Greeting',
    visualSubject: 'speech bubbles, alphabet letters, and flowing scripts',
    bouncingIcon: '👋',
    quote: "A different language is a different vision of life.",
    quoteAuthor: "Federico Fellini"
  },
  [ThemeId.CELEBRATION]: {
    id: ThemeId.CELEBRATION,
    title: 'Celebration - New Year',
    icon: 'PartyPopper',
    color: '#10B981',
    colorClass: 'text-emerald-500 bg-emerald-100 border-emerald-200 hover:bg-emerald-200',
    description: 'How we mark new beginnings and cultural milestones.',
    sharedObject: 'New Year Traditions',
    visualSubject: 'fireworks, festive tables, and community gatherings',
    bouncingIcon: '🎉',
    quote: "Cheers to a new year and another chance for us to get it right.",
    quoteAuthor: "Oprah Winfrey"
  },
};

export const COMMUNITIES: Community[] = [
  // Food - Rice
  { 
    id: 'indian-rice', 
    name: 'Indian', 
    themeId: ThemeId.FOOD, 
    objectName: 'Rice', 
    emoji: '🍚',
    backgroundAudioUrl: AUDIO_ASSETS.SITAR,
    staticStory: "In India, rice is at the heart of everyday cooking, though every region prepares it differently. In South Indian homes, rice is transformed into dishes like lemon rice and biryani, cooked with aromatic spices and shared with family. In Gujarati households, rice is served alongside dal and vegetables, or cooked together as khichdi — a simple, comforting meal. Across all these traditions, rice is more than just food. It brings families to the table and connects us through shared moments and memory."
  },
  { 
    id: 'japanese-rice', 
    name: 'Japanese', 
    themeId: ThemeId.FOOD, 
    objectName: 'Rice', 
    emoji: '🍣',
    backgroundAudioUrl: AUDIO_ASSETS.JAPANESE_FLUTE,
    staticStory: "In Japan, rice is part of every meal — breakfast, lunch, and dinner. It is more than just food. It is a symbol of care, because preparing rice well is seen as an act of love for your family. We eat it plain, in sushi, or as onigiri — rice balls wrapped in seaweed and packed for school or travel. Rice connects us to our ancestors and to each other."
  },
  { 
    id: 'filipino-rice', 
    name: 'Filipino', 
    themeId: ThemeId.FOOD, 
    objectName: 'Rice', 
    emoji: '🍳',
    backgroundAudioUrl: AUDIO_ASSETS.PIANO_CALM,
    staticStory: "In the Philippines, rice is eaten three times a day — it is part of every meal from breakfast to dinner. We cook sinangag, garlic fried rice, in the morning and serve steaming white rice alongside every dish at the table. Offering someone rice is offering them warmth and welcome. In our culture, no meal feels complete without it. Rice is how we show love."
  },
  
  // Light - Celebration of Lights
  { 
    id: 'hindu-diwali', 
    name: 'Hindu (Diwali)', 
    themeId: ThemeId.LIGHT, 
    objectName: 'Diyas (Clay Lamps)', 
    emoji: '🪔',
    backgroundAudioUrl: AUDIO_ASSETS.SITAR,
    staticStory: "During Diwali, we light small clay lamps called diyas and place them around our home. The light represents the victory of good over evil and knowledge over ignorance. Every flame is a reminder to carry hope and kindness in our hearts. When our street glows with hundreds of diyas, it feels like the whole community is celebrating together."
  },
  { 
    id: 'jewish-hanukkah', 
    name: 'Jewish (Hanukkah)', 
    themeId: ThemeId.LIGHT, 
    objectName: 'Hanukkiah', 
    emoji: '🕎',
    backgroundAudioUrl: AUDIO_ASSETS.PIANO_CALM,
    staticStory: "For Hanukkah, we light the hanukkiah — a special candle holder with nine branches — one candle for each of the eight nights, plus one to light the others. Each flame tells the story of a people who held on to their faith and their identity against great odds. Gathering around the candlelight with family every evening reminds us that even a small light can push back the darkness."
  },
  { 
    id: 'christian-christmas', 
    name: 'Christian (Christmas)', 
    themeId: ThemeId.LIGHT, 
    objectName: 'Candles', 
    emoji: '🕯️',
    backgroundAudioUrl: AUDIO_ASSETS.PIANO_CALM,
    staticStory: "At Christmas, we light candles and fill our homes with warm glowing light during the darkest time of year. The light is a symbol of hope and the promise of peace. In our tradition, a single candle in the window was once a sign of welcome — an open door for anyone passing by. When we gather around candlelight with family, it reminds us what truly matters."
  },

  // Clothing - Scarf
  { 
    id: 'muslim-hijab', 
    name: 'Muslim (Hijab)', 
    themeId: ThemeId.CLOTHING, 
    objectName: 'Hijab', 
    emoji: '🧕',
    backgroundAudioUrl: AUDIO_ASSETS.SITAR,
    staticStory: "My hijab is a part of who I am — it is an expression of my faith, my identity, and my values. Wearing it is a personal and spiritual choice that connects me to my community and to something greater than myself. When I put it on each morning, I feel grounded and proud. It is not just a piece of fabric — it carries my story. My hijab is part of my identity and faith. It represents modesty and respect. It makes me feel confident."
  },
  { 
    id: 'french-european-scarf', 
    name: 'French / European Scarf', 
    themeId: ThemeId.CLOTHING, 
    objectName: 'Scarf', 
    emoji: '🧣',
    backgroundAudioUrl: AUDIO_ASSETS.PIANO_CALM,
    staticStory: "In French culture, a scarf is more than something you wear for warmth — it is an expression of who you are. The way you tie it, the colours you choose, the fabric you prefer — it all says something about your personality. A scarf can be passed down from a mother or grandmother, carrying memory and meaning alongside style. It is a small but deeply personal part of how we present ourselves to the world."
  },
  { 
    id: 'west-african-gele', 
    name: 'West African (Gele/Kente)', 
    themeId: ThemeId.CLOTHING, 
    objectName: 'Gele / Kente Cloth', 
    emoji: '👑',
    backgroundAudioUrl: AUDIO_ASSETS.FLUTE_NATIVE,
    staticStory: "In West African culture, the fabrics and head wraps we wear carry deep meaning. A gele tied at a celebration or kente cloth worn at a ceremony is never just an outfit — it tells the story of who you are, where you come from, and what the occasion means. The colours and patterns are chosen with care and intention. When I wear these fabrics I feel connected to my ancestors and proud of my heritage."
  },

  // Language - Greeting
  { 
    id: 'arabic-greeting', 
    name: 'Arabic', 
    themeId: ThemeId.LANGUAGE, 
    objectName: '"As-salamu alaykum"', 
    emoji: '🕊️',
    backgroundAudioUrl: AUDIO_ASSETS.SITAR,
    staticStory: "When we meet someone, we say 'As-salamu alaykum' — meaning 'peace be upon you.' The response is 'Wa alaykum assalam' — 'and upon you peace.' This exchange is more than a greeting. It is a wish, a blessing, and a sign of respect offered to everyone regardless of who they are. In Arabic-speaking communities around the world, these words open every conversation and remind us that kindness should always come first. We greet each other with ‘peace be upon you.’ Our words show kindness. Language brings us together."
  },
  { 
    id: 'francophone-greeting', 
    name: 'Francophone', 
    themeId: ThemeId.LANGUAGE, 
    objectName: '"Bonjour"', 
    emoji: '🗣️',
    backgroundAudioUrl: AUDIO_ASSETS.PIANO_CALM,
    staticStory: "In French-speaking communities, 'bonjour' is one of the first words you learn and one of the most important. Whether you are in Paris, Montreal, Dakar, or Port-au-Prince, saying bonjour is a sign of respect and acknowledgement. It tells someone — I see you, I recognise you. Growing up in a Francophone household, we were taught that greeting someone properly is not optional — it is how you show your character and your upbringing."
  },
  { 
    id: 'indigenous-greeting', 
    name: 'Indigenous', 
    themeId: ThemeId.LANGUAGE, 
    objectName: '"Boozhoo"', 
    emoji: '🍂',
    backgroundAudioUrl: AUDIO_ASSETS.FLUTE_NATIVE,
    staticStory: "In Anishinaabe culture, we greet each other with 'Boozhoo' — a word that carries warmth, respect, and a deep sense of connection. It is not just a hello. It acknowledges the other person's spirit and their place in the community. For generations, our language was silenced and suppressed. Today, every time we say 'Boozhoo' we are keeping our culture alive, honouring our ancestors, and passing something precious on to the next generation."
  },

  // Celebration - New Year
  { 
    id: 'chinese-lunar-new-year', 
    name: 'Chinese / Lunar New Year', 
    themeId: ThemeId.CELEBRATION, 
    objectName: 'Red Decorations', 
    emoji: '🧧',
    backgroundAudioUrl: AUDIO_ASSETS.CHINESE_INSTRUMENTAL,
    staticStory: "Lunar New Year is the biggest celebration in my family. We clean our home to welcome good luck and eat food together. Red decorations and envelopes remind us of happiness, health, and new beginnings."
  },
  { 
    id: 'caribbean-junkanoo', 
    name: 'Caribbean/African (Junkanoo/Bahamas)', 
    themeId: ThemeId.CELEBRATION, 
    objectName: 'Junkanoo Costumes', 
    emoji: '🎭',
    backgroundAudioUrl: AUDIO_ASSETS.FOLK_IRISH,
    staticStory: "In the Bahamas, the new year begins with Junkanoo — one of the most vibrant street festivals in the Caribbean. Starting in the early hours of the morning on New Year's Day, communities take to the streets in elaborately handcrafted costumes made from crepe paper, cardboard, and fabric. Drums, cowbells, and brass instruments fill the air with an infectious rhythm. Junkanoo is a celebration of freedom, creativity, and cultural pride rooted in the traditions of enslaved Africans who were given rare days of rest during the holiday season. To dance in Junkanoo is to honour those who came before us."
  },
  { 
    id: 'persian-nowruz', 
    name: 'Persian/Iranian (Nowruz)', 
    themeId: ThemeId.CELEBRATION, 
    objectName: 'Haft-Sin Table', 
    emoji: '🌱',
    backgroundAudioUrl: AUDIO_ASSETS.SITAR,
    staticStory: "Nowruz, meaning 'new day,' marks the Persian New Year and the first day of spring. We set up the Haft-Sin table — a display of seven symbolic items, each beginning with the letter 'S' in Farsi, representing life, health, prosperity, and renewal. The whole family gathers around the table as the exact moment of the new year arrives, sometimes in the middle of the night. We embrace, exchange gifts, and visit elders to show respect. Nowruz reminds us that nature and humanity are always beginning again."
  },
];

export const THEME_ICONS: Record<string, React.FC<any>> = {
  Utensils, Sun, Shirt, MessageCircle, PartyPopper
};