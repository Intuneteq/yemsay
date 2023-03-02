function addHours(numOfHours, date = new Date()) {
    date.setTime(date.getTime() + numOfHours * 60 * 60 * 1000);
  
    return date;
  }

function generateRandomNum() {
    return `${Math.floor(1000 + Math.random() * 9000)}`
}

module.exports = { addHours, generateRandomNum };