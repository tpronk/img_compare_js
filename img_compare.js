// Reproduces PychoPy's RMS method for comparing the similary of two pictures
// https://github.com/psychopy/psychopy/blob/810ac6bfa8945bb62d9142abd592a2267d3fc936/psychopy/tests/utils.py#L31
// Requires two PNG files of the same height and width: left.png and right.png

// Thomas Pronk, pronkthomas@gmail.com, 2020-07-08

// Dependencies
const PNG = require('pngjs').PNG;
const fs = require('fs');
const Math = require('mathjs')

// SD of difference scores
// Based on https://en.wikipedia.org/wiki/Algorithms_for_calculating_variance#Na%C3%AFve_algorithm
let sdOfDifferences = function (left, right) {
  let sum = 0, sumSq = 0, dif;
  for (let i = 1; i < left.length; i++ ) {
    dif = left[i] - right[i];
    sum += dif;
    sumSq += dif * dif;
  }
  return Math.sqrt((sumSq - (sum * sum) / left.length) / left.length);
};

// Convert PNG to 1-dimensional array, dropping alpha channel
// Adapted from: https://www.npmjs.com/package/pngjs
let convertPNG = function (png) {    
  let result = [];
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      var idx = (png.width * y + x) << 2;
      result.push(png.data[idx]);
      result.push(png.data[idx + 1]);
      result.push(png.data[idx + 2]);
    }
  }
  return result;
};

// Wrap PNG parser with a Promise and drop alpha channel
let readPNG = async function(filename) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(filename)
      .pipe(
        new PNG({
          filterType: 0
        })
      )
      .on("parsed", function () {
        data = convertPNG(this);
        resolve(data);
      });
  });
};

// Run tests
runTests = async function() {
  // *** Read images
  expDat = await readPNG("left.png");
  imgDat = await readPNG("right.png");
  
  // *** Output of tests
  // Expected output based on:
  // https://thomaspronk.com/resources/img_compare/left.png
  // https://thomaspronk.com/resources/img_compare/right.png

  // Should output: [ 88, 81, 71, 87 ] <- RGB of first pixel, R of second pixel
  console.log("RGB values of first four elements:", expDat.slice(0, 4));
  // Should output: 7372800 <- 3 * 2457600 pixels
  console.log("Length of expDat: ", expDat.length);
  // Should output: 18.013210727944
  console.log("SD of differences: ", sdOfDifferences(expDat, imgDat));  
};
runTests();
