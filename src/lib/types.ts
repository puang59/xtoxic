export type Tweet = {
  text: string;
  created_at: string;
  favorite_count: number;
  quote_count: number;
  reply_count: number;
  retweet_count: number;
  is_quote_status?: boolean;
};

export type XProfile = {
  tweets: Tweet[];
  bio?: string;
  profile_url?: string;
  name?: string;
  created_at?: string;
  followers_count?: number;
  statuses_count?: number;
  location?: string;
};
