var express = require("express");
var app = express();
var port = process.env.PORT || 8080;

app.listen(port, () => {
 console.log("Server running on port 3000");
});

app.get("/url", (req, res, next) => {
 res.json(["Tony","Lisa","Michael","Ginger","Food"]);
});
