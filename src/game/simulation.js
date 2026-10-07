import { createRng } from './random.js';
import { createTributes } from './tributes.js';

const MAX_DAYS = 30;

const WEAPONS = [
  'a spear',
  'a bow and a quiver of arrows',
  'a machete',
  'a trident',
  'a set of throwing knives',
  'a broadsword',
  'a slingshot',
  'a sickle',
  'a heavy chain',
  'a blowtorch',
];

const KILL_TEMPLATES = [
  (v, k) => `${k} ambushes ${v} in the tall grass.`,
  (v, k) => `${k} catches ${v} at the river and it is over in seconds.`,
  (v, k) => `${v} is cornered by ${k} in the ruined amphitheatre.`,
  (v, k) => `${k} puts an arrow through ${v} from the treeline.`,
  (v, k) => `${k} and ${v} fight beside the smouldering campfire; only ${k} walks away.`,
  (v, k) => `${k} finds ${v} asleep in the rocks and does not hesitate.`,
  (v, k) => `${v} makes a run for the supplies and ${k} is waiting.`,
  (v, k) => `${k} drives ${v} off the cliff above the dead lake.`,
  (v, k) => `${v} is caught between ${k} and a wall of fire.`,
];

const FINAL_TEMPLATES = [
  (v, k) => `The last two meet on open ground — ${k} outlasts ${v} and the cannons sound.`,
  (v, k) => `${v} and ${k} fight until only ${k} is standing.`,
  (v, k) => `${k} wins the final duel, and ${v} is the last name read at night.`,
];

const ACCIDENTS = [
  { text: (v) => `${v} dies of dehydration in the eastern scrub.`, cause: 'Dehydration' },
  { text: (v) => `${v} falls from a dead oak and does not rise.`, cause: 'A fall' },
  { text: (v) => `${v} eats nightlock berries by mistake.`, cause: 'Nightlock' },
  { text: (v) => `${v} is stung to death by tracker jackers.`, cause: 'Tracker jackers' },
  { text: (v) => `${v} is caught in a wall of fire set by the Gamemakers.`, cause: 'Gamemaker fire' },
  { text: (v) => `${v} slips into the ravine during the night.`, cause: 'A fall' },
  { text: (v) => `${v} does not survive the cold.`, cause: 'Exposure' },
  { text: (v) => `${v} is taken by a muttation at the water's edge.`, cause: 'Muttation' },
];

const SURVIVAL = [
  (v) => `${v} scavenges a full canteen and a coil of rope.`,
  (v) => `${v} climbs high into a tree and hides until dark.`,
  (v) => `${v} receives a loaf of bread from a sponsor.`,
  (v) => `${v} treats a wound with leaves and keeps moving.`,
  (v) => `${v} builds a shelter nothing can get into.`,
  (v) => `${v} tracks a trail to the creek, then loses it.`,
  (v) => `${v} rations what is left and sleeps badly.`,
  (v) => `${v} keeps watch until dawn without seeing anyone.`,
];

/**
 * Runs a complete Games from a seed.
 * Returns { seed, tributes, phases, victor, days }.
 * `phases` is the ordered script (Bloodbath, then Day/Night pairs) and each
 * phase carries `aliveIds`, the snapshot of who is still standing after it.
 */
