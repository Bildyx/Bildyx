import { PrismaClient, Prisma } from "@prisma/client";
import { readCsv, toDate, toInt, buildNameLookup } from "../seed-utils";

type MilitaryCapabilitiesCsv = {
  organization_id?: string;
  number_of_active_navy_personnel?: string;
  number_of_destroyers?: string;
  number_of_submarines_diesel?: string;
  number_of_submarines_nuclear?: string;
  number_of_naval_shipyards?: string;
  number_of_maritime_patrol_aircraft?: string;
  number_of_stealth_fleet?: string;
  number_of_surveillance_radars?: string;
  number_of_aircrafts?: string;
  number_of_fighter_jets?: string;
  number_of_helicopters?: string;
  number_of_drones?: string;
  number_of_tanker_planes?: string;
  number_of_transport_planes?: string;
  number_of_communication_satellites?: string;
  number_of_missile_warning_satellites?: string;
  number_of_navigation_satellites?: string;
  number_of_spy_satellites?: string;
  number_of_satellite_jamming_systems?: string;
  number_of_surveillance_telescopes?: string;
  number_of_operational_spaceplanes?: string;
  number_of_space_launch_sites?: string;
  number_of_space_operations_squadrons?: string;
  number_of_space_personnel?: string;
  updated_at?: string;
};

export async function seedMilitaryCapabilities(prisma: PrismaClient) {
  const rows = readCsv<MilitaryCapabilitiesCsv>("military_capabilities.csv");

  // Comme certifications.issuing_organization_id, organization_id est
  // renseigne avec le nom de l'organisation plutot que son UUID.
  // organization_id est obligatoire ici -> les lignes non resolues sont
  // ecartees (sinon violation de la contrainte NOT NULL).
  const organizations = await prisma.organization.findMany({
    select: { id: true, name: true },
  });
  const resolveOrganizationId = buildNameLookup(organizations);

  const skipped: string[] = [];
  const data: Prisma.MilitaryCapabilitiesCreateManyInput[] = [];

  for (const r of rows) {
    const organization_id = resolveOrganizationId(r.organization_id);
    if (!organization_id) {
      if (r.organization_id) skipped.push(r.organization_id);
      continue;
    }

    data.push({
      organization_id,

      number_of_active_navy_personnel: toInt(r.number_of_active_navy_personnel),
      number_of_destroyers: toInt(r.number_of_destroyers),
      number_of_submarines_diesel: toInt(r.number_of_submarines_diesel),
      number_of_submarines_nuclear: toInt(r.number_of_submarines_nuclear),
      number_of_naval_shipyards: toInt(r.number_of_naval_shipyards),
      number_of_maritime_patrol_aircraft: toInt(
        r.number_of_maritime_patrol_aircraft,
      ),
      number_of_stealth_fleet: toInt(r.number_of_stealth_fleet),
      number_of_surveillance_radars: toInt(r.number_of_surveillance_radars),
      number_of_aircrafts: toInt(r.number_of_aircrafts),
      number_of_fighter_jets: toInt(r.number_of_fighter_jets),
      number_of_helicopters: toInt(r.number_of_helicopters),
      number_of_drones: toInt(r.number_of_drones),
      number_of_tanker_planes: toInt(r.number_of_tanker_planes),
      number_of_transport_planes: toInt(r.number_of_transport_planes),
      number_of_communication_satellites: toInt(
        r.number_of_communication_satellites,
      ),
      number_of_missile_warning_satellites: toInt(
        r.number_of_missile_warning_satellites,
      ),
      number_of_navigation_satellites: toInt(r.number_of_navigation_satellites),
      number_of_spy_satellites: toInt(r.number_of_spy_satellites),
      number_of_satellite_jamming_systems: toInt(
        r.number_of_satellite_jamming_systems,
      ),
      number_of_surveillance_telescopes: toInt(
        r.number_of_surveillance_telescopes,
      ),
      number_of_operational_spaceplanes: toInt(
        r.number_of_operational_spaceplanes,
      ),
      number_of_space_launch_sites: toInt(r.number_of_space_launch_sites),
      number_of_space_operations_squadrons: toInt(
        r.number_of_space_operations_squadrons,
      ),
      number_of_space_personnel: toInt(r.number_of_space_personnel),

      updated_at: toDate(r.updated_at, true) as Date,
    });
  }

  if (skipped.length > 0) {
    console.warn(
      `MilitaryCapabilities: organization_id non resolus (lignes ignorees): ${skipped.join(", ")}`,
    );
  }

  // NOTE: depend de organizations.ts (organization_id) -> a seeder avant.
  const result = await prisma.militaryCapabilities.createMany({
    data,
    skipDuplicates: true,
  });

  console.log(`MilitaryCapabilities rows imported: ${result.count}`);

  return result.count;
}
