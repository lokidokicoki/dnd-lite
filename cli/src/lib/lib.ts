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
  //console.log(classStats, level, stat);
  let d1 = Number.MIN_SAFE_INTEGER;
  let d2 = Number.MIN_SAFE_INTEGER;
  let rolls = [rollDice(1), rollDice(1), rollDice(1)];

  for (let i = 0; i < rolls.length; i++) {
    if (rolls[i] > d1) {
      d2 = d1;
      d1 = rolls[i];
    } else if (rolls[i] > d2) {
      d2 = rolls[1]
    }
  }

  console.log(rolls, d1, d2);


  return 0;

}

function baseStats() {
  const statRolls: number[] = [];
  for (let i = 0; i < 7; i++) {
    statRolls.push(rollDice(3))
  }

  return statRolls.sort();
}

function cullStat(statRolls, value) {
  const found = statRolls.indexOf(value);
  statRolls.splice(found, 1);
  return statRolls
}

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
      name: 'strValue',
      type: 'list'
    },
    {
      choices: (current: inquirer.Answers) => {
        return cullStat(statRolls, current.strValue);
      },
      default: 0,
      message: 'Constitution:',
      name: 'conValue',
      type: 'list'
    },
    {
      choices: (current: inquirer.Answers) => {
        return cullStat(statRolls, current.conValue);
      },
      default: 0,
      message: 'Intelligence:',
      name: 'intValue',
      type: 'list'
    },
    {
      choices: (current: inquirer.Answers) => {
        return cullStat(statRolls, current.intValue);
      },
      default: 0,
      message: 'Dexterity:',
      name: 'dexValue',
      type: 'list'
    },
    {
      choices: (current: inquirer.Answers) => {
        return cullStat(statRolls, current.dexValue);
      },
      default: 0,
      message: 'Charisma:',
      name: 'chaValue',
      type: 'list'
    },
    {
      choices: (current: inquirer.Answers) => {
        return cullStat(statRolls, current.chaValue);
      },
      default: 0,
      message: 'Wisdom:',
      name: 'wisValue',
      type: 'list'
    },
    {
      choices: ['Warrior', 'Paladin', 'Mage', 'Priest', 'Monk', 'Ranger', 'Rogue'],
      message: 'Class:',
      name: 'class',
      type: 'list'
    }
  ] as inquirer.QuestionCollection;

  const answers = await inquirer.prompt(questions);

  console.log(answers);
}
