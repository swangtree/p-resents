import * as React from 'react';

// Type definitions copied from app/dashboard/page.tsx
interface GroupMemberDisplay {
  id: string;
  name: string;
  avatar: string; // Initial for avatar
  status: 'submitted' | 'missing';
  isAdmin: boolean;
}

interface MemberCardProps {
  member: GroupMemberDisplay;
  isCurrentUserAdmin: boolean; // Flag to determine if current user viewing can see admin badge
}

export default function MemberCard({ member, isCurrentUserAdmin }: MemberCardProps) {
  const isSubmitted = member.status === 'submitted';
  
  // Dynamic color for the status text
  const statusColor = isSubmitted ? 'text-pareto-green' : 'text-pareto-pink';
  
  // Dynamic background for the avatar
  const avatarBg = isSubmitted ? 'bg-pareto-green/50' : 'bg-pareto-pink/50';

  return (
    <div className="bg-pareto-dark p-4 rounded-xl shadow-lg border border-pareto-light/30 flex items-center gap-4">
      {/* Avatar (First Letter) */}
      <div className={`flex-shrink-0 w-12 h-12 rounded-full ${avatarBg} flex items-center justify-center`}>
        <span className="font-display text-pareto-light text-xl">
          {member.avatar}
        </span>
      </div>

      {/* Details */}
      <div className="flex-grow">
        <div className="flex items-center gap-2">
          {/* Member Name */}
          <p className="chalk-text text-pareto-light text-lg font-bold truncate">
            {member.name}
          </p>
          
          {/* Admin Badge (Only show if the current viewer is the admin) */}
          {member.isAdmin && isCurrentUserAdmin && (
            <span className="text-xs font-bold text-pareto-yellow bg-pareto-orange/20 px-2 py-0.5 rounded-full">
              ADMIN
            </span>
          )}
        </div>

        {/* Status */}
        <p className={`chalk-text text-sm capitalize ${statusColor}`}>
          {isSubmitted ? 'Preferences Submitted' : 'Preferences Missing'}
        </p>
      </div>
      
      {/* Optional: Add a button/link for the admin to nudge or manage */}
      {member.status === 'missing' && isCurrentUserAdmin && !member.isAdmin && (
        <button
          onClick={() => alert(`Nudging ${member.name}... (Feature not yet implemented)`)}
          className="text-pareto-blue text-sm hover:opacity-80 transition-opacity ml-auto"
          title={`Nudge ${member.name} to submit preferences`}
        >
          Nudge
        </button>
      )}
    </div>
  );
}