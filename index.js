var express = require("express");
var app = express();
var port = process.env.PORT || 5858;

app.listen(port, () => {
 console.log("Server running on port " + port);
});

// first level keys
const KEY_PAYMENT_BRAND = 'paymentBrand';
const KEY_AMOUNT = 'amount';
const KEY_CURRENCY = 'currency';
const KEY_UID = 'uid';

// result keys
const KEY_RESULT_CODE = 'code';
const KEY_RESULT_DESCRIPTION = 'description';

// result values.
const VAL_SUCESS_CODE = '000.000.000';
const VAL_SUCCESS_DESCRIPTION = 'Transaction successfully processed.';

function parseRequest(req, res)
{
  req.is('json');
  var response = {};

  response[KEY_PAYMENT_BRAND] = req.query[KEY_PAYMENT_BRAND];
  response[KEY_UID] = req.query[KEY_UID];

  setStatus(response);

  response = JSON.stringify(response);

  return response;
};

function setStatus(response)
{
  var result = {};

  result[KEY_RESULT_CODE] = VAL_SUCESS_CODE;
  result[KEY_RESULT_DESCRIPTION] = VAL_SUCCESS_DESCRIPTION;

  response["result"] = result;

}

app.post("/v1/payments", (req, res, next) => {
  var response = parseRequest(req, res);
  
  res.type('application/json');
  res.send(response);
});
