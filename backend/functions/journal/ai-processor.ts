import { DynamoDBStreamHandler } from 'aws-lambda';
import * as AWS from 'aws-sdk';

const dynamodb = new AWS.DynamoDB.DocumentClient();
const bedrock = new AWS.BedrockRuntime({ region: 'us-east-1' });

const JOURNAL_ENTRIES_TABLE = process.env.JOURNAL_ENTRIES_TABLE!;
const USER_CONTEXT_TABLE = process.env.USER_CONTEXT_TABLE!;
const INSIGHT_QUEUE_TABLE = process.env.INSIGHT_QUEUE_TABLE!;

// Model configuration
const CLAUDE_MODEL_ID = 'anthropic.claude-3-haiku-20240307-v1:0';
const TITAN_EMBED_MODEL_ID = 'amazon.titan-embed-text-v1';

// Prompts
const EMOTION_PROMPT = `Human: Analyze this journal entry and extract emotional insights.

Journal entry: {entry}

Provide a JSON response with:
1. primaryEmotion: The main emotion (happy, sad, anxious, excited, frustrated, calm, grateful, etc.)
2. emotionIntensity: Scale of 1-10
3. sentiment: positive, negative, neutral, or mixed
4. suggestedSupport: Brief supportive message based on the emotional state

Response must be valid JSON only.