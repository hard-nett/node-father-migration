import { testContract, testContractCodeHash, secretjs, defaultSnips, migrationCodeHash } from './main.js'


let query_code_hash = async () => {
    let query = await secretjs.query.compute.codeHashByCodeId({
        code_id: 963,
    });
    console.log(query);
};
let query_contract_info = async () => {
    let query = await secretjs.query.compute.contractInfo({
        contract_address: "secret1k5kn0a9gqap7uex0l2xj96sw6lxwqwsghewlvn",
        code_hash: undefined,
    });
    console.log(query);
};

let query_contract_history = async () => {
    let query = await secretjs.query.compute.contractHistory({
        contract_address: testContract,
        code_hash: testContractCodeHash,
    });

    console.log(query);
};


const query_owner = async () => {
    const txQuery = await secretjs.query.compute.queryContract({
        contract_address: testContract,
        code_hash: migrationCodeHash, // optional but way faster
        query: { owner: {} },
    });
    console.log(txQuery);
}

const query_all_snips = async () => {
    for (const snip of defaultSnips) {
        const contractAddress = Object.values(snip)[0];
        const codeHash = Object.values(snip)[1];

        console.log(`Querying Contract Address: ${contractAddress} with Code Hash: ${codeHash}`);

        try {
            const txQuery = await secretjs.query.compute.queryContract({
                contract_address: testContract,
                code_hash: migrationCodeHash, // optional but way faster
                query: { query_balance: {} },
            });
            console.log(`Balance: ${txQuery}`);
        } catch (error) {
            console.error(`Error querying ${contractAddress}:`, error);
        }
    }
    console.log("All snips have been queried.");
};

export { query_contract_info, query_contract_history, query_all_snips, query_owner, query_code_hash }