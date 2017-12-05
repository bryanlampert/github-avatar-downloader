require('dotenv').config();
var request = require('request');
var authToken = process.env.GITHUB_TOKEN;
var fs = require('fs');
var owner = process.argv[2];
var repo = process.argv[3];

console.log('Welcome to the GitHub Avatar Downloader!');

// Function to check if user had entered an owner and repo name
function checkInput(rOwner, rName) {
  if (rOwner === undefined || rOwner === '' || rOwner === ' ') {
    console.log("Please enter a valid owner and repo!");
  } else if (rName === undefined || rName === '' || rName === ' ') {
    console.log("Please enter a valid owner and repo!");
  } else {
    return true;
  }
}

//Checks if the avatars directory exists; if not, creates the directory
fs.access("./avatars", function(err) {
  if (err) {
    fs.mkdir("./avatars");
  }
});

fs.access(".env", function(err) {
  if (err) {
    console.log("No .env file found!");
    return;
  }
});

//Function to error handle for missing or incorrect .env file/information
function checkEnvInfo(envFile) {
  if (envFile === undefined || envFile === '' || envFile === ' ' || typeof(envFile) !== 'string') {
    return console.log("Please enter a valid key!");
  } else {
    return true;
  }
}

// Function to error handle if too many inputs were given
function checkArgs() {
  if (process.argv.length > 4) {
    console.log("Too many inputs!");
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
      'Authorization': 'token ' + authToken
    }
  };

  // Checks if owner/repo exists
  request(options, function(err, res, body) {
    if (res.statusCode !== 404) {
      cb(err, JSON.parse(body));
    } else {
      console.log("Please provide an actual owner/repo!");
    }
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

/* Error Checking above functions
If true, then executes the getRepoContributors function and downloadImageByURL function */
if (checkInput(owner, repo) && checkEnvInfo(authToken) && checkArgs() ) {
  getRepoContributors(owner, repo, function(err, result) {
    if (result.message !== 'Bad credentials') {
      if (err === null) {
        console.log("No errors encountered!");
      }
      for (var i = 0; i < result.length; i++) {
        downloadImageByURL(result[i].avatar_url, "avatars/" + result[i].login + ".jpg");
      }
    } else {
      console.log("Bad credentials!");
      return;
    }
  });
}
