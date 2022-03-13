import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'

import {
    nftmarketaddress, nftaddress
} from '../config'

import NFTMarket from '../artifacts/contracts/NFTMarket/NFTMarket.json'
import NFT from '../artifacts/contracts/NFT/NFT.json'

export default function MyAssets() {
    const [nfts, setNfts] = useState([])
    const [loadingState, setLoadingState] = useState('not-loaded')
    useEffect(() => {

        loadNFTs()
    }, [])
    async function loadNFTs() {
        const web3Modal = new Web3Modal({
            network: "mainnet",
            cacheProvider: true,
        })
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer =  provider.getSigner()
        const address = await signer.getAddress()
        console.log("signer:", signer.getAddress())
        const marketContract = new ethers.Contract(nftmarketaddress, NFTMarket, signer)
        const tokenContract = new ethers.Contract(nftaddress, NFT, provider)
        const offerCount = await marketContract.offerCount();
        const data = [];
        
        for ( var i = 1 ; i<=offerCount ; i++ ) {
            var tempId = await marketContract.offers(i);
            console.log("user",tempId.user, signer.getAddress())
            if (tempId.user == address) {
                data.push(tempId);
            }
        }
        console.log("data", data);
        const items = await Promise.all(data.map(async i => {
            const tokenUri = await tokenContract.tokenURI(i.id)
            const meta = await axios.get(tokenUri)
            let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
            let item = {
                price,
                tokenId: i.offerId.toNumber(),
                seller: i.seller,
                owner: i.owner,
                image: meta.data.image,
            }
            return item
        }))
        setNfts(items)
        setLoadingState('loaded')
    }
    if (loadingState === 'loaded' && !nfts.length) return (<h1 className="py-10 px-20 text-3xl">No assets owned</h1>)
    return (
        <div className="flex justify-center">
            <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                    {
                        nfts.map((nft, i) => (
                            <div key={i} className="border shadow rounded-xl overflow-hidden">
                                <img src={nft.image} className="rounded" />
                                <div className="p-4 bg-black">
                                    <p className="text-2xl font-bold text-white">Price - {nft.price} Matic</p>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    )
}