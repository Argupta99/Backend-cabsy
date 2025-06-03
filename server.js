const http = require('http');
const app = require('./app');
const port = process.env.PORT || 3000;
 

const server = http.createServer(app);

//running a call back function that when ever server starts to listen then you have to console .
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});