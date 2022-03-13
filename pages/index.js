import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from "web3modal"

import {
  nftaddress, nftmarketaddress
} from '../config'

import NFT from '../artifacts/contracts/NFT/NFT.json'
import NFTMarket from '../artifacts/contracts/NFTMarket/NFTMarket.json'

let rpcEndpoint = null

if (process.env.NEXT_PUBLIC_WORKSPACE_URL) {
  // rpcEndpoint = process.env.NEXT_PUBLIC_WORKSPACE_URL;
  rpcEndpoint = "https://mainnet.infura.io/v3/f244f3bcf858457fbf912cfccdc29d06";
}

export default function Home() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  useEffect(() => {
    loadNFTs()
  }, [])
  async function loadNFTs() {
    const provider = new ethers.providers.JsonRpcProvider("https://polygon-mumbai.g.alchemy.com/v2/xHPOnjBbuaxmLrplS4_doaadd3L-0Jmr")
    const tokenContract = new ethers.Contract(nftaddress, NFT, provider)
    const marketContract = new ethers.Contract(nftmarketaddress, NFTMarket, provider)
    const offerCount = await marketContract.offerCount();
    console.log("offerCount: " , offerCount);
    const data = [];
    for ( var i = 1 ; i<=offerCount ; i++ ) {
      var tempId = await marketContract.offers(i);
      data.push(tempId);
    }
    // console.log("data", data);
    const items = await Promise.all(data.map(async i => {
      const tokenUri = await tokenContract.tokenURI(i.id)
      console.log("tokenUri", tokenUri)
      const meta = await axios(tokenUri, {timeout:200000})
      console.log("meta", meta);
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price:price,
        itemId: i.offerId.toNumber(),
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description,
      }
      return item
    }))
    // console.log( "items", items);
    setNfts(items)
    setLoadingState('loaded')
  }
  async function buyNft(nft) {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(nftmarketaddress, NFTMarket, signer)

    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')
    console.log("NFT", nft);
    const transaction = await contract.fillOffer( nft.itemId, {
      value: price
    })
    await transaction.wait()
    loadNFTs()
  }
  if (loadingState === 'loaded' && !nfts.length) return (<h1 className="px-20 py-10 text-3xl">No items in marketplace</h1>)
  return (
    <div className="flex justify-center">
      <div className="px-4" style={{ maxWidth: '1600px' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            nfts.map((nft, i) => (
              <div key={i} className="border shadow rounded-xl overflow-hidden">
                <img src={nft.image} />
                <div className="p-4">
                  <p style={{ height: '64px' }} className="text-2xl font-semibold">{nft.name}</p>
                  <div style={{ height: '70px', overflow: 'hidden' }}>
                    <p className="text-gray-400">{nft.description}</p>
                  </div>
                </div>
                <div className="p-4 bg-black">
                  <p className="text-2xl mb-4 font-bold text-white">{nft.price} ETH</p>
                  <button className="w-full bg-pink-500 text-white font-bold py-2 px-12 rounded" onClick={() => buyNft(nft)}>Buy</button>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}