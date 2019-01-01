const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');

router.get('/register', (req, res) =>
{
	const SesData = req.app.get('SessionData');
	const sid = req.session.id;
	if(SesData[sid])
		res.redirect('/');
	res.render('register');
});

router.post('/register',
	[
		check('Username').isLength({ min: 3 }).trim().escape(),
		check('Password').isLength({ min: 5 }),
		check('PasswordConfirm').isLength({ min: 5 }),
	]
	, (req, res) =>
	{
		const SesData = req.app.get('SessionData');
		const sid = req.session.id;
		if(SesData[sid])
			return res.redirect('/');
		const userName = req.sanitize(req.body.Username);
		const passwordOne = req.sanitize(req.body.Password);
		const passwordTwo = req.sanitize(req.body.PasswordConfirm);

		const errors = validationResult(req);
		if(!errors.isEmpty())
			return res.render('register', { 'ErrorMessage': errors.array(), sentUsername: userName });
		if(passwordOne != passwordTwo)
		{
			return res.render('register', { 'ErrorMessage':
			[
				{
					'param': 'Password',
					'msg': 'the two given passwords do not match',
				},
			],
			sentUsername: userName });
		}
		const Account = req.app.get('AccountSQL');
		Account.findOne({ where: { 'username': userName } })
			.then(userExists =>
			{
				if(userExists)
				{
					return res.render('register', { 'ErrorMessage':
					[
						{
							'param': 'Username',
							'msg': 'the given username allready exists',
						},
					],
					sentUsername: userName });
				}
				const saltRounds = 10;
				const salt = bcrypt.genSaltSync(saltRounds);
				const hash = bcrypt.hashSync(passwordOne, salt);
				Account.create(
					{
						username: userName,
						password: hash,
					})
					.then(() =>
					{
						return res.redirect('/login');
					});
			});
	});

module.exports = router;