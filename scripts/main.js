import { Wallet, SecretNetworkClient, EncryptionUtilsImpl, } from "secretjs";
import { upload_contract, instantiate_test_contract, fund_test_with_snips, clawback_assets, migrate_contract } from "./deploy.js";
import { query_contract_info, query_contract_history, query_all_snips, query_owner, query_code_hash } from './queries.js'
import * as fs from "fs";

// wallets
export const wallet = new Wallet(""); // new admin that will receive funds after migration
export const oldWallet = new Wallet(""); // old admin, that is able to call the migrate entry point

// signing client 
export const txEncryptionSeed = EncryptionUtilsImpl.GenerateNewSeed();
export const secretjs = new SecretNetworkClient({
    chainId: "secret-4",
    url: "https://lcd.mainnet.secretsaturn.net",
    wallet: wallet,
    walletAddress: wallet.address,
    txEncryptionSeed: txEncryptionSeed
});

export const migrateSecretJs = new SecretNetworkClient({
    chainId: "secret-4",
    url: "https://lcd.mainnet.secretsaturn.net",
    wallet: oldWallet,
    walletAddress: oldWallet.address,
    txEncryptionSeed: txEncryptionSeed
});


// wasm binary 
export const testContract_blob = fs.readFileSync("../secret-crates/target/wasm32-unknown-unknown/release/mock_contract.wasm");
export const migration_contract_blob = fs.readFileSync("../secret-crates/target/wasm32-unknown-unknown/release/node_father_migration.wasm");

// contract code-id 
export const testContractCodeId = 2038;
export const testContractCodeHash = "d4e05b6cad0c0405b6465dcb6546e17622824936c2fbf6301cc5d1f8f130410b";
export const migrationCodeId = 2039;
export const migrationCodeHash = "cac954fc00756e27ecb739a775b320300bb82723cb5dfd740a23f80e69cd7593";


// contract addrs
export const testContract = "secret1n9sr0d2m45088h2k0n70e7hrph9v23lpj8pjma";
// expected token snip contract addr
export const stkdScrtAddr = "secret1k6u0cy4feepm6pehnz804zmwakuwdapm69tuc4";
export const stkdScrtCodeHash = "f6be719b3c6feb498d3554ca0398eb6b7e7db262acb33f84a8f12106da6bbb09";
export const scrtScrtAddr = "secret1k0jntykt7e4g3y88ltc60czgjuqdy4c9e8fzek";
export const scrtScrtCodeHash = "af74387e276be8874f07bec3a87023ee49b0e7ebe08178c49d0a49c3c98ed60e";
export const defaultSnips = [{ addr: stkdScrtAddr, hash: stkdScrtCodeHash }, { addr: scrtScrtAddr, hash: scrtScrtCodeHash }]
// amount of snip to send to contract


// Process command line arguments
const args = process.argv.slice(2);
if (args.length < 1) {
    console.error('Invalid option.');
} else if (args[0] === '-1') {
    upload_contract(testContract_blob)
} else if (args[0] === '-2') {
    upload_contract(migration_contract_blob);
} else if (args[0] === '-3') {
    instantiate_test_contract();
} else if (args[0] === '-4') {
    fund_test_with_snips();
} else if (args[0] === '-5') {
    migrate_contract(testContract);
} else if (args[0] === '-6') {
    clawback_assets(testContract);
} else if (args[0] === '-7') {
    migrate_contracts();
} else if (args[0] === '-8') {
    query_contract_info();
} else if (args[0] === '-9') {
    query_contract_history();
} else if (args[0] === '-10') {
    query_owner();
} else if (args[0] === '-11a') {
    query_all_snips();
} else if (args[0] === '-11b') {
    query_owner();
} else if (args[0] === '-12') {
    query_code_hash();
    // } else if (args[0] === '-13') {
    //     test_multiple_contract_migrations();
} else {
    console.error('Invalid option.');
}