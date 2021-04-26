const express = require('express');
const url = require('url');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const port = 4040;

const app = express();

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use((req, res, next) =>  {
  res.locals.url = req.originalUrl;
  next();
});

app.get('/', (req, res) => {
  res.render('pages/index');
});

const multerConfig = {
  storage: multer.diskStorage({
    destination: (req, file, next) => {
      next(null, './public/uploads');
    },
    // specify the filename to be unique
    filename: (req, file, next) => {
      // get the file mimetype ie 'image/jpeg' split and prefer the second value ie 'jpeg'
      const ext = file.mimetype.split('/')[1];
      // set the file fieldname to a unique name
      next(null, `${file.fieldname}-${Date.now()}.${ext}`);
    }
  }),

  // filter out and prevent non-image files
  fileFilter: (req, file, next) => {
    if (file) {
      const image = file.mimetype.startsWith('image/');
      if (image) {
        next(null, true);
        return;
      }
    }
    const error = new Error(`Error 415: unsupported Media Type`);
    error.statusCode = 415;
    return next(error);
  }
};

const upload = multer(multerConfig).single('file');

const fullUrl = (req) => {
  return url.format({
    protocol: req.protocol,
    host: req.get('host')
  });
}

app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      const error = new Error(`A Multer error occurred when uploading`);
      return next(error);
    } else if (err) {
      const error = new Error(`An unknown error occurred when uploading`);
      return next(error);
    }
    const files = fs.readdirSync(__dirname + '/public/uploads');
    const { filename, originalname, size } = req.file;
    const imgPath = fullUrl(req) + '/uploads/';
    res.render('pages/success', { files, filename, originalname, size, imgPath });
  });
  
});

app.get('/uploads/file-(*)?', (req, res) => {
  res.write('ok');
});

/*////////////////*/
/* Error handling */
/*////////////////*/

// page not found (404)
app.get('/not-found', (req, res) => {
  res.status(404);
  res.send(`
    <h3>Page not found</h3>
    <p>Unable to access this page.</p>
    <p><a href="/">Upload again</a></p>
  `);
});

app.get('*', (req, res, next) => {
  const error = new Error(`${req.ip} tried to access ${req.originalUrl}`);
  error.statusCode = 302;
  next(error);
});

app.use((error, req, res, next) => {
  if (!error.statusCode) error.statusCode = 500;
  if (error.statusCode === 302) {
    return res.status(302).redirect('/not-found');
  }
  res.status(error.statusCode);
  res.send('Error: ' + error.toString());
});

app.listen(port, () => {
  console.log('Listening on port', port);
});