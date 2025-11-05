import { NewsApiService } from './news-api.service';
import { UserRepository } from '../../../user/infrastructure/repositories/user.repository';

export class CacheUpdateService {
    private newsApiService: NewsApiService;
    private userRepository: UserRepository;
    private updateInterval: number;
    private intervalId: NodeJS.Timeout | null = null;

    constructor(newsApiService: NewsApiService, updateIntervalMinutes: number = 15) {
        this.newsApiService = newsApiService;
        this.userRepository = new UserRepository();
        this.updateInterval = updateIntervalMinutes * 60 * 1000; // Convert to milliseconds
    }

    /**
     * Start periodic cache updates
     */
    start(): void {
        console.log(`Starting cache update service with interval: ${this.updateInterval / 1000 / 60} minutes`);
        
        // Run immediately on start
        this.updateCache();

        // Then run periodically
        this.intervalId = setInterval(() => {
            this.updateCache();
        }, this.updateInterval);
    }

    /**
     * Stop periodic cache updates
     */
    stop(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log('Cache update service stopped');
        }
    }

    /**
     * Update cache for common preferences and general news
     */
    private async updateCache(): Promise<void> {
        try {
            console.log('Starting cache update...');
            
            const commonPreferences = [
                [],
                ['technology'],
                ['business'],
                ['health'],
                ['science'],
                ['sports'],
                ['entertainment'],
                ['general']
            ];

            // Update cache for each preference set
            for (const preferences of commonPreferences) {
                try {
                    await this.newsApiService.getNewsByPreferences(preferences);
                    console.log(`Cache updated for preferences: ${preferences.length === 0 ? 'general' : preferences.join(', ')}`);
                } catch (error) {
                    console.error(`Error updating cache for preferences ${preferences.join(', ')}:`, error);
                }
            }

            // Clean up expired cache entries
            const cacheService = this.newsApiService.getCacheService();
            await cacheService.clearExpiredEntries();

            console.log('Cache update completed');
        } catch (error) {
            console.error('Error in cache update service:', error);
        }
    }
}

