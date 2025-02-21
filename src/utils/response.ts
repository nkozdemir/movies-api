import { ServerResponse } from 'http';

interface SuccessResponse {
    status: number;
    success: true;
    message: string;
    data: any;
}

interface ErrorResponse {
    status: number;
    success: false;
    message: string;
    error: string | string[];
}

export const sendSuccess = (res: ServerResponse, data: any, message: string = 'Success', status: number = 200): void => {
    const response: SuccessResponse = {
        status,
        success: true,
        message,
        data
    };

    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
};

export const sendError = (res: ServerResponse, error: string | string[], message: string = 'Error', status: number = 400): void => {
    const response: ErrorResponse = {
        status,
        success: false,
        message,
        error
    };

    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
}; 