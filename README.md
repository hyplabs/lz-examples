# lz-examples

## `GameItemONFT`
This contract implements `ONFT` so that token holders can bridge their NFTs and equip them against simulated attacks with other holders  

```
/**
 * @title GameItemONFT
 * @notice A simple ERC1155 implementation with the following functionality
 * - permissioned mints
 * - token owners can equip a single NFT to represent them during a "battle" with another token owner
 * - token owners can bridge their NFT to another supported chain (via layerzero)
 */
```

## `GameCurrencyOFT`

### Get Started
```bash
nvm use
yarn
yarn compile
```

### Deploy
To deploy our `GameItemONFT` contract on both chains:
```bash
npx hardhat deploy-onft --network mumbai

npx hardhat deploy-onft --network goerli
```

## Set Trusted Remote
Before our `GameItemONFT` contract on either chain can receive messages, we must set the trusted remote on both chains:
```bash
npx hardhat set-trusted-onft --network mumbai --remote goerli

npx hardhat set-trusted-onft --network goerli --remote mumbai
```

## Simulate + Bridge
Simulate the typical user flow with a series of transactions, which involve a bridge of our `GameItemONFT` token
1. we mint ourselves an NFT, which is equipped
2. we bridge our NFT to a destination chain, which burns it on source chain
3. if we attempt to attack another player with our NFT on the destination chain, we'll see that it reverts because our token was burned
4. we can check [LayerZero Scan](https://layerzeroscan.com/) to validate that our message was relayed
5. on the destination chain, we can attack another player with our newly minted NFT
```bash
npx hardhat simulate-bridge-onft --network mumbai --remote goerli

npx hardhat simulate-bridge-onft --network goerli --remote mumbai --attack
```
