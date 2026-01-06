// The Operator - Motivational Quotes
// Focused on 10X mindset and execution

export interface Quote {
  id: string;
  text: string;
  author: string;
}

export const quotes: Quote[] = [
  {
    id: '1',
    text: "Success is your duty, obligation, and responsibility.",
    author: "10X Mindset"
  },
  {
    id: '2',
    text: "Average is a failing formula.",
    author: "10X Mindset"
  },
  {
    id: '3',
    text: "Your greatness is limited only by the investments you make in yourself.",
    author: "10X Mindset"
  },
  {
    id: '4',
    text: "Don't be a little bitch. Do the work.",
    author: "10X Mindset"
  },
  {
    id: '5',
    text: "Comfort is the enemy of achievement.",
    author: "10X Mindset"
  },
  {
    id: '6',
    text: "The only way to guarantee failure is to quit.",
    author: "10X Mindset"
  },
  {
    id: '7',
    text: "Money and success demand attention. Ignore either and you will have neither.",
    author: "10X Mindset"
  },
  {
    id: '8',
    text: "Never reduce a target. Instead, increase actions.",
    author: "10X Mindset"
  },
  {
    id: '9',
    text: "Massive action is the one thing I know I can depend on from myself.",
    author: "10X Mindset"
  },
  {
    id: '10',
    text: "Wake up! No one is going to save you. No one is going to take care of your family or your retirement. No one is going to make things work out for you.",
    author: "10X Mindset"
  },
  {
    id: '11',
    text: "Approach every situation with a whatever-it-takes mindset.",
    author: "10X Mindset"
  },
  {
    id: '12',
    text: "Be obsessed or be average.",
    author: "10X Mindset"
  },
  {
    id: '13',
    text: "The ambitious are criticized by those who have given up.",
    author: "10X Mindset"
  },
  {
    id: '14',
    text: "Quit settling for reality and start creating it.",
    author: "10X Mindset"
  },
  {
    id: '15',
    text: "Your excuses are just lies your fears have sold you.",
    author: "10X Mindset"
  },
  {
    id: '16',
    text: "Disciplined daily action creates extraordinary results.",
    author: "10X Mindset"
  },
  {
    id: '17',
    text: "The marketplace doesn't reward those who need it; it rewards those who earn it.",
    author: "10X Mindset"
  },
  {
    id: '18',
    text: "Your potential is directly connected to your willingness to be uncomfortable.",
    author: "10X Mindset"
  },
  {
    id: '19',
    text: "Execution beats strategy every single time.",
    author: "10X Mindset"
  },
  {
    id: '20',
    text: "The only thing standing between you and your goal is the story you keep telling yourself.",
    author: "10X Mindset"
  },
  {
    id: '21',
    text: "Everybody wants the results, but nobody wants to make the sacrifices. I choose to be the exception.",
    author: "The Operator"
  }
];

export const getDailyQuote = (date: Date): Quote => {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return quotes[dayOfYear % quotes.length];
};

export const getRandomQuote = (): Quote => {
  return quotes[Math.floor(Math.random() * quotes.length)];
};
