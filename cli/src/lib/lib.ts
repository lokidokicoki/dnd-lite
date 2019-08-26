import * as fs from 'fs-extra';
import * as path from 'path';
// import * as cheerio from 'cheerio'
import * as inquirer from 'inquirer';
import { CommanderStatic } from 'commander';

const BASE_AGE = 18;
const rawstats = fs.readJsonSync(path.join(process.cwd(), `stats.json`))
const statLookup = new Map(rawstats as any[]);

/**
 * Get a random integer between two values, inclusive
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#Getting_a_random_integer_between_two_values_inclusive
 * @param min lower bound
 * @param max upper bound
 */
function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Roll the dice and return the result
 * @param numberOfDice how many D6 to roll
 * @param modifier added to dice roll
 */
function rollDice(numberOfDice: number, modifier: number = 0): number {
  let result = modifier;
  for (let i = 0; i < numberOfDice; i++) {
    result += getRandomInt(1, 6);
  }
  return result;
}

function getClassStat(klass: string, level: number, stat: string): number {
  const classStats = statLookup.get(klass);
  console.log(classStats, level, stat);


  return 0;
}

/**
 * Get base stats rolls, sort descending and return.
 * NB: there are 7 values, this lets the player exclude the lowest
 */
function baseStats() {
  const statRolls: number[] = [];
  for (let i = 0; i < 7; i++) {
    statRolls.push(rollDice(3));
  }

  return statRolls.sort((a: number, b: number) => {
    return b - a;
  });
}

/**
 * Clear out value that has already been used.
 * @param statRolls base stat rolls
 * @param value value to remove
 */
function cullStat(statRolls: number[], value: number): number[] {
  const found = statRolls.indexOf(value);
  statRolls.splice(found, 1);
  return statRolls;
}

/**
 * Big fuckoff questionnaire!
 * @param options from the cli
 */
export async function main(options: CommanderStatic) {
  console.log(options === undefined)
  const statRolls = baseStats();

  console.log(`Hail brave adventurer!

  Let's build you a character. Just fill in a few fields, accept some stat values and select your toys.`);

  const questions = [
    {
      message: 'Character name:',
      name: `name`,
      type: 'input'
    },
    {
      message: 'Gender:',
      name: `gender`,
      type: 'input'
    },
    {
      message: 'Race:',
      name: 'race',
      type: 'input'
    },
    {
      choices: [`Good`, `Bad`, `Indifferent`],
      message: 'Alignment:',
      name: 'alignment',
      type: 'list'
    },
    {
      choices: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      message: 'Level (specified by your DM):',
      name: 'level',
      type: 'list'
    },
    {
      default: (current: inquirer.Answers) => {
        return rollDice(current.level, BASE_AGE)
      },
      message: 'Age:',
      name: 'age',
      type: 'number'
    },
    {
      message: 'Now for your character stats, this is modified by the class you choose later',
      name: `discard`,
      type: 'confirm'
    },
    {
      choices: statRolls,
      default: 0,
      message: 'Strength:',
      name: 'str',
      type: 'list'
    },
    {
      choices: (current: inquirer.Answers) => {
        return cullStat(statRolls, current.str);
      },
      default: 0,
      message: 'Constitution:',
      name: 'con',
      type: 'list'
    },
    {
      choices: (current: inquirer.Answers) => {
        return cullStat(statRolls, current.con);
      },
      default: 0,
      message: 'Intelligence:',
      name: 'int',
      type: 'list'
    },
    {
      choices: (current: inquirer.Answers) => {
        return cullStat(statRolls, current.int);
      },
      default: 0,
      message: 'Dexterity:',
      name: 'dex',
      type: 'list'
    },
    {
      choices: (current: inquirer.Answers) => {
        return cullStat(statRolls, current.dex);
      },
      default: 0,
      message: 'Charisma:',
      name: 'cha',
      type: 'list'
    },
    {
      choices: (current: inquirer.Answers) => {
        return cullStat(statRolls, current.cha);
      },
      default: 0,
      message: 'Wisdom:',
      name: 'wis',
      type: 'list'
    },
    {
      choices: (current: inquirer.Answers) => {
        const classes = ['Warrior', 'Paladin', 'Mage', 'Priest', 'Monk', 'Ranger', 'Rogue'];
        if (current.alignment === 'Indifferent') {
          classes.splice(classes.indexOf('Paladin'), 1);
        }
        return classes
      },
      message: 'Class:',
      name: 'class',
      type: 'list'
    }
  ] as inquirer.QuestionCollection;

  const answers = await inquirer.prompt(questions);

  await fs.writeJson(`dump.json`, answers, { spaces: 2 })


  console.log(answers);
}
