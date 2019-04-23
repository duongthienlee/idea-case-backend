import express from 'express';
import knex from '../../db/index';

const category = express.Router();

// These have been tested to work!!! 2019-04-12

/** http://localhost:8787/api/category/all    with method=GET **/
category.get('/all', function (req, res) {
  knex.select().from('Category').then((data) => {
    res.status(200);
    res.send(data);
  });
});

/** http://localhost:8787/api/category/    with method=GET **/
// http://localhost:8787/api/category?id=1 
category.get('/', function (req, res) {
  console.log(req.query);
  knex.select().from('Category').where('id', req.query.id).then((data) => {
    res.status(200);
    res.send(data);
  }
  ).catch((error) => {
    console.log('error.errno: ' + error.errno);
    res.status(400);
    res.send("Error: " + error.errno);
  });
});

/** http://localhost:8787/api/category/    with method=POST **/
category.post('/', function (req, res) {
  // Just a start of err handling for model for you 
  if (req.body.name && req.body.description) {
    knex.insert(req.body).returning('*').into('Category').then(
      (data) => {
        res.status(200);
        res.send(data);
      }
    ).catch((error) => {
      if (error.errno == 1062) {  // https://mariadb.com/kb/en/library/mariadb-error-codes/
        res.status(409);
        res.send("Conflict: Category with that name already exists!");
      } else {
        res.status(400);
        res.send("Database error, Error number: " + error.errno);
      }
    });
  } else {
    res.status(400);
    res.end(JSON.stringify({
      "error": "firstName and/or lastName missing"
    }));
  }
});

/** http://localhost:8787/api/category/insertMany    with method=POST **/
category.post('/insertMany', function (req, res) {
  knex.insert(req.body).returning('*').into('Category').then(
    (data) => {
      res.status(200);
      res.send(data);
    }
  ).catch((error) => {
    if (error.errno == 1062) {  // https://mariadb.com/kb/en/library/mariadb-error-codes/
      res.status(409);
      res.send("Conflict: Category with that name already exists!");
    } else {
      res.status(400);
      res.send("Database error, Error number: " + error.errno);
    }
  });
});

category.delete("/deleteOne", (req, res) => {
  console.log(req);
  knex("Category")
    .where("id", req.body.id)
    .del()
    .then(() => {
      res.status(200);
      res.send("ok");
    })
    .catch(e => {
      res.status(400);
      res.send("no del");
    });
});

category.put("/edit", (req, res) => {
  const newCategory = {
    id: req.body.id,
    name: req.body.name ? req.body.name : "TBA",
    description: req.body.description ? req.body.description : "TBA",
    budgetLimit: req.body.budgetLimit ? req.body.budgetLimit : 0,
    isActive: req.body.isActive ? req.body.isActive : 0
  };
  knex("Category")
    .where("id", req.body.id)
    .update(newCategory)
    .then((data) => {
      res.status(200);
      res.send("edit ok " + data);
    })
    .catch(e => {
      res.status(400);
      res.send("no edit");
    });
});

// The req.body.name etc. parameter check would work, but 
// naturally not with the multi-insert with JSON array below

export default category;

/* Post e.g. the JSON from below in the POST body
{
	"name": "Jamborees",
    "description": "Jumbo Jambo Jembo",
    "budgetLimit": 1111,
    "isActive": "false"
}
*/

/* Or this JSON array
[{
	"name": "Jamborees2",
    "description": "Jumbo Jambo Jembo",
    "budgetLimit": 1111,
    "isActive": "false"
},
{
	"name": "Jamborees3",
    "description": "Jumbo Jambo Jembo",
    "budgetLimit": 1111,
    "isActive": "false"
}]
*/