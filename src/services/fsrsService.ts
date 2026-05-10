import { 
  fsrs, 
  Card, 
  Rating, 
  RecordLog, 
  FSRSParameters,
  State,
  createEmptyCard,
  generatorParameters
} from 'ts-fsrs';

export interface MemoCard extends Card {
  wordId: string;
  category: string;
  deck?: string;
}

// Default FSRS parameters
const params: FSRSParameters = generatorParameters({
  request_retention: 0.9,
  maximum_interval: 36500,
  enable_fuzz: true,
});

const f = fsrs(params);

/**
 * Gets the next intervals for all ratings.
 */
export const getNextIntervals = (card: MemoCard, reviewTime: Date = new Date()) => {
  const scheduling_cards = f.repeat(card, reviewTime);
  return {
    [Rating.Again]: scheduling_cards[Rating.Again].card.scheduled_days,
    [Rating.Hard]: scheduling_cards[Rating.Hard].card.scheduled_days,
    [Rating.Good]: scheduling_cards[Rating.Good].card.scheduled_days,
    [Rating.Easy]: scheduling_cards[Rating.Easy].card.scheduled_days,
  };
};

/**
 * Creates a brand new FSRS card for a word.
 */
export const createMemoCard = (wordId: string, category: string, deck: string = 'Default'): MemoCard => {
  const card = createEmptyCard(new Date());
  return {
    ...card,
    wordId,
    category,
    deck
  } as MemoCard;
};

/**
 * Processes a review and returns the updated card and log.
 */
export const reviewMemoCard = (card: MemoCard, rating: Rating, reviewTime: Date = new Date()): { card: MemoCard, log: RecordLog } => {
  const scheduling_cards = f.repeat(card, reviewTime);
  const { card: updatedCard, log } = scheduling_cards[rating];
  
  return {
    card: {
      ...updatedCard,
      wordId: card.wordId,
      category: card.category,
      deck: card.deck
    } as MemoCard,
    log
  };
};

/**
 * Formats the next review interval as a human-readable string.
 */
export const getIntervalString = (scheduled_days: number): string => {
  if (scheduled_days < 1) return 'now';
  if (scheduled_days < 30) return `${Math.round(scheduled_days)}d`;
  if (scheduled_days < 365) return `${Math.round(scheduled_days / 30)}mo`;
  return `${Math.round(scheduled_days / 365)}y`;
};
