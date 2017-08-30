var glob = require('glob'),
    nodeCSVtoJSON = require("node-csv-json"),
    mongodb = require('mongodb'),
    fs = require('fs'),
    MongoClient = mongodb.MongoClient,
    mongoDSN = 'mongodb://localhost:27017/my_database_name',
    collection; 

function insertRecord(json, done) {
    return collection.insertMany(json, done);
}

function runOnFile(file, done) {
    fs.readFile(file, function(error, data) {
        if (error) {
            return done(error);
        }
        var json = JSON.parse(data);

        if (!json) {
            return done('Unable to parse JSON: ' + file);
        }
        MongoClient.connect(mongoDSN, function(error, db) {
            collection = db.collection(file.slice(8,-5))
            insertRecord(json, done);            
        })
    });
}

function processFiles(files, done) {
    var next = files.length ? files.shift() : null;    
    if (next) {
        return runOnFile(next, function(error) {
            if (error) {
                console.error(error);
            }
            processFiles(files, done);
        });
    }
    done();
}

function i(){
    glob('imports/**/*.json', function(error, files) {
        if (error) {
            throw new Error(error);
        }
        processFiles(files, function() {
            console.log('all done');
        });
    });
}

function ctoj() {
    glob('imports/**/*.csv', function(error, files) {
        if (error) {
            throw new Error(error);
        }
        processFilesCsv(files, function() {
            console.log('all done');
        });
    });
}

function runOnFileCsv(file, done) {
    nodeCSVtoJSON({
      input: file, 
      output: file.slice(0,-4)+".json"
    }, function(err, result){
      if(err) {
        console.error(err);
      }else {
        i();
        done();
      }
    });
}

function processFilesCsv(files, done) {
    var next = files.length ? files.shift() : null;
    
    if (next) {
        return runOnFileCsv(next, function(error) {
            if (error) {
                console.error(error);
            }
            processFilesCsv(files, done);
        });
    }
    done();
}

/*run function*/
ctoj()



