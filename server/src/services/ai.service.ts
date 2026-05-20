import OpenAI from "openai";
import { SYSTEM_PROMPT } from "../utils/system-prompt";
import { env } from "../configs/env";

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY || "",
    defaultHeaders: {
        "HTTP-Referer": "https://github.com/raghav/projects/crontab",
        "X-OpenRouter-Title": "Crontab Manager",
    },
});

interface AIResponse {
    cron_expression: string;
}

class AiService {
    async generateCron(cron_description: string): Promise<AIResponse> {
        const completion = await openai.chat.completions.create({
            model: "openrouter/free",
            messages: [
                {
                    role: "system",
                    content: SYSTEM_PROMPT,
                },
                {
                    role: "user",
                    content: cron_description,
                },
            ],
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) {
            throw new Error("Empty response from AI service.");
        }

        const aiResponse = JSON.parse(content) as AIResponse;
        console.log("aiResponse", aiResponse);
        return aiResponse;
    }
}

export default new AiService();
