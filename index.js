/* eslint-disable max-len */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
import express from 'express';
import { read, add } from './jsonFileStorage.js';

const app = express();

// Set view engine
app.set('view engine', 'ejs');

/* We bind request-processing middleware like express.urlencoded to Express before our routes. This configures Express to process requests using that middleware before we handle those requests in our routes */
app.use(express.urlencoded({ extended: false }));

const handleSightingIndexRequest = (request, response) => {
  read('data.json', (err, data) => {
    const content = `
      <html>
        <body>
          <h1> UFO Sighting </h1>
            <p>Text: ${(data.sightings[request.params.index].text)} <br><br>
            Date and Time: ${(data.sightings[request.params.index].date_time)} <br><br>
            City: <br> ${(data.sightings[request.params.index].city)}<br><br>
            State: <br> ${(data.sightings[request.params.index].state)}<br><br>
            Shape: <br> ${(data.sightings[request.params.index].shape)}<br><br>
            Duration: <br> ${(data.sightings[request.params.index].duration)}<br><br>
            Summary: <br> ${(data.sightings[request.params.index].summary)}<br><br>
            <a href="/">Back to Main Page</a>

            </p>
        </body>
      </html>
    `;
    response.send(content);
  });
};

// const handleYearRequest = (request, response) => {
//   read('data.json', (err, data) => {
//     console.log(typeof (request.params.year));

//     const yearString = String(request.params.year);

//     const yearSightings = [];

//     for (const i in data.sightings) {
//       const yearEntry = data.sightings[i].YEAR;

//       console.log(`yearEntry is ${typeof (yearEntry)}`);

//       if (typeof (yearEntry) === 'string' && yearEntry.includes(yearString)) {
//         const yearObject = {
//           year: yearEntry,
//           state: data.sightings[i].STATE,
//         };
//         console.log(yearObject);
//         yearSightings.push(yearObject);
//       }
//     }

//     response.send(yearSightings);
//   });
// };

// function handleYearIndex(request, response) {
//   // Obtain data to inject into EJS template
//   // data must be in the form of an object
//   read('data.json', (err, data) => {
//     const yearArray = [];

//     for (const i in data.sightings) {
//       const yearEntry = data.sightings[i].YEAR;

//       console.log(`yearEntry is ${typeof (yearEntry)}`);

//       if (typeof (yearEntry) === 'string' && !yearArray.includes(yearEntry) && yearEntry.length === 4) {
//         yearArray.push(yearEntry);
//         console.log(yearArray);
//       }
//     }
//     const content = { yearMenu: yearArray };
//     response.render('yearMenu', content);
//     // response.send(yearArray);
//   });
// }

function handleAllSightings(request, response) {
  // Obtain data to inject into EJS template
  // data must be in the form of an object
  read('data.json', (err, data) => {
    const content = { allSightings: data.sightings };
    console.log(`length of sightings data is ${data.sightings.length}`);
    response.render('allSightings', content);
  });
}

// Render the form to input new recipes
app.get('/sighting', handleAllSightings);

app.post('/sighting', (request, response) => {
  // Add new recipe data in request.body to recipes array in data.json.

  add('data.json', 'sightings', request.body, (err) => {
    if (err) {
      response.status(500).send('DB write error.');
      return;
    }
    // Acknowledge recipe saved.
    // response.send('Saved sighting!');

    read('data.json', (err, data) => {
      console.log(`length of sightings data is ${data.sightings.length}`);
      const newIndex = data.sightings.length - 1;
      response.redirect(`/sighting/${newIndex}`);
    });
  });
});

app.get('/', handleAllSightings);

app.get('/sighting/:index', handleSightingIndexRequest);

// app.get('/year-sightings', handleYearIndex);

// app.get('/year-sightings/:year', handleYearRequest);

app.listen(3004);
