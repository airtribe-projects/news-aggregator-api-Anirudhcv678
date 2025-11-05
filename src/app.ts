import express from 'express';
import type { Request, Response, NextFunction, Express } from 'express';
import mongoose from 'mongoose';
import routes from './routes.ts/index';

const app: Express = express();
const port: number = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', routes);

// Error handling middleware - must be after routes
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err);
    if (!res.headersSent) {
        res.status(500).json({ error: 'Internal server error', message: err.message });
    }
});

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
    mongoose.connect('mongodb://localhost:27017/news-aggregator')
        .then(() => {
            console.log('Connected to MongoDB');
            app.listen(port, (err?: Error): void => {
                if (err) {
                    return console.log('Something bad happened', err);
                }
                console.log(`Server is listening on ${port}`);
            });
        })
        .catch(err => {
            console.error('Failed to connect to MongoDB', err);
            process.exit(1);
        });
} else {
    // In test environment, connect to MongoDB but don't start server
    mongoose.connect('mongodb://localhost:27017/news-aggregator')
        .then(() => {
            console.log('Connected to MongoDB (test mode)');
        })
        .catch(err => {
            console.error('Failed to connect to MongoDB', err);
        });
}

export default app;

