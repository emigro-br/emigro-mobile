# Emigro Mobile

## Overview

Interface developed with React Native + Typescript, to consume Emigro API. Creating, logging users and making payments between users.

## Powered by

- React Native.
- Typescript.
- Jest.
- React Testing Library

## How to run it

1. You've to install it with npm ci/install
2. You've to populate the .env file using the .env.dist file as a guide
3. Then, you can execute `npm run start`

## How to run unit & integration tests

Jest: Execute `npm run test`

### Environment variables

#### Database

| Variable              | Description                                 | URL
| -------------         | ---------------------                       | ---------------------
| `BACKEND_URL`         | Backend Url where Emigro API is consumed.   | 
| `GEOCODE_BASE_URL`    | Base URL for geocoding requests.            | [https://nominatim.openstreetmap.org/search](https://nominatim.openstreetmap.org/search)
