const express = require('express');
const morgan = require('morgan');
const connect = require('../connect');
const { json, urlencoded } = require('body-parser');
const app = express();
const Todo = require('./todo');

const config = {
  itemsPerPage: 5,
};

app.use(morgan('dev'));
app.use(urlencoded({ extended: true }));
app.use(json());

app.get('/todo/:id', async (req, res) => {
  const todoId = req.params.id;
  const match = await Todo.findById(todoId).exec();
  return res.status(200).json(match);
});

app.get('/todos', async (req, res) => {
  const todos = await Todo.find({}).exec();
  return res.status(200).json(todos);
});

// route with pagination
app.get('/todos/:page', async (req, res) => {
  const pageNum = parseInt(req.params.page);

  const todos = await Todo.find({})
    .sort({ dueOn: 1 })
    .skip(pageNum * config.itemsPerPage)
    .limit(itemsPerPage)
    .exec();

  return res.status(200).json(todos);
});

app.post('/todo', async () => {
  const todoToCreate = req.body.todo;

  const newTodo = await Todo.create(todoToCreate);
  return res.status(200).json(newTodo);
});

connect(/**add mongo url here */)
  .then(() =>
    app.listen(4000, () => {
      console.log('server on http://localhost:4000');
    })
  )
  .catch(e => console.error(e));
