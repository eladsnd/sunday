# Authentication System

This document describes the authentication system implemented in Sunday Work OS.

## Features

### 1. Email/Password Authentication
- User registration with email and password
- Secure password hashing using bcrypt (10 rounds)
- JWT-based authentication with 7-day token expiration
- Email validation and password strength requirements (minimum 6 characters)

### 2. Google OAuth Authentication
- Sign in with Google account
- Automatic account creation or linking
- Google Calendar API integration with the following scopes:
  - `email` - Access to user's email
  - `profile` - Access to user's profile information
  - `https://www.googleapis.com/auth/calendar` - Full calendar access
  - `https://www.googleapis.com/auth/calendar.events` - Calendar events management
- Offline access for calendar synchronization

### 3. User Roles
- **User**: Standard user role with access to boards and features
- **Admin**: Administrator role with elevated privileges

### 4. Default Admin Account
A default administrator account is created when running the seed script:
- **Email**: `admin@sunday.com`
- **Password**: `Admin123!`
- **Please change the password after first login!**

## Setup Instructions

### 1. Environment Variables

Copy `.env.example` to `.env` and configure the following variables:

```bash
# JWT Secret (required)
JWT_SECRET=your-very-secure-random-string-here

# Google OAuth (required for Google login)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### 2. Getting Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Google+ API
   - Google Calendar API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure the OAuth consent screen
6. Create OAuth 2.0 Client ID:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:3000/api/auth/google/callback`
7. Copy the Client ID and Client Secret to your `.env` file

### 3. Database Setup

The User entity will be automatically created when you start the application (if `synchronize: true` in development).

To create the default admin user:

```bash
npm run seed
```

### 4. Running the Application

```bash
# Backend
npm run start:dev

# Frontend (in another terminal)
cd client
npm run dev
```

## API Endpoints

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

Response:
```json
{
  "accessToken": "jwt-token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "profilePicture": null
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response: Same as register

#### Google OAuth Login
```http
GET /api/auth/google
```

This will redirect to Google's OAuth consent screen. After authentication, the user will be redirected to:
```
http://localhost:5173/auth/callback?token=<jwt-token>&user=<user-data>
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <jwt-token>
```

Response:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "user",
  "profilePicture": "https://...",
  "isActive": true,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

## Google Calendar Integration

The `GoogleCalendarService` provides the following methods:

### List Events
```typescript
await googleCalendarService.listEvents(userId, maxResults);
```

### Create Event
```typescript
await googleCalendarService.createEvent(userId, {
  summary: 'Meeting',
  start: {
    dateTime: '2025-01-15T10:00:00Z',
    timeZone: 'America/New_York'
  },
  end: {
    dateTime: '2025-01-15T11:00:00Z',
    timeZone: 'America/New_York'
  }
});
```

### Update Event
```typescript
await googleCalendarService.updateEvent(userId, eventId, eventData);
```

### Delete Event
```typescript
await googleCalendarService.deleteEvent(userId, eventId);
```

## Frontend Usage

### Using the Auth Context

```tsx
import { useAuth } from './context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <p>Welcome, {user.firstName}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Protected Routes

Routes are automatically protected in `App.tsx`. Unauthenticated users are redirected to `/login`.

## Security Considerations

1. **JWT Secret**: Use a strong, random secret in production (at least 32 characters)
2. **HTTPS**: Always use HTTPS in production
3. **Password Policy**: Current minimum is 6 characters; consider increasing for production
4. **Token Storage**: Tokens are stored in localStorage; consider using httpOnly cookies for enhanced security
5. **CORS**: Configure `CORS_ORIGIN` to match your frontend URL
6. **Google Credentials**: Keep your Google Client Secret secure and never commit it to version control

## Troubleshooting

### "Invalid credentials" error
- Check that the email and password are correct
- Ensure the user account is active (`isActive: true`)

### Google OAuth not working
- Verify that Google OAuth credentials are correctly set in `.env`
- Check that the redirect URI matches exactly in Google Cloud Console
- Ensure Google Calendar API is enabled in Google Cloud Console

### Token expired
- Tokens expire after 7 days
- User will need to log in again
- Consider implementing refresh tokens for longer sessions

## Future Enhancements

- [ ] Email verification
- [ ] Password reset functionality
- [ ] Two-factor authentication (2FA)
- [ ] Refresh token mechanism
- [ ] Session management
- [ ] Activity logs
- [ ] OAuth with other providers (GitHub, Microsoft, etc.)
