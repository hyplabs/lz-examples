# lz-collect-module

`LZCollectModule` is a Lens Collect Module that allows creators to mint soulbound NFTs (OmniSBT) for their followers that are cross-chain compatible, via LayerZero.
- a creator attaches this module to one of their posts and specifies parameters such as the destination chain id
- any user that collects the post gets an OmniSBT minted on the destination chain

## blog post describing this project in detail [here](./blog/blog.md)

## setup + compile contracts
```
nvm use
yarn
yarn compile
```

## running tests
To test our Lens module, we use the same setup as seen in `@aave/lens-protocol`. We need to compile their contracts + copy over the generated types
```
cd node_modules/@aave/lens-protocol
npm run compile
cd ../../../
cp -r node_modules/@aave/lens-protocol/typechain-types typechain-types-lens
```

Now we can run our tests
```
yarn quick-test

# if you want to see the gas cost estimates
yarn test

# if you want to see coverage
yarn coverage
```

## deploying contracts
We deploy our `OmniSBT` contract on the destination chain (`fantom_testnet`) and the source chain (`mumbai`), as well as setting trusted remotes on both ends. Finally, we stub the `FollowCampaignModule` to be the deployer address

1. deploy `OmniSBT` contract on the destination chain `npx hardhat deploy-token-remote --network fantom_testnet`
2. deploy `OmniSBT` contract on the source chain + set trusted remote `npx hardhat deploy-token-source --network mumbai`
3. set trusted remote on the destination chain `npx hardhat set-trusted-remote --network fantom_testnet`

## stubbed transactions + tenderly infra
Considering that our `LZCollectModule` contract is what triggers mints of `OmniSBT` and it relies on lens module whitelisting - we can stub those transaction by setting the collect module to some permissioned address and triggering mints from an off-chain process

1. create a collection and set our lens testnet address as the collect module `npx hardhat stub-create-collection --network mumbai`
2. create a post that we will listen for collects on https://testnet.lenster.xyz/
3. address the `@TODO` in `processCollected.ts` and deploy our tenderly action `cd tenderly && npm run deploy`
  - NOTE: in order for our action to process the `Collect` event off `lens-protocol`, we must add their `InteractionLogic` lib to our tenderly project. You can do so by clicking "Add to project" here: https://dashboard.tenderly.co/contract/mumbai/0xefd400326635e016cbfcc309725d5b62fd9d3468
4. collect our post via lenster or by modifying our task `tasks/stub-collect-post.ts`
