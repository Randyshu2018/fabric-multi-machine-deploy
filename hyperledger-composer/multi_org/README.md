## Hyperledger composer

A sample for hyperledger composer

### Prerequisites and setup:

To run Hyperledger Composer and Hyperledger Fabric, we recommend you have at least 4Gb of memory.

The following are prerequisites for installing the required development tools:

* Operating Systems: Ubuntu Linux 14.04 / 16.04 LTS (both 64-bit), or Mac OS 10.12
* Docker Engine: Version 17.03 or higher
* Docker-Compose: Version 1.8 or higher
* Node: 8.9 or higher (note version 9 is not supported)
* npm: v5.x
* git: 2.9.x or higher
* Python: 2.7.x
* A code editor of your choice, we recommend VSCode.
* more details please visit [Hyperledger composer](https://hyperledger.github.io/composer/installing/installing-prereqs.html)


Once you have completed the above setup, you will have provisioned a local network with the following docker container configuration:

* 2 CAs
* A Kafka orderer
* 2 peers (1 peer per Org)

## Bring up fabric network

```
cd fabric-multi-machine-deploy

./runApp.sh

```

## Run hyperldegr composer sample

``` 
cd hyperledger-composer/multi_org
./clear.sh
./run.sh
composer-rest-server
```

<a rel="license" href="http://creativecommons.org/licenses/by/4.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by/4.0/88x31.png" /></a><br />This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International License</a>.
