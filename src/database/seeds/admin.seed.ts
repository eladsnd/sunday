import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../../entities/user.entity';

export async function seedAdmin(dataSource: DataSource) {
    const userRepository = dataSource.getRepository(User);

    // Check if admin already exists
    const existingAdmin = await userRepository.findOne({
        where: { email: 'admin@sunday.com' },
    });

    if (existingAdmin) {
        console.log('Admin user already exists');
        return;
    }

    // Create default admin user
    const hashedPassword = await bcrypt.hash('Admin123!', 10);

    const admin = userRepository.create({
        email: 'admin@sunday.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: UserRole.ADMIN,
        isActive: true,
    });

    await userRepository.save(admin);

    console.log('Default admin user created successfully');
    console.log('Email: admin@sunday.com');
    console.log('Password: Admin123!');
    console.log('Please change the password after first login!');
}
