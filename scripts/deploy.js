import { wallet, oldWallet, testContract, secretjs, migrateSecretJs, migrationCodeId, txEncryptionSeed, testContractCodeId, testContractCodeHash, migrationCodeHash, defaultSnips } from './main.js'
import { MsgStoreCode, MsgInstantiateContract, MsgExecuteContract, SecretNetworkClient, BroadcastMode } from "secretjs";
import * as fs from "fs";



// stores contract, prints code hash & code id
let upload_contract = async (wasm) => {
    const msgs = new MsgStoreCode({
        sender: wallet.address, // Your address
        wasm_byte_code: wasm,
        source: "",
        builder: "",
    })
    // broadcast 
    const tx = await secretjs.tx.broadcast([msgs], {
        gasLimit: 2_000_000,
    });

    if (tx.code == 0) {
        const codeId = Number(
            tx.arrayLog.find((log) => log.type === "message" && log.key === "code_id").value
        );
        console.log("codeId:", codeId);
        const contractCodeHash = (await secretjs.query.compute.codeHashByCodeId({ code_id: codeId })).code_hash;
        console.log(`Contract hash: ${contractCodeHash}`);
    } else
        console.log(`Tx Error: ${tx.rawLog}`);
}

// initialize a new headstash contract
let instantiate_test_contract = async () => {
    let initMsg = {
        owner: oldWallet.address
    };

    const msgInstantiateContract = new MsgInstantiateContract({
        admin: oldWallet.address,
        sender: wallet.address, // Your address
        code_id: testContractCodeId, // Code ID of the contract
        code_hash: testContractCodeHash,
        init_msg: initMsg, // Contract initialization message
        label: "Migration Test" + Math.ceil(Math.random() * 10000),
    });

    // broadcast 
    const tx = await secretjs.tx.broadcast([msgInstantiateContract], {
        gasLimit: 400_000,
        broadcastMode: BroadcastMode.Block,
        // explicitSignerData: {chainId: "secret-4", accountNumber: 358310, sequence: 69}
    });

    // console.log(tx);
    //Find the contract_address in the logs
    if (tx.code === 0) {
        const contractAddress = tx.arrayLog.find(
            (log) => log.type === "message" && log.key === "contract_address"
        ).value
        console.log(contractAddress);
    } else {
        console.log(`Tx Error: ${tx.rawLog}`);
    }
}

let fund_test_with_snips = async (contract_address, code_hash, recipient, amount) => {
    // for each snip, run these commmands
    const msg = { transfer: { recipient, amount } }
    let tx = await secretjs.tx.compute.executeContract(
        {
            sender: wallet.address,
            contract_address,
            code_hash,
            msg: msg,
        },
        { gasLimit: 80_000, }
    )

    if (tx.code === 0) {
        console.log(tx)
        return tx.hash;
    } else {
        console.log(`Tx Error: ${tx.rawLog}`);
        return null;
    }
}

let migrate_contract = async (contract_address) => {
    const tx = await migrateSecretJs.tx.compute.migrateContract(
        {
            sender: oldWallet.address,
            contract_address,
            code_id: migrationCodeId,
            code_hash: migrationCodeHash,
            msg: { migrate: {} },
            sent_funds: [], // optional
        },
        { gasLimit: 200_000 },
    );

    if (tx.code === 0) {
        console.log(tx);
    } else {
        console.log(`Tx Error: ${tx.rawLog}`);
    }
}

let clawback_assets = async (contract_address) => {
    const tx = await secretjs.tx.compute.executeContract(
        {
            sender: wallet.address, // new owner after migration
            contract_address,
            code_hash: migrationCodeHash,
            msg: { clawback_assets: {} },
            sent_funds: [], // optional
        },
        { gasLimit: 200_000 },
    );
    if (tx.code === 0) {
        console.log(tx);
    } else {
        console.log(`Tx Error: ${tx.rawLog}`);
    }
}


