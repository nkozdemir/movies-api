import { IncomingMessage, ServerResponse } from 'http';
import { directorController } from '../../controllers/directorController';
import * as directorService from '../../services/directorService';
import { Socket } from 'net';

// Mock services
jest.mock('../../services/directorService');

class MockIncomingMessage extends IncomingMessage {
    constructor() {
        super(new Socket());
        this.method = 'POST';
        this.headers = { 'content-type': 'application/json' };
    }
}

describe('Director Controller Unit Tests', () => {
    let mockRequest: MockIncomingMessage;
    let mockResponse: Partial<ServerResponse>;
    let responseData: any;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Mock response
        mockResponse = {
            writeHead: jest.fn(),
            end: jest.fn().mockImplementation((data) => {
                responseData = JSON.parse(data);
            })
        };

        // Reset response data
        responseData = null;
    });

    describe('createDirector', () => {
        beforeEach(() => {
            mockRequest = new MockIncomingMessage();
        });

        it('should create director successfully', async () => {
            const directorData = {
                firstName: 'Christopher',
                lastName: 'Nolan',
                birthDate: '1970-07-30',
                bio: 'Test bio'
            };

            (directorService.createDirector as jest.Mock).mockResolvedValue({
                ...directorData,
                _id: 'director-id'
            });

            const promise = directorController.createDirector(mockRequest, mockResponse as ServerResponse);
            mockRequest.emit('data', JSON.stringify(directorData));
            mockRequest.emit('end');
            await promise;

            expect(mockResponse.writeHead).toHaveBeenCalledWith(201, { 'Content-Type': 'application/json' });
            expect(responseData).toEqual({
                status: 201,
                success: true,
                message: 'Director created successfully',
                data: expect.objectContaining(directorData)
            });
        });

        it('should validate required fields', async () => {
            const invalidData = {
                firstName: 'Christopher'
                // Missing required fields
            };

            const promise = directorController.createDirector(mockRequest, mockResponse as ServerResponse);
            mockRequest.emit('data', JSON.stringify(invalidData));
            mockRequest.emit('end');
            await promise;

            expect(mockResponse.writeHead).toHaveBeenCalledWith(400, { 'Content-Type': 'application/json' });
            expect(responseData.success).toBe(false);
            expect(responseData.message).toBe('Validation Error');
            expect(responseData.error).toContain('lastName');
            expect(responseData.error).toContain('birthDate');
            expect(responseData.error).toContain('bio');
        });

        it('should validate birth date format', async () => {
            const invalidData = {
                firstName: 'Christopher',
                lastName: 'Nolan',
                birthDate: 'invalid-date',
                bio: 'Test bio'
            };

            const promise = directorController.createDirector(mockRequest, mockResponse as ServerResponse);
            mockRequest.emit('data', JSON.stringify(invalidData));
            mockRequest.emit('end');
            await promise;

            expect(responseData.success).toBe(false);
            expect(responseData.error).toContain('Invalid birth date format');
        });

        it('should handle invalid JSON', async () => {
            const promise = directorController.createDirector(mockRequest, mockResponse as ServerResponse);
            mockRequest.emit('data', 'invalid json');
            mockRequest.emit('end');
            await promise;

            expect(responseData.success).toBe(false);
            expect(responseData.message).toBe('Invalid Request');
            expect(responseData.error).toBe('Invalid JSON format');
        });
    });

    describe('deleteDirector', () => {
        beforeEach(() => {
            mockRequest = new MockIncomingMessage();
            mockRequest.url = '/directors/director-id';
        });

        it('should delete director successfully', async () => {
            (directorService.deleteDirector as jest.Mock).mockResolvedValue({ _id: 'director-id' });

            await directorController.deleteDirector(mockRequest, mockResponse as ServerResponse);

            expect(responseData.success).toBe(true);
            expect(responseData.message).toBe('Director deleted successfully');
        });

        it('should handle non-existent director', async () => {
            const error = new Error('Director not found');
            (directorService.deleteDirector as jest.Mock).mockRejectedValue(error);

            await directorController.deleteDirector(mockRequest, mockResponse as ServerResponse);

            expect(responseData.success).toBe(false);
            expect(responseData.status).toBe(404);
            expect(responseData.error).toBe('Director not found');
        });

        it('should handle director with movies', async () => {
            const error = new Error('Director has movie(s), cannot delete');
            (directorService.deleteDirector as jest.Mock).mockRejectedValue(error);

            await directorController.deleteDirector(mockRequest, mockResponse as ServerResponse);

            expect(responseData.success).toBe(false);
            expect(responseData.status).toBe(409);
            expect(responseData.message).toBe('Conflict');
            expect(responseData.error).toBe('Cannot delete director because they have associated movies. Please delete the movies first.');
        });

        it('should handle invalid director ID', async () => {
            mockRequest.url = undefined; // This will trigger the ID required error

            await directorController.deleteDirector(mockRequest, mockResponse as ServerResponse);

            expect(responseData.success).toBe(false);
            expect(responseData.status).toBe(400);
            expect(responseData.message).toBe('Invalid Request');
            expect(responseData.error).toBe('Director ID is required');
        });
    });
}); 