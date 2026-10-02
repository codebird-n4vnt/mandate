// Copies the contract ABIs from Foundry's build output into src/abi as typed constants.
// Run `forge build` in ../contract first, then `npm run abi`.
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const out = (name) => fileURLToPath(new URL(`../../contract/out/${name}.sol/${name}.json`, import.meta.url))
const dest = (file) => fileURLToPath(new URL(`../src/abi/${file}`, import.meta.url))

for (const [contract, file, constName] of [
  ['MandateRegistry', 'registry.ts', 'registryAbi'],
  ['MandateLoans', 'loans.ts', 'loansAbi'],
]) {
  const { abi } = JSON.parse(readFileSync(out(contract), 'utf8'))
  const body = JSON.stringify(abi, null, 2)
  writeFileSync(
    dest(file),
    `// Generated from contract/out by \`npm run abi\`. Do not edit by hand.\nexport const ${constName} = ${body} as const\n`,
  )
  console.log(`${contract} -> src/abi/${file} (${abi.length} entries)`)
}
