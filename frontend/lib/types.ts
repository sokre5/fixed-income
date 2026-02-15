export type Sentiment = "Bullish" | "Bearish" | "Neutral";

export interface Instrument {
  id: number;
  name: string;
}

export interface NoteItem {
  id: number;
  instrumentId: number;
  instrumentName: string;
  dataPoint: string;
  actualValue: string;
  expectedValue: string;
  observedOn: string;
  sentiment: Sentiment;
  commentary: string;
  createdAt: string;
}

export interface NotePayload {
  instrumentName: string;
  dataPoint: string;
  actualValue: string;
  expectedValue: string;
  observedOn: string;
  sentiment: Sentiment;
  commentary: string;
}

export interface StudyNote {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}
