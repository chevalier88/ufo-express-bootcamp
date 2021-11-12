/* eslint-disable max-len */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
import express from 'express';
import methodOverride from 'method-override';
import cookieParser from 'cookie-parser';
import { read, add, write } from './jsonFileStorage.js';

const app = express();

const PORT = 3006;

// Set view engine
app.set('view engine', 'ejs');

/* We bind request-processing middleware like express.urlencoded to Express before our routes. This configures Express to process requests using that middleware before we handle those requests in our routes */
app.use(express.urlencoded({ extended: false }));

// we need this line to tell EJS where to look for static assets like gifs and imgs
app.use(express.static('public'));

// Override POST requests with query param ?_method=PUT to be PUT requests
app.use(methodOverride('_method'));

// bind the Cookie Parser middleware to our Express app like in the following code snippet.
app.use(cookieParser());

const handleSightingIndexRequest = (request, response) => {
  read('data.json', (err, data) => {
    const indexNumber = request.params.index;
    const cookieStatus = 0;
    // request.headers.cookie;
    console.log(cookieStatus);
    const content = {
      sightingIndex: {
        index: indexNumber,
        info: data.sightings[indexNumber],
        cookie: cookieStatus,
      },
    };
    response.render('sightingIndex', content);
  });
};

const handleEditRequest = (request, response) => {
  read('data.json', (err, data) => {
    const indexNumber = request.params.index;
    const content = {
      editIndex: {
        index: indexNumber,
        info: data.sightings[indexNumber],
      },
    };
    response.render('editIndex', content);
  });
};

function handleAllSightings(request, response) {
  // Obtain data to inject into EJS template
  // data must be in the form of an object
  read('data.json', (err, data) => {
    const content = { allSightings: data.sightings };
    console.log(`length of sightings data is ${data.sightings.length}`);
    response.render('allSightings', content);
  });
}

function handleShapes(request, response) {
  // Obtain data to inject into EJS template
  // data must be in the form of an object
  read('data.json', (err, data) => {
    const content = data.sightings;
    const allShapes = [];

    for (const i in content) {
      const shapeEntry = data.sightings[i].shape;

      if (typeof (shapeEntry) === 'string') {
        console.log(shapeEntry);
        allShapes.push(shapeEntry);
      }
    }
    // we also need the shapes to be unique, so we use Set to return a unique array
    const uniqueShapes = [...new Set(allShapes)];

    console.log(uniqueShapes);
    const shapedContent = { shapes: uniqueShapes };
    response.render('allShapes', shapedContent);
  });
}

function handleShapeCategory(request, response) {
  // Obtain data to inject into EJS template
  // data must be in the form of an object
  read('data.json', (err, data) => {
    const content = data.sightings;
    const { shape } = request.params;

    const filteredShapeList = content.filter((item) => item.shape === shape);
    console.log(filteredShapeList);

    const filteredShapeContent = { shapeCat: shape, filteredList: filteredShapeList };

    response.render('shapeCategory', filteredShapeContent);
  });
}

function handleHomepage(request, response) {
  response.render('home');
}

function handleShapeCategoryIndex(request, response) {
  // Obtain data to inject into EJS template
  // data must be in the form of an object
  read('data.json', (err, data) => {
    const content = data.sightings;
    const indexNumber = request.params.index;
    const { shape } = request.params;

    console.log('reading request.params...');
    console.log(request.params);

    const filteredShapeList = content.filter((item) => item.shape === shape);
    console.log('listing the shape category...');
    console.log(filteredShapeList);

    console.log(`shape is ${shape}`);
    console.log(`index is ${indexNumber}`);

    const contentFiltered = {
      sightingIndex: {
        index: indexNumber,
        info: filteredShapeList[indexNumber],
      },
    };

    response.render('sightingIndex', contentFiltered);
  });
}

app.get('/sighting', (request, response) => {
  response.render('sightingForm');
});

app.post('/sighting', (request, response) => {
  setTimeout(() => { add('data.json', 'sightings', request.body, (err) => {
    if (err) {
      response.status(500).send('DB write error.');
      return;
    }
    // Acknowledge recipe saved.
    // response.send('Saved sighting!');

    // redirects back to new sighting index page when done.
    read('data.json', (err, data) => {
      console.log(`length of sightings data is ${data.sightings.length}`);
      const newIndex = data.sightings.length - 1;

      response.redirect(`/sighting/${newIndex}`);
    });
  }); }, 2000);
  // Add new recipe data in request.body to recipes array in data.json.
});

app.get('/', handleAllSightings);

app.get('/sighting/:index', handleSightingIndexRequest);

app.get('/sighting/:index/edit', handleEditRequest);

// edits content of data.json
app.put('/sighting/:index/edit', (request, response) => {
  const { index } = request.params;

  read('data.json', (err, data) => {
    if (err) {
      console.log('read error', err);
    }

    data.sightings[index] = request.body;

    write('data.json', data, () => {
      console.log('file changed');
      response.redirect(`/sighting/${index}`);
    });
  });
});

app.delete('/sighting/:index', (request, response) => {
  // Remove element from DB at given index
  const { index } = request.params;
  read('data.json', (err, data) => {
    data.sightings.splice(index, 1);
    write('data.json', data, (err) => {
      response.redirect('/');
    });
  });
});

app.get('/shapes', handleShapes);

app.get('/shapes/:shape', handleShapeCategory);

app.get('/shapes/:shape/:index', handleShapeCategoryIndex);

app.get('/sighting/:index/favourite', (request, response) => {
  const favouriteIndex = request.params.index;

  response.cookie('favourited', favouriteIndex);
  console.log(`favourite cookie set with Sighting ${favouriteIndex}`);
  response.redirect(`/sighting/${favouriteIndex}`);
  // console.log(request.headers);
  console.log(request.headers.cookie);
});

app.get('/home', handleHomepage);

app.listen(PORT);

console.log(`using Port Number ${PORT}`);

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
