import { CommanderStatic } from 'commander';
import * as fs from 'fs-extra';
// import * as cheerio from 'cheerio'
import * as inquirer from 'inquirer';
import * as path from 'path';
import { ICharacterClass, IWeaponTypes } from './types';

const BASE_AGE = 18;
const rawClasses = fs.readJsonSync(path.join(process.cwd(), `classes.json`));
const rawWeapons = fs.readJsonSync(path.join(process.cwd(), `weapons.json`));
const armorTypes = fs.readJsonSync(path.join(process.cwd(), `armor.json`));
const characterClasses: Map<string, ICharacterClass> = new Map(rawClasses as any[]);
const weaponTypes: Map<string, IWeaponTypes> = new Map(rawWeapons as any[]);
let characterClass: ICharacterClass;

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
  const classStats = characterClasses.get(klass);
  console.log(classStats, level, stat);

  return 0;
}

function getClassArmor(klass: string, useSeparators: boolean = false): string[] {
  characterClass = characterClass || characterClasses.get(klass);
  let armor: Array<(string | any)> = [];
  if (characterClass.kickers.armor & 1) {
    if (useSeparators) {
      armor.push(new inquirer.Separator(`= Light =`));
    }
    armor = armor.concat(armorTypes.light);
  }
  if (characterClass.kickers.armor & 2) {
    if (useSeparators) {
      armor.push(new inquirer.Separator(`= Medium =`));
    }
    armor = armor.concat(armorTypes.medium);
  }
  if (characterClass.kickers.armor & 4) {
    if (useSeparators) {
      armor.push(new inquirer.Separator(`= Heavy =`));
    }
    armor = armor.concat(armorTypes.heavy);
  }
  return armor;
}
function getClassWeapons(klass: string, useSeparators: boolean = false): string[] {
  characterClass = characterClass || characterClasses.get(klass);
  let weapons: Array<(string | any)> = [];
  const blunt = weaponTypes.get('blunt');
  const edged = weaponTypes.get('edged');
  const ranged = weaponTypes.get('ranged');
  if (characterClass.kickers.weapons.blunt & 1) {
    if (useSeparators) {
      weapons.push(new inquirer.Separator(`= Blunt/light =`));
    }
    weapons = weapons.concat(blunt.light);
  }
  if (characterClass.kickers.weapons.blunt & 2) {
    if (useSeparators) {
      weapons.push(new inquirer.Separator(`= Blunt/medium =`));
    }
    weapons = weapons.concat(blunt.medium);
  }
  if (characterClass.kickers.weapons.blunt & 4) {
    if (useSeparators) {
      weapons.push(new inquirer.Separator(`= Blunt/heavy =`));
    }
    weapons = weapons.concat(blunt.heavy);
  }
  if (characterClass.kickers.weapons.edged & 1) {
    if (useSeparators) {
      weapons.push(new inquirer.Separator(`= Edged/light =`));
    }
    weapons = weapons.concat(edged.light);
  }
  if (characterClass.kickers.weapons.edged & 2) {
    if (useSeparators) {
      weapons.push(new inquirer.Separator(`= Edged/medium =`));
    }
    weapons = weapons.concat(edged.medium);
  }
  if (characterClass.kickers.weapons.edged & 4) {
    if (useSeparators) {
      weapons.push(new inquirer.Separator(`= Edged/heavy =`));
    }
    weapons = weapons.concat(edged.heavy);
  }
  if (characterClass.kickers.weapons.ranged & 1) {
    if (useSeparators) {
      weapons.push(new inquirer.Separator(`= Ranged/light =`));
    }
    weapons = weapons.concat(ranged.light);
  }
  if (characterClass.kickers.weapons.ranged & 2) {
    if (useSeparators) {
      weapons.push(new inquirer.Separator(`= Ranged/medium =`));
    }
    weapons = weapons.concat(ranged.medium);
  }
  if (characterClass.kickers.weapons.ranged & 4) {
    if (useSeparators) {
      weapons.push(new inquirer.Separator(`= Ranged/heavy =`));
    }
    weapons = weapons.concat(ranged.heavy);
  }
  return weapons;
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
  console.log(options === undefined);
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
        return rollDice(current.level, BASE_AGE);
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
        return classes;
      },
      message: 'Class:',
      name: 'class',
      type: 'list'
    },
    {
      choices: (current: inquirer.Answers) => {
        return getClassWeapons(current.class, true);
      },
      message: 'Now choose your main weapon:',
      name: 'weapon1',
      type: 'list',
      when: (current: inquirer.Answers) => {
        return current.class !== 'Monk';
      }
    },
    {
      choices: (current: inquirer.Answers) => {
        return getClassWeapons(current.class, true);
      },
      message: 'Now choose your off-hand weapon:',
      name: 'weapon2',
      type: 'list',
      when: (current: inquirer.Answers) => {
        return current.class !== 'Monk' && characterClass.kickers.dualWield;
      }
    },
    {
      choices: (current: inquirer.Answers) => {
        return getClassArmor(current.class, true);
      },
      message: 'Now choose your armor:',
      name: 'armor',
      type: 'list',
      when: (current: inquirer.Answers) => {
        return current.class !== 'Mage';
      }
    },
    {
      message: 'Would you like a shield? Remember, you can only use one weapon with a shield.',
      name: 'shield',
      type: 'confirm',
      when: (current: inquirer.Answers) => {
        return current.class !== 'Mage';
      }
    }

  ] as inquirer.QuestionCollection;

  const answers = await inquirer.prompt(questions);

  await fs.writeJson(`dump.json`, answers, { spaces: 2 });

  console.log(answers);
}
