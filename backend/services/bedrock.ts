import * as AWS from 'aws-sdk';

const bedrock = new AWS.BedrockRuntime({ region: 'us-east-1' });

const CLAUDE_MODEL_ID = 'anthropic.claude-3-haiku-20240307-v1:0';

export interface EmotionAnalysis {
  primaryEmotion: string;
  emotionIntensity: number;
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  suggestedSupport?: string;
}

export async function analyzeJournalEmotion(journalText: string): Promise<EmotionAnalysis | null> {
  try {
    const prompt = `\n\nHuman: Analyze this journal entry and provide emotional insights in JSON format.

Journal entry: ${journalText}

Respond with ONLY a JSON object containing:
- primaryEmotion: string (main emotion)
- emotionIntensity: number (1-10)
- sentiment: string (positive/negative/neutral/mixed)
- suggestedSupport: string (brief supportive message)

\n\nAssistant: `;

    const params = {
      modelId: CLAUDE_MODEL_ID,
      body: JSON.stringify({
        prompt,
        max_tokens_to_sample: 300,
        temperature: 0.7,
        top_p: 0.9,
      }),
      contentType: 'application/json',
      accept: 'application/json',
    };

    const response = await bedrock.invokeModel(params).promise();
    const responseBody = JSON.parse(response.body?.toString() || '{}');
    
    // Extract JSON from Claude's response
    const completion = responseBody.completion || '';
    const jsonMatch = completion.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return null;
  } catch (error) {
    console.error('Error analyzing emotion:', error);
    return null;
  }
}

export async function extractTasks(journalText: string): Promise<Array<{
  description: string;
  context: string;
  priority: string;
}>> {
  try {
    const prompt = `\n\nHuman: Extract any implicit or explicit tasks from this journal entry.

Journal entry: ${journalText}

Respond with ONLY a JSON object containing:
- tasks: array of objects with:
  - description: string (what needs to be done)
  - context: string (why this is important)
  - priority: string (high/medium/low)

If no tasks found, return {"tasks": []}

\n\nAssistant: `;

    const params = {
      modelId: CLAUDE_MODEL_ID,
      body: JSON.stringify({
        prompt,
        max_tokens_to_sample: 500,
        temperature: 0.7,
        top_p: 0.9,
      }),
      contentType: 'application/json',
      accept: 'application/json',
    };

    const response = await bedrock.invokeModel(params).promise();
    const responseBody = JSON.parse(response.body?.toString() || '{}');
    
    const completion = responseBody.completion || '';
    const jsonMatch = completion.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return result.tasks || [];
    }
    
    return [];
  } catch (error) {
    console.error('Error extracting tasks:', error);
    return [];
  }
}

export async function generateEmbedding(text: string): Promise<number[] | null> {
  try {
    const params = {
      modelId: 'amazon.titan-embed-text-v1',
      body: JSON.stringify({
        inputText: text
      }),
      contentType: 'application/json',
      accept: 'application/json',
    };

    const response = await bedrock.invokeModel(params).promise();
    const responseBody = JSON.parse(response.body?.toString() || '{}');
    
    return responseBody.embedding || null;
  } catch (error) {
    console.error('Error generating embedding:', error);
    return null;
  }
}