export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlockedAt: string;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  role?: string;
  avatar?: string;
  badges?: Badge[];
  dailyChallengeCompleted?: { date: string }[];
}
