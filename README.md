# Node-Father Migrations 

## Requirements
- define new admin 
- allow admin to claim funds held by contract  (stkd-scrt, sscrt)

## Building The Contract 
```sh
sh scripts/build.sh
```

# Testing The Migration 

## 0. Install secretjs
```sh 
cd scripts && yarn 
```

## 1. upload test contract 
```sh
node main.js -1
```

## 2. Populate code-ID and code hash into scripts
this is done manually in main.js

## 3. Upload migration contract 
```sh
node main.js -2
```
## 4. Populate code-ID and code hash into scripts
this is done manually in main.js

## 5. Instantiate test contract
```sh
node main.js -3
```

## 6. Populate contract addr into scripts
this is done manually in main.js

## 7. Fund test contract with sscrt & stkd-scrt 
```sh
node main.js -4 
```
## 8. Migrate contract 
```sh 
node main.js -5
```
## 9. Clawback assets
```sh 
node main.js -5
```