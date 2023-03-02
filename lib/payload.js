const allTrue = (...arr) => {
    return [...arr].every(Boolean)
 }
 
 const someTrue = (...arr) => {
     return [...arr].some(Boolean)
 }
 
 const someEquallyTrue = (test, ...arr) => {
     return [...arr].some(value => value === test)
 }
 
 module.exports = { allTrue, someTrue, someEquallyTrue }