import * as hugeicons from 'hugeicons-react'; import { writeFileSync } from 'fs'; writeFileSync('hugeicons_list.json', JSON.stringify(Object.keys(hugeicons)));
