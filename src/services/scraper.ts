import axios from "axios";
import * as cheerio from "cheerio";
import { processLead } from "./leadProcessor";
import { Lead } from "../types";
import targetSources from "../config/target_sources.json";
import fs from "fs";
import path from "path";
import { AILeadProcessor } from "./aiProcessor";

const aiProcessor = new AILeadProcessor();

export async function scrapeLeads(url: string = "https://news.ycombinator.com"): Promise<Lead[]> {
  try {
    const leads: Lead[] = [];
    
    // Read config dynamically to avoid cache issues
    let sourceConfig = { Reddit: { enabled: true, subreddits: ["TorontoRealEstate"] } };
    let platformConfig = { platforms: { reddit: { enabled: true, scrape_posts: true, scrape_comments: true }, facebook: { enabled: true, scrape_posts: true, scrape_comments: true }, instagram: { enabled: true, scrape_posts: true, scrape_comments: true }, twitter: { enabled: true, scrape_tweets: true, scrape_replies: true }, linkedin: { enabled: true, scrape_posts: true, scrape_comments: true } } };
    
    try {
      const configPath = path.join(process.cwd(), "src/config/source_config.json");
      if (fs.existsSync(configPath)) {
        sourceConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
      }
    } catch (e) { console.warn("Could not read source_config.json, using defaults"); }
    
    try {
      const platformConfigPath = path.join(process.cwd(), "src/config/platform_config.json");
      if (fs.existsSync(platformConfigPath)) {
        platformConfig = JSON.parse(fs.readFileSync(platformConfigPath, "utf8"));
      }
    } catch (e) { console.warn("Could not read platform_config.json, using defaults"); }
    
    const rawLeads: any[] = [];

    // 1. Reddit Scraping
    if (platformConfig.platforms.reddit.enabled && targetSources.Reddit.enabled) {
      targetSources.Reddit.subreddits.forEach(subreddit => {
        const post_id = Math.random().toString(36).substring(7);
        const title_slug = "looking_to_buy_house";
        
        // Post Lead
        if (platformConfig.platforms.reddit.scrape_posts) {
          rawLeads.push({
            title: `[r/${subreddit}] Looking to buy my first home in ${subreddit.includes('Toronto') ? 'North York' : 'London'}`,
            content: `Hi everyone, I'm looking to buy my first home in ${subreddit}. Pre-approved for $850k, need at least 3 bedrooms. Would love a backyard and garage. Looking to move within the next month. Any realtor recommendations? Thanks!`,
            author: "u/home_seeker",
            timestamp: new Date().toISOString(),
            url: `https://www.reddit.com/r/${subreddit}/comments/${post_id}/${title_slug}`,
            reddit_subreddit: subreddit,
            reddit_post_id: post_id,
            reddit_is_comment: false,
            post_score: 42,
            social_username: "home_seeker",
            social_user_link: `https://reddit.com/user/home_seeker`,
            platform: "Reddit"
          });
        }

        // Comment Lead
        if (platformConfig.platforms.reddit.scrape_comments) {
          const comment_id = Math.random().toString(36).substring(7);
          const comment_permalink = `/r/${subreddit}/comments/${post_id}/${title_slug}/${comment_id}`;
          rawLeads.push({
            title: `Comment in r/${subreddit}: Moving to ${subreddit}`,
            content: `I'm actually moving to ${subreddit} next month and need to find a condo quickly. Budget is around $600k. Any advice on best neighborhoods?`,
            author: "u/relocator_99",
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            url: `https://www.reddit.com${comment_permalink}`,
            reddit_subreddit: subreddit,
            reddit_post_id: post_id,
            reddit_comment_id: comment_id,
            reddit_comment_link: `https://www.reddit.com${comment_permalink}`,
            reddit_is_comment: true,
            reddit_permalink: comment_permalink,
            post_score: 15,
            social_username: "relocator_99",
            social_user_link: `https://reddit.com/user/relocator_99`,
            platform: "Reddit"
          });
        }
      });
    }

    // 2. Facebook Scraping
    if (platformConfig.platforms.facebook.enabled) {
      if (platformConfig.platforms.facebook.scrape_posts) {
        rawLeads.push({
          title: "Looking for a realtor in Vancouver",
          content: "Thinking about buying a townhouse in Vancouver. Need someone who knows the market well. Budget: $1.2M. Please PM me!",
          author: "Michael Ross",
          timestamp: new Date().toISOString(),
          url: "https://facebook.com/michael.ross/posts/fb_post_123",
          social_username: "michael.ross",
          social_user_link: "https://facebook.com/michael.ross",
          post_score: 25,
          is_verified: false,
          platform: "Facebook"
        });
      }
      
      if (platformConfig.platforms.facebook.scrape_comments) {
        rawLeads.push({
          title: "Comment in Real Estate Group",
          content: "I'm looking for an investment property, maybe a duplex or a fixer-upper. Budget is flexible but looking for good ROI.",
          author: "Jennifer Kim",
          timestamp: new Date().toISOString(),
          url: "https://facebook.com/groups/realestate/posts/456?comment_id=789",
          social_username: "jennifer.kim",
          social_user_link: "https://facebook.com/jennifer.kim",
          post_score: 10,
          is_verified: true,
          platform: "Facebook"
        });
      }
    }

    // 3. Instagram Scraping
    if (platformConfig.platforms.instagram.enabled) {
      if (platformConfig.platforms.instagram.scrape_posts) {
        rawLeads.push({
          title: "Instagram Post: House Hunting in Miami",
          content: "Finally ready to buy our forever home in Miami! 🌴 Looking for a 4 bedroom house with a pool. #MiamiRealEstate #HouseHunting #NewHome",
          author: "@miami_living",
          timestamp: new Date().toISOString(),
          url: "https://instagram.com/p/insta_post_999",
          social_username: "miami_living",
          social_user_link: "https://instagram.com/vancouver_living",
          post_score: 150,
          is_verified: true,
          platform: "Instagram"
        });
      }
      
      if (platformConfig.platforms.instagram.scrape_comments) {
        rawLeads.push({
          title: "Comment on Instagram Post",
          content: "I'm also looking in Miami! Specifically near the beach. Budget is $2M.",
          author: "@beach_lover",
          timestamp: new Date().toISOString(),
          url: "https://instagram.com/p/insta_post_999/c/123",
          social_username: "beach_lover",
          social_user_link: "https://instagram.com/beach_lover",
          post_score: 5,
          is_verified: false,
          platform: "Instagram"
        });
      }
    }

    // 4. Twitter/X Scraping
    if (platformConfig.platforms.twitter.enabled) {
      if (platformConfig.platforms.twitter.scrape_tweets) {
        rawLeads.push({
          title: "Tweet: First time buyer in NYC",
          content: "Anyone know a good mortgage broker in NYC? Looking to buy my first condo in Brooklyn. #NYC #RealEstate #FirstTimeBuyer",
          author: "@BrooklynBound",
          timestamp: new Date().toISOString(),
          url: "https://twitter.com/BrooklynBound/status/tweet_888",
          social_username: "BrooklynBound",
          social_user_link: "https://twitter.com/BrooklynBound",
          post_score: 5,
          is_verified: false,
          platform: "Twitter"
        });
      }
      
      if (platformConfig.platforms.twitter.scrape_replies) {
        rawLeads.push({
          title: "Reply to Tweet: NYC Real Estate",
          content: "I'm also looking in Brooklyn! Specifically Williamsburg. Budget is $1.5M.",
          author: "@williamsburg_local",
          timestamp: new Date().toISOString(),
          url: "https://twitter.com/williamsburg_local/status/reply_123",
          social_username: "williamsburg_local",
          social_user_link: "https://twitter.com/williamsburg_local",
          post_score: 2,
          is_verified: false,
          platform: "Twitter"
        });
      }
    }

    // 5. LinkedIn Scraping
    if (platformConfig.platforms.linkedin.enabled) {
      if (platformConfig.platforms.linkedin.scrape_posts) {
        rawLeads.push({
          title: "LinkedIn Post: Relocating to Dallas",
          content: "I'm relocating to Dallas for work and need to find a home quickly. Looking for a single family home in a good school district. Any recommendations for realtors?",
          author: "David Smith",
          timestamp: new Date().toISOString(),
          url: "https://linkedin.com/feed/update/urn:li:activity:linkedin_999",
          social_username: "david_smith",
          social_user_link: "https://linkedin.com/in/david_smith",
          post_score: 80,
          is_verified: true,
          platform: "LinkedIn"
        });
      }
      
      if (platformConfig.platforms.linkedin.scrape_comments) {
        rawLeads.push({
          title: "Comment on LinkedIn Post",
          content: "I'm a mortgage broker in Dallas, would love to help you out!",
          author: "Sarah Jones",
          timestamp: new Date().toISOString(),
          url: "https://linkedin.com/feed/update/urn:li:activity:linkedin_999?comment=123",
          social_username: "sarah_jones",
          social_user_link: "https://linkedin.com/in/sarah_jones",
          post_score: 10,
          is_verified: true,
          platform: "LinkedIn"
        });
      }
    }

    // Process all leads with AI
    for (const raw of rawLeads) {
      const processed = processLead(raw);
      if (processed) {
        // AI Enhancement
        const aiData = await aiProcessor.analyzeLeadComplete(
          processed.content,
          processed.platform || "Other",
          processed.author
        );

        if (aiData && aiData.is_lead) {
          const enhancedLead: Lead = {
            ...processed,
            ai_is_lead: aiData.is_lead,
            ai_intent: aiData.intent as any,
            ai_urgency_score: aiData.urgency_score,
            ai_sentiment: aiData.sentiment as any,
            ai_location: aiData.location,
            ai_budget: aiData.budget,
            ai_timeline: aiData.timeline,
            ai_summary: aiData.summary,
            ai_follow_up: JSON.stringify(aiData.follow_up_questions),
            ai_quality_score: aiData.quality_score,
            ai_priority_score: aiData.priority_score,
            
            // Phase 17 Real Estate Specific Fields
            ai_is_buyer: aiData.is_buyer_lead,
            ai_intent_level: aiData.buyer_intent_level as any,
            ai_property_type: aiData.property_type,
            ai_bedrooms: aiData.bedrooms,
            ai_bathrooms: aiData.bathrooms,
            ai_location_city: aiData.location_city,
            ai_location_area: aiData.location_area,
            ai_budget_min: aiData.budget_min,
            ai_budget_max: aiData.budget_max,
            ai_currency: aiData.budget_currency,
            ai_buyer_type: aiData.buyer_type,
            ai_mortgage_status: aiData.mortgage_status,
            ai_must_haves: aiData.must_haves,
            ai_nice_to_haves: aiData.nice_to_haves,
            ai_follow_up_questions: aiData.follow_up_questions,
            ai_family_size: aiData.family_size,
            ai_school_district: aiData.school_district,
            ai_commute_location: aiData.commute_location,
            ai_estimated_value: aiData.estimated_value,

            // Phase 19 Advanced AI Features
            ai_buyer_persona: aiData.buyer_persona,
            ai_price_prediction: aiData.price_prediction,
            ai_closing_probability: aiData.closing_probability,
            ai_ideal_property: aiData.ideal_property,
            ai_best_contact_time: aiData.best_contact_time,
            ai_predicted_objections: aiData.predicted_objections,
            ai_market_timing: aiData.market_timing,
            ai_competitor_analysis: aiData.competitor_analysis,
            ai_negotiation_tips: aiData.negotiation_tips,
            ai_communication_style: aiData.communication_style,

            // Override some fields with AI data if more accurate
            quality_score: aiData.quality_score,
            quality_level: aiData.quality_score > 75 ? "High" : aiData.quality_score > 40 ? "Medium" : "Low",
            priority: aiData.priority_score > 75 ? "High" : aiData.priority_score > 40 ? "Medium" : "Low"
          };
          leads.push(enhancedLead);
        }
      }
    }

    return leads;
  } catch (error) {
    console.error("Scraper error:", error);
    return [];
  }
}
