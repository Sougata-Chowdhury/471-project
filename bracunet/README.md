# BracuNet - University Alumni Platform

BracuNet is a university alumni platform designed to connect alumni, facilitate networking, and provide resources for career development. This project utilizes a modern tech stack, including Nest.js for the backend, React with TailwindCSS for the frontend, and MongoDB as the database.

## Project Structure

The project is organized into three main directories:

- **backend**: Contains the Nest.js application for handling server-side logic, authentication, and database interactions.
- **frontend**: Contains the React application for the user interface, built with TailwindCSS for styling.
- **infra**: Contains infrastructure-related files for Docker and Kubernetes deployments.

## Tech Stack

- **Backend**: Nest.js, MongoDB
- **Frontend**: React, TailwindCSS
- **Integrations**: Google OAuth, LinkedIn OAuth, Stripe for payments, SendGrid for email notifications

## Functional Requirements

1. **User Authentication**: Users can register, log in, and manage their profiles.
2. **Alumni Management**: Alumni can create profiles, connect with other alumni, and share updates.
3. **Event Management**: Users can create and manage events for alumni gatherings.
4. **Job Postings**: Alumni can post job opportunities and apply for jobs.
5. **Notifications**: Users receive notifications for events, job postings, and messages.

## Getting Started

### Backend

1. Navigate to the `backend` directory.
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on the `.env.example` file and configure your environment variables.
4. Start the server:
   ```
   npm run start:dev
   ```

### Frontend

1. Navigate to the `frontend` directory.
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on the `.env.example` file and configure your environment variables.
4. Start the development server:
   ```
   npm start
   ```

## Deployment

The project can be deployed using Docker or Kubernetes. Refer to the `infra` directory for Docker Compose and Kubernetes configuration files.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.