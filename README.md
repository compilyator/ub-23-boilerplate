# Node.js & MongoDB Boilerplate Application

This repository contains a boilerplate Node.js application that uses MongoDB as the database, allowing user registration, login, file uploads, and downloads. The application uses Express.js, Mongoose, bcrypt, JSON Web Tokens (JWT), and Materialize CSS for the front end.

## Features

- **User Authentication**: Users can register, log in, and log out using JWT for secure sessions.
- **File Upload**: Authenticated users can upload files, which are stored in MongoDB with metadata.
- **File List and Download**: Users can view their uploaded files and download them.
- **Responsive Frontend**: Built with Materialize CSS for a responsive and clean user interface.

## Prerequisites

- Node.js (v14 or above)
- npm
- MongoDB (local instance or Atlas)

## Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/compilyator/ub-23-boilerplate.git
   cd ub-23-boilerplate
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables**:

   Create a `.env` file in the root directory with the following:

   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

4. **Run the application**:

   ```bash
   npm start
   ```

   The application will run on `http://localhost:3000`.

## Folder Structure

- **server.js**: Main server file containing all routes and logic.
- **/views**: Contains EJS template files for rendering pages.
- **/uploads**: Stores the uploaded files.

## Routes

### Authentication

- **POST /register**: Register a new user.
- **POST /login**: Log in an existing user and receive a JWT.
- **GET /logout**: Log out the user by clearing the JWT cookie.

### File Operations

- **GET /files**: View a list of uploaded files (requires authentication).
- **POST /upload**: Upload a new file (requires authentication).
- **GET /download/:filename**: Download a file (requires authentication, file must belong to the user).

## Technologies Used

- **Node.js**: JavaScript runtime for server-side development.
- **Express.js**: Web framework for Node.js.
- **MongoDB & Mongoose**: Database and ODM for data storage.
- **bcrypt**: Password hashing.
- **JWT**: JSON Web Tokens for authentication.
- **Materialize CSS**: CSS framework for responsive UI.
- **EJS**: Templating engine for rendering HTML views.

## Usage Notes

- Only authenticated users can upload and view files.
- File uploads are stored in the `/uploads` directory, and metadata is saved in MongoDB.
- Logout clears the JWT cookie, making sure that the user session is ended securely.

## Deployment to Heroku

To deploy this application to Heroku, follow these steps:

1. **Log in to Heroku**:

   If you haven't logged in yet, you can do so using the Heroku CLI:

   ```bash
   heroku login
   ```

2. **Create a new Heroku application**:

   Run the following command to create a new Heroku app:

   ```bash
   heroku create ub-23-boilerplate
   ```

   This will create a new Heroku app and give you a URL where your app will be hosted.

3. **Add MongoDB to your Heroku app**:

   You can use a cloud-hosted MongoDB service like MongoDB Atlas. Alternatively, you can add the `mLab` or `MongoDB Atlas` add-on if it's available:

   ```bash
   heroku addons:create mongolab
   ```

   This will add a MongoDB instance to your Heroku app and set the `MONGODB_URI` environment variable.

4. **Set environment variables**:

   Set the `JWT_SECRET` and any other environment variables your application needs:

   ```bash
   heroku config:set JWT_SECRET=your_jwt_secret_key
   ```

5. **Push the code to Heroku**:

   Commit all your changes and push the code to Heroku:

   ```bash
   git add .
   git commit -m "Prepare for Heroku deployment"
   git push heroku main
   ```

   If your branch is named something other than `main`, replace `main` with your branch name.

6. **Open the application**:

   Once the deployment is complete, open the application in your browser:

   ```bash
   heroku open
   ```

   The application will now be running on the Heroku-provided URL.

## License

This project is open source and available under the [MIT License](LICENSE).

## Contributing

Feel free to open issues or create pull requests if you would like to contribute or find any problems.

## Acknowledgements

- [Materialize CSS](https://materializecss.com) for the frontend styling.
- [Express.js](https://expressjs.com) and [Mongoose](https://mongoosejs.com) for backend development.