let migrate_contracts = async () => {
    try {
        const contractsJson = await fs.readFile('./contracts.json', 'utf8');
        const contracts = JSON.parse(contractsJson);

        // Check if errors.json already exists and load its content if so
        let errors = [];
        const errorsFilePath = path.join(__dirname, 'errors.json');
        try {
            const existingErrorsJson = await fs.readFile(errorsFilePath, 'utf8');
            errors = JSON.parse(existingErrorsJson);
        } catch (error) {
            if (error.code !== 'ENOENT') { // Ignore if file does not exist
                console.error('Error reading existing errors.json:', error);
            }
        }

        // Iterate over each contract in the array
        for (const contract of contracts) {
            const { addr, hash } = contract;
            console.log(`Processing contract: ${addr} (Hash: ${hash})`);

            // Migrate contract
            const migrateTx = await migrate_contract(addr);
            if (migrateTx.code !== 0) {
                console.log(`Migration failed for ${addr}. Skipping clawback.`);
                errors.push({ addr, reason: 'Migration Failure', error: migrateTx.rawLog });
                continue; // Skip to the next contract if migration fails
            }

            // Clawback assets after successful migration
            console.log(`Migration successful for ${addr}. Proceeding with clawback...`);
            const clawbackTx = await clawback_assets(addr);
            if (clawbackTx.code !== 0) {
                console.log(`Clawback failed for ${addr}: ${clawbackTx.rawLog}`);
                errors.push({ addr, reason: 'Clawback Failure', error: clawbackTx.rawLog });
            }

        }
        // write error.json if any errors
        if (errors.length > 0) {
            const errorsJson = JSON.stringify(errors, null, 2);
            await fs.writeFile(errorsFilePath, errorsJson);
            console.log(`Errors encountered. Written to ${errorsFilePath}:`);
            console.log(errorsJson);
        }
    } catch (error) {
        console.error('Error migrating contracts:', error);
    }
};

// Function to instantiate contracts in batches
// let instantiate_test_contracts_batch = async (batchSize, batchIndex) => {
//     const initMsgs = Array(batchSize).fill(null).map(() => ({
//         owner: oldWallet.address,
//     }));

//     const msgsInstantiateContract = Array(batchSize).fill(null).map((_, index) => new MsgInstantiateContract({
//         admin: oldWallet.address,
//         sender: wallet.address,
//         code_id: testContractCodeId,
//         code_hash: testContractCodeHash,
//         init_msg: initMsgs[index],
//         label: `Migration Test Batch ${batchIndex}-${Math.ceil(Math.random() * 10000)}`,
//     }));

//     try {
//         // Broadcast the batch
//         const tx = await secretjs.tx.broadcast(msgsInstantiateContract, {
//             gasLimit: 50_000 * batchSize, // Adjust gas limit for the batch
//         });

//         if (tx.code === 0) {
//             // Extract contract addresses from logs
//             const contractAddresses = tx.arrayLog
//                 .filter(log => log.type === "message" && log.key === "contract_address")
//                 .map(log => log.value);

//             console.log(`Batch ${batchIndex} Contract Addresses:`, contractAddresses);
//             return contractAddresses;
//         } else {
//             console.error(`Batch ${batchIndex} Tx Error: ${tx.rawLog}`);
//             return { error: `Batch ${batchIndex} Tx Error: ${tx.rawLog}` };
//         }
//     } catch (error) {
//         console.error(`Error in Batch ${batchIndex}:`, error);
//         return { error: `Error in Batch ${batchIndex}: ${error.message}` };
//     }
// };


// Updated function to form and broadcast a batch of clawback messages
// let broadcast_clawback_batch = async (contractAddresses) => {
//     const msgs = contractAddresses.map((contractAddress) => ({
//         execute_contract: {
//             sender: wallet.address, // new owner after migration
//             contract_address: contractAddress,
//             code_hash: migrationCodeHash,
//             msg: { clawback_assets: {} },
//         }
//     }));