export function runSimulation(seed) {
  const rng = createRng(seed);
  const tributes = createTributes(rng);
  const phases = [];

  const alive = () => tributes.filter((t) => t.alive);

  const pushPhase = (day, label) => {
    const phase = { day, label, events: [], aliveIds: [] };
    phases.push(phase);
    return phase;
  };

  const eventId = (phase, suffix) => `${phases.indexOf(phase)}-${suffix}`;

  const recordDeath = (phase, victim, { killer, text, cause }) => {
    victim.alive = false;
    victim.deathDay = phase.day;
    victim.cause = cause;
    victim.status = cause;
    if (killer) killer.kills += 1;
    phase.events.push({
      id: eventId(phase, `d${phase.events.length}`),
      type: 'death',
      text,
      victim: victim.name,
      killer: killer ? killer.name : null,
    });
  };

  const pickKiller = (candidates, victim) => {
    const pool = candidates.filter((t) => t.alive && t.id !== victim.id);
    if (!pool.length) return null;
    return rng.weighted(pool.map((t) => [t, t.strength]));
  };

  const runPhase = (phase, deathTarget) => {
    const standing = alive();
    const flavourCount = Math.min(3, Math.max(1, Math.floor(standing.length / 4)));

    for (let i = 0; i < flavourCount; i += 1) {
      const tribute = rng.pick(alive());
      if (!tribute) break;
      phase.events.push({
        id: eventId(phase, `f${i}`),
        type: 'event',
        text: rng.pick(SURVIVAL)(tribute.name),
      });
    }

    for (let i = 0; i < deathTarget; i += 1) {
      const candidates = alive();
      if (candidates.length <= 1) break;

      // Weaker tributes are likelier to be the one who falls.
      const victim = rng.weighted(candidates.map((t) => [t, Math.max(1, 12 - t.strength)]));
      const duel = candidates.length === 2;
      const killer = duel || rng.chance(0.7) ? pickKiller(candidates, victim) : null;

      if (killer) {
        const template = duel ? rng.pick(FINAL_TEMPLATES) : rng.pick(KILL_TEMPLATES);
        recordDeath(phase, victim, {
          killer,
          text: template(victim.name, killer.name),
          cause: `Killed by ${killer.name}`,
        });
      } else {
        const accident = rng.pick(ACCIDENTS);
        recordDeath(phase, victim, {
          text: accident.text(victim.name),
          cause: accident.cause,
        });
      }
    }

    phase.aliveIds = alive().map((t) => t.id);
  };

  // The Bloodbath — the Cornucopia opening.
  const bloodbath = pushPhase(0, 'The Bloodbath');
  const pool = rng.shuffle(alive());
  const deathCount = Math.min(pool.length - 1, rng.int(6, 10));
  const dying = pool.slice(0, deathCount);
  const surviving = pool.slice(deathCount);

  for (const tribute of rng.shuffle(surviving).slice(0, rng.int(4, 7))) {
    tribute.weapon = rng.pick(WEAPONS);
    bloodbath.events.push({
      id: eventId(bloodbath, `g${tribute.id}`),
      type: 'event',
      text: `${tribute.name} escapes the Cornucopia with ${tribute.weapon}.`,
    });
  }

  for (const victim of dying) {
    const killer = rng.chance(0.8) ? pickKiller(surviving, victim) : null;
    if (killer) {
      recordDeath(bloodbath, victim, {
        killer,
        text: rng.pick(KILL_TEMPLATES)(victim.name, killer.name),
        cause: `Killed by ${killer.name}`,
      });
    } else {
      const accident = rng.pick(ACCIDENTS);
      recordDeath(bloodbath, victim, {
        text: `The Bloodbath takes ${victim.name} — ${accident.cause.toLowerCase()}.`,
        cause: 'Slain in the Bloodbath',
      });
    }
  }
  bloodbath.aliveIds = alive().map((t) => t.id);

  // The Games proper.
  const feastDay = rng.int(4, 8);
  let day = 1;

  while (alive().length > 1 && day <= MAX_DAYS) {
    const planned = Math.max(1, Math.round(alive().length / 5) + rng.int(0, 1));
    const deathsToday = Math.min(alive().length - 1, planned);
    const dayDeaths = Math.ceil(deathsToday / 2);

    runPhase(pushPhase(day, 'Day'), dayDeaths);

    if (day === feastDay && alive().length > 2) {
      runPhase(pushPhase(day, 'The Feast'), 1);
    }

    if (alive().length > 1) {
      runPhase(pushPhase(day, 'Night'), Math.min(deathsToday - dayDeaths, alive().length - 1));
    }

    day += 1;
  }

  // Safety net: the Games always end with exactly one victor.
  if (alive().length > 1) {
    runPhase(pushPhase(day, 'Final Stand'), alive().length - 1);
  }

  const victor = alive()[0];
  if (victor) {
    victor.status = 'Victor';
    victor.cause = null;
  }

  return {
    seed,
    tributes,
    phases,
    days: phases.length ? phases[phases.length - 1].day : 0,
    victor: victor
      ? {
          id: victor.id,
          name: victor.name,
          district: victor.district,
          districtName: victor.districtName,
          kills: victor.kills,
        }
      : null,
  };
}
