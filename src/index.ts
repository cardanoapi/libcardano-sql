import {Blockchain, ChainPoint, ChainTip} from 'libcardano/src/types';
import {PrismaClientKnownRequestError} from "@prisma/client/runtime/library";
import { PrismaClient } from '@prisma/client'
import cbor from 'libcardano/lib/cbor';
import { Kafka } from 'libcardano-kafka/src/kafka';
const prisma = new PrismaClient()
let isExiting = false;
const k = new Kafka(["kafka.sireto.dev:9092"], 'blockchain')

// Gracefully handle process termination
process.on('SIGINT', async () => {
    // Check if the process is already exiting
    if (isExiting) {
        return;
    }

    isExiting = true;
    console.log('\nStopping application...');
    try {
        // Disconnect from the Prisma database
        await prisma.$disconnect();
        console.log('Prisma disconnected.');
    } catch (e) {
        console.error('Error disconnecting from Prisma:', e);
    } finally {
        // Exit the process
        process.exit();
    }
});

export function saveBlockHeader(hash:Buffer,headerData:Buffer,cb=()=>{}){
    return prisma.blocks.create({
        data:{
            headerHash : hash,
            header: headerData
        }
    }).catch((e: any)=>{
        console.error("Unexpected error saving block "+hash)
    })
}
export async  function saveBlock(hash:Buffer,blockBody:Buffer){
    return prisma.blocks.update({
        where:{
            headerHash:hash
        },
        data:{
            body: blockBody
        }
    })
}
export async function rollForward(tip:ChainTip){
    return prisma.blockchain.create({
        data:{
            blockNo : tip[1],
            slotNo: tip[0][0],
            headerHash: tip[0][1]
        }
    }).catch((e:any)=>{
        if(e instanceof PrismaClientKnownRequestError){
            console.error(e)
        }
        throw e

    })
}
export async function rollback(tip:ChainPoint){
    return  prisma.blockchain.deleteMany({
        where:{
            slotNo : {
                gt: tip[0]
            }
        }
    })
}

export async function install_db_subscriber(blockchain: Blockchain){

    return prisma.$connect().then(async ()=>{
        console.log("Database opened")
        const chainQuery= await prisma.blockchain.findMany({
            orderBy:{
                slotNo: 'desc'
            },
            take: 1000,
            select: {
                block:{
                    select:{
                        body: true
                    }
                }
            }
        })
        const chain =chainQuery.map((v: any)=>v.block.body!)
        blockchain.rewrite(chain.reverse())

        blockchain.pipeline('rollback',(to,head,cb)=>{
            console.log("Handling rollback")
            rollback(to[0]).then(()=>cb()).catch(cb)
        })
 
        blockchain.pipeline('extendBlock',(event,cb)=>{            
            const action=async()=>{
                let dbBlock = await prisma.blocks.findFirst({
                    "where":{
                        headerHash: event.headerHash
                    },select:{
                        header: true
                    }
                })
                if(!dbBlock){
                    dbBlock=await prisma.blocks.create({
                        data:{
                            header:event.header,
                            headerHash:event.headerHash,
                            body:event.body
                        }
                    })
                }
                await rollForward([[event.slotNo,event.headerHash],event.blockNo])

                return dbBlock
            }
            action().then(()=>cb()).catch(e=>{
                if(e){
                    cb(e)
                }else{
                    cb(new Error("UnknownError Saving block to chain"))
                }
            })
        })
    })
}

export async function getBlockInfo() {
    console.log("Writing from kafka to database...")
    return new Promise((resolve, reject) => {
        k.consumer.on('message', (message) => {
            if (message.value instanceof Buffer) {
                const chainPoint = cbor.decode(message.value)
                const blockNo = chainPoint.get('blockNo')
                const hash = chainPoint.get('headerHash')
                const slotNo = chainPoint.get('slotNo')
                writeToDatabase(blockNo, hash, slotNo)  
            }
        })
    })
}

async function writeToDatabase(blockNo: number, hash: Buffer, slotNo: number) {
    try {
        await prisma.kafkaData.create({
            data: {
                kafkaHeaderHash: hash,
                kafkaBlockNo: blockNo,
                kafkaSlotNo: slotNo
            }
        });
    } catch (error) {
        console.log("duplicate detected...");
        if (error instanceof PrismaClientKnownRequestError) {
            return;
        }
        console.error('Error saving Kafka data to the database:', error);
    }
}

