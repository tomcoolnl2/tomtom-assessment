# Generate clustered markers on a mapbox map

## backend

All backend related files are in the ```backend``` folder.
This node script takes a provided geoJSON object, for now with a fixed zoom level.

I got to the point that I made a difference in markers ready to be clustered.
This means the code doesn't fully solves the problem stated in the assessment.

For now, this code produces an array of FeatureCollections.
The first object inside this array is an array of all features.
Each other object is a FeatureCollection representing a group of markers that are about to be clustered.
This would be the logical next step.

Please see the code, it is provided with comments.
The script produces false data. I made a mistake, but didn't have the time to properly debug and fix it.
The code is not very fast, unfortunately. Please treat it as a draft; it needs a lot of improvement.

## Local setup for the backend

To run locally, you have to have at least one of the latest 2 NodeJS LTS installed.

- Move into the `backend` directory
- Run ```npm install`` inside this folder.
- Then run `npm run dev` to start nodemon and watch for file changes.
- The script produces a json file, outputted inside `backend/build/output.json`.

Processing the data takes a while. It is far from performant.
The code processing and building data is inside `backend/src/index.ts`.

## Local setup for the frontend

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).\
It is used as a representation of the generated data/outcome from the beackend.\
Interaction with the map so far has been disabled to avoid confusion ;)

- light blue markers are solitairy features
- dark blue means it is withing a clster
Forgive me that I couldn't make it clearer.

- Move into the `frontend` directory
- Run `npm install` inside this folder.
- Run `npm start`, wich runs the app in the development mode.
- [http://localhost:3000](http://localhost:3000) will automatically open the browser, that refreshed on file changes.

This frontend app imports data that I manually copied into it.\
A very logical next step would be to either load it through a ajax request, or let the backend generate it and put it inside the frontend application.

- Run `npm run build`, wich runs the app in the development mode.

### Next steps

- A next step is to isolate solitary features
- A next step would be generate data for a set or even all zoom levels, so it is pre processerd
- A next step would be to calculate the clusterd point center, and make a point out of that.
- Another next step could be: wrapping this project in a Docker container, so a user who wants to set this up locally doesn't have to upgrade his/her system to run the proper version of NodeJS. For times' sake, this was omitted.
- A next step is to write unit tests to support and clarify my code. Especially the backend part.
