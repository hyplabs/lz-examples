// SPDX-License-Identifier: MIT

pragma solidity 0.8.10;

import {ONFT1155} from "@layerzerolabs/solidity-examples/contracts/token/onft/ONFT1155.sol";

/**
 * @title GameItemONFT
 * @notice A simple ERC1155 implementation with the following functionality
 * - permissioned mints
 * - token owners can equip a single NFT to represent them during a "battle" with another token owner
 * - token owners can bridge their NFT to another supported chain (via layerzero)
 */
contract GameItemONFT is ONFT1155 {
  struct PlayerScore {
    uint256 totalWins;
    uint256 totalLosses;
  }

  mapping (address => uint256) public equippedItems; // account => tokenId
  mapping (address => PlayerScore) public scores; // account => PlayerScore

  address public zroPaymentAddress; // the address of the ZRO token holder who would pay for all transactions

  modifier onlyTokenOwner(uint256 id) {
    require(balanceOf(msg.sender, id) != 0, "ONLY_TOKEN_OWNER");
    _;
  }

  /**
   * @notice contract constructor
   * @param _uri The URI for all token types by relying on ID substitution
   * @param _lzEndpoint The lz endpoint contract deployed on this chain
   */
  constructor(
    string memory _uri,
    address _lzEndpoint
  ) ONFT1155(_uri, _lzEndpoint) {}

  /**
   * @notice allows the contract owner to mint one token for the given `to` address
   * @param to the address to receive the new token
   * @param id the id of the new token
   */
  function mint(address to, uint256 id) external onlyOwner {
    require(id != 0, "NOT_ZERO");

    // mint the item
    _mint(to, id, 1, bytes(""));

    // auto-equip the item for the player if none is already equipped
    if (equippedItems[to] == 0) {
      equippedItems[to] = id;
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
   * @notice allows a token owner to bridge their tokens to another chain, by burning them on this one
   * NOTE: the chain must be set as a trusted remote
   * @param id the id of the token to bridge
   * @param amount the amount of tokens to bridge
   * @param toChainId the lz chain id to bridge the token to
   */
  function bridge(uint256 id, uint256 amount, uint16 toChainId) external payable {
    sendFrom(
      msg.sender,
      toChainId,
      abi.encodePacked(msg.sender),
      id, amount,
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
    if (balanceOf(otherPlayer, equippedItems[otherPlayer]) == 0) {
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
