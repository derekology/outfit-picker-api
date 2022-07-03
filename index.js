const  express  =  require('express');
const ExpressGraphQL = require("express-graphql");
const schema = require("./graphql/schema.js");
const  app  =  express();
const { graphqlHTTP } = require('express-graphql');
const cors = require('cors');

var corsOptions = {
    origin: ["https://outfit-picker-client.herokuapp.com","https://outfitpicker.wooprojects.com","http://192.168.0.13:8080", "http://localhost:8080"],
    credentials: true, // <-- REQUIRED backend setting
    optionsSuccessStatus: 200
  };

app.use(cors(corsOptions));

app.use("/graphql", graphqlHTTP({ schema: schema.schema, graphiql: true}));

app.listen({port: process.env.PORT || 4000}, () => {
    console.log(`Server ready`);
});