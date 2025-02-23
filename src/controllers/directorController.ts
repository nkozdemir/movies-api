import { IncomingMessage, ServerResponse } from "http";
import { createDirector, deleteDirector } from "../services/directorService";
import { parse } from "url";
import { sendSuccess, sendError } from "../utils/response";

export const directorController = {
  createDirector: async (req: IncomingMessage, res: ServerResponse) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      try {
        const directorData = JSON.parse(body);

        // Validate required fields
        const requiredFields = ["firstName", "lastName", "birthDate", "bio"];
        const missingFields = requiredFields.filter(
          (field) => !directorData[field],
        );

        if (missingFields.length > 0) {
          return sendError(
            res,
            `Missing required fields: ${missingFields.join(", ")}`,
            "Validation Error",
            400,
          );
        }

        // Validate birthDate format
        const birthDate = new Date(directorData.birthDate);
        if (isNaN(birthDate.getTime())) {
          return sendError(
            res,
            "Invalid birth date format. Use YYYY-MM-DD format",
            "Validation Error",
            400,
          );
        }

        const newDirector = await createDirector(directorData);
        sendSuccess(res, newDirector, "Director created successfully", 201);
      } catch (error) {
        if (error instanceof SyntaxError) {
          sendError(res, "Invalid JSON format", "Invalid Request", 400);
        } else {
          sendError(
            res,
            "Failed to create director",
            "Internal Server Error",
            500,
          );
        }
      }
    });
  },

  deleteDirector: async (req: IncomingMessage, res: ServerResponse) => {
    const parsedUrl = parse(req.url || "", true);
    const directorId = parsedUrl.pathname?.split("/")[2];

    if (!directorId) {
      return sendError(res, "Director ID is required", "Invalid Request", 400);
    }

    try {
      await deleteDirector(directorId);
      sendSuccess(res, null, "Director deleted successfully");
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Director not found") {
          return sendError(res, "Director not found", "Not Found", 404);
        } else if (error.message === "Director has movie(s), cannot delete") {
          return sendError(
            res,
            "Cannot delete director because they have associated movies. Please delete the movies first.",
            "Conflict",
            409,
          );
        }
      }
      sendError(res, "Failed to delete director", "Internal Server Error", 500);
    }
  },
};
