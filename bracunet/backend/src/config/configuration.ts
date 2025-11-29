export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/bracunet',
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret',
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || 'your_google_client_id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'your_google_client_secret',
  },
  linkedin: {
    clientId: process.env.LINKEDIN_CLIENT_ID || 'your_linkedin_client_id',
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET || 'your_linkedin_client_secret',
  },
  stripe: {
    apiKey: process.env.STRIPE_API_KEY || 'your_stripe_api_key',
  },
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY || 'your_sendgrid_api_key',
  },
});