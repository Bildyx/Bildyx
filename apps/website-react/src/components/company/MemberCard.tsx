import { TeamMember } from "@repo/models/team_members";
import { Job } from "@repo/models/jobs";

interface MemberCardProps {
  member: TeamMember;
  job?: Job;
  isAdminMode: boolean;
  onEdit: () => void;
  onToggleLeader: () => void;
  onDelete: () => void;
}

export function MemberCard({
  member,
  job,
  isAdminMode,
  onEdit,
  onToggleLeader,
  onDelete,
}: MemberCardProps) {
  return (
    <article
      className="ca-member"
      style={{
        position: "relative",
        cursor: "pointer",
      }}
      onClick={onEdit}
    >
      {isAdminMode && (
        <>
          <button
            type="button"
            className="ca-star-button"
            title={
              member.is_leader ? "Remove team leader" : "Set as team leader"
            }
            style={{
              position: "absolute",
              top: 8,
              left: 8,
              border: 0,
              background: "transparent",
              padding: 4,
              cursor: "pointer",
              color: "#2447f4",
              fontSize: 16,
              zIndex: 2,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onToggleLeader();
            }}
          >
            {member.is_leader ? "★" : "☆"}
          </button>
          <button
            className="ca-member-delete"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            🗑
          </button>
        </>
      )}
      <div
        className="ca-member-photo-wrap"
        style={{
          position: "relative",
          width: 54,
          height: 54,
          margin: "6px auto 8px",
        }}
      >
        {member.profile_image ? (
          <img
            src={member.profile_image}
            alt=""
            style={{
              width: 54,
              height: 54,
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
        ) : (
          <div className="ca-default-avatar">☻</div>
        )}
      </div>
      <strong>{member.fullname}</strong>
      <small>{job ? job.title : "Team Member"}</small>
    </article>
  );
}
