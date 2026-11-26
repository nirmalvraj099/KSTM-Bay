/**
 * Homepage photography. All images are from Wikimedia Commons under free licences
 * (CC0, CC BY-SA, FAL) and are credited in the footer. They load straight from
 * Wikimedia's thumbnail CDN at its standard widths (960 / 1920).
 */

export type Photo = {
  src: string; // 1920px
  small: string; // 960px
  alt: string;
  credit: string;
  license: string;
  page: string;
};

const thumb = (path: string, file: string) => ({
  src: `https://thumb.wikimedia.org/wikipedia/commons/thumb/${path}/${file}/1920px-${file}`,
  small: `https://thumb.wikimedia.org/wikipedia/commons/thumb/${path}/${file}/960px-${file}`,
});

export const PHOTOS = {
  hero: {
    ...thumb("f/fa", "Audi_e-tron_%28Edit1%29.jpg"),
    alt: "Red sports car lit in a dark studio",
    credit: "Thomas Wolf",
    license: "CC BY-SA 3.0",
    page: "https://commons.wikimedia.org/wiki/File:Audi_e-tron_(Edit1).jpg",
  },
  offroad: {
    ...thumb("1/11", "FJ_Cruiser_2007.jpg"),
    alt: "Orange off-road SUV with roof lights and all-terrain tyres",
    credit: "Stefan Krause",
    license: "FAL",
    page: "https://commons.wikimedia.org/wiki/File:FJ_Cruiser_2007.jpg",
  },
  thar: {
    ...thumb("a/a5", "Mahindra_Thar_DI_beach_patrol%2C_Goa.jpg"),
    alt: "Mahindra Thar parked on a beach in Goa",
    credit: "Bishnu Sarangi",
    license: "CC0",
    page: "https://commons.wikimedia.org/wiki/File:Mahindra_Thar_DI_beach_patrol,_Goa.jpg",
  },
  concept: {
    ...thumb("b/bc", "Audi_Sport_quattro_concept.jpg"),
    alt: "Yellow performance coupe under show lights",
    credit: "Thomas Wolf",
    license: "CC BY-SA 3.0 DE",
    page: "https://commons.wikimedia.org/wiki/File:Audi_Sport_quattro_concept.jpg",
  },
  porsche: {
    ...thumb("c/c6", "2013_Porsche_911_Carrera_4S_%28991%29_%289626546987%29.jpg"),
    alt: "Grey 911 coupe on an open road",
    credit: "David Villarreal Fernández",
    license: "CC BY-SA 2.0",
    page: "https://commons.wikimedia.org/wiki/File:2013_Porsche_911_Carrera_4S_(991)_(9626546987).jpg",
  },
  wash: {
    ...thumb("7/7c", "2015_K%C5%82odzko%2C_ul._Dusznicka%2C_myjnia_samochodowa_02.jpg"),
    alt: "Detailer pressure-washing a car in a wash bay",
    credit: "Jacek Halicki",
    license: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:2015_K%C5%82odzko,_ul._Dusznicka,_myjnia_samochodowa_02.jpg",
  },
  ferrari: {
    ...thumb("f/f7", "Ferrari-Monaco-4071021.jpg"),
    alt: "Close-up of a glossy red rear deck",
    credit: "ermell",
    license: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Ferrari-Monaco-4071021.jpg",
  },
  mini: {
    ...thumb("b/ba", "D%C3%BClmen%2C_Kirchspiel%2C_BMW_Mini_--_2016_--_5065-71.jpg"),
    alt: "Lime green hatchback with lights on, in a forest at dusk",
    credit: "Dietmar Rabich",
    license: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:D%C3%BClmen,_Kirchspiel,_BMW_Mini_--_2016_--_5065-71.jpg",
  },
  interior: {
    ...thumb("a/ad", "Ford_Mustang_Oldtimertreffen_Ebern_2019_6200572.jpg"),
    alt: "Classic red interior with a wood-rim steering wheel",
    credit: "ermell",
    license: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:Ford_Mustang_Oldtimertreffen_Ebern_2019_6200572.jpg",
  },
  forest: {
    ...thumb("a/a8", "D%C3%BClmen%2C_Kirchspiel%2C_B%C3%B6rnste%2C_BMW_Mini_--_2019_--_7207-13.jpg"),
    alt: "Hatchback with headlights on beside a stack of logs at night",
    credit: "Dietmar Rabich",
    license: "CC BY-SA 4.0",
    page: "https://commons.wikimedia.org/wiki/File:D%C3%BClmen,_Kirchspiel,_B%C3%B6rnste,_BMW_Mini_--_2019_--_7207-13.jpg",
  },
  bike: {
    ...thumb("4/43", "BMW_Welt%2C_M%C3%BAnich%2C_Alemania%2C_2013-04-22%2C_DD_10.jpg"),
    alt: "Adventure motorcycle in red, white and grey under dramatic light",
    credit: "Diego Delso",
    license: "CC BY-SA 3.0",
    page: "https://commons.wikimedia.org/wiki/File:BMW_Welt,_M%C3%BAnich,_Alemania,_2013-04-22,_DD_10.jpg",
  },
} satisfies Record<string, Photo>;
