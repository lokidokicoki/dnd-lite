import * as cheerio from 'cheerio';
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
    allowedSpells: [{
      easy: number;
      medium: number;
      hard: number;
    }];
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
  public spells: any;

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

  public htmlOutput(html: string) {
    const $ = cheerio.load(html);

    $(`#name`).text(this.name);
    $(`#age`).text(this.age.toString());
    $(`#gender`).text(this.gender);
    $(`#race`).text(this.race);
    $(`#class`).text(this.type);
    $(`#level`).text(this.level.toString());
    $(`#alignment`).text(this.alignment);
    $(`#hit-points`).text(this.hitPoints.toString());

    // stats and bonuses
    for (const key of Object.keys(this.stats)) {
      $(`#${key}-value`).text(this.stats[key].toString());
      $(`#${key}-bonus`).text(this.skillBonuses[key].toString());
    }

    // spells

    // weapons

    // armor

    // equipment


    return $.html();
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
