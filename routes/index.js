const express = require('express');
const router = express.Router();

router.get('/', (req, res) =>
{
	const SesData = req.app.get('SessionData');
	const sid = req.session.id;
	if(!SesData[sid])
		return res.redirect('/login');
	
	const Category = req.app.get('CategorySQL');
	Category.findAll({ where: { uid: SesData[sid].Account.ID }, order: ['name'] })
			.then(UserCategories =>
			{
				return res.render('index', { 'UserCategories': UserCategories });
			});
});

module.exports = router;