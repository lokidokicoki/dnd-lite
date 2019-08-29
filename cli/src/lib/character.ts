import { getSkillBonus } from './lib';
import { ICharacterClass } from './types';

export const HP_MULTIPLIER = 2;

export class Character implements ICharacterClass {
  public type: string;
  public boosts: {
    str?: number;
    con?: number;
    dex?: number;
    cha?: number;
    wis?: number;
    int?: number;
    [key: string]: number;
  };
  public kickers: {
    dualWield?: boolean;
    armor: number;
    weapons: {
      ranged: number;
      blunt: number;
      edged: number;
    };
    spells?: any[];
  };

  public skillBonuses: {
    str: number;
    con: number;
    dex: number;
    cha: number;
    wis: number;
    int: number;
    [key: string]: number;
  };

  public name: string;
  public gender: string;

  public race: string;
  public alignment: string;
  public level: number;
  public age: number;

  public stats: {
    str: number;
    con: number;
    int: number;
    dex: number;
    cha: number;
    wis: number;
    [key: string]: number;
  };

  public hitPoints: number;
  public equipment: string[];

  constructor(options: any) {
    // get characterClass
    const characterClass = options.class as ICharacterClass;
    this.type = characterClass.type;
    this.boosts = characterClass.boosts;
    this.kickers = characterClass.kickers;

    this.name = options.name;
    this.gender = options.gender;
    this.race = options.race;
    this.alignment = options.alignment;
    this.level = options.level;
    this.age = options.age;
    this.stats = {
      cha: options.cha,
      con: options.con,
      dex: options.dex,
      int: options.int,
      str: options.str,
      wis: options.wis
    };
    this.skillBonuses = {
      cha: 0,
      con: 0,
      dex: 0,
      int: 0,
      str: 0,
      wis: 0
    };

    this.equipment = options.equipment || [];

    this.update();
  }

  private update() {

    // get skill bonuses and adjusted skills
    for (const key of Object.keys(this.stats)) {
      this.stats[key] = this.boosts[key] ? this.stats[key] + this.boosts[key] : this.stats[key];
      this.skillBonuses[key] = getSkillBonus(this.stats[key]);
    }

    this.hitPoints = this.stats.con * HP_MULTIPLIER;
  }

}
