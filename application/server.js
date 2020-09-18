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
    
    if(fn_name == 'addMember')
    {
        name = args[0];
        id = args[1];
        result = await contract.submitTransaction('addMember', name, id);
    }
    else if( fn_name == 'removeMember')
    {
        name = args[0];
        result = await contract.submitTransaction('removeMember', name);
    }
    else if(fn_name == 'readMember')
    {
        name = args[0];
        console.log("readMember in cc_call with " + name)
        result = await contract.evaluateTransaction('readMember', name);
    }
    else
        result = 'not supported function'
    
    return result;
}

// create mate
app.post('/add', async(req, res)=>{
    const name = req.body.name;
    const id = req.body.id;
    console.log("add member: " + name + id);

    var args = [name, id];
    result = cc_call('addMember', args)

    const myobj = {result: "success"}
    res.status(200).json(myobj)
    /*
    result = cc_call('addUser', email)

    const myobj = {result: "success"}
    res.status(200).json(myobj) 
    */
})

// add score
app.post('/remove', async(req, res)=>{
    const name = req.body.name;
    console.log("remove member: " + name)

    var args = [name];
    result = cc_call('removeMember', args)

    const myobj = {result: "success"}
    res.status(200).json(myobj)
    /*
    const email = req.body.email;
    const prj = req.body.project;
    const sc = req.body.score;
    console.log("add project email: " + email);
    console.log("add project name: " + prj);
    console.log("add project score: " + sc);

    var args=[email, prj, sc];
    result = cc_call('addRating', args)

    const myobj = {result: "success"}
    res.status(200).json(myobj) 
    */
})

app.post('/search', async(req, res)=>{
    const name = req.body.name;
    console.log("search member: " + name)

    var args = [name];
    const result = await cc_call('readMember', args)

    console.log("result: " + result)
    //res.status(200).json(result)

    /*
    setTimeout(function() {
        console.log("result: " + result)
        //console.log("parsedResult: " + JSON.parse(result))
        //const myobj = JSON.parse(result)
        res.status(200).json(result)
    }, 5000);
    */
})

// find mate
/*
app.post('/mate/:email', async (req,res)=>{
    const email = req.body.email;
    console.log("email: " + req.body.email);
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = new FileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    // Check to see if we've already enrolled the user.
    const userExists = await wallet.exists('user1');
    if (!userExists) {
        console.log('An identity for the user "user1" does not exist in the wallet');
        console.log('Run the registerUser.js application before retrying');
        return;
    }
    const gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } });
    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('teamate');
    const result = await contract.evaluateTransaction('readRating', email);
    const myobj = JSON.parse(result)
    res.status(200).json(myobj)
    // res.status(200).json(result)

});
*/
// server start
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);