require("@nomiclabs/hardhat-waffle")
const fs = require("fs")
const privateKey = fs.readFileSync(".secret").toString()
//const projectId = fs.readFileSync(".infuraid").toString().trim() || "";
const projectId = "6a456e69c3a94303a5a97026827e8a46"
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337
    },

    mumbai: {
      // Infura
      url: `https://polygon-mumbai.infura.io/v3/${projectId}`,
      // url: 'https://polygon-mainnet.infura.io/v3/${projectId}',
      accounts: [privateKey]
    },
    mainnet: {
      // Infura
      url: `https://polygon-mainnet.infura.io/v3/${projectId}`,
      //url: "https://rpc-mainnet.maticvigil.com",
      accounts: [privateKey]
    }

  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
};
