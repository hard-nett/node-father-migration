# Node-Father Migrations 

## Requirements
- define new admin 
- allow admin to claim funds held by contract  (stkd-scrt, sscrt)

## Building The Contract 
```sh
sh scripts/build.sh
```

# Testing The Migration 

in `scripts/main.js`, we use two keys to test the migration: `wallet` and `oldWallet`. during migration, `oldWallet` is expected to be the wasmVm level admin authroized to migrate. multiple wallets were used for testing purposes. `secret1j7tmjrh5wkxf4yx0kas0ja4an6wktss7mvqenm` is the wallet address hard-coded as migrated contracts admin. 

## 0. Install secretjs
```sh 
cd scripts && yarn 
```

## 1. upload test contract 
```sh
node main.js -1
```

## 2. Populate test contract code-ID and code hash into scripts
this is done manually in main.js,  line # 34-35

## 3. Upload migration contract 
```sh
node main.js -2
```
## 4. Populate migration contract code-ID and code hash into scripts
this is done manually in main.js, line # 36-37

## 5. Instantiate test contract
```sh
node main.js -3
```

## 6. Populate test contract addr into scripts
this is done manually in main.js, line # 41

## 7. Fund test contract with sscrt & stkd-scrt  (or manually)
```sh
node main.js -4 
```
## 8. Migrate contract 
```sh 
node main.js -5
```
## 9. Clawback assets
```sh 
node main.js -6
```