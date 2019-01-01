const express = require('express');
const router = express.Router();

router.get('/logout', (req, res) =>
{
	const sid = req.session.id;
	const SesData = req.app.get('SessionData');
	if(!SesData[sid])
		return res.redirect('login');
	delete SesData[sid];
	req.session.destroy();
	res.redirect('login');
});

module.exports = router;