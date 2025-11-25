import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class GoogleCalendarService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}

    private getOAuth2Client(accessToken: string, refreshToken: string) {
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_CALLBACK_URL,
        );

        oauth2Client.setCredentials({
            access_token: accessToken,
            refresh_token: refreshToken,
        });

        return oauth2Client;
    }

    async listEvents(userId: string, maxResults: number = 10) {
        const user = await this.userRepository.findOne({ where: { id: userId } });

        if (!user || !user.googleAccessToken) {
            throw new Error('User not authenticated with Google');
        }

        const auth = this.getOAuth2Client(user.googleAccessToken, user.googleRefreshToken);
        const calendar = google.calendar({ version: 'v3', auth });

        try {
            const response = await calendar.events.list({
                calendarId: 'primary',
                timeMin: new Date().toISOString(),
                maxResults,
                singleEvents: true,
                orderBy: 'startTime',
            });

            return response.data.items || [];
        } catch (error) {
            console.error('Error fetching calendar events:', error);
            throw error;
        }
    }

    async createEvent(userId: string, eventData: any) {
        const user = await this.userRepository.findOne({ where: { id: userId } });

        if (!user || !user.googleAccessToken) {
            throw new Error('User not authenticated with Google');
        }

        const auth = this.getOAuth2Client(user.googleAccessToken, user.googleRefreshToken);
        const calendar = google.calendar({ version: 'v3', auth });

        try {
            const response = await calendar.events.insert({
                calendarId: 'primary',
                requestBody: eventData,
            });

            return response.data;
        } catch (error) {
            console.error('Error creating calendar event:', error);
            throw error;
        }
    }

    async updateEvent(userId: string, eventId: string, eventData: any) {
        const user = await this.userRepository.findOne({ where: { id: userId } });

        if (!user || !user.googleAccessToken) {
            throw new Error('User not authenticated with Google');
        }

        const auth = this.getOAuth2Client(user.googleAccessToken, user.googleRefreshToken);
        const calendar = google.calendar({ version: 'v3', auth });

        try {
            const response = await calendar.events.update({
                calendarId: 'primary',
                eventId,
                requestBody: eventData,
            });

            return response.data;
        } catch (error) {
            console.error('Error updating calendar event:', error);
            throw error;
        }
    }

    async deleteEvent(userId: string, eventId: string) {
        const user = await this.userRepository.findOne({ where: { id: userId } });

        if (!user || !user.googleAccessToken) {
            throw new Error('User not authenticated with Google');
        }

        const auth = this.getOAuth2Client(user.googleAccessToken, user.googleRefreshToken);
        const calendar = google.calendar({ version: 'v3', auth });

        try {
            await calendar.events.delete({
                calendarId: 'primary',
                eventId,
            });

            return { success: true };
        } catch (error) {
            console.error('Error deleting calendar event:', error);
            throw error;
        }
    }
}
