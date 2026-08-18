import { useEffect, useState } from "react";
import { CertificationService } from "../../services/certification.service";
import { DegreeService } from "../../services/degree.service";
import { IndustryService } from "../../services/industry.service";
import { JobService } from "../../services/job.service";
import { OrganizationService } from "../../services/organization.service";
import { SubjectService } from "../../services/subject.service";

export interface EntitySearchConfig {
  title: string;
  placeholder: string;
  searchEndpoint: string;
  displayProp: string;
}

const organizationService = new OrganizationService();
const subjectService = new SubjectService();
const jobService = new JobService();
const industryService = new IndustryService();
const degreeService = new DegreeService();
const certificationService = new CertificationService();

export const ENTITY_SEARCH_CONFIG: Record<string, EntitySearchConfig> = {
  "company-card": {
    title: "Select an Organisation",
    placeholder: "Search for a company...",
    searchEndpoint: "/organizations",
    displayProp: "name",
  },

  "university-card": {
    title: "Select a University",
    placeholder: "Search for a university...",
    searchEndpoint: "/universities",
    displayProp: "name",
  },

  "subject-card": {
    title: "Select a Product / Service",
    placeholder: "Search for a product or service...",
    searchEndpoint: "/subjects",
    displayProp: "name",
  },

  "brand-card": {
    title: "Select a Brand",
    placeholder: "Search for a brand...",
    searchEndpoint: "/subjects",
    displayProp: "name",
  },

  "role-card": {
    title: "Select a Role / Position",
    placeholder: "Search for a role...",
    searchEndpoint: "/jobs",
    displayProp: "title",
  },

  "client-card": {
    title: "Select a Sector / Industry",
    placeholder: "Search for an industry...",
    searchEndpoint: "/industries",
    displayProp: "name",
  },

  "degree-card": {
    title: "Select a Degree",
    placeholder: "Search for a degree...",
    searchEndpoint: "/degrees",
    displayProp: "name",
  },

  "certification-card": {
    title: "Select a Certification",
    placeholder: "Search for a certification...",
    searchEndpoint: "/certifications",
    displayProp: "name",
  },
};

async function searchEntities(endpoint: string, query: string): Promise<any[]> {
  switch (endpoint) {
    case "/organizations":
      return organizationService.getAll({
        name: query,
      });

    case "/universities":
      return organizationService.getAll({
        name: query,
        subtypes: ["UNIVERSITY"],
      });

    case "/subjects":
      return subjectService.getAll({
        name: query,
      });

    case "/jobs":
      return jobService.getAll({
        name: query,
      });

    case "/industries":
      return industryService.getAll({
        name: query,
      });

    case "/degrees":
      return degreeService.getAll({
        name: query,
      });

    case "/certifications": {
      const certifications = await certificationService.getAll();

      return certifications.filter((cert: any) =>
        cert.name?.toLowerCase().includes(query.toLowerCase()),
      );
    }

    default:
      return [];
  }
}

type Props = {
  open: boolean;
  slotType: string | null;
  onClose: () => void;
  onSelect: (entityId: string, entity: any) => void;
};

export default function EntitySearchModal({
  open,
  slotType,
  onClose,
  onSelect,
}: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const config = slotType ? ENTITY_SEARCH_CONFIG[slotType] : null;

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      setLoading(false);
      return;
    }

    setQuery("");
    setResults([]);
  }, [open, slotType]);

  useEffect(() => {
    if (!open || !config) {
      return;
    }

    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        setLoading(true);

        const entities = await searchEntities(
          config.searchEndpoint,
          trimmedQuery,
        );

        setResults(entities);
      } catch (error) {
        console.error("[EntitySearchModal] Search error:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [open, query, config]);

  if (!open || !config) {
    return null;
  }

  return (
    <div
      className="org-modal-overlay"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="org-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="entitySearchModalTitle"
      >
        <div className="org-modal-header">
          <h3 id="entitySearchModalTitle">{config.title}</h3>

          <button
            type="button"
            className="org-modal-close"
            aria-label="Close"
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        <div className="org-modal-body">
          <div className="org-search-wrapper">
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={config.placeholder}
              autoComplete="off"
              autoFocus
            />
          </div>

          {loading && (
            <ul className="org-results-list">
              <li className="org-result-loading">Searching...</li>
            </ul>
          )}

          {!loading && query.trim().length >= 2 && (
            <ul className="org-results-list">
              {!results.length ? (
                <li className="org-result-empty">No results found</li>
              ) : (
                results.map((entity) => {
                  const label = entity[config.displayProp] || "Unknown";

                  return (
                    <li
                      key={entity.id}
                      className="org-result-item"
                      onClick={() => {
                        onSelect(entity.id, entity);
                        onClose();
                      }}
                    >
                      <div className="org-item-name">{label}</div>
                    </li>
                  );
                })
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
