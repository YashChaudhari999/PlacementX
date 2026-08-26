const bcrypt = require('bcrypt');
const hash = '$2b$10$1N5smvEEBqNZPj0GcmnP0etnuJeF5tkuoX8hv.9boBIE37FUcNMzq';

async function check() {
  console.log('password123:', await bcrypt.compare('password123', hash));
  console.log('student123:', await bcrypt.compare('student123', hash));
  console.log('Aarav123:', await bcrypt.compare('Aarav123', hash));
}
check();
