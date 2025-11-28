import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User, UserRole } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt');

describe('AuthService', () => {
    let service: AuthService;
    let userRepository: Repository<User>;
    let jwtService: JwtService;

    const mockUserRepository = {
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
    };

    const mockJwtService = {
        sign: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: getRepositoryToken(User),
                    useValue: mockUserRepository,
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        userRepository = module.get<Repository<User>>(getRepositoryToken(User));
        jwtService = module.get<JwtService>(JwtService);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('register', () => {
        it('should successfully register a new user', async () => {
            const registerDto = {
                email: 'test@example.com',
                password: 'Password123!',
                firstName: 'Test',
                lastName: 'User',
            };

            const hashedPassword = 'hashedPassword123';
            const mockUser = {
                id: 'user-1',
                email: registerDto.email,
                password: hashedPassword,
                firstName: registerDto.firstName,
                lastName: registerDto.lastName,
                role: UserRole.USER,
                profilePicture: null,
            };

            mockUserRepository.findOne.mockResolvedValue(null);
            (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
            mockUserRepository.create.mockReturnValue(mockUser);
            mockUserRepository.save.mockResolvedValue(mockUser);
            mockJwtService.sign.mockReturnValue('jwt-token');

            const result = await service.register(registerDto);

            expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { email: registerDto.email } });
            expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
            expect(mockUserRepository.create).toHaveBeenCalledWith({
                email: registerDto.email,
                password: hashedPassword,
                firstName: registerDto.firstName,
                lastName: registerDto.lastName,
                role: UserRole.USER,
            });
            expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
            expect(mockJwtService.sign).toHaveBeenCalledWith({
                sub: mockUser.id,
                email: mockUser.email,
                role: mockUser.role,
            });
            expect(result).toEqual({
                accessToken: 'jwt-token',
                user: {
                    id: mockUser.id,
                    email: mockUser.email,
                    firstName: mockUser.firstName,
                    lastName: mockUser.lastName,
                    role: mockUser.role,
                    profilePicture: mockUser.profilePicture,
                },
            });
        });

        it('should throw ConflictException if user already exists', async () => {
            const registerDto = {
                email: 'existing@example.com',
                password: 'Password123!',
                firstName: 'Test',
                lastName: 'User',
            };

            mockUserRepository.findOne.mockResolvedValue({ id: 'existing-user' });

            await expect(service.register(registerDto)).rejects.toThrow(
                ConflictException,
            );
            await expect(service.register(registerDto)).rejects.toThrow(
                'User with this email already exists',
            );
        });
    });

    describe('login', () => {
        it('should successfully login with valid credentials', async () => {
            const loginDto = {
                email: 'test@example.com',
                password: 'Password123!',
            };

            const mockUser = {
                id: 'user-1',
                email: loginDto.email,
                password: 'hashedPassword',
                firstName: 'Test',
                lastName: 'User',
                role: UserRole.USER,
                profilePicture: null,
                isActive: true,
            };

            mockUserRepository.findOne.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            mockJwtService.sign.mockReturnValue('jwt-token');

            const result = await service.login(loginDto);

            expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { email: loginDto.email } });
            expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
            expect(mockJwtService.sign).toHaveBeenCalledWith({
                sub: mockUser.id,
                email: mockUser.email,
                role: mockUser.role,
            });
            expect(result).toEqual({
                accessToken: 'jwt-token',
                user: {
                    id: mockUser.id,
                    email: mockUser.email,
                    firstName: mockUser.firstName,
                    lastName: mockUser.lastName,
                    role: mockUser.role,
                    profilePicture: mockUser.profilePicture,
                },
            });
        });

        it('should throw UnauthorizedException if user not found', async () => {
            const loginDto = {
                email: 'nonexistent@example.com',
                password: 'Password123!',
            };

            mockUserRepository.findOne.mockResolvedValue(null);

            await expect(service.login(loginDto)).rejects.toThrow(
                UnauthorizedException,
            );
            await expect(service.login(loginDto)).rejects.toThrow(
                'Invalid credentials',
            );
        });

        it('should throw UnauthorizedException if user has no password (Google user)', async () => {
            const loginDto = {
                email: 'google@example.com',
                password: 'Password123!',
            };

            const mockUser = {
                id: 'user-1',
                email: loginDto.email,
                password: null,
                isActive: true,
            };

            mockUserRepository.findOne.mockResolvedValue(mockUser);

            await expect(service.login(loginDto)).rejects.toThrow(
                UnauthorizedException,
            );
            await expect(service.login(loginDto)).rejects.toThrow(
                'Invalid credentials',
            );
        });

        it('should throw UnauthorizedException if password is invalid', async () => {
            const loginDto = {
                email: 'test@example.com',
                password: 'WrongPassword!',
            };

            const mockUser = {
                id: 'user-1',
                email: loginDto.email,
                password: 'hashedPassword',
                isActive: true,
            };

            mockUserRepository.findOne.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(service.login(loginDto)).rejects.toThrow(
                UnauthorizedException,
            );
            await expect(service.login(loginDto)).rejects.toThrow(
                'Invalid credentials',
            );
        });

        it('should throw UnauthorizedException if user is inactive', async () => {
            const loginDto = {
                email: 'test@example.com',
                password: 'Password123!',
            };

            const mockUser = {
                id: 'user-1',
                email: loginDto.email,
                password: 'hashedPassword',
                isActive: false,
            };

            mockUserRepository.findOne.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            await expect(service.login(loginDto)).rejects.toThrow(
                UnauthorizedException,
            );
            await expect(service.login(loginDto)).rejects.toThrow(
                'Account is inactive',
            );
        });
    });

    describe('validateUser', () => {
        it('should return user without password if credentials are valid', async () => {
            const email = 'test@example.com';
            const password = 'Password123!';

            const mockUser = {
                id: 'user-1',
                email,
                password: 'hashedPassword',
                firstName: 'Test',
                lastName: 'User',
                role: UserRole.USER,
            };

            mockUserRepository.findOne.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            const result = await service.validateUser(email, password);

            expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { email } });
            expect(bcrypt.compare).toHaveBeenCalledWith(password, mockUser.password);
            expect(result).toEqual({
                id: mockUser.id,
                email: mockUser.email,
                firstName: mockUser.firstName,
                lastName: mockUser.lastName,
                role: mockUser.role,
            });
            expect(result).not.toHaveProperty('password');
        });

        it('should return null if user not found', async () => {
            const email = 'nonexistent@example.com';
            const password = 'Password123!';

            mockUserRepository.findOne.mockResolvedValue(null);

            const result = await service.validateUser(email, password);

            expect(result).toBeNull();
        });

        it('should return null if password is invalid', async () => {
            const email = 'test@example.com';
            const password = 'WrongPassword!';

            const mockUser = {
                id: 'user-1',
                email,
                password: 'hashedPassword',
            };

            mockUserRepository.findOne.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            const result = await service.validateUser(email, password);

            expect(result).toBeNull();
        });
    });

    describe('findOrCreateGoogleUser', () => {
        it('should create new user if Google user does not exist', async () => {
            const profile = {
                id: 'google-123',
                emails: [{ value: 'newuser@example.com' }],
                name: { givenName: 'New', familyName: 'User' },
                photos: [{ value: 'https://example.com/photo.jpg' }],
            };

            const mockUser = {
                id: 'user-1',
                email: 'newuser@example.com',
                googleId: 'google-123',
                firstName: 'New',
                lastName: 'User',
                role: UserRole.USER,
                profilePicture: 'https://example.com/photo.jpg',
            };

            mockUserRepository.findOne.mockResolvedValue(null);
            mockUserRepository.create.mockReturnValue(mockUser);
            mockUserRepository.save.mockResolvedValue(mockUser);
            mockJwtService.sign.mockReturnValue('jwt-token');

            const result = await service.findOrCreateGoogleUser(profile, 'access-token', 'refresh-token');

            expect(mockUserRepository.findOne).toHaveBeenCalledTimes(2);
            expect(mockUserRepository.create).toHaveBeenCalledWith({
                email: 'newuser@example.com',
                googleId: 'google-123',
                googleAccessToken: 'access-token',
                googleRefreshToken: 'refresh-token',
                firstName: 'New',
                lastName: 'User',
                profilePicture: 'https://example.com/photo.jpg',
                role: UserRole.USER,
            });
            expect(result.accessToken).toBe('jwt-token');
        });

        it('should update tokens if Google user already exists', async () => {
            const profile = {
                id: 'google-123',
                emails: [{ value: 'existing@example.com' }],
                name: { givenName: 'Existing', familyName: 'User' },
                photos: [{ value: 'https://example.com/photo.jpg' }],
            };

            const existingUser = {
                id: 'user-1',
                email: 'existing@example.com',
                googleId: 'google-123',
                firstName: 'Existing',
                lastName: 'User',
                role: UserRole.USER,
                googleAccessToken: 'old-access-token',
                googleRefreshToken: 'old-refresh-token',
            };

            mockUserRepository.findOne.mockResolvedValue(existingUser);
            mockUserRepository.save.mockResolvedValue({
                ...existingUser,
                googleAccessToken: 'access-token',
                googleRefreshToken: 'refresh-token',
            });
            mockJwtService.sign.mockReturnValue('jwt-token');

            const result = await service.findOrCreateGoogleUser(profile, 'access-token', 'refresh-token');

            expect(mockUserRepository.save).toHaveBeenCalledWith({
                ...existingUser,
                googleAccessToken: 'access-token',
                googleRefreshToken: 'refresh-token',
            });
            expect(result.accessToken).toBe('jwt-token');
        });

        it('should link Google account to existing email user', async () => {
            const profile = {
                id: 'google-123',
                emails: [{ value: 'existing@example.com' }],
                name: { givenName: 'Existing', familyName: 'User' },
                photos: [{ value: 'https://example.com/photo.jpg' }],
            };

            const existingUser = {
                id: 'user-1',
                email: 'existing@example.com',
                password: 'hashedPassword',
                firstName: 'Existing',
                lastName: 'User',
                role: UserRole.USER,
                profilePicture: null,
            };

            mockUserRepository.findOne
                .mockResolvedValueOnce(null) // First call for googleId
                .mockResolvedValueOnce(existingUser); // Second call for email

            mockUserRepository.save.mockResolvedValue({
                ...existingUser,
                googleId: 'google-123',
                googleAccessToken: 'access-token',
                googleRefreshToken: 'refresh-token',
                profilePicture: 'https://example.com/photo.jpg',
            });
            mockJwtService.sign.mockReturnValue('jwt-token');

            const result = await service.findOrCreateGoogleUser(profile, 'access-token', 'refresh-token');

            expect(mockUserRepository.save).toHaveBeenCalledWith({
                ...existingUser,
                googleId: 'google-123',
                googleAccessToken: 'access-token',
                googleRefreshToken: 'refresh-token',
                profilePicture: 'https://example.com/photo.jpg',
            });
            expect(result.accessToken).toBe('jwt-token');
        });
    });

    describe('findById', () => {
        it('should return user by id', async () => {
            const mockUser = {
                id: 'user-1',
                email: 'test@example.com',
                firstName: 'Test',
                lastName: 'User',
            };

            mockUserRepository.findOne.mockResolvedValue(mockUser);

            const result = await service.findById('user-1');

            expect(mockUserRepository.findOne).toHaveBeenCalledWith({ where: { id: 'user-1' } });
            expect(result).toEqual(mockUser);
        });

        it('should return null if user not found', async () => {
            mockUserRepository.findOne.mockResolvedValue(null);

            const result = await service.findById('nonexistent');

            expect(result).toBeNull();
        });
    });
});
