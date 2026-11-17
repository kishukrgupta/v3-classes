const { body, matchedData } = require('express-validator');

function rules(partial) {
  const fields = [['title', 160], ['summary', 300], ['body', 30000]];
  return [
    ...fields.map(([name, max]) => {
      const field = body(name);
      if (partial) field.optional();
      return field.isString().bail().trim().isLength({ min: 1, max });
    }),
    body('isPublished').optional().isBoolean().toBoolean(),
  ];
}

exports.createArticleRules = rules(false);
exports.updateArticleRules = rules(true);
exports.useArticleFields = (req, res, next) => {
  req.body = matchedData(req, { locations: ['body'] });
  next();
};
