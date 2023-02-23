// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;

import {ONFT721} from "@layerzerolabs/solidity-examples/contracts/token/onft/ONFT721.sol";

/**
 * @title GameItemONFT721
 * @notice A simple ERC721 implementation with the following functionality
 * - permissioned mints
 * - token owners can equip a single NFT to represent them during a "battle" with another token owner
 * - token owners can bridge their NFT to another supported chain (via layerzero)
 */
contract GameItemONFT721 is ONFT721 {
  struct PlayerScore {
    uint256 totalWins;
    uint256 totalLosses;
  }

  mapping (address => uint256) public equippedItems; // account => tokenId
  mapping (address => PlayerScore) public scores; // account => PlayerScore

  address public zroPaymentAddress; // the address of the ZRO token holder who would pay for all transactions
  uint256 public tokenIdCounter; // token ids will be 1-based

  modifier onlyTokenOwner(uint256 id) {
    require(ownerOf(id) == msg.sender, "ONLY_TOKEN_OWNER");
    _;
  }

  /**
   * @notice contract constructor
   * @param _name The NFT name
   * @param _symbol The NFT symbol
   * @param _minGasToTransfer The min amount of gas required to transfer, and also store the payload
   * @param _lzEndpoint The lz endpoint contract deployed on this chain
   */
  constructor(
    string memory _name,
    string memory _symbol,
    uint256 _minGasToTransfer,
    address _lzEndpoint
  ) ONFT721(_name, _symbol, _minGasToTransfer, _lzEndpoint) {}

  /**
   * @notice allows the contract owner to mint one token for the given `to` address
   * @param to the address to receive the new token
   */
  function mint(address to) external onlyOwner {
    // mint the item
    _mint(to, ++tokenIdCounter);

    // auto-equip the item for the player if none is already equipped
    if (equippedItems[to] == 0) {
      equippedItems[to] = tokenIdCounter;
    }
  }

  /**
   * @notice allows a token owner to equip a token for attacks
   * NOTE: for simplicity, the higher the token id, the stronger it is
   * @param id the id of the token to equip
   */
  function setEquippedItem(uint256 id) external onlyTokenOwner(id) {
    equippedItems[msg.sender] = id;
  }

  /**
   * @notice allows a token owner to bridge their tokens to another chain, by locking them on this one
   * NOTE: the chain must be set as a trusted remote
   * @param id the id of the token to bridge
   * @param toChainId the lz chain id to bridge the token to
   */
  function bridge(uint256 id, uint16 toChainId) external payable {
    sendFrom(
      msg.sender,
      toChainId,
      abi.encodePacked(msg.sender),
      id,
      payable(msg.sender),
      zroPaymentAddress,
      bytes("")
    );
  }

  /**
   * @notice allows a token owner to attack another player with their equipped item
   * NOTE: will revert if the caller's balance of their equipped item is 0 (ex: after bridging)
   * @param otherPlayer the other player to attack
   */
  function attack(address otherPlayer) external onlyTokenOwner(equippedItems[msg.sender]) {
    // attacking a defenseless player, shame!
    require(equippedItems[otherPlayer] != 0, "DEFENSELESS");

    // the player _had_ an equipped item, but then bridged it
    if (!_exists(equippedItems[otherPlayer])) {
      equippedItems[otherPlayer] = 0;
    }

    if (equippedItems[otherPlayer] < equippedItems[msg.sender]) { // we are stronger
      scores[msg.sender].totalWins++;
      scores[otherPlayer].totalLosses++;
    } else { // whoops
      scores[otherPlayer].totalWins++;
      scores[msg.sender].totalLosses++;
    }
  }

}
