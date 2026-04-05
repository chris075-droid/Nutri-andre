// NutriAndré — Constantes globales

export const C = {
  primary: "#29B6F6", dark: "#0288D1", deep: "#01579B",
  bg: "#F0F8FF", card: "#FFFFFF", light: "#E1F5FE", accent: "#B3E5FC",
  text: "#0D2B4A", mid: "#4A7A9B", soft: "#90B8D0",
  green: "#26C6A1", orange: "#FFB300", red: "#EF5350", purple: "#7C4DFF",
};

export const grad = `linear-gradient(135deg,${C.primary},${C.dark})`;

export const STAGE_DESC = {
  newborn: "leche exclusiva",
  infant: "primeras papillas",
  solids: "introducción sólidos",
  toddler: "transición familiar",
  preschool: "dieta variada",
};

export const POOL = {
  solids: [
    { dish:"Puré suave de manzana y pera",      emoji:"\u{1F34E}", tag:"Vitaminas A y C",    mealDB:"apple",    offTerm:"apple"    },
    { dish:"Papilla de avena con plátano",       emoji:"\u{1F33E}", tag:"Energía natural",    mealDB:"oatmeal",  offTerm:"oat"      },
    { dish:"Crema de zanahoria y papa",          emoji:"\u{1F955}", tag:"Betacaroteno",       mealDB:"carrot",   offTerm:"carrot"   },
    { dish:"Puré de calabaza suave",             emoji:"\u{1F383}", tag:"Vitamina A",         mealDB:"pumpkin",  offTerm:"pumpkin"  },
    { dish:"Papilla de camote y canela",         emoji:"\u{1F360}", tag:"Vitamina A + fibra", mealDB:"sweet potato",offTerm:"sweet potato"},
    { dish:"Puré de chícharo con menta",         emoji:"\u{1F33F}", tag:"Hierro + proteína",  mealDB:"pea",      offTerm:"pea"      },
    { dish:"Crema de brócoli suave",             emoji:"\u{1F966}", tag:"Calcio + vitamina C",mealDB:"broccoli", offTerm:"broccoli" },
    { dish:"Papilla de pera y arroz",            emoji:"\u{1F350}", tag:"Fibra suave",        mealDB:"pear",     offTerm:"pear"     },
    { dish:"Puré de betabel con manzana",        emoji:"\u{1F34E}", tag:"Hierro + antioxidantes",mealDB:"beetroot",offTerm:"beetroot"},
    { dish:"Crema de espinaca y papa",           emoji:"\u{1F96C}", tag:"Hierro + energía",   mealDB:"spinach",  offTerm:"spinach"  },
    { dish:"Papilla de plátano y aguacate",      emoji:"\u{1F34C}", tag:"Grasas saludables",  mealDB:"banana",   offTerm:"avocado"  },
    { dish:"Puré de mango y zanahoria",          emoji:"\u{1F96D}", tag:"Vitaminas A y C",    mealDB:"mango",    offTerm:"mango"    },
  ],
  toddler: [
    { dish:"Puré de lentejas con zanahoria",     emoji:"\u{1F35B}", tag:"Rico en hierro",     mealDB:"lentil",   offTerm:"lentil"   },
    { dish:"Tortillitas de espinaca y huevo",    emoji:"\u{1F96C}", tag:"Proteína + hierro",  mealDB:"spinach",  offTerm:"spinach"  },
    { dish:"Albóndigas suaves de pollo",         emoji:"\u{1F357}", tag:"Proteína magra",     mealDB:"chicken",  offTerm:"chicken"  },
    { dish:"Croquetas de brócoli y queso",       emoji:"\u{1F966}", tag:"Calcio + fibra",     mealDB:"broccoli", offTerm:"broccoli" },
    { dish:"Arroz con verduras y pollo",         emoji:"\u{1F35A}", tag:"Equilibrado",        mealDB:"rice",     offTerm:"rice"     },
    { dish:"Crema de calabaza y quinoa",         emoji:"\u{1F383}", tag:"Vitaminas A y C",    mealDB:"pumpkin",  offTerm:"quinoa"   },
    { dish:"Puré de aguacate con plátano",       emoji:"\u{1F951}", tag:"Grasas saludables",  mealDB:"avocado",  offTerm:"avocado"  },
    { dish:"Sopa de fideos con pollo",           emoji:"\u{1F35C}", tag:"Hidratación + proteína",mealDB:"chicken soup",offTerm:"chicken"},
    { dish:"Tortita de papa y zanahoria",        emoji:"\u{1F954}", tag:"Energía + betacaroteno",mealDB:"potato", offTerm:"potato"   },
    { dish:"Huevo revuelto con espinaca",        emoji:"\u{1F373}", tag:"Proteína + hierro",  mealDB:"omelette", offTerm:"egg"      },
    { dish:"Pasta con crema de calabaza",        emoji:"\u{1F35D}", tag:"Vitamina A + energía",mealDB:"pasta",   offTerm:"pumpkin"  },
    { dish:"Arroz con frijoles y queso",         emoji:"\u{1F35A}", tag:"Proteína completa",  mealDB:"rice",     offTerm:"bean"     },
    { dish:"Pollo desmenuzado con camote",       emoji:"\u{1F357}", tag:"Proteína + vitamina A",mealDB:"chicken",offTerm:"sweet potato"},
    { dish:"Crema de chayote con queso",         emoji:"\u{1F966}", tag:"Calcio + fibra",     mealDB:"squash",   offTerm:"squash"   },
    { dish:"Sopa de verduras con estrellitas",   emoji:"\u{1F372}", tag:"Vitaminas variadas", mealDB:"vegetable soup",offTerm:"vegetable"},
    { dish:"Quesadilla suave con frijoles",      emoji:"\u{1FAD4}", tag:"Calcio + proteína",  mealDB:"tortilla", offTerm:"bean"     },
    { dish:"Caldo de pollo con verduras",        emoji:"\u{1F372}", tag:"Nutritivo + hidratante",mealDB:"chicken",offTerm:"chicken"  },
    { dish:"Puré de papa con mantequilla",       emoji:"\u{1F954}", tag:"Energía + grasas",   mealDB:"potato",   offTerm:"potato"   },
    { dish:"Avena con manzana rallada",          emoji:"\u{1F33E}", tag:"Fibra + energía",    mealDB:"oatmeal",  offTerm:"oat"      },
    { dish:"Minihamburguesa de res con avena",   emoji:"\u{1F354}", tag:"Hierro + proteína",  mealDB:"beef",     offTerm:"beef"     },
  ],
  preschool: [
    { dish:"Pasta con salsa de tomate y carne",  emoji:"\u{1F35D}", tag:"Completo",           mealDB:"pasta",    offTerm:"pasta"    },
    { dish:"Tortilla de patata suave",           emoji:"\u{1F373}", tag:"Energía + proteína", mealDB:"omelette", offTerm:"egg"      },
    { dish:"Cazuela de pollo con patata",        emoji:"\u{1F372}", tag:"Nutritivo",          mealDB:"chicken",  offTerm:"chicken"  },
    { dish:"Arroz con lentejas y zanahoria",     emoji:"\u{1F35A}", tag:"Hierro + proteína",  mealDB:"lentil",   offTerm:"lentil"   },
    { dish:"Tacos de pollo con guacamole",       emoji:"\u{1F32E}", tag:"Proteína + grasas saludables",mealDB:"chicken",offTerm:"avocado"},
    { dish:"Sopa de tortilla con queso",         emoji:"\u{1F372}", tag:"Calcio + energía",   mealDB:"tortilla soup",offTerm:"cheese"},
    { dish:"Espagueti con albóndigas de pavo",   emoji:"\u{1F35D}", tag:"Proteína magra",     mealDB:"pasta",    offTerm:"turkey"   },
    { dish:"Quesadilla con champiñones",         emoji:"\u{1FAD4}", tag:"Proteína + vitamina D",mealDB:"mushroom",offTerm:"mushroom"},
    { dish:"Arroz frito con huevo y verduras",   emoji:"\u{1F35A}", tag:"Equilibrado",        mealDB:"fried rice",offTerm:"rice"    },
    { dish:"Enchiladas suaves de pollo",         emoji:"\u{1F32E}", tag:"Proteína + calcio",  mealDB:"chicken",  offTerm:"chicken"  },
    { dish:"Sándwich de atún con aguacate",      emoji:"\u{1F96A}", tag:"Omega-3 + grasas buenas",mealDB:"tuna", offTerm:"tuna"     },
    { dish:"Caldo tlalpeño con garbanzos",       emoji:"\u{1F372}", tag:"Proteína + fibra",   mealDB:"chickpea", offTerm:"chickpea" },
    { dish:"Picadillo de res con papa",          emoji:"\u{1F356}", tag:"Hierro + energía",   mealDB:"beef",     offTerm:"beef"     },
    { dish:"Pescado empanizado al horno",        emoji:"\u{1F41F}", tag:"Omega-3 + proteína", mealDB:"fish",     offTerm:"fish"     },
    { dish:"Crema de elote con pollo",           emoji:"\u{1F33D}", tag:"Energía + proteína", mealDB:"corn",     offTerm:"corn"     },
    { dish:"Hotcakes de avena con plátano",      emoji:"\u{1F95E}", tag:"Fibra + energía",    mealDB:"pancake",  offTerm:"oat"      },
    { dish:"Tinga de pollo suave",               emoji:"\u{1F357}", tag:"Proteína + vitamina C",mealDB:"chicken",offTerm:"chicken"  },
    { dish:"Sopa de estrellitas con espinaca",   emoji:"\u{1F35C}", tag:"Hierro + vitaminas", mealDB:"spinach",  offTerm:"spinach"  },
  ],
};