//     const gasLimit = 200_000 * msgs.length; // Adjust gas limit based on batch size
//     const tx = await secretjs.tx.compute.broadcast(
//         { sender: wallet.address, msgs },
//         { gasLimit }
//     );

//     if (tx.code === 0) {
//         console.log(tx);
//         return msgs.length; // Return the number of successful clawbacks in the batch
//     } else {
//         console.log(`Tx Error: ${tx.rawLog}`);
//         throw new Error(`Failed to broadcast clawback batch: ${tx.rawLog}`);
//     }
// };


// let test_multiple_contract_migrations = async () => {
//     const numContracts = 30;
//     const batchSize = 20;
//     const fundingBatchSize = 15;
//     const amount = "10000"

//     const account = await secretjs.query.auth.account({ address: wallet.address });
//     wallet.sequence = account.sequence;
//     // Calculate number of batches
//     const numBatches = Math.ceil(numContracts / batchSize);

//     // Track instantiated contract addresses
//     let contractAddresses = [];

//     // 1. Instantiate 30 test contract addresses
//     for (let i = 0; i < numBatches; i++) {
//         const batchContractCount = Math.min(batchSize, numContracts - (i * batchSize));
//         console.log(`Processing Batch ${i + 1} of ${numBatches} (Contracts: ${batchContractCount})...`);

//         await new Promise(resolve => setTimeout(resolve, 10000));
//         const batchAddresses = await instantiate_test_contracts_batch(batchContractCount, i + 1);
//         if (Array.isArray(batchAddresses)) {
//             contractAddresses.push(...batchAddresses);
//         }
//     }

//     // // 2. Fund the new contract addresses with defaultSnips
//     for (let recipient of contractAddresses) {
//         for (let snip of defaultSnips) {
//             await new Promise(resolve => setTimeout(resolve, 7000));
//             let txHash = await fund_test_with_snips(snip.addr, snip.hash, recipient, amount);
//             if (txHash !== null) {
//                 console.log(`Funded ${recipient} with ${amount} of snip at ${snip.addr}. Tx hash: ${txHash}`);
//             } else {
//                 console.log(`Failed to fund ${recipient} with ${amount} of snip at ${snip.addr}.`);
//             }
//         }
//     }

//     // 3. Migrate new contracts
//     for (const [index, contractAddress] of contractAddresses.entries()) {
//         console.log(`Migrating contract ${index + 1} of ${numContracts}...`);
//         // Wait for at least 6 seconds before proceeding
//         await new Promise(resolve => setTimeout(resolve, 6500));
//         await migrate_contract(contractAddress)
//             .then(() => console.log(`Successfully migrated contract ${index + 1}`))
//             .catch((error) => console.error(`Error migrating contract ${index + 1}:`, error));
//     }

//     // wait between functions for assurance
//     await new Promise(resolve => setTimeout(resolve, 2500));

//     const batchedClawbackPromises = [];

//     // 4. Perform clawback for each
//     for (let batchIndex = 0; batchIndex < contractAddresses.length; batchIndex += batchSize) {
//         const batchContractAddresses = contractAddresses.slice(batchIndex, batchIndex + batchSize);
//         console.log(`Preparing clawback batch for contracts ${batchIndex + 1} to ${batchIndex + batchContractAddresses.length}...`);

//         // Wait for at least 6 seconds before broadcasting the batch
//         await new Promise(resolve => setTimeout(resolve, 6500));

//         // Broadcast the batched messages
//         await broadcastClawbackBatch(batchContractAddresses)
//             .then((successCount) => console.log(`Successfully performed clawback for ${successCount} contracts in batch`))
//             .catch((error) => console.error(`Error broadcasting clawback batch:`, error));
//     }
// };


export { upload_contract, instantiate_test_contract, fund_test_with_snips, migrate_contract, clawback_assets }