"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const index_1 = __importDefault(require("./src/routes.ts/index"));
// Create a test app without starting the server
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/', index_1.default);
const server = (0, supertest_1.default)(app);
async function testSignup() {
    console.log('Testing signup endpoint...');
    console.log('Connecting to MongoDB...');
    try {
        await mongoose_1.default.connect('mongodb://localhost:27017/news-aggregator');
        console.log('Connected to MongoDB\n');
    }
    catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
    // Test 1: Normal signup
    console.log('1. Testing normal signup...');
    const signupResponse = await server.post('/users/signup').send({
        name: 'Test User',
        email: 'test-signup@example.com',
        password: 'test123'
    });
    console.log('Signup Status:', signupResponse.status);
    console.log('Signup Body:', JSON.stringify(signupResponse.body, null, 2));
    // Test 2: Duplicate email
    console.log('\n2. Testing duplicate email signup...');
    const duplicateResponse = await server.post('/users/signup').send({
        name: 'Another User',
        email: 'test-signup@example.com',
        password: 'test123'
    });
    console.log('Duplicate Status:', duplicateResponse.status);
    console.log('Duplicate Body:', JSON.stringify(duplicateResponse.body, null, 2));
    // Test 3: Missing email
    console.log('\n3. Testing signup with missing email...');
    const missingEmailResponse = await server.post('/users/signup').send({
        name: 'Test User',
        password: 'test123'
    });
    console.log('Missing Email Status:', missingEmailResponse.status);
    console.log('Missing Email Body:', JSON.stringify(missingEmailResponse.body, null, 2));
    // Test 4: Missing password
    console.log('\n4. Testing signup with missing password...');
    const missingPasswordResponse = await server.post('/users/signup').send({
        name: 'Test User',
        email: 'test2@example.com'
    });
    console.log('Missing Password Status:', missingPasswordResponse.status);
    console.log('Missing Password Body:', JSON.stringify(missingPasswordResponse.body, null, 2));
    await mongoose_1.default.disconnect();
    console.log('\nTests completed!');
    process.exit(0);
}
testSignup().catch(err => {
    console.error('Test error:', err);
    process.exit(1);
});
//# sourceMappingURL=test-signup.js.map