export function getDailySuggestion(stage) {
  const pool = POOL[stage] || POOL.toddler;
  const day = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return pool[day % pool.length];
}

export const SNACK_POOL = {
  solids: [
    { dish:"Puré de plátano con canela",         emoji:"🍌", tag:"Energía + potasio",     mealDB:"banana",   offTerm:"banana"   },
    { dish:"Compota de pera suave",              emoji:"🍐", tag:"Fibra suave",            mealDB:"pear",     offTerm:"pear"     },
    { dish:"Yogur natural sin azúcar",           emoji:"🥛", tag:"Calcio + probióticos",   mealDB:"yogurt",   offTerm:"yogurt"   },
    { dish:"Puré de mango",                      emoji:"🥭", tag:"Vitamina C",             mealDB:"mango",    offTerm:"mango"    },
    { dish:"Papilla de durazno suave",           emoji:"🍑", tag:"Vitamina A + fibra",     mealDB:"peach",    offTerm:"peach"    },
    { dish:"Puré de ciruela",                    emoji:"🟣", tag:"Fibra digestiva",        mealDB:"plum",     offTerm:"plum"     },
    { dish:"Compota de manzana con avena",       emoji:"🍎", tag:"Energía + fibra",        mealDB:"apple",    offTerm:"apple"    },
    { dish:"Papilla de chayote suave",           emoji:"🥒", tag:"Hidratación + vitaminas",mealDB:"squash",   offTerm:"squash"   },
    { dish:"Puré de papaya",                     emoji:"🧡", tag:"Digestión + vitamina C", mealDB:"papaya",   offTerm:"papaya"   },
    { dish:"Crema de camote dulce",              emoji:"🍠", tag:"Vitamina A + energía",   mealDB:"sweet potato",offTerm:"sweet potato"},
  ],
  toddler: [
    { dish:"Rodajas de plátano con avena",       emoji:"🍌", tag:"Energía + fibra",        mealDB:"banana",   offTerm:"banana"   },
    { dish:"Palitos de zanahoria cocida",        emoji:"🥕", tag:"Betacaroteno",           mealDB:"carrot",   offTerm:"carrot"   },
    { dish:"Yogur con fruta picada",             emoji:"🍓", tag:"Calcio + vitaminas",     mealDB:"yogurt",   offTerm:"strawberry"},
    { dish:"Galletas de avena caseras",          emoji:"🍪", tag:"Fibra + hierro",         mealDB:"oatmeal",  offTerm:"oat"      },
    { dish:"Cubitos de queso fresco",            emoji:"🧀", tag:"Calcio + proteína",      mealDB:"cheese",   offTerm:"cheese"   },
    { dish:"Bolitas de plátano y avena",         emoji:"🍡", tag:"Energía natural",        mealDB:"banana",   offTerm:"oat"      },
    { dish:"Mini tostada con aguacate",          emoji:"🥑", tag:"Grasas saludables",      mealDB:"avocado",  offTerm:"avocado"  },
    { dish:"Mango picado con limón",             emoji:"🥭", tag:"Vitamina C + digestión", mealDB:"mango",    offTerm:"mango"    },
    { dish:"Tortita de arroz con queso crema",   emoji:"🍘", tag:"Energía + calcio",       mealDB:"rice",     offTerm:"rice"     },
    { dish:"Pepino en bastones con limón",       emoji:"🥒", tag:"Hidratación + vitaminas",mealDB:"cucumber", offTerm:"cucumber" },
    { dish:"Plátano con crema de cacahuate",     emoji:"🥜", tag:"Proteína + grasas buenas",mealDB:"banana",  offTerm:"peanut"   },
    { dish:"Mini panqué de zanahoria",           emoji:"🥕", tag:"Vitamina A + fibra",     mealDB:"carrot cake",offTerm:"carrot"  },
    { dish:"Gelatina de fruta natural",          emoji:"🍮", tag:"Hidratación + vitaminas",mealDB:"jelly",    offTerm:"gelatin"  },
    { dish:"Camote horneado en cubitos",         emoji:"🍠", tag:"Vitamina A + energía",   mealDB:"sweet potato",offTerm:"sweet potato"},
    { dish:"Quesito con galleta integral",       emoji:"🧀", tag:"Calcio + fibra",         mealDB:"cheese",   offTerm:"cheese"   },
    { dish:"Puré de fresa con yogur",            emoji:"🍓", tag:"Probióticos + vitamina C",mealDB:"strawberry",offTerm:"strawberry"},
  ],
  preschool: [
    { dish:"Manzana en rodajas con crema de maní",emoji:"🍎", tag:"Fibra + proteína",     mealDB:"apple",    offTerm:"apple"    },
    { dish:"Palomitas naturales",                emoji:"🍿", tag:"Fibra + snack ligero",   mealDB:"popcorn",  offTerm:"corn"     },
    { dish:"Brocheta de frutas",                 emoji:"🍇", tag:"Vitaminas variadas",     mealDB:"fruit",    offTerm:"grape"    },
    { dish:"Hummus con bastones de pepino",      emoji:"🥒", tag:"Proteína + fibra",       mealDB:"hummus",   offTerm:"chickpea" },
    { dish:"Rollito de tortilla con queso",      emoji:"🌯", tag:"Calcio + energía",       mealDB:"tortilla", offTerm:"cheese"   },
    { dish:"Smoothie de plátano y fresa",        emoji:"🥤", tag:"Vitaminas + energía",    mealDB:"smoothie", offTerm:"strawberry"},
    { dish:"Mini sándwich de jamón y queso",     emoji:"🥪", tag:"Proteína + calcio",      mealDB:"sandwich", offTerm:"cheese"   },
    { dish:"Jícama con chile y limón",           emoji:"🥒", tag:"Fibra + vitamina C",     mealDB:"jicama",   offTerm:"jicama"   },
    { dish:"Barritas de granola casera",         emoji:"🥣", tag:"Fibra + energía",        mealDB:"granola",  offTerm:"oat"      },
    { dish:"Elote en vaso con limón",            emoji:"🌽", tag:"Fibra + energía",        mealDB:"corn",     offTerm:"corn"     },
    { dish:"Pepino con queso cottage",           emoji:"🥒", tag:"Proteína + hidratación", mealDB:"cucumber", offTerm:"cheese"   },
    { dish:"Mango con chamoy natural",           emoji:"🥭", tag:"Vitamina C + digestión", mealDB:"mango",    offTerm:"mango"    },
    { dish:"Bolitas de atún con galleta",        emoji:"🐟", tag:"Omega-3 + proteína",     mealDB:"tuna",     offTerm:"tuna"     },
    { dish:"Yogur griego con miel y nueces",     emoji:"🥛", tag:"Proteína + grasas buenas",mealDB:"yogurt",  offTerm:"yogurt"   },
    { dish:"Tostada de aguacate con tomate",     emoji:"🥑", tag:"Grasas saludables",      mealDB:"avocado",  offTerm:"avocado"  },
    { dish:"Coctel de frutas con granola",       emoji:"🍓", tag:"Vitaminas + fibra",      mealDB:"fruit",    offTerm:"strawberry"},
  ],
};

