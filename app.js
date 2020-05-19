const mysql = require('mysql');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log('REST API listening on port ', port);
});

app.get('/people', async (req, res) => {
    getDBPool().query("SELECT * FROM persons", (err, result) =>{
        if (err) res.status(500).json({ErrorMessage: err});
        else res.status(200).json({result});
    });
});

app.get('/people/:rut', async (req, res) => {
    var rut = req.params.rut;
    var sql = 'SELECT * FROM persons WHERE rut=';
    sql += rut;
    getDBPool().query(sql, function (err, result, fields){
        if (err) res.status(500).json({ErrorMessage: err});
        else res.status(200).json({result});
    });
});

app.post('/people', async (req, res) => {
    //req.body
    const sql = 'INSERT INTO persons SET?';
    getDBPool().query(sql, req.body, (err, result) =>{
        if(err) res.status(500).json({ErrorMessage: err});
        else res.status(201).json({result});
        resolve(results.insertId);
    });
});

app.put('/people/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const sql = `UPDATE persons SET ? WHERE id = ?`;
    const data = [req.body, id];
    getDBPool().query(sql, data, (err, result) =>{
        if(err) res.status(500).json({ErrorMessage: err});
        //else res.status(200).json({result});
        if(result.affectedRows > 0) res.status(200).json({result});
        else res.status(404).json({ErrorMessage: 'id no encontrado'});
    });
});
app.delete('/people/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const sql = 'DELETE FROM persons WHERE id = ?';
    getDBPool().query(sql, id, (err, result) =>{
        if(err) res.status(500).json({ErrorMessage: err});
        //else res.status(200).json({result});
        if(result.affectedRows > 0) res.status(200).json({result});
        else res.status(404).json({ErrorMessage: 'id no encontrado'});
    });
});



let cachedDBPool;
function getDBPool(){
  if(!cachedDBPool){
      cachedDBPool = mysql.createPool({
          connectionLimit: 1,
          user: 'root',//'process.env.SQL_USER',
          password: '123456',//'process.env.SQL_PASSWORD',
          database: 'persons_db',//'process.env.SQL_NAME',
          socketPath:'/cloudsql/person23io:us-central1:person-instance'//${process.env.INST_CON_NAME}'
          //host: 'test-rwilson.cyht93b3jgmy.us-east-2.rds.amazonaws.com',//host:'35.193.197.197',
          //port: 3306
      });
  }
  return cachedDBPool;
}

module.exports = app;
