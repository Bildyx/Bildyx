import { z } from "zod";

export const MilitaryCapabilitySchema = z.object({
  id: z.string().uuid(),
  number_of_active_navy_personnel: z.number().int().min(0).nullable().optional(),
  number_of_aircrafts: z.number().int().min(0).nullable().optional(),
  number_of_communication_satellites: z.number().int().min(0).nullable().optional(),
  number_of_destroyers: z.number().int().min(0).nullable().optional(),
  number_of_drones: z.number().int().min(0).nullable().optional(),
  number_of_fighter_jets: z.number().int().min(0).nullable().optional(),
  number_of_helicopters: z.number().int().min(0).nullable().optional(),
  number_of_maritime_patrol_aircraft: z.number().int().min(0).nullable().optional(),
  number_of_missile_warning_satellites: z.number().int().min(0).nullable().optional(),
  number_of_naval_shipyards: z.number().int().min(0).nullable().optional(),
  number_of_navigation_satellites: z.number().int().min(0).nullable().optional(),
  number_of_operational_spaceplanes: z.number().int().min(0).nullable().optional(),
  number_of_satellite_jamming_systems: z.number().int().min(0).nullable().optional(),
  number_of_space_launch_sites: z.number().int().min(0).nullable().optional(),
  number_of_space_operations_squadrons: z.number().int().min(0).nullable().optional(),
  number_of_space_personnel: z.number().int().min(0).nullable().optional(),
  number_of_spy_satellites: z.number().int().min(0).nullable().optional(),
  number_of_stealth_fleet: z.number().int().min(0).nullable().optional(),
  number_of_submarines_diesel: z.number().int().min(0).nullable().optional(),
  number_of_submarines_nuclear: z.number().int().min(0).nullable().optional(),
  number_of_surveillance_radars: z.number().int().min(0).nullable().optional(),
  number_of_surveillance_telescopes: z.number().int().min(0).nullable().optional(),
  number_of_tanker_planes: z.number().int().min(0).nullable().optional(),
  number_of_transport_planes: z.number().int().min(0).nullable().optional(),
  organization_id: z.string().uuid(),
  updated_at: z.date(),
});

// GET
export const GetMilitaryCapabilitiesSchema = z.object({
  organization_id: z.string().uuid().optional(),
});

export const GetMilitaryCapabilitySchema = z.object({
  militaryCapabilityId: z.string().uuid(),
});

// POST
export const PostMilitaryCapabilitySchema = MilitaryCapabilitySchema.omit({
  id: true,
  updated_at: true,
});

// PATCH
export const PutMilitaryCapabilitySchema = PostMilitaryCapabilitySchema.partial();

// DELETE
export const DeleteMilitaryCapabilitySchema = z.object({
  militaryCapabilityId: z.string().uuid(),
});

export const DeleteMilitaryCapabilitiesBulkSchema = z.object({
  militaryCapabilityIds: z.array(z.string().uuid()),
});

export type MilitaryCapability = z.infer<typeof MilitaryCapabilitySchema>;
export type PostMilitaryCapability = z.infer<typeof PostMilitaryCapabilitySchema>;
export type PutMilitaryCapability = z.infer<typeof PutMilitaryCapabilitySchema>;
