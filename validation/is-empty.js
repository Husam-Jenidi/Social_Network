const isEmpty = value =>
    value === undefined ||
    value === null ||
    (typeof value === 'object' && Object.keys(value).length === 0) ||
    (typeof value === 'string' && value.trim().length === 0);
module.exports = isEmpty;


//to have a default value for the function parameter you can do like this:
// function greeting(name="Guest"){
//                                 return `Hello ${name}`}

// which is basically the same as saying this :

//                      function greeting (name){
//                      name = name || "Guest"
//                      return `Hello ${name}`
//                       }                      