import chalk from 'chalk';
import { execa } from 'execa';

function run(rBin, rArgs, opts = {}) {
  return execa(rBin, rArgs, { stdio: 'inherit', ...opts });
}
const step = msg => console.log(chalk.cyan(msg));

async function main() {
  // generate changelog
  step('\nGenerating changelog...');
  await run(`pnpm`, ['run', 'changelog']);

  const { stdout } = await run('git', ['diff'], { stdio: 'pipe' });
  if (stdout) {
    step('\nCommitting changes...');
    await run('git', ['add', '-A']);
  } else {
    console.log('No changes to commit.');
  }
}

main().catch((err) => {
  console.error(err);
});
