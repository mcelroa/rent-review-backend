# Rent Review Backend

A REST API for a rental property review platform. Users can sign up, verify their email, add rental properties, and leave 1–5 star reviews on them.

Built with **Node.js**, **Express**, and **MongoDB** (Mongoose).

## Features

- **Authentication**: signup and signin with JWT, with salted, hashed passwords
- **Email verification**: new accounts get a verification link through the [Brevo](https://www.brevo.com/) email API and can't sign in until they're verified
- **Properties**: create, list, search (by address or city), view, and delete
- **Reviews**: add reviews to a property, list a property's reviews, and delete your own reviews
- **Ownership checks**: only the user who created a property or review can delete it
- **Input validation**: signup fields are checked with `express-validator`
- **Rate limiting**: 100 requests per IP every 15 minutes
- **Logging**: every request is logged with Winston to the console and to `logs/app.log`, plus Morgan dev logs

## Tech Stack

| Layer          | Tools                                      |
| -------------- | ------------------------------------------ |
| Runtime        | Node.js                                    |
| Framework      | Express 4                                  |
| Database       | MongoDB with Mongoose 8                    |
| Auth           | `jsonwebtoken`, `express-jwt`              |
| Email          | Brevo transactional email API (via `axios`) |
| Validation     | `express-validator`                        |
| Security       | `express-rate-limit`, `cors`               |
| Logging        | `winston`, `morgan`                        |

## Getting Started

### Prerequisites

- Node.js 18 or later
- A MongoDB database (local, or a hosted one like MongoDB Atlas)
- A Brevo account and API key for sending verification emails

### Installation

```bash
git clone <your-repo-url>
cd rent-review-backend
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>/<db>
JWT_SECRET=your_jwt_secret
BREVO_API_KEY=your_brevo_api_key
FRONTEND_URI=http://localhost:3000
PORT=5000
```

| Variable        | Description                                                          |
| --------------- | -------------------------------------------------------------------- |
| `MONGO_URI`     | MongoDB connection string                                            |
| `JWT_SECRET`    | Secret used to sign and verify JWTs                                  |
| `BREVO_API_KEY` | Brevo API key for sending verification emails                        |
| `FRONTEND_URI`  | Base URL of the frontend, used to build the email verification link  |
| `PORT`          | Port the server listens on (defaults to `5000`)                      |

### Run the Server

```bash
npm start
```

This starts the server with `nodemon`, which reloads it when files change. The API is served at `http://localhost:5000/api`.

## API Reference

All routes are prefixed with `/api`. For protected routes, send the JWT returned by `/signin` in the `Authorization` header:

```
Authorization: Bearer <token>
```

Protected routes also take the signed-in user's ID as `:userId` in the URL, and it has to match the ID in the token.

### Auth

| Method | Endpoint   | Auth | Description                                   |
| ------ | ---------- | ---- | --------------------------------------------- |
| POST   | `/signup`  | No   | Register a new user and send a verification email |
| POST   | `/signin`  | No   | Sign in and receive a JWT (email must be verified) |
| GET    | `/signout` | No   | Clear the auth cookie                         |

**Signup body**

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123"
}
```

Passwords must be at least 6 characters long and contain a number.

**Signin response**

```json
{
  "token": "<jwt>",
  "user": { "_id": "...", "email": "jane@example.com", "name": "Jane Doe", "role": 0 }
}
```

### Email Verification

| Method | Endpoint                 | Auth | Description                  |
| ------ | ------------------------ | ---- | ---------------------------- |
| GET    | `/verify-email/:userId`  | No   | Mark the user's email as verified |

### Properties

| Method | Endpoint                          | Auth | Description                                         |
| ------ | --------------------------------- | ---- | --------------------------------------------------- |
| GET    | `/properties?search=<term>`       | No   | List all properties, optionally filtered by address or city (case-insensitive) |
| GET    | `/property/:propertyId`           | No   | Get a single property                               |
| POST   | `/property/:userId`               | Yes  | Create a property                                   |
| DELETE | `/property/:propertyId/:userId`   | Yes  | Delete a property (creator only)                    |

**Create property body**

```json
{
  "address": "123 Main St",
  "city": "Dublin"
}
```

### Reviews

| Method | Endpoint                      | Auth | Description                          |
| ------ | ----------------------------- | ---- | ------------------------------------ |
| GET    | `/reviews/:propertyId`        | No   | List reviews for a property          |
| POST   | `/review/:userId`             | Yes  | Create a review                      |
| DELETE | `/review/:reviewId/:userId`   | Yes  | Delete a review (author only)        |

**Create review body**

```json
{
  "propertyId": "<property id>",
  "rating": 4,
  "comment": "Great landlord, quick to fix issues."
}
```

`rating` must be a whole number from 1 to 5.

## Data Models

**User**: `name`, `email` (unique), `hashed_password`, `salt`, `role` (default `0`), `isVerified` (default `false`), timestamps

**Property**: `address`, `city`, `addedBy` (ref: User), `createdAt`

**Review**: `property` (ref: Property), `user` (ref: User), `rating` (1–5), `comment`, `createdAt`

## Project Structure

```
rent-review-backend/
├── app.js                 # App entry point: middleware, routes, DB connection
├── controllers/           # Route handlers
│   ├── auth.js            # Signup, signin, signout, JWT middleware
│   ├── mailer.js          # Brevo email sending and email verification
│   ├── property.js
│   ├── review.js
│   └── user.js
├── helpers/
│   └── dbErrorHandler.js  # Turns MongoDB errors into readable messages
├── models/                # Mongoose schemas
│   ├── property.js
│   ├── review.js
│   └── user.js
├── routes/                # Express routers
│   ├── auth.js
│   ├── mailer.js
│   ├── property.js
│   └── review.js
├── utils/
│   └── logger.js          # Winston logger config
└── validator/
    └── index.js           # Signup validation rules
```

Request logs are written to `logs/app.log` at runtime. The `logs/` directory is git-ignored.

## Error Responses

Errors come back as JSON with an `error` field (or `message` for the email verification route):

```json
{ "error": "Property not found" }
```

When the rate limit is exceeded, the API responds with HTTP `429`:

```json
{ "error": "You have exceeded the request limit. Try again later." }
```

## License

ISC
