const fs = require("fs"); 
var post =[];
var categories = [];

exports.initialize = () => {
    return new Promise ((resolve, reject) => {
        file.readFile('./data/categories.json', (err,data) => {
            if (err) {
                reject ('unable to read file');
            }
            else {
                employees = JSON.parse(data);
            }
        });

        file.readFile('./data/departments.json', (err,data)=> {
            if (err) {
                reject ('unable to read file');
            }
            else {
                departments = JSON.parse(data);
            }
        })
        resolve();
    })
};