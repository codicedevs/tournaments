// Utility to sort tournament arrays by Spanish ordinal names (Primera, Segunda, ... Vigésima)
// Supports accents and compound forms like "décimocuarta".

import { Tournament } from "../api/http";

// Mapping of sanitized ordinal word -> numeric position
const ordinalMap: Record<string, number> = {
  primera: 1,
  segunda: 2,
  tercera: 3,
  cuarta: 4,
  quinta: 5,
  sexta: 6,
  septima: 7,
  "séptima": 7,
  octava: 8,
  novena: 9,
  decima: 10,
  "décima": 10,
  undecima: 11,
  "undécima": 11,
  duodecima: 12,
  "duodécima": 12,
  decimotercera: 13,
  "décimotercera": 13,
  decimocuarta: 14,
  "décimocuarta": 14,
  decimoquinta: 15,
  "décimoquinta": 15,
  decimosexta: 16,
  "décimosexta": 16,
  decimoseptima: 17,
  "decimoséptima": 17,
  "décimoseptima": 17,
  "décimoséptima": 17,
  decimooctava: 18,
  decimoctava: 18,
  "décimooctava": 18,
  "décimoctava": 18,
  decimonovena: 19,
  "décimonovena": 19,
  vigesima: 20,
  "vigésima": 20,
};

// Remove accents and convert to lowercase for consistent mapping lookup
const sanitize = (str: string) =>
  str.toLowerCase().normalize("NFD").replace(/[^\w\s]/g, "").replace(/[\u0300-\u036f]/g, "");

const getRank = (name: string) => {
  const firstWord = sanitize(name).split(" ")[0];
  return ordinalMap[firstWord] ?? Number.MAX_SAFE_INTEGER;
};

export function sortTournamentsByDivision(tournaments: Tournament[]): Tournament[] {
  return [...tournaments].sort((a, b) => {
    const diff = getRank(a.name) - getRank(b.name);
    return diff !== 0 ? diff : a.name.localeCompare(b.name, "es", { numeric: true, sensitivity: "base" });
  });
}

export type { Tournament };
