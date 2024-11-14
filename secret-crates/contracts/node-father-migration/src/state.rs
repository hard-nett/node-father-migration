use cosmwasm_std::Addr;
use secret_toolkit::storage::Item;

pub const KEY_OWNER: &[u8] = b"ko";
pub const KEY_VIEWINGKEY: &[u8] = b"kvk";
pub const KEY_SNIPS: &[u8] = b"ks";

pub static OWNER: Item<Addr> = Item::new(KEY_OWNER);
pub static VIEWING_KEY: Item<String> = Item::new(KEY_SNIPS);
pub static COUNT: Item<u64> = Item::new(KEY_SNIPS);

// pub static SNIPS: Item<Vec<(String, String)>> = Item::new(KEY_SNIPS);
// #[derive(Serialize, Deserialize, Clone, Debug, Eq, PartialEq, JsonSchema)]
// pub struct Snip {
//     /// contract address of snip20
//     pub contract: String,
//     /// code-hash of snip20 (may have different versions)
//     pub code_hash: String,
// }

// #[derive(Serialize, Deserialize, Clone, Debug, Eq, PartialEq, JsonSchema)]
// pub struct SnipBalance {
//     /// contract address of snip20
//     pub contract: String,
//     /// code-hash of snip20 (may have different versions)
//     pub amount: Uint128,
// }
