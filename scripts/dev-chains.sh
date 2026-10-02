#!/usr/bin/env bash
# Runs Mandate end to end on your machine, no testnet funds needed:
#   - a fork of Sepolia on :8545 (real ENS, with the MandateRegistry deployed and given the two root names)
#   - a stand-in Arc chain on :8546 (chain id 5042002, mock USDC, MandateLoans)
#   - seeded lender/borrower profiles and loans
# and writes frontend/.env.anvil.local so `npm run dev:anvil` talks to them with a built-in dev wallet.
#
# Usage: scripts/dev-chains.sh            (Ctrl-C stops both chains)
# Needs Foundry (anvil, forge, cast) and Node. SEPOLIA_RPC_URL overrides the RPC that is forked.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONTRACT="$ROOT/contract"
SEPOLIA_FORK_URL="${SEPOLIA_RPC_URL:-https://ethereum-sepolia-rpc.publicnode.com}"
SEPOLIA_LOCAL="http://127.0.0.1:8545"
ARC_LOCAL="http://127.0.0.1:8546"
DEPLOYER=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 # anvil account 0
ENS_REGISTRY=0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e
BORROWER_ROOT=0x8f7d6f386b899e662d8ffffe5abf1a017bb202edf791763fa27a41cc06e21521


export DEPLOYMENTS_DIR=deployments/local
LOG_DIR="$CONTRACT/deployments/local"
mkdir -p "$LOG_DIR"
rm -f "$LOG_DIR"/*.json

pids=()
cleanup() { for pid in "${pids[@]}"; do kill "$pid" 2>/dev/null || true; done; }
trap cleanup EXIT INT TERM

echo "Starting a Sepolia fork on :8545 (from $SEPOLIA_FORK_URL)"
anvil --fork-url "$SEPOLIA_FORK_URL" --port 8545 --silent >"$LOG_DIR/anvil-sepolia.log" 2>&1 &
pids+=($!)
echo "Starting a local Arc chain on :8546"
anvil --chain-id 5042002 --port 8546 --silent >"$LOG_DIR/anvil-arc.log" 2>&1 &
pids+=($!)

for url in "$SEPOLIA_LOCAL" "$ARC_LOCAL"; do
  for _ in $(seq 1 60); do cast chain-id --rpc-url "$url" >/dev/null 2>&1 && break; sleep 0.5; done
  cast chain-id --rpc-url "$url" >/dev/null || { echo "anvil at $url did not start"; exit 1; }
done

# The real Arc testnet has Multicall3 at its canonical address; give the local chain the same.
MULTICALL3=0xcA11bde05977b3631167028862bE2a173976CA11
cast rpc anvil_setCode "$MULTICALL3" "$(cast code "$MULTICALL3" --rpc-url "$SEPOLIA_LOCAL")" --rpc-url "$ARC_LOCAL" >/dev/null

json() { node -p "require('$LOG_DIR/$1.json').$2"; }
script() { (cd "$CONTRACT" && FOUNDRY_PROFILE=local forge script "$@" --broadcast --slow -q); }

echo "Deploying MandateRegistry on the Sepolia fork"
script script/DeployRegistry.s.sol --rpc-url "$SEPOLIA_LOCAL" --unlocked --sender "$DEPLOYER"
REGISTRY=$(json 11155111 registry)

ROOT_OWNER=$(cast call "$ENS_REGISTRY" "owner(bytes32)(address)" "$BORROWER_ROOT" --rpc-url "$SEPOLIA_LOCAL")
echo "Handing the root names to the registry as their owner, $ROOT_OWNER (impersonated)"
cast rpc anvil_impersonateAccount "$ROOT_OWNER" --rpc-url "$SEPOLIA_LOCAL" >/dev/null
cast rpc anvil_setBalance "$ROOT_OWNER" 0x56BC75E2D63100000 --rpc-url "$SEPOLIA_LOCAL" >/dev/null
REGISTRY="$REGISTRY" script script/HandOverRoots.s.sol --rpc-url "$SEPOLIA_LOCAL" --unlocked --sender "$ROOT_OWNER"

echo "Deploying mock USDC and MandateLoans on the local Arc chain"
script script/local/DeployMockUsdc.s.sol --rpc-url "$ARC_LOCAL" --unlocked --sender "$DEPLOYER"
USDC=$(json 5042002 usdc)
USDC="$USDC" script script/DeployLoans.s.sol --rpc-url "$ARC_LOCAL" --unlocked --sender "$DEPLOYER"
LOANS=$(json 5042002 loans)

if [[ "${SEED:-1}" == "1" ]]; then
  echo "Seeding profiles and loans"
  REGISTRY="$REGISTRY" script script/local/SeedProfiles.s.sol --rpc-url "$SEPOLIA_LOCAL"
  LOANS="$LOANS" USDC="$USDC" script script/local/SeedLoans.s.sol --rpc-url "$ARC_LOCAL"
fi

cat >"$ROOT/frontend/.env.anvil.local" <<ENV
# Written by scripts/dev-chains.sh — local chains only.
VITE_SEPOLIA_RPC_URL=$SEPOLIA_LOCAL
VITE_ARC_RPC_URL=$ARC_LOCAL
VITE_REGISTRY_ADDRESS=$REGISTRY
VITE_LOANS_ADDRESS=$LOANS
VITE_USDC_ADDRESS=$USDC
VITE_DEV_WALLET=true
ENV

cat <<DONE

Local chains are ready.
  Sepolia fork  $SEPOLIA_LOCAL   MandateRegistry $REGISTRY
  Arc (local)   $ARC_LOCAL   MandateLoans    $LOANS   USDC $USDC

Now run the app:  cd frontend && npm run dev:anvil
Pick a "Dev wallet" account in the wallet menu. Ctrl-C here stops the chains.
DONE
wait
