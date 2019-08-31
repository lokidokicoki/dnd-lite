import { CommanderStatic } from 'commander';
import * as fs from 'fs-extra';
import * as inquirer from 'inquirer';
import * as os from 'os';
import * as path from 'path';
import { Character } from './character';
import { IArmorTypes, ICharacterClass, IEquipmentList, IWeaponTypes } from './types';

const BASE_AGE = 18;
const rawClasses = fs.readJsonSync(path.join(process.cwd(), `classes.json`));
const rawWeapons = fs.readJsonSync(path.join(process.cwd(), `weapons.json`));
const races = fs.readJsonSync(path.join(process.cwd(), `races.json`));
const armorTypes: IArmorTypes = fs.readJsonSync(path.join(process.cwd(), `armor.json`));
const equipmentList: IEquipmentList = fs.readJsonSync(path.join(process.cwd(), `equipment.json`));
const characterClasses: Map<string, ICharacterClass> = new Map(rawClasses as any[]);
const weaponTypes: Map<string, IWeaponTypes> = new Map(rawWeapons as any[]);

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

/**
 * Get bonus for stat value
 * @param value stat value
 */
export function getSkillBonus(value: number) {
  let bonus = 0;

  if (value > 8 && value <= 11) {
    bonus = 1;
  } else if (value >= 12 && value <= 14) {
    bonus = 2;
  } else if (value >= 15) {
    bonus = 3;
  }
  return bonus;
}

function getClassArmor(characterClass: ICharacterClass, useSeparators: boolean = false): string[] {
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
function getClassWeapons(characterClass: ICharacterClass, useSeparators: boolean = false): string[] {
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
 * What weapons can this character wield?
 * @param characterClass current character
 */
function canWield(characterClass: ICharacterClass) {
  return characterClass.kickers.weapons.ranged !== 0 && characterClass.kickers.weapons.edged !== 0 && characterClass.kickers.weapons.blunt !== 0;
}

/**
 * What armor can this character wear?
 * @param characterClass current character
 */
function canWearArmor(characterClass: ICharacterClass) {
  return characterClass.kickers.armor !== 0;
}

/**
 * Build out the character.
 * @param answers cli answers
 */
async function processAnswers(answers: inquirer.Answers) {
  await fs.writeJson(`dump-answers.json`, answers, { spaces: 2 });

  const character = new Character(answers);

  // supply default equipment based on character
  character.equipment = equipmentList[character.type.toLowerCase()];

  // get generic equipment based on charisma score modulo 3
  const items = parseInt((character.stats.cha / 3).toFixed(0));
  for (let i = 0; i < items; i++) {
    character.equipment.push(equipmentList.generic[getRandomInt(0, equipmentList.generic.length - 1)]);
  }

  character.equipment.push(...equipmentList.mandatory);

  let cash = 'No money';
  let rations = 'No rations';
  switch (items) {
    case 1:
      cash = 'very little money';
      rations = 'meagre rations';
      break;
    case 2:
      cash = 'a little money';
      rations = 'a few rations';
      break;
    case 3:
      cash = 'some money';
      rations = 'several rations';
      break;
    case 4:
      cash = 'plenty of money';
      rations = 'enough rations to get by';
      break;
    case 6:
      cash = 'lots of money';
      rations = 'lots of rations';
      break;
    case 7:
      cash = 'absolute shitloads of money';
      rations = 'a fat bastards amount of rations';
      break;
    default:
      break;
  }

  character.equipment.push(cash);
  character.equipment.push(rations);

  // dump raw character values
  await fs.writeJson(`dump.json`, character, { spaces: 2 });

  let html = await fs.readFile(`character-sheet.html`, `utf8`);

  html = character.htmlOutput(html);
  const fileName = path.join(os.homedir(), `dndlite-characters`, `${character.name.toLowerCase().replace(/ /g, `-`)}.html`);
  console.log(`You did! You made it to the end! Your character sheet is here:`, fileName);
  await fs.ensureFile(fileName);
  await fs.writeFile(`${fileName}`, html, `utf8`);
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
      default: 'Steve the Mighty Clencher',
      message: 'Character name:',
      name: `name`,
      type: 'input'
    },
    {
      default: 'Attack helicopter',
      message: 'Gender:',
      name: `gender`,
      type: 'input'
    },
    {
      choices: races,
      message: 'Race:',
      name: 'race',
      type: 'list'
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
      choices: statRolls,
      default: 0,
      message: 'Now for your character stats, these are modified by the class you choose later.\n\nStrength:',
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
        const classes = ['Warrior', 'Paladin', 'Wizard', 'Priest', 'Monk', 'Ranger', 'Rogue'];
        if (current.alignment === 'Indifferent') {
          classes.splice(classes.indexOf('Paladin'), 1);
        }
        return classes;
      },
      filter: (current: string) => {
        return characterClasses.get(current);
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
        return canWield(current.class);
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
        return canWield(current.class) && current.class.kickers.dualWield;
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
        return canWearArmor(current.class);
      }
    },
    {
      message: 'Would you like a shield? Remember, you can only use one weapon with a shield.',
      name: 'shield',
      type: 'confirm',
      when: (current: inquirer.Answers) => {
        return canWearArmor(current.class);
      }
    }

  ] as inquirer.QuestionCollection;

  const answers = await inquirer.prompt(questions);

  await processAnswers(answers);

}
