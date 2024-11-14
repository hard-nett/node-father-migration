use cosmwasm_std::StdError;
use thiserror::Error;

#[derive(Error, Debug, PartialEq)]
pub enum ContractError {
    #[error("{0}")]
    Std(#[from] StdError),

    #[error("unauthorized")]
    Unauthorized {},

    #[error("Not Owner")]
    OwnershipError(),

    #[error("unknown reply id: {0}")]
    UnknownReplyId(u64),
}
