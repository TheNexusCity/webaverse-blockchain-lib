import { Contract, Signer } from "ethers";

// These constants must match the ones used in the smart contract.
const SIGNING_DOMAIN_NAME = "Webaverse-voucher";
const SIGNING_DOMAIN_VERSION = "1";

/**
 * JSDoc typedefs.
 *
 * @typedef {object} NFTVoucher
 * @property {ethers.BigNumber | number} tokenId the id of the minted NFT
 * @property {ethers.BigNumber | number} nonce  The nonce is the number of vocuhers created from a given address, onced claimed it can never be re used
 * @property {ethers.BigNumber | number} expiry the expiry of voucher, hence cannot be calaimed after the due limit
 * @property {ethers.BytesLike} signature an EIP-712 signature of all fields in the NFTVoucher, apart from signature itself.
 */
export class ClaimableVoucher {
  contract: Contract;
  signer: Signer;
  chainId: Number;

  /**
   * Create a new LazyMinter targeting a deployed instance of the LazyNFT contract.
   *
   * @param {Object} options
   * @param {ethers.Contract} contract an ethers Contract that's wired up to the deployed contract
   * @param {ethers.Signer} signer a Signer whose account is authorized to transfer the NFTs on the deployed contract
   */
  constructor({ contract, signer, chainId }) {
    this.contract = contract;
    this.signer = signer;
    this.chainId = chainId;
  }

  /**
   * Creates a new NFTVoucher object and signs it using signing key provided.
   *
   * @param {ethers.BigNumber | number} tokenId the id of the minted NFT
   * @param {ethers.BigNumber | number} nonce  The nonce is the number of vocuhers created from a given address, onced claimed it can never be re used
   * @param {ethers.BigNumber | number} expiry the expiry of voucher, hence cannot be calaimed after the due limit
   *
   * @returns {NFTVoucher}
   */
  async createVoucher(tokenId, balance, nonce, expiry, chainId) {
    const voucher = { tokenId, balance, nonce, expiry };
    const types = {
      NFTVoucher: [
        { name: "tokenId", type: "uint256" },
        { name: "balance", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "expiry", type: "uint256" },
      ],
    };
    const domain = {
      name: SIGNING_DOMAIN_NAME,
      version: SIGNING_DOMAIN_VERSION,
      verifyingContract: this.contract.address,
      chainId,
    };

    const signature = await (this.signer as any)._signTypedData(
      domain,
      types,
      voucher
    );
    return {
      ...voucher,
      signature,
    };
  }
}

export default ClaimableVoucher;

