// import * as fs from 'fs-extra';
// import * as cheerio from 'cheerio'
import * as inquirer from 'inquirer';
import { CommanderStatic } from 'commander';

const BASE_AGE = 18;

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

export async function main(options: CommanderStatic) {
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
      choices: ['Warrior', 'Paladin', 'Mage', 'Priest', 'Monk', 'Ranger', 'Rogue'],
      message: 'Class:',
      name: 'class',
      type: 'list'
    }
  ] as inquirer.QuestionCollection;

  const answers = await inquirer.prompt(questions);

  console.log(answers);
}
