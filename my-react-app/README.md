# Home Assessment Tool

A React application for home value assessment and investment analysis. This tool helps users find property information, analyze potential investments, and make informed real estate decisions.

## Features

- Address autocomplete using Google Places API
- Property search with detailed information
- Automatic county detection
- Investment analysis with key metrics (IRR, cash-on-cash return, cap rate)
- Property comparisons
- Commute time analysis

## Available Scripts

In the project directory, you can run:

### `npm start`

Starts the development server in a controlled manner, preventing multiple server instances.

### `npm run stop`

Stops the development server if one is running.

### `npm run restart`

Restarts the development server.

### `npm run status`

Checks the status of the development server.

### `npm run build`

Builds the app for production to the `build` folder.

### `npm test`

Launches the test runner in the interactive watch mode.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

## Server Management

The application includes a server management system to prevent multiple development servers from running simultaneously. This is implemented through the `server-manager.sh` script which:

1. Checks for existing development servers
2. Stops any old servers
3. Starts a new server or reuses an existing one

The script maintains a PID file (.react-server.pid) to track the running server and can detect servers running on port 3000 even if not started through the script.

## Configuration

The app requires the following environment variables:

- `REACT_APP_GOOGLE_MAPS_API_KEY`: Your Google Maps API key for Places, Geocoding, and Directions APIs

## Dependencies

- React 19
- react-toastify for user notifications
- Google Maps JavaScript API (loaded via script tag)