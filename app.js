/**
 * Created by marco on 19.01.19.
 */
var express = require('express');
var path = require("path");

var app = express();


app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/build', express.static(path.join(__dirname, 'build')));
app.use('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/index.html'));
});



app.listen(9019, function () {
    console.log('Listening on port 9019!');
});
