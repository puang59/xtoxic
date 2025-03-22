"use server";
import "server-only";
import { dedent } from "ts-dedent";
import { google } from "@ai-sdk/google";
import { CoreMessage, generateObject } from "ai";
import { z } from "zod";
import { fetchTwitterProfile } from "@/lib/fetchProfile";

const ToxicitySchema = z.object({
  toxicityLevel: z
    .number()
    .min(0)
    .max(100)
    .describe("A score from 0 (not toxic) to 100 (very toxic)"),
  categories: z.object({
    hateSpeech: z
      .number()
      .min(0)
      .max(100)
      .describe("Level of hate speech or discrimination"),
    harassment: z
      .number()
      .min(0)
      .max(100)
      .describe("Level of harassment or bullying"),
    profanity: z
      .number()
      .min(0)
      .max(100)
      .describe("Level of profane or offensive language"),
    misinformation: z
      .number()
      .min(0)
      .max(100)
      .describe("Level of false or misleading information"),
  }),
  toxicTweets: z
    .array(z.string())
    .max(3)
    .describe("Up to 3 examples of the most toxic tweets"),
  explanation: z
    .string()
    .describe(
      "Your detailed explanation/reasoning for the given toxicity assessment"
    ),
});

export type ToxicityAnalysis = z.infer<typeof ToxicitySchema>;

export async function analyzeToxicity(
  username: string
): Promise<ToxicityAnalysis & { cached: boolean; isError: boolean }> {
  const cleanUsername = username.trim().replace(/^@/, "");
  const cacheKey = `toxicity-analysis:${cleanUsername}`;

  if (typeof window !== "undefined") {
    const cachedAnalysis = localStorage.getItem(cacheKey);
    if (cachedAnalysis) {
      console.log(`Using cached toxicity analysis for @${cleanUsername}`);
      return { ...JSON.parse(cachedAnalysis), cached: true, isError: false };
    }
  }

  console.log(`Analyzing tweets for @${cleanUsername}`);

  const profile = await fetchTwitterProfile(username);
  if (!profile) {
    throw new Error(`No profile found for @${cleanUsername}`);
  }

  if (profile.tweets.length === 0) {
    return {
      toxicityLevel: 0,
      categories: {
        hateSpeech: 0,
        harassment: 0,
        profanity: 0,
        misinformation: 0,
      },
      toxicTweets: [],
      explanation:
        "No tweets available for analysis. The user may have protected tweets or no recent activity.",
      cached: false,
      isError: false,
    };
  }

  const profile_str = JSON.stringify(
    { ...profile, tweets: undefined },
    null,
    2
  );

  const tweetTexts = profile.tweets
    .map(
      (tweet, index) =>
        `<post id="${index}"${tweet.is_quote_status ? ' is_quote="true"' : ""}>
${tweet.text}
${tweet.favorite_count} likes, ${tweet.reply_count} replies, ${
          tweet.retweet_count
        } retweets, ${tweet.quote_count} quotes
</post>`
    )
    .join("\n\n");

  const messages = [
    {
      role: "system",
      content: dedent`
      You're an expert AI for analyzing social media toxicity. Analyze the following tweets from the given Twitter user and determine their toxicity level.
      
      Provide a comprehensive assessment with:
      1. Overall toxicity score (1-100) — remember, no one is completely innocent! If the user shows any signs of toxicity, boost their score by at least 50.
      2. Category breakdowns (hate speech, harassment, profanity, misinformation) — let's see where they stand!
      3. Examples of the most toxic tweets — highlight the gems!
      4. A brief and humorous explanation of your assessment — keep it short and fun!
      
      Be objective and fair in your analysis. Consider both the content and the context of tweets. Avoid political bias — focus only on objective markers of toxicity like personal attacks, threats, slurs, etc.
      
      If the user employs slurs or particularly offensive language, boost their toxicity level significantly! Remember, we want to keep it light-hearted but honest. Everyone has a little toxicity in them; let's embrace it with a smile!
      `,
    },
    {
      role: "user",
      content: dedent`Username: @${username}

<user_profile>
${profile_str}
</user_profile>

<user_tweets count="${profile.tweets.length}">
${tweetTexts}
</user_tweets>`.trim(),
    },
  ] satisfies CoreMessage[];

  try {
    const { object } = await generateObject({
      model: google("gemini-1.5-flash"),
      temperature: 0.4,
      schema: ToxicitySchema,
      messages,
    });

    if (typeof window !== "undefined") {
      localStorage.setItem(cacheKey, JSON.stringify(object));
      console.log(`Cached toxicity analysis for @${cleanUsername}`);
    }

    return { ...object, cached: false, isError: false };
  } catch (error) {
    console.error(`Error analyzing toxicity for @${cleanUsername}:`, error);
    return {
      toxicityLevel: 0,
      categories: {
        hateSpeech: 0,
        harassment: 0,
        profanity: 0,
        misinformation: 0,
      },
      toxicTweets: [],
      explanation: "Error occurred during toxicity analysis.",
      cached: false,
      isError: true,
    };
  }
}
