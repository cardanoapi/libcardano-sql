import { execSync } from "child_process";
import { writeFileSync } from "fs";

export function generateSchema() {
    execSync(`touch schema.prisma`)
    const schema = `// database
    datasource db {
      provider = "sqlite"
      url      = "file:./blockchain.sqlite3"
    }
    
    // generator
    generator client {
      provider = "prisma-client-js"
    }
    
    // data models 
    model Blockchain {
      slotNo           Int    @id
      // headerHash Bytes  @unique
      blockNo          Int
      block       Blocks @relation(fields: [headerHash], references: [headerHash])
      headerHash Bytes
    }
    
    model Blocks {
      headerHash Bytes        @id
      header     Bytes
      body       Bytes?
      // blockchain blockchain? @relation(fields: [headerHash], references: [headerHash]) // Define a nullable foreign key
      blockchain Blockchain[]
    }
    
    model Transactions {
      hash      Bytes    @id
      content   Bytes?
      firstSeen DateTime
    }
    
    model KafkaData {
      kafkaHeaderHash Bytes @id
      kafkaBlockNo    Int
      kafkaSlotNo     Int
    }
    `
    writeFileSync('schema.prisma', schema)
    execSync(`npx prisma generate`)
    execSync(`npx prisma migrate dev`)
}

generateSchema()