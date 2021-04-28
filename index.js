const express = require('express');
const url = require('url');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const sharp = require('sharp');
const { v4:uuidv4 } = require('uuid');
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

// add to Multer class
const multerConfig = {
  storage: multer.diskStorage({
    destination: (req, file, next) => {
      next(null, './public/images');
    },
    // specify the filename to be unique
    filename: (req, file, next) => {
      // get file mimetype 'image/jpeg' split and get second value ie 'jpeg'
      const ext = file.mimetype.split('/')[1];
      // set the file fieldname to a unique name
      next(null, `${file.fieldname}-${uuidv4()}.${ext}`);
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

// add to Utils class
const fullUrl = (req) => {
  return url.format({
    protocol: req.protocol,
    host: req.get('host')
  });
}

// add to Utils class
const getPath = (folderName, filename) => {
  const folderPath = path.join(__dirname, `/public/${folderName}`);
  return path.resolve(folderPath + '/' + filename);
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
    
    const { filename, originalname, size } = req.file;
    const imagePath = getPath('images', filename);
    const thumbsPath = getPath('thumbnails', filename);
    
    const angles = { '1':0, '2':0, '3':180, '4':180, '5':90, '6':90, '7':270, '8':270 };

    (async () => {
      try {
        const image = await sharp(imagePath)
        image.metadata()
        .then(metadata => {
          console.log(metadata, metadata.width, metadata.height);
          const angle = angles[String(metadata.orientation)] || 0;
          const thumbSize = 100;
          return image.resize(thumbSize, thumbSize, {
            fit:sharp.fit.cover,
            withoutEnlargement: true
          })
          .rotate(angle)
          .sharpen()
          .toFormat('jpeg')
          .jpeg()
          .toFile(thumbsPath)
        });
        
        let thumbnails = fs.readdirSync(__dirname + '/public/thumbnails');
        thumbnails = thumbnails.filter(item => item !== filename);
        res.render('pages/success', {
          thumbnails, 
          filename,
          originalname, 
          size,
          currentUrl:fullUrl(req)
        });
        // console.log({image});
      } catch (err) {
        console.log({err});
      }
    })();
  });
});

app.get('/images/file-(*)?', (req, res) => {
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