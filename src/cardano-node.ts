import { Kafka } from 'libcardano-kafka/kafka'
import { install_kafka_subscriber } from 'libcardano-kafka/index'
import { InmemoryBlockchain } from 'libcardano/src/InmemoryBlockchain'
import { NodePeer } from 'libcardano/src/network'
import { getBlockInfo, install_db_subscriber } from '.'
import {BlockFetch, ChainSync, HandShake, KeepAlive, TxSubmission} from 'libcardano/src/protocol';
import { ChainPoint } from 'libcardano/src/types'

const k = new Kafka(["kafka.sireto.dev:9092"], 'blockchain')
const blockchain = new InmemoryBlockchain()
const url = process.argv[2] || '172.31.0.6:3004'
const peer = new NodePeer(url)
install_db_subscriber(blockchain).then(() => {
    install_kafka_subscriber(k, blockchain)
    peer.connect((err) => {
        if (!err) {
            const handShakeProtocol = peer.createProtocolChannel(0)!
            HandShake.initiate(handShakeProtocol, () => {
                // persistance.subscribe(blockchain,{
                //   fetchBlock(hash:Buffer){
                //     console.warn("[WARN] ignoring block fetch request:",hash.toString('hex'))
                //   }
                // })
                let listening: any;
                listening = () => {
                    startServer()
                    blockchain.unsubscribe("extendBlock", listening)
                }
                blockchain.on("extendBlock", listening)
                const txSubmissionChannel = peer.createProtocolChannel(4)!
                TxSubmission.initiate(txSubmissionChannel)

                // const keepAliveChannel=peer.createProtocolChannel(8)!
                // KeepAlive.initiate(keepAliveChannel)

                const chainSyncChannel = peer.createProtocolChannel(2)!
                ChainSync.initiate(chainSyncChannel, blockchain)

                const blockFetchChannel = peer.createProtocolChannel(3)!
                const blockFetch = new BlockFetch(blockFetchChannel)

                blockchain.setBlockSource((start, end, cb) => {
                    blockFetch.requestBlocks(start, end, {
                        onBlock(block: Buffer): void {
                            cb(block)
                        },
                        onComplete(start: ChainPoint, end: ChainPoint): void {
                            console.log("BlockFetch complete")
                        },
                        onError(reason: string): void {
                            console.log("BlockFetch: Unexpected error", reason)
                        }

                    })
                })
            }, 4)
        }
    })


})

// connect to a peer, perform handshake and then start server functionality 

function startServer() {
    NodePeer.listen('0.0.0.0', 3004, peer => {
        const handshakeChannel = peer.createProtocolChannel(0)!
        HandShake.accept(handshakeChannel, (success) => {
            if (success) {
                const txSubmissionChannel = peer.createProtocolChannel(4)!
                TxSubmission.listen(txSubmissionChannel)

                const keepAliveChannel = peer.createProtocolChannel(8)!
                KeepAlive.listen(keepAliveChannel)

                const chainSyncChannel = peer.createProtocolChannel(2)!
                ChainSync.listen(chainSyncChannel, blockchain)
            }
        })
    })
}


