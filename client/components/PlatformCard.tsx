import { Edit2, Trash2, Plus } from 'lucide-react';

interface PlatformProfile {
  username?: string;
  solved?: number;
  rating?: number;
  maxRating?: number;
}

interface PlatformCardProps {
  platform: 'leetcode' | 'codeforces' | 'codechef';
  profile: PlatformProfile | undefined;
  onConnect: (platform: 'leetcode' | 'codeforces' | 'codechef') => void;
  onEdit: (platform: 'leetcode' | 'codeforces' | 'codechef') => void;
  onRemove: (platform: string) => void;
}

export default function PlatformCard({
  platform,
  profile,
  onConnect,
  onEdit,
  onRemove,
}: PlatformCardProps) {
  const isConnected = !!profile?.username;

  const renderProfileDetails = () => {
    if (!isConnected) return <p className="text-sm text-muted-foreground">Not connected</p>;

    switch (platform) {
      case 'leetcode':
        return (
          <>
            <p className="mb-2 text-sm text-muted-foreground">@{profile.username}</p>
            <p className="text-lg font-bold">{profile.solved} Solved</p>
            {profile.rating && profile.rating > 0 && (
              <p className="text-sm text-muted-foreground">Rating: {profile.rating}</p>
            )}
          </>
        );
      case 'codeforces':
        return (
          <>
            <p className="mb-2 text-sm text-muted-foreground">@{profile.username}</p>
            <p className="text-lg font-bold">Rating: {profile.rating}</p>
            {profile.maxRating && profile.maxRating > 0 && (
              <p className="text-sm text-muted-foreground">Max: {profile.maxRating}</p>
            )}
          </>
        );
      case 'codechef':
        return (
          <>
            <p className="mb-2 text-sm text-muted-foreground">@{profile.username}</p>
            <p className="text-lg font-bold">Rating: {profile.rating}</p>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="surface-secondary p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold capitalize">{platform}</h3>
        <div className="flex gap-2">
          {isConnected ? (
            <>
              <button
                onClick={() => onEdit(platform)}
                className="text-muted-foreground hover:text-primary transition"
                title="Edit"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => onRemove(platform)}
                className="text-muted-foreground hover:text-red-500 transition"
                title="Remove"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          ) : (
            <button
              onClick={() => onConnect(platform)}
              className="flex items-center gap-1 text-sm text-primary hover:text-primary/80"
            >
              <Plus className="h-4 w-4" />
              Connect
            </button>
          )}
        </div>
      </div>
      {renderProfileDetails()}
    </div>
  );
}
