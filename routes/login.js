const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');

router.get('/login', (req, res) =>
{
	const SesData = req.app.get('SessionData');
	const sid = req.session.id;
	if(SesData[sid])
		return res.redirect('/');
	return res.render('login');
});

router.post('/login',
	[
		check('Username').isLength({ min: 3 }).trim().escape(),
		check('Password').isLength({ min: 5 }),
	],
	(req, res) =>
	{
		const SesData = req.app.get('SessionData');
		const sid = req.session.id;
		if(SesData[sid])
			return res.redirect('/');
		const userName = req.sanitize(req.body.Username);
		const password = req.sanitize(req.body.Password);

		const errors = validationResult(req);
		if(!errors.isEmpty())
			return res.render('login', { 'ErrorMessage': errors.array(), sentUsername: userName });
		const Account = req.app.get('AccountSQL');
		Account.findOne({ where: { 'username': userName } })
			.then(user =>
			{
				if(!user)
					return res.render('login', { 'ErrorMessage': [ { 'param': 'Username', 'msg': 'the given username does not exists' } ], sentUsername: userName });
				bcrypt.compare(password, user.password, (err, match) =>
				{
					if(err)
						return res.render('login', { 'ErrorMessage': [ { 'param': 'Username', 'msg': err } ], sentUsername: userName });
					if(!match)
						return res.render('login', { 'ErrorMessage': [ { 'param': 'Password', 'msg': 'does not match' } ], sentUsername: userName });
					SesData[sid] =
					{
						'Account':
						{
							'ID': user.id,
							'Username': user.username,
						},
					};
					return res.redirect('/');
				});
			});
	});

module.exports = router;