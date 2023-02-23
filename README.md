# lz-examples

### Get Started
```bash
nvm use
yarn
yarn compile
```

## `GameItemONFT1155`
This contract implements the `ONFT` standard and `ERC1155` so that token holders can bridge their NFTs and equip them against simulated attacks with other holders  

```
/**
 * @title GameItemONFT1155
 * @notice A simple ERC1155 implementation with the following functionality
 * - permissioned mints
 * - token owners can equip a single NFT to represent them during a "battle" with another token owner
 * - token owners can bridge their NFT to another supported chain (via layerzero)
 */
```

### Deploy
To deploy our `GameItemONFT1155` contract on both chains:
```bash
npx hardhat deploy-onft --network mumbai

npx hardhat deploy-onft --network goerli
```

### Set Trusted Remote
Before our `GameItemONFT1155` contract on either chain can receive messages, we must set the trusted remote on both chains:
```bash
npx hardhat set-trusted-onft --network mumbai --remote goerli

npx hardhat set-trusted-onft --network goerli --remote mumbai
```

### Simulate + Bridge
Simulate the typical user flow with a series of transactions, which involve a bridge of our `GameItemONFT1155` token
```bash
npx hardhat simulate-bridge-onft --network mumbai --remote goerli
```
1. we mint ourselves an NFT
2. this NFT is auto-equipped for attacks
3. we estimate the fee for sending our token to another chain
4. we bridge our NFT to a destination chain, paying a native fee. this burns our NFT on the source chain
5. we can check [LayerZero Scan](https://layerzeroscan.com/) to validate that our message was relayed
6. if we attempt to attack another player with our NFT on the source chain, we'll see that it reverts because our token was burned

on the destination chain, we can attack another player with our newly minted NFT
```bash
npx hardhat simulate-bridge-onft --network goerli --remote mumbai --attack
```

## `GameItemONFT721`
This contract implements the `ONFT` standard and `ERC721` so that token holders can bridge their NFTs and equip them against simulated attacks with other holders  

```
/**
 * @title GameItemONFT721
 * @notice A simple ERC721 implementation with the following functionality
 * - permissioned mints
 * - token owners can equip a single NFT to represent them during a "battle" with another token owner
 * - token owners can bridge their NFT to another supported chain (via layerzero)
 */
```

### Deploy
To deploy our `GameItemONFT721` contract on both chains:
```bash
npx hardhat deploy-onft-721 --network mumbai

npx hardhat deploy-onft-721 --network goerli
```

### Set Trusted Remote
Before our `GameItemONFT721` contract on either chain can receive messages, we must set the trusted remote on both chains:
```bash
npx hardhat set-trusted-onft-721 --network mumbai --remote goerli

npx hardhat set-trusted-onft-721 --network goerli --remote mumbai
```

### Simulate + Bridge
Simulate the typical user flow with a series of transactions, which involve a bridge of our `GameItemONFT721` token
```bash
npx hardhat simulate-bridge-onft-721 --network mumbai --remote goerli
```
1. we mint ourselves an NFT
2. this NFT is auto-equipped for attacks
3. we estimate the fee for sending our token to another chain
4. we bridge our NFT to a destination chain, paying a native fee. this burns our NFT on the source chain
5. we can check [LayerZero Scan](https://layerzeroscan.com/) to validate that our message was relayed
6. if we attempt to attack another player with our NFT on the source chain, we'll see that it reverts because our token was burned

on the destination chain, we can attack another player with our newly minted NFT
```bash
npx hardhat simulate-bridge-onft-721 --network goerli --remote mumbai --attack
```

## `GameCurrencyOFT`
