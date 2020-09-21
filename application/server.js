// ExpressJS Setup
const express = require('express');
const app = express();
var bodyParser = require('body-parser');

// Hyperledger Bridge
const { FileSystemWallet, Gateway } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const ccpPath = path.resolve(__dirname, '..', 'network' ,'connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

// use static file
app.use(express.static(path.join(__dirname, 'views')));

// configure app to use body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// main page routing
app.get('/', (req, res)=>{
    res.sendFile(__dirname + '/index.html');
})

async function cc_call(fn_name, args){
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = new FileSystemWallet(walletPath);

    const userExists = await wallet.exists('user1');
    if (!userExists) {
        console.log('An identity for the user "user1" does not exist in the wallet');
        console.log('Run the registerUser.js application before retrying');
        return;
    }

    const gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } });
    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('team-manager');

    var result;
    
    if (fn_name == 'addMember') {
        name = args[0];
        id = args[1];
        result = await contract.submitTransaction('addMember', name, id);
    } else if( fn_name == 'removeMember') {
        name = args[0];
        result = await contract.submitTransaction('removeMember', name);
    } else if(fn_name == 'readMember') {
        name = args[0];
        console.log("readMember in cc_call with " + name)
        result = await contract.evaluateTransaction('readMember', name);
    } else
        result = 'not supported function'
    
    return result;
}

// add member
app.post('/add', async(req, res) => {
    const name = req.body.name;
    const id = req.body.id;

    console.log(" ")
    console.log("* add member: ");
    console.log("- name : " + name)
    console.log("- id : " + id)

    var args = [name, id];
    result = await cc_call('addMember', args)
    const myobj = {result: "success"}
    res.status(200).json(myobj)
})

// remove member
app.post('/remove', async(req, res) => {
    const name = req.body.name;

    console.log(" ")
    console.log("* remove member: ")
    console.log("- name : " + name)

    var args = [name];
    result = await cc_call('removeMember', args)
    const myobj = {result: "success"}
    res.status(200).json(myobj)
})

// search member
app.post('/search', async(req, res) => {
    const name = req.body.name;

    console.log(" ")
    console.log("* search member: ")
    console.log("- name : " + name)

    var args = [name];
    var result = await cc_call('readMember', args)

    if (result.length == 0) {
        console.log("fail to find the member, " + name)
        result = {}
    }

    const myobj = JSON.parse(result)
    console.log("result: " + result)
    res.status(200).json(myobj)
})

// start server
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);