const fs = require('fs');
const path = require('path');
const giPath = path.join('node_modules', 'react-icons', 'gi', 'index.js');
if (fs.existsSync(giPath)) {
  const content = fs.readFileSync(giPath, 'utf8');
  console.log('Cow:', content.match(/GiCow[a-zA-Z]*/g));
  console.log('Sheep:', content.match(/GiSheep[a-zA-Z]*/g));
  console.log('Goat:', content.match(/GiGoat[a-zA-Z]*/g));
  console.log('Chicken:', content.match(/GiChicken[a-zA-Z]*/g));
  console.log('Horse:', content.match(/GiHorse[a-zA-Z]*/g));
  console.log('Camel:', content.match(/GiCamel[a-zA-Z]*/g));
  console.log('Pig:', content.match(/GiPig[a-zA-Z]*/g));
}
