export interface ICharacterClass {
  type: string;
  boosts: {
    str?: number;
    con?: number;
    dex?: number;
    cha?: number;
    wis?: number;
    int?: number;
    [key: string]: number;
  };
  kickers: {
    dualWield?: boolean;
    armor: number;
    weapons: {
      ranged: number;
      blunt: number;
      edged: number;
    };
    spells?: any[];
  };
}

export interface IWeaponTypes {
  light: string[];
  medium: string[];
  heavy: string[];
}

export interface IArmorTypes {
  light: string[];
  medium: string[];
  heavy: string[];
}

export interface IEquipmentList {
  warrior: string[];
  paladin: string[];
  priest: string[];
  monk: string[];
  mage: string[];
  ranger: string[];
  rogue: string[];
  generic: string[];
  mandatory: string[];
  [key: string]: string[];
}
