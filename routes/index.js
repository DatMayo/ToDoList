const express = require('express');
const router = express.Router();

router.get('/', (req, res) =>
{
	const SesData = req.app.get('SessionData');
	const sid = req.session.id;
	if(!SesData[sid])
		res.redirect('/login');
});

module.exports = router;