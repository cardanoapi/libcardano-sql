## LibCardano SQL

**Usage Example**

- start node to kafka stream. refer [here](https://github.com/reeshavacharya/libcardano-kafka/blob/main/README.md)
- Run:  
    ```bash
    npx prisma generate
    ```
    and 
    ```bash
    npx prisma migrate dev
    ```
- Run test:
  ```bash 
  yarn test
  ``` 
- To run cardano-node:
  ```bash
  yarn cardano-node
    ```
