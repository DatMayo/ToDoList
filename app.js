const bodyparser = require('body-parser');
const createError = require('http-errors');
const expressSanitizer = require('express-sanitizer');
const express = require('express');
const helmet = require('helmet');
const Logger = require('./utils/Logger');
const path = require('path');
const session = require('express-session');
const sequelize = require('sequelize');

const app = express();

const port = process.env.PORT || 3000;

const sqliteConfig = require('./config/sqlite.config.json');
const connection = new sequelize('todo', null, null, sqliteConfig);

const Accounts = connection.define('accounts',
	{
		username: sequelize.STRING,
		password: sequelize.STRING,
	});
const Category = connection.define('category',
	{
		uid: sequelize.INTEGER,
		name: sequelize.STRING,
	});

app.set('AccountSQL', Accounts);
app.set('CategorySQL', Category);

let SessionData = null;
SessionData = { };

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(helmet());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));
app.use(expressSanitizer());

app.use(session(
	{
		secret: require('crypto').randomBytes(64).toString('hex'),
		resave: false,
		saveUninitialized: true,
		expires: new Date(Date.now() + (30 * 86400 * 1000)),
	}
));

app.set('SessionData', SessionData);

// #region Routes
app.use(require('./routes/index'));
app.use(require('./routes/login'));
app.use(require('./routes/register'));
app.use(require('./routes/category'));
// #endregion

app.use((req, res, next) =>
{
	next(createError(404));
});

app.use((err, req, res, next) =>
{
	if(req.url != '/favicon.ico')
		Logger.log(err.message);
	res.render('404');
});

connection.sync().then(() =>
{
	Logger.log('Established SQLite connection');
	app.listen(port, () =>
	{
		Logger.log(`Server started on port ${port}`);
	});
}).catch(err =>
{
	Logger.log(`There was an error: ${err}`, 'error');
});