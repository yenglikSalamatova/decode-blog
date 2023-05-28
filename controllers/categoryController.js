const slugify = require("slugify");
const Category = require("./../models/categoryModel");

const categoriesArr = [
  "Прогнозы в IT",
  "Веб-разработка",
  "Мобильная разработка",
  "Фриланс",
  "Алгоритмы",
  "Тестирование IT систем",
  "Разработка игр",
  "Дизайн и юзабилити",
  "Искуственный интеллект",
  "Машинное обучение"
];

exports.writeDataCategories = async (req, res) => {
  const length = await Category.countDocuments();
  if (!length) {
    categoriesArr.forEach(async (el, index) => {
      const slug = slugify(el, { lower: true });
      await Category.create({
        title: el,
        key: index,
        slug: slug
      });
    });
  } else {
    return;
  }
};

exports.getAllCategories = async (req, res) => {
  const categories = await Category.find();
  res.status(200).json({ categories });
};

exports.categoryMiddleware = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ key: 1 });
    res.locals.categories = categories;
    next();
  } catch (err) {
    next(err);
  }
};
