const express = require('express');
const router = express.Router();

router.get('/category', (req, res) =>
{
	const SesData = req.app.get('SessionData');
	const sid = req.session.id;
	if(!SesData[sid])
		return res.redirect('/login');
	return res.render('category');
});

module.exports = router;