/**This middelware will the save the user Id globally and passes it to the next controller
 * for previous url accessing */

const passIdToUrl = (req, res, next) => {
  const id = req.params.id;
  global.voterUrl = id;
  next();
};
module.exports = passIdToUrl;
