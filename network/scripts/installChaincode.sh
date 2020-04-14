#!/bin/bash

echo
echo " ____    _____      _      ____    _____ "
echo "/ ___|  |_   _|    / \    |  _ \  |_   _|"
echo "\___ \    | |     / _ \   | |_) |   | |  "
echo " ___) |   | |    / ___ \  |  _ <    | |  "
echo "|____/    |_|   /_/   \_\ |_| \_\   |_|  "
echo
echo "Deploying Chaincode pharmanet On Certification Network"
echo
CHANNEL_NAME="$1"
DELAY="$2"
LANGUAGE="$3"
VERSION="$4"
TYPE="$5"
: ${CHANNEL_NAME:="pharmachannel"}
: ${DELAY:="5"}
: ${LANGUAGE:="node"}
: ${VERSION:=1.1}
: ${TYPE="basic"}

LANGUAGE=`echo "$LANGUAGE" | tr [:upper:] [:lower:]`
ORGS="manufacturer transporter distributor retailer consumer"
TIMEOUT=15
CC_SRC_PATH="/opt/gopath/src/github.com/hyperledger/fabric/peer/chaincode/"


echo "Channel name : "$CHANNEL_NAME

# import utils
. scripts/utils.sh

## Install new version of chaincode on peer of all orgs making them endorsers
echo "Installing chaincode on peer0.manufacturer.pharma-network.com ..."
installChaincode 0 'manufacturer' $VERSION
echo "Installing chaincode on peer1.manufacturer.pharma-network.com ..."
installChaincode 1 'manufacturer' $VERSION
echo "Installing chaincode on peer0.transporter.pharma-network.com ..."
installChaincode 0 'transporter' $VERSION
echo "Installing chaincode on peer1.transporter.pharma-network.com ..."
installChaincode 1 'transporter' $VERSION
echo "Installing chaincode on peer0.distributor.pharma-network.com ..."
installChaincode 0 'distributor' $VERSION
echo "Installing chaincode on peer1.distributor.pharma-network.com ..."
installChaincode 1 'distributor' $VERSION
echo "Installing chaincode on peer0.retailer.pharma-network.com ..."
installChaincode 0 'retailer' $VERSION
echo "Installing chaincode on peer1.retailer.pharma-network.com ..."
installChaincode 1 'retailer' $VERSION
echo "Installing chaincode on peer0.consumer.pharma-network.com ..."
installChaincode 0 'consumer' $VERSION
echo "Installing chaincode on peer1.consumer.pharma-network.com ..."
installChaincode 1 'consumer' $VERSION

# Instantiate chaincode on the channel using peer0.manufacturer
echo "Instantiating chaincode on channel using peer0.manufacturer.pharma-network.com.com ..."
instantiateChaincode 0 'manufacturer' $VERSION

echo
echo "========= All GOOD, Chaincode pharmanet Is Now Installed & Instantiated On Pharma Network =========== "
echo

echo
echo " _____   _   _   ____   "
echo "| ____| | \ | | |  _ \  "
echo "|  _|   |  \| | | | | | "
echo "| |___  | |\  | | |_| | "
echo "|_____| |_| \_| |____/  "
echo

exit 0
