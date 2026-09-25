import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const rules = [
  ['private-key', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ['aws-access-key', /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],
  ['github-token', /\b(?:ghp|gho|ghu|ghs|github_pat)_[A-Za-z0-9_]{20,}\b/],
  ['slack-token', /\bxox[baprs]-[0-9A-Za-z-]{10,}\b/],
  ['openai-key', /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/],
  ['stripe-live-key', /\b(?:sk|rk)_live_[A-Za-z0-9]{16,}\b/],
  ['jwt', /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/],
  ['credential-assignment', /\b(?:JWT_SECRET|SUPABASE_SERVICE_ROLE_KEY|FIREBASE_PRIVATE_KEY|DATABASE_URL)\s*=\s*[^\s#][^\r\n]{7,}/i],
];

const ignoredValue = (line) =>
  /\[YOUR-|example|placeholder|process\.env|<redacted>|=$/i.test(line)
  || /postgres(?:ql)?:\/\/(?:user|postgres):(?:password|postgres)@(?:db|localhost)(?::|\/)/i.test(line);
const findings = [];

const scan = (source, text) => {
  text.split(/\r?\n/).forEach((line, index) => {
    if (ignoredValue(line)) return;
    for (const [rule, pattern] of rules) {
      if (pattern.test(line)) findings.push({ source, line: index + 1, rule });
    }
  });
};

const tracked = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
for (const file of tracked) {
  if (/^(?:node_modules|dist|build)\//.test(file) || /package-lock\.json$/.test(file)) continue;
  try {
    const content = readFileSync(file, 'utf8');
    if (!content.includes('\0')) scan(file, content);
  } catch {
    // Binary, deleted, or unreadable files are ignored.
  }
}

if (process.argv.includes('--history')) {
  const log = execFileSync('git', ['log', '-p', '--all', '--no-ext-diff', '--format=commit:%H'], {
    encoding: 'utf8',
    maxBuffer: 100 * 1024 * 1024,
  });
  let commit = 'unknown';
  let historicalFile = 'unknown';
  for (const line of log.split(/\r?\n/)) {
    if (line.startsWith('commit:')) commit = line.slice(7, 19);
    if (line.startsWith('+++ b/')) historicalFile = line.slice(6);
    if (line.startsWith('+') && !line.startsWith('+++')) {
      scan(`git:${commit}:${historicalFile}`, line.slice(1));
    }
  }
}

if (findings.length) {
  console.error('Potential secrets detected (values are intentionally redacted):');
  for (const finding of findings.slice(0, 100)) {
    console.error(`- ${finding.source}:${finding.line} [${finding.rule}]`);
  }
  process.exitCode = 1;
} else {
  console.log('Secret scan passed: no known credential patterns found.');
}
