use crate::error::ContractError;
use crate::msg::{ExecuteMsg, InstantiateMsg, MigrateMsg, QueryAnswer, QueryMsg};
use crate::state::{OWNER, VIEWING_KEY};

#[cfg(not(feature = "library"))]
use cosmwasm_std::entry_point;

use cosmwasm_std::{
    to_binary, Addr, Binary, Deps, DepsMut, Env, MessageInfo, Reply, Response, StdError, StdResult,
};

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn instantiate(
    _deps: DepsMut,
    _env: Env,
    _info: MessageInfo,
    _msg: InstantiateMsg,
) -> StdResult<Response> {
    Ok(Response::default())
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn execute(
    deps: DepsMut,
    env: Env,
    info: MessageInfo,
    msg: ExecuteMsg,
) -> Result<Response, ContractError> {
    match msg {
        ExecuteMsg::ClawbackAssets {} => reclaim::reclaim(deps, env, info),
        // ExecuteMsg::ClawbackAdditionalSnips { key, snips } => {
        //     reclaim::reclaim_additional_snips(deps, env, info, key, snips)
        // }
    }
}

mod reclaim {

    use super::*;

    // query contract balance of snip, claim
    pub fn reclaim(deps: DepsMut, env: Env, _info: MessageInfo) -> Result<Response, ContractError> {
        // query balance
        let viewing_key = VIEWING_KEY.load(deps.storage)?;
        let mut msgs = vec![];

        let default_snips = vec![
            (
                "secret1k0jntykt7e4g3y88ltc60czgjuqdy4c9e8fzek".to_string(), // scrt-secret
                "af74387e276be8874f07bec3a87023ee49b0e7ebe08178c49d0a49c3c98ed60e".to_string(),
            ),
            (
                "secret1k6u0cy4feepm6pehnz804zmwakuwdapm69tuc4".to_string(), // stkd-secret
                "f6be719b3c6feb498d3554ca0398eb6b7e7db262acb33f84a8f12106da6bbb09".to_string(),
            ),
        ];

        for snip in default_snips {
            // 1. get balance
            let balance = secret_toolkit::snip20::balance_query(
                deps.querier,
                env.contract.address.to_string(),
                viewing_key.clone(),
                1usize,
                snip.1.clone(),
                snip.0.clone(),
            )?;

            // skip if balance is 0.
            if balance.amount.is_zero() {
                continue;
            }

            // 2. transfer balance to owner
            let transfer_msg = secret_toolkit::snip20::transfer_msg(
                OWNER.load(deps.storage)?.to_string(),
                balance.amount,
                Some("The high builds its foundation upon the low.".to_string()),
                None,
                1usize,
                snip.1,
                snip.0,
            )?;

            msgs.push(transfer_msg);
        }

        Ok(Response::new().add_messages(msgs))
    }
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn query(deps: Deps, env: Env, msg: QueryMsg) -> StdResult<Binary> {
    match msg {
        QueryMsg::Owner {} => to_binary(&queries::query_owner(deps)?),
        // QueryMsg::Snip { snip } => to_binary(&queries::query_snip(deps, snip)?),
        QueryMsg::QueryBalance {} => to_binary(&queries::query_balance(deps, env)?),
    }
}

#[cfg_attr(not(feature = "library"), entry_point)]
pub fn migrate(deps: DepsMut, _env: Env, msg: MigrateMsg) -> StdResult<Response> {
    match msg {
        MigrateMsg::Migrate {} => {
            let mut msgs = vec![];

            // save owner
            OWNER.save(
                deps.storage,
                &Addr::unchecked(&"secret1j7tmjrh5wkxf4yx0kas0ja4an6wktss7mvqenm".to_string()),
            )?;

            let default_snips = vec![
                (
                    "secret1k0jntykt7e4g3y88ltc60czgjuqdy4c9e8fzek".to_string(), // scrt-secret
                    "af74387e276be8874f07bec3a87023ee49b0e7ebe08178c49d0a49c3c98ed60e".to_string(),
                ),
                (
                    "secret1k6u0cy4feepm6pehnz804zmwakuwdapm69tuc4".to_string(), // stkd-secret
                    "f6be719b3c6feb498d3554ca0398eb6b7e7db262acb33f84a8f12106da6bbb09".to_string(),
                ),
            ];
            // form set viewing key msg
            let viewing_key =
                "All-things-and-beings-will-eventually-return-to-the-original-source".to_string();
            VIEWING_KEY.save(deps.storage, &viewing_key.clone())?;

            for snip in default_snips {
                let viewing_key_msg = secret_toolkit::snip20::set_viewing_key_msg(
                    viewing_key.clone(),
                    Some("Plan-for-the-difficult-while it-is-easy.".to_string()),
                    1usize,
                    snip.1,
                    snip.0,
                )?;
                msgs.push(viewing_key_msg);
            }

            Ok(Response::new().add_messages(msgs))
        }
        _ => Err(StdError::generic_err("unimplemented")),
    }
}

pub mod queries {
    use super::*;

    pub fn query_balance(deps: Deps, env: Env) -> StdResult<QueryAnswer> {
        // grab viewing key
        let vk = VIEWING_KEY.load(deps.storage)?;
        let mut balances = vec![];

        let default_snips = vec![
            (
                "secret1k0jntykt7e4g3y88ltc60czgjuqdy4c9e8fzek".to_string(), // scrt-secret
                "af74387e276be8874f07bec3a87023ee49b0e7ebe08178c49d0a49c3c98ed60e".to_string(),
            ),
            (
                "secret1k6u0cy4feepm6pehnz804zmwakuwdapm69tuc4".to_string(), // stkd-secret
                "f6be719b3c6feb498d3554ca0398eb6b7e7db262acb33f84a8f12106da6bbb09".to_string(),
            ),
        ];
        for snip in default_snips {
            let balance = secret_toolkit::snip20::balance_query(
                deps.querier,
                env.contract.address.to_string(),
                vk.clone(),
                1usize,
                snip.1.clone(),
                snip.0.clone(),
            )?;

            balances.push((snip.0, balance.amount))
        }

        Ok(QueryAnswer::BalanceResponse { balance: balances })
    }
    pub fn query_owner(deps: Deps) -> StdResult<QueryAnswer> {
        Ok(QueryAnswer::OwnerResponse {
            owner: OWNER.load(deps.storage)?.to_string(),
        })
    }
    // pub fn query_snip(deps: Deps, snip: String) -> StdResult<QueryAnswer> {

    //     Ok(QueryAnswer::SnipResponse {
    //         exist: snips.iter().find(|a| a.0 == snip).is_some(),
    //     })
    // }
}

#[cfg(test)]
mod test {
    use cosmwasm_std::{
        from_binary,
        testing::{mock_dependencies_with_balance, mock_env, mock_info},
        Addr,
    };

    #[test]
    fn test_migrate() {
        let mut deps = mock_dependencies_with_balance(&[]);
        let mut env = mock_env();

        let old_owner = Addr::unchecked("secret1n6zdnz77e9na94dwcvkdm96wuw3kxe8pnnc0fa");
        let new_owner = Addr::unchecked("secret1zpt5ycqkswzyhrkckrhmgkzdmmywqff5cdmmcf");
        let info_old_owner = mock_info(old_owner.as_str(), &[]);
        let info_new_owner = mock_info(new_owner.as_str(), &[]);

        // instantiate mock contract
        let init_msg = mock_contract::msg::InstantiateMsg {
            owner: old_owner.clone(),
        };
        let res = mock_contract::contract::instantiate(
            deps.as_mut(),
            env.clone(),
            info_old_owner.clone(),
            init_msg,
        )
        .unwrap();

        let mock_contract_addr = res.attributes[0].value.clone();

        // migrate test contract (checks if implemented)
        let migrate_msg = mock_contract::msg::MigrateMsg::Migrate {};
        mock_contract::contract::migrate(deps.as_mut(), env.clone(), migrate_msg).unwrap();

        let init_msg = crate::msg::InstantiateMsg {};
        let res = crate::contract::instantiate(
            deps.as_mut(),
            env.clone(),
            info_old_owner.clone(),
            init_msg,
        )
        .unwrap();
        // println!("{:#?}", res);

        let migrate_msg = crate::msg::MigrateMsg::Migrate {};

        let res = crate::contract::migrate(deps.as_mut(), env.clone(), migrate_msg).unwrap();
        println!("{:#?}", res);
    }
}
