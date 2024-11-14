use cosmwasm_std::StdError;
use thiserror::Error;

#[derive(Error, Debug, PartialEq)]
pub enum ContractError {
    #[error("{0}")]
    Std(#[from] StdError),

    #[error("unauthorized")]
    Unauthorized {},

    #[error("FromUtf8Error: {0}")]
    JsonSerde(#[from] std::string::FromUtf8Error),

    // #[error("json_serde_wasm serialization error: {0}")]
    // JsonWasmSerialize(#[from] serde_json_wasm::ser::Error),
    #[error("json_serde_wasm deserialization error: {0}")]
    JsonWasmDeserialize(#[from] serde_json_wasm::de::Error),

    // #[error("semver parse error: {0}")]
    // SemverError(#[from] semver::Error),
    #[error("Not Owner")]
    OwnershipError(),
}
