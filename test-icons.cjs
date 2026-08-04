const fs = require('fs');
const path = require('path');
const giPath = path.join('node_modules', 'react-icons', 'gi', 'index.js');
if (fs.existsSync(giPath)) {
  const content = fs.readFileSync(giPath, 'utf8');
  console.log('Cow:', [...new Set(content.match(/GiCow[a-zA-Z]*/g))]);
  console.log('Sheep:', [...new Set(content.match(/GiSheep[a-zA-Z]*/g))]);
  console.log('Goat:', [...new Set(content.match(/GiGoat[a-zA-Z]*/g))]);
  console.log('Chicken:', [...new Set(content.match(/GiChicken[a-zA-Z]*/g))]);
  console.log('Horse:', [...new Set(content.match(/GiHorse[a-zA-Z]*/g))]);
  console.log('Camel:', [...new Set(content.match(/GiCamel[a-zA-Z]*/g))]);
  console.log('Pig:', [...new Set(content.match(/GiPig[a-zA-Z]*/g))]);
} else {
  console.log('react-icons/gi/index.js not found');
}
