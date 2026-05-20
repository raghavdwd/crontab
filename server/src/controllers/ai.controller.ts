import { type AuthenticatedRequest } from "../middlewares/auth.middleware";
import { type Response } from "express";
import aiService from "../services/ai.service";
import AiModel from "../models/ai.model";

export const generateCron = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id as string;
        const cron_description = req.body.cron_description as string;

        if (!cron_description) {
            res.status(400).json({ error: "Cron description is required." });
            return;
        }

        const aiResponse = await aiService.generateCron(cron_description);

        // Persist the AI generation log/history
        await AiModel.create({
            userId,
            cron_description,
            cron_expression: aiResponse.cron_expression,
        });

        res.status(200).json({ aiResponse });
    } catch (error: any) {
        console.error("Error in generating cron expression ", error);
        res.status(500).json({
            error: "Failed to generate cron.",
            details: error.message || String(error),
        });
    }
};