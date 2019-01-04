const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator/check');

router.get('/',	(req, res) =>
{
	const SesData = req.app.get('SessionData');
	const sid = req.session.id;
	if(!SesData[sid])
		return res.redirect('/login');

	const Category = req.app.get('CategorySQL');
	const ToDo = req.app.get('ToDoSQL');
	Category.findAll({ where: { uid: SesData[sid].Account.ID }, order: ['name'] })
		.then(UserCategories =>
		{
			ToDo.findAll({ where: { uid: SesData[sid].Account.ID }, order: ['name'] })
				.then(ToDoData =>
				{
					return res.render('index',
						{
							'UserCategories': UserCategories,
							'ToDo': ToDoData,
						});
				});
		});
});

router.post('/',
	[
		check('taskName').isLength({ min: 3 }).trim().escape(),
		check('catID').isInt(),
	],
	(req, res) =>
	{
		const SesData = req.app.get('SessionData');
		const sid = req.session.id;
		if(!SesData[sid])
			return res.redirect('/login');

		const ToDo = req.app.get('ToDoSQL');
		const Category = req.app.get('CategorySQL');
		Category.findAll({ where: { uid: SesData[sid].Account.ID }, order: ['name'] })
			.then(UserCategories =>
			{
				ToDo.findAll({ where: { uid: SesData[sid].Account.ID }, order: ['name'] })
					.then(UserCategoriesAll =>
					{
						const errors = validationResult(req);
						if(!errors.isEmpty())
						{
							return res.render('index',
								{
									'ErrorMessage': errors.array(),
									'ToDo': ToDo,
									'UserCategories': UserCategoriesAll,
								});
						}
						ToDo.findOne({ where: { name: req.body.taskName } })
							.then(doesTaskExists =>
							{
								if(doesTaskExists)
								{
									return res.render('index',
										{
											'ErrorMessage':
											[
												{
													'param': 'Task',
													'msg': 'allready exists',
												},
											],
											'ToDo': ToDo,
											'UserCategories': UserCategoriesAll,
										});
								}
								ToDo.create(
									{
										uid: SesData[sid].Account.ID,
										name: req.body.taskName,
										catid: req.body.catID,
									}
								).then(() =>
								{
									ToDo.findAll({ where: { uid: SesData[sid].Account.ID }, order: ['name'] })
										.then(NewToDo =>
										{
											return res.render('index',
												{
													'SuccessMessage': 'The given todo was created successfully',
													'ToDo': NewToDo,
													'UserCategories': UserCategoriesAll,
												});
										});
								});
							});
						// return res.render('index', { 'UserCategories': UserCategories });
					});
			});
	});

module.exports = router;