export function getDailySnack(stage) {
  const pool = SNACK_POOL[stage] || SNACK_POOL.toddler;
  // Offset diferente al de sugerencia para que no coincidan en ciclo
  const day = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return pool[(day + 3) % pool.length];
}

export const DESSERT_POOL = {
  solids: [
    { dish:"Compota de manzana y canela",        emoji:"🍎", tag:"Vitamina C + digestión",  mealDB:"apple",    offTerm:"apple"    },
    { dish:"Puré de plátano con yogur",          emoji:"🍌", tag:"Calcio + potasio",        mealDB:"banana",   offTerm:"banana"   },
    { dish:"Papilla de pera cocida",             emoji:"🍐", tag:"Fibra suave",             mealDB:"pear",     offTerm:"pear"     },
    { dish:"Crema de mango natural",             emoji:"🥭", tag:"Vitamina A y C",          mealDB:"mango",    offTerm:"mango"    },
    { dish:"Puré de durazno suave",              emoji:"🍑", tag:"Vitaminas + fibra",        mealDB:"peach",    offTerm:"peach"    },
    { dish:"Compota de ciruela",                 emoji:"🟣", tag:"Fibra digestiva",          mealDB:"plum",     offTerm:"plum"     },
    { dish:"Papilla de papaya",                  emoji:"🧡", tag:"Digestión + vitamina C",   mealDB:"papaya",   offTerm:"papaya"   },
    { dish:"Puré de camote con canela",          emoji:"🍠", tag:"Vitamina A + energía",     mealDB:"sweet potato",offTerm:"sweet potato"},
  ],
  toddler: [
    { dish:"Gelatina de fruta natural",          emoji:"🍮", tag:"Hidratación + vitaminas",  mealDB:"jelly",    offTerm:"gelatin"  },
    { dish:"Plátano horneado con canela",        emoji:"🍌", tag:"Potasio + energía",        mealDB:"banana",   offTerm:"banana"   },
    { dish:"Manzana al horno con avena",         emoji:"🍎", tag:"Fibra + antioxidantes",    mealDB:"apple",    offTerm:"apple"    },
    { dish:"Yogur con miel y plátano",           emoji:"🥛", tag:"Calcio + probióticos",     mealDB:"yogurt",   offTerm:"yogurt"   },
    { dish:"Bolitas de coco y avena",            emoji:"🥥", tag:"Energía + fibra",           mealDB:"coconut",  offTerm:"coconut"  },
    { dish:"Flan de vainilla casero",            emoji:"🍮", tag:"Calcio + proteína",         mealDB:"flan",     offTerm:"egg"      },
    { dish:"Mousse de mango",                    emoji:"🥭", tag:"Vitamina C + cremoso",      mealDB:"mango",    offTerm:"mango"    },
    { dish:"Arroz con leche suave",              emoji:"🍚", tag:"Calcio + energía",           mealDB:"rice pudding",offTerm:"rice"  },
    { dish:"Paleta de yogur con fresas",         emoji:"🍓", tag:"Probióticos + vitamina C",  mealDB:"strawberry",offTerm:"strawberry"},
    { dish:"Galleta de plátano y avena",         emoji:"🍪", tag:"Fibra + hierro",             mealDB:"oatmeal",  offTerm:"oat"      },
    { dish:"Compota de frutas mixtas",           emoji:"🍇", tag:"Vitaminas variadas",         mealDB:"fruit",    offTerm:"grape"    },
    { dish:"Mini panqué de zanahoria",           emoji:"🥕", tag:"Vitamina A + fibra",         mealDB:"carrot cake",offTerm:"carrot" },
  ],
  preschool: [
    { dish:"Fresas con crema de yogur",          emoji:"🍓", tag:"Vitamina C + calcio",       mealDB:"strawberry",offTerm:"strawberry"},
    { dish:"Paleta helada de mango y plátano",   emoji:"🍦", tag:"Vitaminas + refrescante",    mealDB:"mango",    offTerm:"mango"    },
    { dish:"Galletas de avena con chispas",      emoji:"🍪", tag:"Fibra + energía",             mealDB:"oatmeal",  offTerm:"oat"      },
    { dish:"Arroz con leche y canela",           emoji:"🍚", tag:"Calcio + energía",             mealDB:"rice pudding",offTerm:"rice"  },
    { dish:"Gelatina mosaico de frutas",         emoji:"🍮", tag:"Hidratación + diversión",      mealDB:"jelly",    offTerm:"gelatin"  },
    { dish:"Mini muffin de plátano",             emoji:"🧁", tag:"Energía + potasio",            mealDB:"banana",   offTerm:"banana"   },
    { dish:"Brocheta de frutas con chocolate",   emoji:"🍫", tag:"Antioxidantes + vitaminas",    mealDB:"chocolate",offTerm:"chocolate"},
    { dish:"Smoothie bowl de frutos rojos",      emoji:"🫐", tag:"Antioxidantes + fibra",        mealDB:"berry",    offTerm:"blueberry"},
    { dish:"Flan de coco casero",                emoji:"🥥", tag:"Grasas buenas + calcio",       mealDB:"coconut",  offTerm:"coconut"  },
    { dish:"Nieve de yogur con fruta",           emoji:"🍨", tag:"Probióticos + refrescante",    mealDB:"yogurt",   offTerm:"yogurt"   },
    { dish:"Pay de manzana sin azúcar",          emoji:"🥧", tag:"Fibra + vitaminas",             mealDB:"apple pie",offTerm:"apple"   },
    { dish:"Panqué de elote casero",             emoji:"🌽", tag:"Energía + fibra",                mealDB:"corn",     offTerm:"corn"     },
    { dish:"Mazapán de cacahuate casero",        emoji:"🥜", tag:"Proteína + grasas buenas",      mealDB:"peanut",   offTerm:"peanut"   },
    { dish:"Crepas con fruta y miel",            emoji:"🥞", tag:"Energía + vitaminas",            mealDB:"crepe",    offTerm:"wheat"    },
  ],
};

