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
const KEY_DESCRIPTOR = 'descriptor';
const KEY_PAYMENT_TYPE = 'paymentType';
const KEY_URL = 'url';
const KEY_METHOD = 'method';
const KEY_REDIRECT = 'redirect';

// result keys
const KEY_RESULT_CODE = 'code';
const KEY_RESULT_DESCRIPTION = 'description';
const KEY_RESULT_DETAILS_ACQUIRERRESPONSE = 'AcquirerResponse';
const KEY_RESULT_DETAILS_DESCRIPTION = 'description';

// result values.
const VAL_SUCESS_CODE = '000.000.000';
const VAL_VAPENDING_CODE = '800.400.500';
const VAL_SUCCESS_DESCRIPTION = 'Transaction successfully processed.';
const VAL_VAPENDING_DESCRIPTION = 'Waiting for confirmation of non-instant payment. Denied for now.';


// others

function parseRequest(req, res)
{
  var response = {};

  response[KEY_PAYMENT_BRAND] = req[KEY_PAYMENT_BRAND];
  response[KEY_UID] = req[KEY_UID];
  response[KEY_DESCRIPTOR] = req[KEY_DESCRIPTOR];
  response[KEY_PAYMENT_TYPE] = req[KEY_PAYMENT_TYPE];
  response[KEY_AMOUNT] = req[KEY_AMOUNT];
  response[KEY_CURRENCY] = req[KEY_CURRENCY];

  //For async workflows includes the redirectURL.
  var redirect = {};

  var expectedWorkflow = false;
  if('customParameters' in req && 'expectedWorkflow' in req.customParameters)
    expectedWorkflow = req.customParameters['expectedWorkflow'];

  if(expectedWorkflow == 'async')
  {
    redirect[KEY_URL] = 'https://docs.oppwa.com';
    redirect[KEY_METHOD] = 'GET';
    var parameters = [];
    redirect['parameters'] = parameters;
    response[KEY_REDIRECT] = redirect;
  }

  setStatus(req, response);

  response = JSON.stringify(response);

  return response;
};

function setStatus(req, response)
{
  var result = {};
  
  var expectedResult = 'undefined';

  var resultFormatRegex = /[0-9]{3}\.[0-9]{3}\.[0-9]{3}/;



  //Setting result field.
  if( ('customParameters' in req) && req.customParameters['expectedResult'].match(resultFormatRegex) ) {
    expectedResult = req.customParameters['expectedResult'];
    result[KEY_RESULT_CODE] = expectedResult;
  } else {
    result[KEY_RESULT_CODE] = VAL_SUCESS_CODE;
  }

  result[KEY_RESULT_DESCRIPTION] = "";

  response["result"] = result;


  //Sets resultDetails
  var resultDetails = {};

  resultDetails[KEY_RESULT_DETAILS_ACQUIRERRESPONSE] = '00';
  resultDetails[KEY_RESULT_DETAILS_DESCRIPTION] = 'someDescription';

  response["resultDetails"] = resultDetails;


}

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(bodyParser.json()); // for parsing application/json



app.post("/v1/payments", (req, res, next) => {
  var body = req.body;

  var response = parseRequest(body, res);

  res.type('application/json');
  res.send(response);
});
