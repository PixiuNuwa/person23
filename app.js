//node js module used in this app
const mysql = require('mysql');
const express = require('express');

//creation of the express app
const app = express();

//configuration of the express app
// Require body-parser (to receive post data from clients)
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

//configuration to listen
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log('REST API listening on port ', port);
});
//get all the persosns in the table 
app.get('/people', async (req, res) => {
    //prepare the sql statement
    var sql = 'SELECT rut, name, lastName, age, course FROM persons WHERE 1';
    //execute the sql statement
    getDBPool().query(sql, (err, result) =>{
        //if there was an error inform
        //if not, send status 200 and the list of persosn even if it has zero records
        if (err) res.status(500).json({ErrorMessage: err});
        else res.status(200).json({result});
    });
});
//get a person that has the given rut
app.get('/people/:rut', async (req, res) => {
    //take the rut parameter
    var rut = req.params.rut;
    //generate the sql statement
    var sql = 'SELECT rut, name, lastName, age, course FROM persons WHERE rut=?';
    //execute the sql statement
    getDBPool().query(sql,[rut], (err, result) =>{
        //if there was an error inform
        if (err) res.status(500).json({ErrorMessage: err});
        //if there was no error then check if there was a result
        //if there was a result, inform with status 200 and the info of the person
        //if not, inform with status 400 that there is no person with that rut
        if(result.length > 0) res.status(200).json({result});
        else res.status(404).json({ErrorMessage: 'the given rut was not found', resultado: result});
    });
});
//insert a person with the given info, but first verify that the rut is not inserted
app.post('/people', async (req, res) => {
    var rut = req.body.rut;
    //verify that a rut comes at least in the json file
    //if not inform with status 500
    if (typeof rut !== 'undefined' && rut !== null && rut.length > 0){
        //prepare the sql statement to erify that the person exist
        const sql = 'SELECT id, rut, name, lastName, age, course FROM persons WHERE rut=?';
        //execute the sql statement
        getDBPool().query(sql,[rut], (err, result) =>{
            //if there was an error inform
            if (err) res.status(500).json({ErrorMessage: err});
            //if there was no error then check if there was a result
            //if there was a result, inform with status 500 that the person exist
            //if not, try to insert in the data base
            if(result.length > 0) res.status(400).json({ErrorMessage: 'rut already in data base'});
            else{
                //prepare sql statement for insertion of person
                const sql2 = 'INSERT INTO persons SET?';
                //execute the given sql statement
                getDBPool().query(sql2, req.body, (err, result) =>{
                    //if there was an error inform
                    //if not, inform with status 201
                    if(err) res.status(500).json({ErrorMessage: err});
                    else res.status(201).json({result});
                });
            }
        });
    }
    else res.status(400).json({ErrorMessage: 'There was no rut'});
                   
});
//update a person with the given info that has the given id
app.put('/people/:id', async (req, res) => {
    //take the id parameter
    const id = parseInt(req.params.id);
    //verify that id is a number
    if(isNaN(id)) res.status(400).json({ErrorMessage: 'given id is not a number'});
    else{
        //prepare the sql statement
        const sql = `UPDATE persons SET ? WHERE id = ?`;
        //prepare the data to use in the sql statement
        const data = [req.body, id];
        //execute the sql statement
        getDBPool().query(sql, data, (err, result) =>{
            //if there was an error, inform
            if(err) res.status(500).json({ErrorMessage: err});
            //if there was no error, then 
            //check if it affected a row, because it means that it updated the person
            //if not then it means that it did not delete the person
            if(result.affectedRows > 0) res.status(200).json({result});
            else res.status(404).json({ErrorMessage: 'Not Found'});
        });
    }
});
//delete a person with the given id and returns status 200 on success
//if id is not found, then it returns status 404
app.delete('/people/:id', async (req, res) => {
    //take the id parameter and convert to number
    const id = parseInt(req.params.id);
    //verify that id is a number
    if(isNaN(id)) res.status(400).json({ErrorMessage: 'given id is not a number'});
    else{
        //generate the sql statement
        const sql = 'DELETE FROM persons WHERE id = ?';
        //execute the sql statement
        getDBPool().query(sql, id, (err, result) =>{
            //if there was an error on the statement execution, inform
            if(err) res.status(500).json({ErrorMessage: err});
            //if there was no error
            //check if the statement affected a row, because it means that it deleted the person
            //if not then it means that it did not delete the person
            if(result.affectedRows > 0) res.status(200).json({result});
            else res.status(404).json({ErrorMessage: 'Not found'});
        });
    }
});

//will use as global just for optimization
let cachedDBPool;
function getDBPool(){
  if(!cachedDBPool){
      cachedDBPool = mysql.createPool({
          connectionLimit: 1,
          user: 'gustavo',
          password: '123456',
          database: 'persons_db',
          socketPath:'/cloudsql/person23io:us-central1:person-instance'
      });
  }
  return cachedDBPool;
}
//this exports the app object as a module
module.exports = app;
