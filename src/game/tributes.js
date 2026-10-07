export const DISTRICTS = [
  { id: 1, name: 'District 1', specialty: 'Luxury goods' },
  { id: 2, name: 'District 2', specialty: 'Masonry and weapons' },
  { id: 3, name: 'District 3', specialty: 'Technology' },
  { id: 4, name: 'District 4', specialty: 'Fishing' },
  { id: 5, name: 'District 5', specialty: 'Power' },
  { id: 6, name: 'District 6', specialty: 'Transportation' },
  { id: 7, name: 'District 7', specialty: 'Lumber' },
  { id: 8, name: 'District 8', specialty: 'Textiles' },
  { id: 9, name: 'District 9', specialty: 'Grain' },
  { id: 10, name: 'District 10', specialty: 'Livestock' },
  { id: 11, name: 'District 11', specialty: 'Agriculture' },
  { id: 12, name: 'District 12', specialty: 'Coal' },
];

// Career districts train volunteers, so their tributes start stronger.
const CAREER_DISTRICTS = [1, 2, 4];

const FIRST_NAMES = [
  'Ashen', 'Briar', 'Cato', 'Clove', 'Corvin', 'Dax', 'Dusk', 'Elowen',
  'Ember', 'Flint', 'Fox', 'Galen', 'Glimmer', 'Grit', 'Hazel', 'Hollis',
  'Iris', 'Juno', 'Kestrel', 'Lark', 'Marrow', 'Nettle', 'Oak', 'Piper',
  'Quill', 'Rook', 'Sable', 'Sparrow', 'Talon', 'Thorn', 'Vale', 'Wren',
  'Yarrow', 'Zephyr', 'Bramble', 'Cinder',
];

const SURNAMES = [
  'Alder', 'Blackwood', 'Crane', 'Dray', 'Everts', 'Fallow', 'Gray',
  'Halloway', 'Ivory', 'Kray', 'Larkspur', 'Mercer', 'Nox', 'Odair',
  'Pike', 'Quarry', 'Ridge', 'Stone', 'Tam', 'Underwood', 'Vickers',
  'Whitlock', 'Yates', 'Zale',
];

export function createTributes(rng) {
  const names = rng.shuffle(FIRST_NAMES).slice(0, DISTRICTS.length * 2);

  return DISTRICTS.flatMap((district, index) => {
    const career = CAREER_DISTRICTS.includes(district.id);

    return [0, 1].map((slot) => ({
      id: `d${district.id}-t${slot + 1}`,
      name: `${names[index * 2 + slot]} ${rng.pick(SURNAMES)}`,
      district: district.id,
      districtName: district.name,
      specialty: district.specialty,
      age: rng.int(12, 18),
      strength: rng.int(3, 8) + (career ? 2 : 0),
      career,
      weapon: null,
      alive: true,
      kills: 0,
      status: 'In the arena',
      cause: null,
      deathDay: null,
    }));
  });
}
