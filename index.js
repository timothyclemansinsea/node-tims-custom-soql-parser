var qs = require('querystring'),
  sqlparser = require('node-sqlparser');

// Converts AST to SQL
exports.stringify = require('./stringify');

// Return quote-wrapped value for non numbers
var typedValue = function(val) {
  var lowerCaseVal = val.toLowerCase()
  try {
    JSON.parse(lowerCaseVal)
    return lowerCaseVal
  } catch(e) {
    return '"' + val + '"'
  }
}

// Converts SQL to AST
exports.parse = function(params) {
  // If a string was passed, parse the querystring into an object
  if(typeof params === 'string') {
    params = qs.parse(params);
  }

  // Append simple filters to WHERE clause
  var where = [];
  if(params.$where) where.push(params.$where);
  for(key in params) {
    if(key.charAt(0) !== '$') where.push(key + ' = ' + typedValue(params[key]));
  }
  params.$where = where.join(' AND ');

  // Construct SQL string to be parsed
  if (params.$select_distinct) {
      var sql = 'SELECT DISTINCT ' + (params.$select_distinct);
  } else {
      var sql = 'SELECT ' + (params.$select || '*');
  }
  if(params.$where) sql += ' WHERE ' + params.$where;
  if(params.$group) sql += ' GROUP BY ' + params.$group;
  if(params.$order) sql += ' ORDER BY ' + params.$order;
  if(params.$offset) {
    sql += ' OFFSET ' + params.$offset;
  }
  if(params.$limit) {
    sql += ' LIMIT ' + params.$limit;
  }

  return sqlparser.parse(sql);
};
