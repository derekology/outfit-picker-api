const graphql = require("graphql");
const { Client } = require("pg");


const database = new Client({
  connectionString: process.env.DATABASE_URL,
//   connectionString: 'postgres://postgres:password@localhost:5432/clothes',
  ssl: {
    rejectUnauthorized: false
  }
});

database.connect();

database.query("SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'clothes';", (err, res) => {
  if (err) throw err;
//   console.log(res.rows);  
  console.log('Database connection established')
//   database.end();
});


//create graphql clothing object
const ClothingType = new graphql.GraphQLObjectType({
    name: "Clothing",
    fields: {
        id: { type: graphql.GraphQLID },
        userid: { type: graphql.GraphQLString },
        type: { type: graphql.GraphQLString },
        article: { type: graphql.GraphQLString },
        colour: { type: graphql.GraphQLString },
        weight: { type: graphql.GraphQLString },
        wash: { type: graphql.GraphQLBoolean },
        created: { type: graphql.GraphQLString },
        updated: { type: graphql.GraphQLString }
    }
});
// create a graphql query to select all and by id
var queryType = new graphql.GraphQLObjectType({
    name: 'Query',
    fields: {
        //first query to select all
        allClothes: {
            type: new graphql.GraphQLList(ClothingType),
            args:{
                userid:{
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                }
            },
            resolve: (root, {userid}, context, info) => {
                return new Promise((resolve, reject) => {
                    // raw query to select from table
                    const text = "SELECT * FROM clothes WHERE userid=($1);"
                    const values = [{userid}.userid]
                    database.query(text, values, (err, res) => {  
                        if(err) {
                            reject(err);
                        }
                        resolve(res.rows);
                    });                  
                });
            }
        },
        //second query to select by id
        Clothing_byId:{
            type: ClothingType,
            args:{
                id:{
                    type: new graphql.GraphQLNonNull(graphql.GraphQLID)
                }               
            },
            resolve: (root, {id}, context, info) => {
                return new Promise((resolve, reject) => {
                    // raw query to select from table by clothing id
                    const text = "SELECT * FROM clothes WHERE id = ($1);"
                    const values = [{id}.id]
                    database.query(text, values, (err, res) => {  
                        if(err) {
                            reject(err);
                        }
                        resolve(res.rows[0]);
                        console.log(res);
                    });                  
                });
            }
        },

        // query to search by weight
        weatherApproClothes: {
            type: new graphql.GraphQLList(ClothingType),
            args:{
                weight:{
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                },
                userid:{
                    type: new graphql.GraphQLNonNull(graphql.GraphQLString)
                }
            },
            resolve: (root, {weight, userid}, context, info) => {
                return new Promise((resolve, reject) => {
                    // raw query to select from table by weather
                    const text = "SELECT * FROM clothes WHERE weight=($1) AND userId=($2) AND wash=false;"
                    const values = [{weight}.weight, {userid}.userid]
                    database.query(text, values, (err, res) => {  
                        if(err) {
                            reject(err);
                        }
                        resolve(res.rows);
                    });                  
                });
            }
        },
    }
});

//mutation type is a type of object to modify data (INSERT,DELETE,UPDATE)
var mutationType = new graphql.GraphQLObjectType({
    name: 'Mutation',
    fields: {
      //mutation for create
      createClothing: {
        //type of object to return after create
        type: ClothingType,
        //argument of mutation createClothing to get from request
        args: {
          userid: {
            type: new graphql.GraphQLNonNull(graphql.GraphQLString)
          },
          type: {
            type: new graphql.GraphQLNonNull(graphql.GraphQLString)
          },
          article:{
              type: new graphql.GraphQLNonNull(graphql.GraphQLString)
          },
          colour:{
              type: new graphql.GraphQLNonNull(graphql.GraphQLString)
          },
          weight:{
              type: new graphql.GraphQLNonNull(graphql.GraphQLString)
          },
          wash:{
            type: new graphql.GraphQLNonNull(graphql.GraphQLBoolean)
          },
          created:{
              type: new graphql.GraphQLNonNull(graphql.GraphQLString)
          }
        },
        resolve: (root, {userid, type, article, colour, weight, wash, created}) => {
            return new Promise((resolve, reject) => {
                //raw to insert new clothing in clothes table
                const text = "INSERT INTO clothes (userid, type, article, colour, weight, wash, created) VALUES (($1),($2),($3),($4),($5),($6),($7));"
                const values = [{userid}.userid, {type}.type, {article}.article, {colour}.colour, {weight}.weight, {wash}.wash, {created}.created]
                database.query(text , values, (err) => {
                    if(err) {
                        reject(err);
                    }
                    resolve(`New clothing added`)
                });
            })
        }
      },
      //mutation for update
      updateClothing: {
        //type of object to return afater update
        type: graphql.GraphQLString,
        //argument of mutation createClothing to get from request
        args:{
            id:{
                type: new graphql.GraphQLNonNull(graphql.GraphQLID)
            },
            type: {
                type: new graphql.GraphQLNonNull(graphql.GraphQLString)
            },
            article:{
                  type: new graphql.GraphQLNonNull(graphql.GraphQLString)
            },
            colour:{
                  type: new graphql.GraphQLNonNull(graphql.GraphQLString)
            },
            weight:{
                  type: new graphql.GraphQLNonNull(graphql.GraphQLString)
            }             
        },
        resolve: (root, {id, type, article, colour, weight}) => {
            return new Promise((resolve, reject) => {
                //raw to update clothing in clothes table
                const text = "UPDATE clothes SET type = ($1), article = ($2), colour = ($3), weight = ($4) WHERE id = ($5);"
                const data = [{type}.type, {article}.article, {colour}.colour, {weight}.weight, {id}.id]
                database.query(text, data, (err) => {
                    if(err) {
                        reject(err);
                    }
                    resolve(`Clothing ${id} updated`);
                });
            })
        }
      },
    //mutation for wash
    washClothing: {
        //type of object to return after update
        type: graphql.GraphQLString,
        //argument of mutation createClothing to get from request
        args:{
            id:{
                type: new graphql.GraphQLNonNull(graphql.GraphQLID)
            },
            wash: {
                type: new graphql.GraphQLNonNull(graphql.GraphQLBoolean)
            },
        },
        resolve: (root, {id, wash}) => {
            return new Promise((resolve, reject) => {
                //raw to update clothing in clothes table
                const text = "UPDATE clothes SET wash = ($1) WHERE id = ($2);"
                const data = [{wash}.wash, {id}.id]
                database.query(text, data, (err) => {
                    if(err) {
                        reject(err);
                    }
                    resolve(`Clothing ${id} wash status updated`);
                });
            })
        }
        },
      //mutation for delete
      deleteClothing: {
         //type of object return after delete
        type: graphql.GraphQLString,
        args:{
            id:{
                type: new graphql.GraphQLNonNull(graphql.GraphQLID)
            }               
        },
        resolve: (root, {id}) => {
            return new Promise((resolve, reject) => {
                //raw query to delete from clothes table by id
                const text = "DELETE from clothes WHERE id =($1);"
                const data = [{id}.id]
                database.query(text, data, (err) => {
                    if(err) {
                        reject(err);
                    }
                    resolve(`Clothing ${id} deleted`);                    
                });
            })
        }
      }
    }
});

//define schema with post object, queries, and mustation 
const schema = new graphql.GraphQLSchema({
    query: queryType,
    mutation: mutationType 
});

//export schema to use on index.js
module.exports = {
    schema
}