export interface ClassIcon {
    name: string;
    position: number; // Y position (will be multiplied by -28)
  }
  
  export const CLASS_ICONS: Record<string, ClassIcon> = {
    warrior: { name: 'Warrior', position: 0 },
    ranger: { name: 'Ranger', position: 1 },
    sorceress: { name: 'Sorceress', position: 2 },
    berserker: { name: 'Berserker', position: 3 },
    tamer: {name:'Tamer', position:4},
    ninja: {name:'Ninja',position:5},
    kunoichi: {name:"Kunoichi",position:6},
    wizard:{name:'Wizard',position:7},
    witch:{name:'Witch',position:8},
    maehwa:{name:'Maehwa',position:9},
    valkyrie:{name:'Valk',position:10},
    musa:{name:"Musa",position:11},
    dark_knight:{name:"Dark Knight",position:12},
    striker:{name:"Striker",position:13},
    mystic:{name:"Mystic",position:14},
    lahn:{name:"Lahn",position:15},
    archer:{name:"Archer",position:16},
    shai:{name:"Shai",position:17},
    guardian:{name:"Guardian",position:18},
    hashashin:{name:"Hashashin",position:19},
    nova:{name:"Nova",position:20},
    sage:{name:"Sage",position:21},
    corsair:{name:"Corsair",position:22},
    drakania:{name:"Drakania",position:23},
    woosa:{name:"Woosa",position:24},
    maegu:{name:"Maegu",position:25},
    scholar:{name:"Scholar",position:26},
    dosa:{name:"Dosa",position:27},
    deadeye: { name: 'Deadeye', position: 28 },
    wukong:{name:"Wukong",position:29}
    // last class at position 29
  };
  
  // Helper function to get Y offset
  export function getClassIconOffset(className: string): number {
    const icon = CLASS_ICONS[className.toLowerCase()];
    return icon ? icon.position * -28 : 0;
  }
  
  // Alternative: if you want to store actual pixel values
//   export const CLASS_ICON_POSITIONS: Record<string, number> = {
//     warrior: 0,
//     ranger: -28,
//     sorceress: -56,
//     berserker: -84,
//     // ...
//     deadeye: -784,
//   };
  
  export const SPRITE_CONFIG = {
    url: 'https://s1.pearlcdn.com/NAEU/contents/img/common/character/icn_class_symbol_spr.svg',
    iconSize: 28,
    spriteSize: 84,
  } as const;