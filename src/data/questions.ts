import type { RiasecCode } from './riasec';

// Course Match quiz: 4 activity statements per interest type, answered from 1 to 5.
export type Question = { code: RiasecCode; text: string };

export const ANSWER_LABELS = ['Dislike a lot', 'Dislike', 'Neutral', 'Like', 'Like a lot'] as const;

export const QUESTIONS: Question[] = [
  { code: 'R', text: 'Fix a broken appliance or gadget' },
  { code: 'I', text: 'Do a science experiment' },
  { code: 'A', text: 'Draw, paint, or design posters' },
  { code: 'S', text: 'Teach or tutor a classmate' },
  { code: 'E', text: 'Lead a group project' },
  { code: 'C', text: 'Keep records and files neatly organized' },

  { code: 'R', text: 'Build or repair something with tools' },
  { code: 'I', text: 'Solve a tough math or logic puzzle' },
  { code: 'A', text: 'Write stories, poems, or scripts' },
  { code: 'S', text: 'Care for sick or elderly people' },
  { code: 'E', text: 'Start and run a small business' },
  { code: 'C', text: 'Work with numbers in a spreadsheet' },

  { code: 'R', text: 'Work outdoors on a farm, field, or construction site' },
  { code: 'I', text: 'Research how something works' },
  { code: 'A', text: 'Play music or perform on stage' },
  { code: 'S', text: 'Volunteer for a community project' },
  { code: 'E', text: 'Convince others to support your idea' },
  { code: 'C', text: 'Follow a clear schedule and set procedures' },

  { code: 'R', text: 'Operate machines or drive vehicles' },
  { code: 'I', text: 'Write a program or analyze data to find a pattern' },
  { code: 'A', text: 'Edit photos or videos' },
  { code: 'S', text: 'Listen to a friend with a problem and help them' },
  { code: 'E', text: 'Sell a product or manage a budget' },
  { code: 'C', text: 'Check documents carefully for errors' },
];