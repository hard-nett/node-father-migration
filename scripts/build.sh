# 1. build the contracts 
cd secret-crates && RUSTFLAGS='-C link-arg=-s' cargo build --release --target wasm32-unknown-unknown

# 2. move buil