export function getDailyDessert(stage) {
  const pool = DESSERT_POOL[stage] || DESSERT_POOL.toddler;
  const day = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return pool[(day + 7) % pool.length];
}

// ── RECOMENDACIONES NUTRICIONALES POR GRUPO DE EDAD (cada 6 meses) ──
// Fuentes: AAP, OMS, ESPGHAN, Dietary Guidelines for Americans 2020-2025
export const NUTRI_RECS = {
  0: { // 0-5 meses
    label: "0–5 meses", kcal: "500-550", source: "OMS 2023",
    macros: [
      { name: "Proteína", val: "~9g", emoji: "🥩" },
      { name: "Grasa", val: "~31g (55% kcal)", emoji: "🫒" },
      { name: "Carbos", val: "~60g", emoji: "🌾" },
    ],
    liquids: [
      { name: "Leche materna/fórmula", val: "600-900 ml/día", emoji: "🤱" },
      { name: "Agua", val: "No necesaria (la leche la aporta)", emoji: "💧" },
    ],
    avoid: ["Agua sola", "Jugos", "Leche de vaca", "Miel", "Sal", "Azúcar", "Sólidos antes de 4-6 meses"],
  },
  6: { // 6-11 meses
    label: "6–11 meses", kcal: "600-700", source: "OMS/AAP 2023",
    macros: [
      { name: "Proteína", val: "~11g", emoji: "🥩" },
      { name: "Grasa", val: "~30g (40% kcal)", emoji: "🫒" },
      { name: "Carbos", val: "~95g", emoji: "🌾" },
      { name: "Hierro", val: "11mg/día", emoji: "🩸" },
      { name: "Fibra", val: "~5g", emoji: "🌿" },
    ],
    liquids: [
      { name: "Leche materna/fórmula", val: "500-700 ml/día", emoji: "🤱" },
      { name: "Agua", val: "60-120 ml/día (sorbos)", emoji: "💧" },
    ],
    avoid: ["Leche de vaca como bebida", "Miel", "Jugos", "Sal añadida", "Azúcar añadida", "Frutos secos enteros", "Uvas enteras", "Alimentos duros"],
  },
  12: { // 12-17 meses
    label: "12–17 meses", kcal: "800-1000", source: "AAP/DGA 2020-2025",
    macros: [
      { name: "Proteína", val: "~13g", emoji: "🥩" },
      { name: "Grasa", val: "~35g (30-40% kcal)", emoji: "🫒" },
      { name: "Carbos", val: "~130g", emoji: "🌾" },
      { name: "Hierro", val: "7mg/día", emoji: "🩸" },
      { name: "Calcio", val: "700mg/día", emoji: "🦴" },
      { name: "Fibra", val: "~10g", emoji: "🌿" },
    ],
    liquids: [
      { name: "Leche entera", val: "400-500 ml/día (máx)", emoji: "🥛" },
      { name: "Agua", val: "200-400 ml/día", emoji: "💧" },
    ],
    avoid: ["Miel cruda (hasta 12m)", "Jugos (máx 120ml/día)", "Sal excesiva", "Azúcar añadida", "Frutos secos enteros", "Uvas/salchichas sin cortar", "Bebidas azucaradas"],
  },
  18: { // 18-23 meses
    label: "18–23 meses", kcal: "900-1100", source: "AAP/DGA 2020-2025",
    macros: [
      { name: "Proteína", val: "~13g", emoji: "🥩" },
      { name: "Grasa", val: "~35g (30-40% kcal)", emoji: "🫒" },
      { name: "Carbos", val: "~130g", emoji: "🌾" },
      { name: "Hierro", val: "7mg/día", emoji: "🩸" },
      { name: "Calcio", val: "700mg/día", emoji: "🦴" },
      { name: "Fibra", val: "~12g", emoji: "🌿" },
    ],
    liquids: [
      { name: "Leche entera", val: "400-500 ml/día (máx)", emoji: "🥛" },
      { name: "Agua", val: "400-600 ml/día", emoji: "💧" },
    ],
    avoid: ["Jugos (máx 120ml/día)", "Bebidas azucaradas", "Exceso de leche (>500ml)", "Frutos secos enteros", "Alimentos con riesgo de asfixia", "Ultraprocesados"],
  },
  24: { // 24-29 meses
    label: "24–29 meses", kcal: "1000-1200", source: "AAP/DGA 2020-2025",
    macros: [
      { name: "Proteína", val: "~13-16g", emoji: "🥩" },
      { name: "Grasa", val: "~35-40g (30-35% kcal)", emoji: "🫒" },
      { name: "Carbos", val: "~130g", emoji: "🌾" },
      { name: "Hierro", val: "7mg/día", emoji: "🩸" },
      { name: "Calcio", val: "700mg/día", emoji: "🦴" },
      { name: "Fibra", val: "~14g", emoji: "🌿" },
    ],
    liquids: [
      { name: "Leche (puede ser semi)", val: "350-500 ml/día", emoji: "🥛" },
      { name: "Agua", val: "500-800 ml/día", emoji: "💧" },
    ],
    avoid: ["Bebidas azucaradas", "Exceso de jugos", "Cafeína", "Frutos secos enteros (<3 años)", "Caramelos/palomitas", "Ultraprocesados"],
  },
  30: { // 30-35 meses
    label: "30–35 meses", kcal: "1100-1300", source: "DGA 2020-2025",
    macros: [
      { name: "Proteína", val: "~16g", emoji: "🥩" },
      { name: "Grasa", val: "~40g (30-35% kcal)", emoji: "🫒" },
      { name: "Carbos", val: "~130g", emoji: "🌾" },
      { name: "Hierro", val: "7mg/día", emoji: "🩸" },
      { name: "Calcio", val: "700mg/día", emoji: "🦴" },
      { name: "Fibra", val: "~16g", emoji: "🌿" },
    ],
    liquids: [
      { name: "Leche descremada/semi", val: "350-500 ml/día", emoji: "🥛" },
      { name: "Agua", val: "600-900 ml/día", emoji: "💧" },
    ],
    avoid: ["Bebidas azucaradas", "Cafeína", "Exceso de sodio", "Ultraprocesados", "Caramelos duros"],
  },
  36: { // 36-47 meses (3-4 años)
    label: "3–4 años", kcal: "1200-1400", source: "DGA 2020-2025",
    macros: [
      { name: "Proteína", val: "~16-19g", emoji: "🥩" },
      { name: "Grasa", val: "~40-45g (25-35% kcal)", emoji: "🫒" },
      { name: "Carbos", val: "~130g", emoji: "🌾" },
      { name: "Hierro", val: "10mg/día", emoji: "🩸" },
      { name: "Calcio", val: "1000mg/día", emoji: "🦴" },
      { name: "Fibra", val: "~17g", emoji: "🌿" },
    ],
    liquids: [
      { name: "Leche baja en grasa", val: "350-500 ml/día", emoji: "🥛" },
      { name: "Agua", val: "800-1000 ml/día", emoji: "💧" },
    ],
    avoid: ["Bebidas azucaradas", "Cafeína", "Exceso de sal/azúcar", "Ultraprocesados"],
  },
  48: { // 48-60 meses (4-5 años)
    label: "4–5 años", kcal: "1300-1500", source: "DGA 2020-2025",
    macros: [
      { name: "Proteína", val: "~19g", emoji: "🥩" },
      { name: "Grasa", val: "~45-50g (25-35% kcal)", emoji: "🫒" },
      { name: "Carbos", val: "~130g", emoji: "🌾" },
      { name: "Hierro", val: "10mg/día", emoji: "🩸" },
      { name: "Calcio", val: "1000mg/día", emoji: "🦴" },
      { name: "Fibra", val: "~20g", emoji: "🌿" },
    ],
    liquids: [
      { name: "Leche baja en grasa", val: "350-500 ml/día", emoji: "🥛" },
      { name: "Agua", val: "1000-1200 ml/día", emoji: "💧" },
    ],
    avoid: ["Bebidas energéticas", "Cafeína", "Exceso de azúcar añadida", "Ultraprocesados"],
  },
};

