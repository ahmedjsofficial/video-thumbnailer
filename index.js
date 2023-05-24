const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Set storage engine for multer
const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, callback) => {
    callback(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Initialize multer upload
const upload = multer({ storage });

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Define route to render the form
app.get('/', (req, res) => {
  res.render('index');
});

// Define route for file upload
app.post('/upload', upload.single('video'), (req, res) => {
  const videoPath = req.file.path;
  const screenshotsPath = './screenshots';

  // Create screenshots directory if it doesn't exist
  if (!fs.existsSync(screenshotsPath)) {
    fs.mkdirSync(screenshotsPath);
  }

  // Generate screenshots using ffmpeg command
  const command = `ffmpeg -i ${videoPath} -ss 00:00:10 -vframes 1 ${screenshotsPath}/thumbnail.png`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(error);
      res.redirect('/error');
      return;
    }

    console.log('Screenshot generated');
    res.redirect('/success');
  });
});

// Route for success page
app.get('/success', (req, res) => {
  res.render('success');
});

// Route for error page
app.get('/error', (req, res) => {
  res.render('error');
});

// Start the server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
