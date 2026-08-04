-- Rename the Organization <-> Country implicit many-to-many join table.
-- The relation was previously named "CountryLargestOrganizations" (an unused,
-- misleadingly-named editorial concept) and is repurposed as the direct
-- "country(ies) of an organization" relation. The table is empty in every
-- environment (no seeds/queries ever wrote to it), so a plain rename is safe
-- and preserves the existing A/B column FKs (A -> countries.iso_code, B -> organizations.id).
ALTER TABLE "_CountryLargestOrganizations" RENAME TO "_OrganizationCountries";
