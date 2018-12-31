const express = require('express');
const router = express.Router();

router.get('/login', (req, res) =>
{
	const SesData = req.app.get('SessionData');
	const sid = req.session.id;
	if(SesData[sid])
		res.redirect('/');
	res.render('login');
});

module.exports = router;