// Obtener recomendación según meses de edad (cada 6 meses)
export function getNutriRec(months) {
  if (months == null) return NUTRI_RECS[12]; // fallback
  const bracket = Math.floor(months / 6) * 6;
  // Buscar el bracket más cercano disponible
  const keys = Object.keys(NUTRI_RECS).map(Number).sort((a, b) => a - b);
  let best = keys[0];
  for (const k of keys) { if (k <= bracket) best = k; }
  return NUTRI_RECS[best];
}

// Obtener el semestre actual (0, 6, 12, 18, 24...) para detectar cambio
export function getAgeSemester(months) {
  if (months == null) return null;
  return Math.floor(months / 6) * 6;
}

export const MEAL_SLOTS = {
  newborn: [
    { type: "toma1", label: "Mañana", hour: "07:00" },
    { type: "toma2", label: "Mediodía", hour: "12:00" },
    { type: "toma3", label: "Tarde", hour: "17:00" },
  ],
  infant: [
    { type: "toma1", label: "Mañana", hour: "07:00" },
    { type: "toma2", label: "Mediodía", hour: "12:00" },
    { type: "toma3", label: "Tarde", hour: "17:00" },
  ],
  solids: [
    { type: "desayuno", label: "Desayuno", hour: "08:00" },
    { type: "comida", label: "Comida", hour: "12:30" },
    { type: "merienda", label: "Merienda", hour: "16:00" },
  ],
  toddler: [
    { type: "desayuno", label: "Desayuno", hour: "08:00" },
    { type: "comida", label: "Comida", hour: "12:30" },
    { type: "merienda", label: "Merienda", hour: "16:00" },
    { type: "cena", label: "Cena", hour: "19:00" },
  ],
  preschool: [
    { type: "desayuno", label: "Desayuno", hour: "07:30" },
    { type: "snack", label: "Snack", hour: "10:30" },
    { type: "comida", label: "Comida", hour: "13:00" },
    { type: "merienda", label: "Merienda", hour: "16:00" },
    { type: "cena", label: "Cena", hour: "19:30" },
  ],
};

