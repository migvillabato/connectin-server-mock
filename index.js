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
const KEY_DESCRIPTOR = 'ShortId';
const KEY_UID = 'UUID';
const KEY_PAYMENT_TYPE = 'paymentType';
const KEY_URL = 'url';
const KEY_METHOD = 'method';
const KEY_REDIRECT = 'redirect';
const KEY_CARD = 'card';
const KEY_CARD_NUMBER = 'card.number';
const KEY_CARD_BIN = 'card.bin';
const KEY_CARD_LAST4DIGITS = 'card.last4Digits';
const KEY_CARD_HOLDER = 'card.holder';
const KEY_CARD_EXPIRYMONTH = 'card.expiryMonth';
const KEY_CARD_EXPIRYYEAR = 'card.expiryYear';
const KEY_NOTIFICATION_URL='notificationUrl';
const KEY_SHOPPERRESULT_URL='shopperResultUrl';

// result keys
const KEY_RESULT_CODE = 'code';
const KEY_RESULT_DESCRIPTION = 'description';
const KEY_RESULT_DETAILS_ACQUIRERRESPONSE = 'AcquirerResponse';
const KEY_RESULT_DETAILS_DESCRIPTION = 'description';

// result values.
const VAL_SUCESS_CODE = '000.000.000';


var card = {};

function isUndefined(obj)
{
  return (obj === undefined)
}

function setCardHolder( cardHolder )
{
  if (!isUndefined(cardHolder))
    card[KEY_CARD_HOLDER] = cardHolder;
}

function setExpiryMonth( expiryMonth )
{
  if (!isUndefined(expiryMonth))
    card[KEY_CARD_EXPIRYMONTH] = expiryMonth;
}

function setExpiryYear( expiryYear )
{
  if (!isUndefined(expiryYear))
    card[KEY_CARD_EXPIRYYEAR] = expiryYear;
}

function isEmpty(ob){
  for(var i in ob)
  {
    console.log("Server running on port " + i);
    return false;}
 return true;
}

// others

function parseRequest(req, res)
{
  var response = {};

  if('customParameters' in req)
  response['id'] = req.customParameters[KEY_UID];

  response[KEY_PAYMENT_BRAND] = req[KEY_PAYMENT_BRAND];

  if('customParameters' in req)
    response['descriptor'] = req.customParameters[KEY_DESCRIPTOR];
    
  response[KEY_PAYMENT_TYPE] = req[KEY_PAYMENT_TYPE];
  response[KEY_AMOUNT] = req[KEY_AMOUNT];
  response[KEY_CURRENCY] = req[KEY_CURRENCY];
  
  var cardNumberLenght = 0;
  if(req.hasOwnProperty(KEY_CARD_NUMBER))
  cardNumberLenght = req[KEY_CARD_NUMBER].length;

  if(cardNumberLenght > 5)
  {
    card[KEY_CARD_BIN] = req[KEY_CARD_NUMBER].substring(0, 6);
  }
  if(cardNumberLenght > 3)
  {
    card[KEY_CARD_LAST4DIGITS] = req[KEY_CARD_NUMBER].substring(cardNumberLenght-4, cardNumberLenght);
  }

  setCardHolder(req[KEY_CARD_HOLDER]);
  setExpiryMonth(req[KEY_CARD_EXPIRYMONTH]); 
  setExpiryYear(req[KEY_CARD_EXPIRYYEAR]);
  
  if (!isEmpty(card))
    response[KEY_CARD] = card;

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
  req.customParameters;
  if( ('customParameters' in req) && req.customParameters.hasOwnProperty('expectedResult') 
    && req.customParameters['expectedResult'].match(resultFormatRegex) ) {
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
  resultDetails[KEY_NOTIFICATION_URL]=req[KEY_NOTIFICATION_URL];
  resultDetails[KEY_SHOPPERRESULT_URL]=req[KEY_SHOPPERRESULT_URL];
  

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






function decodeHTHML(str)
{
  result = str.replace(/%2F/g, '/');
  result = result.replace(/%2B/g, '+');
  return result;
}

function calculateSignature(req)
{
  var response = {};

  var data='';

  var secret = req['secret'];
  delete req.secret;

  requestKeys = Object.keys(req);
  reqLength = requestKeys.length;
  var sortedRequestKeys = requestKeys.sort();

  sortedRequestKeys.forEach( function(prop) {
    data+= prop + '=' + decodeHTHML(req[prop]);
    --reqLength;
    if(reqLength>0)
      data+='|';
  });

  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', secret);

  console.log(data);
  hmac.update(data);
  signature = hmac.digest('hex');
  console.log(signature);

  response['signature'] = signature;
  return response;
}




/*const url = require('url');  
const querystring = require('querystring');*/

app.get("/getSignature", (req, res, next) => {

  var query = req.query;

  var response = calculateSignature(query);
  res.type('application/json');
  res.send(response);
});











