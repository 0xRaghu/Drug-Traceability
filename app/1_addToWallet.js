'use strict';

/**
 * This is a Node.JS module to load a user's Identity to his wallet.
 * This Identity will be used to sign transactions initiated by this user.
 * Defaults:
 *  User Role: Admin
 *
 */

const fs = require('fs'); // FileSystem Library
const { FileSystemWallet, X509WalletMixin } = require('fabric-network'); // Wallet Library provided by Fabric
// const path = require('path'); // Support library to build filesystem paths in NodeJs

/**
 * 
 * @param {*} org Used to store the organisation's name for which the identity has to be created
 */
async function main(org) {

	/**ORG in the placeholder in the certificatePath variable which will be replaced 
	with the organisations's name based on the input parameter **/
	
	let certificatePath = '../network/crypto-config/peerOrganizations/ORG.pharma-network.com/users/Admin@ORG.pharma-network.com/msp/signcerts/Admin@ORG.pharma-network.com-cert.pem';
	certificatePath =  certificatePath.replace(/ORG/g,org); 
	
	/**ORG in the placeholder in the privateKeyFolderPath variable which will be replaced 
	with the organisations's name based on the input parameter **/
	let privateKeyFolderPath = '../network/crypto-config/peerOrganizations/ORG.pharma-network.com/users/Admin@ORG.pharma-network.com/msp/keystore'.replace(/ORG/g,org);
	/* A new keycert file is generated when the cryptogen command is run.
	The keycert file will be automatically read from the filesystem.
	*/ 
	const files = fs.readdirSync(privateKeyFolderPath)
	let privateKeyPath = privateKeyFolderPath + '/' + files[0];

	// Main try/catch block
	try {
		//A wallet is a filesystem path that stores a collection of Identities
		const wallet = new FileSystemWallet('./identity/'+org);
		// Fetch the credentials from our previously generated Crypto Materials required to create this user's identity
		const certificate = fs.readFileSync(certificatePath).toString();
		const privatekey = fs.readFileSync(privateKeyPath).toString();

		// Load credentials into wallet
		const identityLabel = org+'_admin';
		const msp = org+'MSP';
		const identity = X509WalletMixin.createIdentity(msp, certificate, privatekey);
		await wallet.import(identityLabel, identity);

	} catch (error) {
		console.log(`Error adding to wallet. ${error}`);
		console.log(error.stack);
		throw new Error(error);
	}
}

// var args = process.argv.slice(2);
// let org = args[0].toString();
// main(org).then(() => {
// 	console.log('identity added to wallet.');
//   });

module.exports.execute = main;
