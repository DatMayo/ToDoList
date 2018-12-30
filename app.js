const bodyparser = require('body-parser');
const createError = require('http-errors');
const express = require('express');
const helmet = require('helmet');
const Logger = require('./utils/Logger');
const session = require('express-session');

const app = express();

const port = process.env.PORT || 3000;

let SessionData = null;
SessionData = { };

app.use(helmet());
app.use(bodyparser.urlencoded({ extended: false }));

app.use(session(
	{
		secret: require('crypto').randomBytes(64).toString('hex'),
		resave: false,
		saveUninitialized: true,
		expires: new Date(Date.now() + (30 * 86400 * 1000)),
	}
));

app.set('SessionData', SessionData);

app.use((req, res, next) =>
{
	next(createError(404));
});

app.use((err, req, res, next) =>
{
	res.send(`<pre>${err.stack}</pre>`);
});

app.listen(3000, () =>
{
	Logger.log(`Server started on port ${port}`);
});