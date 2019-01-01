const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');

router.get('/category/:action?/:id?', (req, res) =>
{
	const SesData = req.app.get('SessionData');
	const sid = req.session.id;
	if(!SesData[sid])
		return res.redirect('/login');
	const Category = req.app.get('CategorySQL');
	Category.findAll({ where: { uid: SesData[sid].Account.ID }, order: ['name'] })
		.then(UserCategories =>
		{
			const itemID = parseInt(req.params.id);
			if(!Number.isInteger(itemID))
				return res.render('category', { 'UserCategories': UserCategories });
			switch(req.params.action)
			{
				case 'delete':
					Category.findOne(
						{
							where:
							{
								id: itemID,
								uid: SesData[sid].Account.ID,
							},
						}
					)
						.then(selectedCategory =>
						{
							if(!selectedCategory)
								return res.redirect('/category');
							Category.destroy({ where: { id: itemID } })
								.then(() =>
								{
									return res.redirect('/category');
								});
						});
					break;
				default:
					return res.redirect('/category');
			}
		});
});

router.post('/category',
	[
		check('CategoryName').isLength({ min: 3 }).trim().escape(),
	],
	(req, res) =>
	{
		const SesData = req.app.get('SessionData');
		const sid = req.session.id;
		if(!SesData[sid])
			return res.redirect('/login');

		const Category = req.app.get('CategorySQL');
		Category.findAll({ where: { uid: SesData[sid].Account.ID }, order: ['name'] })
			.then(UserCategories =>
			{

				const newCategoryName = req.sanitize(req.body.CategoryName);
				const errors = validationResult(req);
				if(!errors.isEmpty())
				{
					return res.render('category',
						{
							'ErrorMessage': errors.array(),
							'UserCategories': UserCategories,
						});
				}
				Category.findOne(
					{
						where:
						{
							uid: SesData[sid].Account.ID,
							name: newCategoryName,
						},
					})
					.then(UserCategory =>
					{
						if(UserCategory)
						{
							return res.render('category',
								{
									'ErrorMessage':
									[
										{
											'param': 'Category',
											'msg': 'allready exists',
										},
									],
									'UserCategories': UserCategories,
								});
						}
						Category.create(
							{
								uid: SesData[sid].Account.ID,
								name: newCategoryName,
							})
							.then(() =>
							{
								Category.findAll({ where: { uid: SesData[sid].Account.ID }, order: ['name'] })
									.then(NewUserCategories =>
									{
										return res.render('category',
											{
												'SuccessMessage': 'The given category was created successfully',
												'UserCategories': NewUserCategories,
											});
									}
									);
							});
					});
			});
	});

module.exports = router;