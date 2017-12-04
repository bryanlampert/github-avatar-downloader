var request = require('request');
var authToken = require('./secrets.js');
var fs = require('fs');
var owner = process.argv[2];
var repo = process.argv[3];

console.log('Welcome to the GitHub Avatar Downloader!');

// Function to check if user had entered an owner and repo name
function checkInput(rOwner, rName) {
  if (rOwner === undefined || rOwner === '' || rOwner === ' ') {
    return false;
  } else if (rName === undefined || rName === '' || rName === ' ') {
    return false;
  } else {
    return true;
  }
}

//Function to receive the repo and parses the info
function getRepoContributors(repoOwner, repoName, cb) {

  var options = {
    url: "https://api.github.com/repos/" + repoOwner + "/" + repoName + "/contributors",
    headers: {
      'User-Agent': 'request',
      'Authorization': 'token ' + authToken.GITHUB_TOKEN
    }
  };

  request(options, function(err, res, body) {
    cb(err, JSON.parse(body));
  });
}

/* Function to download the images from the urls.
Also logs the image that is being downloaded */
function downloadImageByURL(url, filePath) {
  request.get(url)
    .on('error', function(err) {
      throw err;
    })
    .on('response', function(response) {
      console.log('Downloading image:', url);
    })
    .pipe(fs.createWriteStream(filePath))
    .on('finish', function(finish){
      console.log('Download complete for image:', url);
    });
}

/* Conditional to check if valid input was received.
If true, then executes the getRepoContributors function and downloadImageByURL function
If false, log returns looking for valid input */
if (checkInput(owner, repo)) {
  getRepoContributors(owner, repo, function(err, result) {
    console.log("Errors:", err);
    for (var i = 0; i < result.length; i++) {
      downloadImageByURL(result[i].avatar_url, "avatars/" + result[i].login + ".jpg");
    }
  });
} else {
  return console.log("Please enter a valid owner and repo!");
}
