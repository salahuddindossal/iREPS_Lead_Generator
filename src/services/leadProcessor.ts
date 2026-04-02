import { Lead, REAL_ESTATE_KEYWORDS, URGENCY_KEYWORDS, SCORING_RULES, QUALITY_INDICATORS } from "../types";
import crypto from "crypto";
import countriesConfig from "../config/countries.json";
import socialPlatformsConfig from "../config/social_platforms.json";

export function processLead(raw: any): Lead | null {
  const content = raw.content.toLowerCase();
  const title = raw.title.toLowerCase();
  const combined = `${title} ${content}`;

  // 1. Filtering (International Keywords)
  const allKeywords = [
    ...REAL_ESTATE_KEYWORDS,
    ...countriesConfig.Canada.keywords,
    ...countriesConfig.USA.keywords,
    ...countriesConfig.UK.keywords
  ];
  
  const matchedKeywords = Array.from(new Set(allKeywords.filter(kw => combined.includes(kw.toLowerCase()))));
  if (matchedKeywords.length === 0) return null;

  // 2. Country & City Detection
  let country: Lead["country"] = "Other";
  let city: string | undefined;
  let currency: Lead["currency"] | undefined;

  // Check for explicit country mention
  if (combined.includes("canada")) country = "Canada";
  else if (combined.includes("usa") || combined.includes("united states")) country = "USA";
  else if (combined.includes("uk") || combined.includes("united kingdom")) country = "UK";

  // Check for major city names if country not found
  if (country === "Other") {
    for (const [cName, config] of Object.entries(countriesConfig)) {
      for (const cityName of (config as any).cities) {
        if (combined.includes(cityName.toLowerCase())) {
          country = cName as Lead["country"];
          city = cityName;
          break;
        }
      }
      if (country !== "Other") break;
    }
  }

  // Phase 12: Skip Pakistan leads and only process Canada, USA, UK
  if (combined.includes("pakistan") || country === "Other") {
    return null;
  }

  // 3. Currency Detection
  for (const [cName, config] of Object.entries(countriesConfig)) {
    for (const symbol of (config as any).currency_symbols) {
      if (combined.includes(symbol.toLowerCase())) {
        currency = (config as any).currency as Lead["currency"];
        break;
      }
    }
    if (currency) break;
  }

  // 4. Scoring (Phase 14 Quality Scoring)
  let quality_score = 0;
  
  // Base keyword scoring
  Object.entries(SCORING_RULES).forEach(([category, rule]) => {
    rule.words.forEach(word => {
      if (combined.includes(word.toLowerCase())) {
        quality_score += rule.points;
      }
    });
  });

  // 5. Contact Extraction (Improved)
  const phoneRegex = /(\+1|1)?[ -]?\(?[0-9]{3}\)?[ -]?[0-9]{3}[ -]?[0-9]{4}|(\+44|0)[0-9]{2,4}[ -]?[0-9]{6,8}/g;
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const whatsappRegex = /(wa\.me\/|whatsapp\.com\/)[a-zA-Z0-9]+/g;
  const websiteRegex = /(https?:\/\/[^\s]+)/g;
  
  const phone = combined.match(phoneRegex)?.[0];
  const email = combined.match(emailRegex)?.[0];
  const contact_whatsapp = combined.match(whatsappRegex)?.[0];
  const contact_website = combined.match(websiteRegex)?.[0];

  // Quality Indicators (Phase 14.4.2)
  if (phone || email || contact_whatsapp || raw.social_username) quality_score += QUALITY_INDICATORS.CONTACT_METHOD;
  if (city) quality_score += QUALITY_INDICATORS.LOCATION_SPECIFIED;
  if (currency || combined.includes("budget") || combined.includes("price")) quality_score += QUALITY_INDICATORS.BUDGET_MENTIONED;
  if (URGENCY_KEYWORDS.some(kw => combined.includes(kw))) quality_score += QUALITY_INDICATORS.TIMELINE_MENTIONED;
  if (combined.length > 50) quality_score += QUALITY_INDICATORS.PROJECT_DETAILS;
  if (raw.post_score && raw.post_score > 10) quality_score += QUALITY_INDICATORS.ENGAGEMENT;
  if (content.split('.').length > 1) quality_score += QUALITY_INDICATORS.COMPLETE_SENTENCE;
  if (raw.is_verified) quality_score += QUALITY_INDICATORS.VERIFIED_PROFILE;

  // Phase 14.4.3: Filter Out Low Quality Leads (Minimum 20 points)
  if (quality_score < 20) {
    console.log(`Lead filtered out due to low quality score: ${quality_score}`);
    return null;
  }

  // Quality Classification
  let quality_level: Lead["quality_level"] = "Low";
  if (quality_score >= 70) quality_level = "High";
  else if (quality_score >= 40) quality_level = "Medium";

  // Priority Level (Mapping quality to priority for backward compatibility)
  let priority: Lead["priority"] = "Low";
  if (quality_level === "High") priority = "High";
  else if (quality_level === "Medium") priority = "Medium";

  // 7. Social Media Extraction
  let social_platform: Lead["social_platform"];
  let extracted_social_links: string[] = [];

  for (const [pName, config] of Object.entries(socialPlatformsConfig)) {
    for (const domain of (config as any).domain_patterns) {
      if (raw.url.includes(domain)) {
        social_platform = pName as Lead["social_platform"];
        break;
      }
    }
    if (social_platform) break;
  }

  // Extract social links from content
  const allSocialDomains = Object.values(socialPlatformsConfig).flatMap((c: any) => c.domain_patterns);
  const links = combined.match(websiteRegex) || [];
  extracted_social_links = links.filter(link => allSocialDomains.some(domain => link.includes(domain)));

  // 8. Categorization
  let category = "Residential";
  if (combined.includes("commercial") || combined.includes("shop") || combined.includes("office")) category = "Commercial";
  else if (combined.includes("land") || combined.includes("plot") || combined.includes("acre")) category = "Land";
  else if (combined.includes("investment") || combined.includes("rental") || combined.includes("portfolio")) category = "Investment";

  const id = crypto.createHash("md5").update(raw.content + raw.timestamp + raw.url).digest("hex");

  return {
    id,
    title: raw.title,
    content: raw.content,
    author: raw.author || "Anonymous",
    timestamp: raw.timestamp,
    url: raw.url,
    score: quality_score, // Using quality score as the main score
    priority,
    location: city || country,
    keywords: matchedKeywords,
    phone,
    email,
    category,
    dateScraped: new Date().toISOString(),
    country,
    city,
    currency,
    social_platform,
    social_username: raw.social_username,
    social_user_link: raw.social_user_link,
    post_link: raw.url,
    reddit_subreddit: raw.reddit_subreddit,
    reddit_post_id: raw.reddit_post_id,
    reddit_comment_id: raw.reddit_comment_id,
    reddit_comment_link: raw.reddit_comment_link,
    reddit_comment_parent: raw.reddit_comment_parent,
    reddit_comment_depth: raw.reddit_comment_depth,
    reddit_is_comment: raw.reddit_is_comment,
    reddit_permalink: raw.reddit_permalink,
    post_score: raw.post_score,
    contact_whatsapp,
    contact_website,
    extracted_social_links,
    // Phase 14 Fields
    platform: social_platform,
    platform_username: raw.social_username,
    platform_profile_link: raw.social_user_link,
    platform_post_link: raw.url,
    platform_comment_id: raw.reddit_comment_id,
    platform_comment_link: raw.reddit_comment_link,
    platform_is_comment: raw.reddit_is_comment,
    platform_engagement: raw.post_score,
    platform_permalink: raw.reddit_permalink,
    quality_score,
    quality_level,
    contact_phone: phone,
    contact_email: email,
    contact_social: extracted_social_links
  };
}