export const MEAL_EMOJIS = { desayuno:"🌅", comida:"🍲", merienda:"🍎", cena:"🌙", snack:"🥤", toma1:"🤱", toma2:"🤱", toma3:"🤱" };

export const APPETITE = ["\u{1F60D} Le encantó", "\u{1F60A} Comió bien", "\u{1F610} Comió poco", "\u{1F922} Con dificultad", "\u{1F624} Rechazó"];
export const CATS = ["\u{1F963} Cereal", "\u{1F969} Proteína", "\u{1F966} Vegetal", "\u{1F34E} Fruta", "\u{1F95B} Lácteo", "\u{1F375} Otro"];

export const lSt = {
  display: "block", fontSize: 11, fontWeight: 800, color: C.mid,
  marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.8,
  fontFamily: "'Nunito',sans-serif",
};

export const iSt = {
  width: "100%", padding: "9px 12px", borderRadius: 10,
  border: `1.5px solid ${C.accent}`, fontSize: 14,
  fontFamily: "'Nunito',sans-serif", outline: "none",
  background: C.light, color: C.text, fontWeight: 600,
};

export const TIPS_POOL = [
  // ── Exposición y aceptación ──
  { tip: "Ofrece un alimento nuevo al menos 10-15 veces antes de asumir que no le gusta. La exposición repetida aumenta la aceptación.", source: "AAP", emoji: "🔄" },
  { tip: "Si rechaza un alimento, no lo retires del menú. Ponlo en el plato sin presión para normalizarlo.", source: "Ellyn Satter", emoji: "🔁" },
  { tip: "Sé paciente con la etapa de rechazo (neofobia). Es normal entre los 2-6 años y es temporal.", source: "Child Dev.", emoji: "💪" },
  { tip: "No disfraces los alimentos. Es mejor que el niño reconozca lo que come para formar preferencias reales.", source: "Gill Rapley", emoji: "👀" },
  { tip: "Permite que toque y explore el alimento antes de comerlo. Oler, aplastar y jugar es parte del proceso de aceptación.", source: "BLW", emoji: "🤏" },
  { tip: "Introduce un solo alimento nuevo a la vez y espera 3 días para detectar posibles alergias.", source: "AAP", emoji: "🔬" },
  // ── Hábitos y rutinas ──
  { tip: "Establece horarios regulares de comida. La rutina genera seguridad y mejor apetito.", source: "OMS", emoji: "🕐" },
  { tip: "Evita pantallas durante las comidas. La distracción impide reconocer las señales de saciedad.", source: "AAP", emoji: "📵" },
  { tip: "Comer en familia al menos una vez al día mejora los hábitos alimenticios a largo plazo.", source: "Harvard", emoji: "🍽️" },
  { tip: "Come junto a tu hijo. Los niños imitan: si te ven disfrutar verduras, querrán probarlas.", source: "OMS", emoji: "👨‍👩‍👦" },
  { tip: "Designa un lugar fijo para comer. Comer siempre en el mismo sitio crea asociación positiva con la comida.", source: "Ellyn Satter", emoji: "🪑" },
  { tip: "Los snacks deben ser planificados, no aleatorios. Demasiados snacks reducen el apetito en las comidas principales.", source: "AAP", emoji: "📋" },
  { tip: "Limita las comidas a 20-30 minutos. Si no come, retira sin drama y espera a la siguiente comida.", source: "Ellyn Satter", emoji: "⏱️" },
  // ── Porciones y saciedad ──
  { tip: "Sirve porciones pequeñas. Es mejor que pida más a que se sienta abrumado por un plato lleno.", source: "AAP", emoji: "🥄" },
  { tip: "Respeta las señales de hambre y saciedad. Forzar a comer genera rechazo a largo plazo.", source: "Ellyn Satter", emoji: "🤲" },
  { tip: "Nunca uses comida como premio o castigo. Esto crea una relación emocional negativa con los alimentos.", source: "Ellyn Satter", emoji: "🚫" },
  { tip: "No uses frases como 'no te levantas hasta que termines'. Esto genera ansiedad alrededor de la comida.", source: "Ellyn Satter", emoji: "🙅" },
  { tip: "Tu decides qué, cuándo y dónde se come. El niño decide cuánto y si come. Esta es la división de responsabilidad.", source: "Ellyn Satter", emoji: "⚖️" },
  // ── Nutrientes clave ──
  { tip: "El hierro se absorbe mejor con vitamina C. Combina lentejas o carne con limón o naranja.", source: "OMS", emoji: "🍋" },
  { tip: "Las grasas saludables (aguacate, aceite de oliva) son esenciales para el desarrollo cerebral.", source: "OMS", emoji: "🧠" },
  { tip: "El calcio es fundamental entre 1-3 años. Ofrece lácteos, brócoli o almendras molidas diariamente.", source: "AAP", emoji: "🦴" },
  { tip: "La vitamina D ayuda a absorber calcio. Unos minutos de sol por día o alimentos fortificados son suficientes.", source: "AAP", emoji: "☀️" },
  { tip: "Los omega-3 (pescado, nueces, linaza) apoyan el desarrollo del cerebro y la vista.", source: "OMS", emoji: "🐟" },
  { tip: "El zinc es clave para el crecimiento y el sistema inmune. Carnes, frijoles y semillas son buenas fuentes.", source: "OMS", emoji: "🛡️" },
  { tip: "La fibra previene el estreñimiento. Frutas con cáscara, avena y legumbres son excelentes fuentes.", source: "AAP", emoji: "🌾" },
  // ── Bebidas ──
  { tip: "Ofrece agua como bebida principal. Los jugos, incluso naturales, contienen mucha azúcar.", source: "OMS", emoji: "💧" },
  { tip: "Evita las bebidas azucaradas por completo antes de los 5 años. Agua y leche son suficientes.", source: "AAP", emoji: "🚱" },
  { tip: "La leche entera es recomendable entre 1-2 años. Después de los 2 años puede ser semi o descremada.", source: "AAP", emoji: "🥛" },
  { tip: "No ofrezcas jugo antes del primer año. Después, máximo 120ml al día y siempre diluido.", source: "AAP", emoji: "🧃" },
  // ── Texturas y preparación ──
  { tip: "Presenta los alimentos de formas diferentes: en puré, trocitos, bolitas. La textura importa.", source: "BLW", emoji: "🎨" },
  { tip: "Deja que se ensucie al comer. Explorar texturas con las manos es parte del aprendizaje.", source: "BLW", emoji: "🖐️" },
  { tip: "Involucra a tu hijo en la preparación. Lavar frutas o mezclar ingredientes aumenta su interés.", source: "Montessori", emoji: "👐" },
  { tip: "Corta los alimentos en formas divertidas. Un simple cortador de galletas puede cambiar la experiencia.", source: "BLW", emoji: "⭐" },
  { tip: "Ofrece alimentos a temperatura ambiente o tibios. Los niños suelen rechazar comida muy caliente o fría.", source: "AAP", emoji: "🌡️" },
  { tip: "Mezcla un alimento nuevo con uno favorito. Esto reduce la resistencia al sabor desconocido.", source: "AAP", emoji: "🥣" },
  // ── Restricciones y seguridad ──
  { tip: "Evita la sal y el azúcar añadida antes de los 2 años. Sus riñones y paladar están en desarrollo.", source: "OMS", emoji: "⚠️" },
  { tip: "Los frutos secos enteros son riesgo de asfixia hasta los 4 años. Ofrécelos molidos o en crema.", source: "AAP", emoji: "🥜" },
  { tip: "Las uvas, salchichas y alimentos redondos deben cortarse a lo largo, nunca en rodajas circulares.", source: "AAP", emoji: "🔪" },
  { tip: "La miel está prohibida antes del año por riesgo de botulismo.", source: "OMS", emoji: "🍯" },
  { tip: "Evita alimentos duros y pequeños como palomitas, caramelos y zanahorias crudas antes de los 3 años.", source: "AAP", emoji: "🛑" },
  // ── Comidas específicas ──
  { tip: "El desayuno es clave para la concentración. Incluye proteína, carbohidrato y fruta.", source: "AAP", emoji: "🌅" },
  { tip: "La cena debe ser ligera. Los alimentos pesados antes de dormir dificultan el sueño.", source: "AAP", emoji: "🌙" },
  { tip: "Ofrece variedad de colores en el plato. Cada color representa diferentes nutrientes.", source: "Harvard T.H. Chan", emoji: "🌈" },
  { tip: "Las legumbres (lentejas, frijoles, garbanzos) son una fuente económica y completa de proteína y hierro.", source: "OMS", emoji: "🫘" },
  { tip: "El huevo es un alimento casi perfecto para niños: proteína completa, colina para el cerebro y es económico.", source: "AAP", emoji: "🥚" },
  { tip: "Las verduras de hoja verde (espinaca, acelga) aportan hierro y ácido fólico esenciales para el crecimiento.", source: "OMS", emoji: "🥬" },
  // ── Emocional y conductual ──
  { tip: "Elogia el esfuerzo de probar, no de terminar. 'Qué valiente por probar' es mejor que 'muy bien por terminar todo'.", source: "Child Dev.", emoji: "👏" },
  { tip: "Si un día come poco, no te preocupes. Los niños regulan su ingesta semanalmente, no por comida.", source: "Ellyn Satter", emoji: "📊" },
  { tip: "El apetito varía con el crecimiento. Durante estirones comen mucho, en mesetas comen menos.", source: "AAP", emoji: "📈" },
  { tip: "No compares su alimentación con otros niños. Cada niño tiene su ritmo y sus necesidades.", source: "Ellyn Satter", emoji: "🌱" },
  { tip: "Evita etiquetas como 'mal comedor'. Los niños internalizan esas palabras y las cumplen.", source: "Child Dev.", emoji: "🏷️" },
  { tip: "Si está enfermo, no lo fuerces a comer. Ofrece líquidos y comida ligera cuando tenga apetito.", source: "AAP", emoji: "🤒" },
  { tip: "Celebra pequeños logros: probar un bocado nuevo merece el mismo reconocimiento que terminar el plato.", source: "Montessori", emoji: "🎉" },
  // ── BLW y autonomía ──
  { tip: "Desde los 6 meses puedes ofrecer trozos blandos que pueda agarrar con la mano. Esto promueve la autonomía.", source: "BLW", emoji: "✊" },
  { tip: "Los cubiertos adaptados a su tamaño facilitan la independencia. Empieza con cuchara corta y gruesa.", source: "Montessori", emoji: "🥄" },
  { tip: "Permite que elija entre 2-3 opciones saludables. La sensación de control mejora la aceptación.", source: "Montessori", emoji: "🤔" },
  { tip: "El reflejo de arcada es normal y diferente al atragantamiento. Es un mecanismo de protección mientras aprende.", source: "BLW", emoji: "👶" },
  // ── Suplementos y micronutrientes ──
  { tip: "Si tu hijo es vegetariano, vigila especialmente hierro, B12, zinc y proteína completa.", source: "AAP", emoji: "🌿" },
  { tip: "Consulta con el pediatra sobre suplementación de hierro si nació prematuro o con bajo peso.", source: "OMS", emoji: "💊" },
  { tip: "Los alimentos ultraprocesados desplazan opciones nutritivas. Revisa etiquetas y prioriza comida real.", source: "OMS", emoji: "📦" },
  { tip: "El estreñimiento puede reducir el apetito. Asegura suficiente fibra, agua y actividad física.", source: "AAP", emoji: "🚶" },
  { tip: "Los probióticos (yogur, kéfir) apoyan la salud intestinal y pueden mejorar la tolerancia a nuevos alimentos.", source: "AAP", emoji: "🦠" },
  { tip: "La anemia por falta de hierro es la deficiencia más común en niños pequeños. Incluye carne, legumbres y cereales fortificados.", source: "OMS", emoji: "🩸" },
];

export function getDailyTip() {
  const day = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return TIPS_POOL[day % TIPS_POOL.length];
}
