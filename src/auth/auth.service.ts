import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService,
    ) {}

    async register(registerDto: RegisterDto) {
        const { email, password, firstName, lastName } = registerDto;

        // Check if user already exists
        const existingUser = await this.userRepository.findOne({ where: { email } });
        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = this.userRepository.create({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            role: UserRole.USER,
        });

        await this.userRepository.save(user);

        // Generate JWT token
        const payload = { sub: user.id, email: user.email, role: user.role };
        const accessToken = this.jwtService.sign(payload);

        return {
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                profilePicture: user.profilePicture,
            },
        };
    }

    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;

        // Find user by email
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user || !user.password) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Check if user is active
        if (!user.isActive) {
            throw new UnauthorizedException('Account is inactive');
        }

        // Generate JWT token
        const payload = { sub: user.id, email: user.email, role: user.role };
        const accessToken = this.jwtService.sign(payload);

        return {
            accessToken,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                profilePicture: user.profilePicture,
            },
        };
    }

    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.userRepository.findOne({ where: { email } });
        if (user && user.password && await bcrypt.compare(password, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async findOrCreateGoogleUser(profile: any, accessToken: string, refreshToken: string) {
        const { id, emails, name, photos } = profile;
        const email = emails[0].value;

        let user = await this.userRepository.findOne({ where: { googleId: id } });

        if (!user) {
            // Check if user with this email already exists
            user = await this.userRepository.findOne({ where: { email } });

            if (user) {
                // Link Google account to existing user
                user.googleId = id;
                user.googleAccessToken = accessToken;
                user.googleRefreshToken = refreshToken;
                user.profilePicture = photos?.[0]?.value || user.profilePicture;
            } else {
                // Create new user
                user = this.userRepository.create({
                    email,
                    googleId: id,
                    googleAccessToken: accessToken,
                    googleRefreshToken: refreshToken,
                    firstName: name.givenName,
                    lastName: name.familyName,
                    profilePicture: photos?.[0]?.value,
                    role: UserRole.USER,
                });
            }
        } else {
            // Update tokens
            user.googleAccessToken = accessToken;
            user.googleRefreshToken = refreshToken;
        }

        await this.userRepository.save(user);

        // Generate JWT token
        const payload = { sub: user.id, email: user.email, role: user.role };
        const jwtToken = this.jwtService.sign(payload);

        return {
            accessToken: jwtToken,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                profilePicture: user.profilePicture,
            },
        };
    }

    async findById(id: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { id } });
    }
}
