// Import the page's CSS. Webpack will know what to do with it.
import "./stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

/*
 * When you compile and deploy your Voting contract,
 * truffle stores the abi and deployed address in a json
 * file in the build directory. We will use this information
 * to setup a Voting abstraction. We will use this abstraction
 * later to create an instance of the Voting contract.
 * Compare this against the index.js from our previous tutorial to see the difference
 * https://gist.github.com/maheshmurthy/f6e96d6b3fff4cd4fa7f892de8a1a1b4#file-index-js
 */

import ballot_artifacts from '../build/contracts/Ballot.json'

var Ballot = contract(ballot_artifacts);

var proposals = {"Göran Persson": 1, "Anders Borg": 2, "Blankt": 3}

$( document ).ready(function() {
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source like Metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

  Ballot.setProvider(web3.currentProvider);
  let proposals2 = Object.keys(proposals);
  for (var i = 0; i < proposals2.length; i++) {
    let name = proposals2[i];

    //Ballot.deployed().then(function(contractInstance) {
      //contractInstance.totalVotesFor.call(name).then(function(v) {
       // $("#" + proposals2[name]).html(v.toString());
      //});
    //})
  }

  // When user clicks vote
  $( "#vote" ).click(function(){
      // Authorize voter - get voter address from login 
      web3.eth.defaultAccount = web3.eth.accounts[0];
      var voterAddress1 = web3.eth.accounts[1]; // Change to real adresses!
      var voterAddress2 = web3.eth.accounts[2]; // Change to real adresses!
      var voterAddress3 = web3.eth.accounts[3]; // Change to real adresses!
      var voterAddress4 = web3.eth.accounts[4]; // Change to real adresses!
      
      window.console.log(voterAddress1 + "-- " + web3.eth.defaultAccount );
      console.log(Ballot.deployed());
      Ballot.deployed().then(function(contractInstance){
        // Check which proposal was voted for 
        var votedProposal;
        switch($("#candidate").val()) {
          case "Göran Persson":
              votedProposal = 1;
              break;
          case "Anders Borg":
              votedProposal = 2;
              break;
          case "Blankt":
              votedProposal = 3;
              break;
          default:
           
      }
        // Give the voter access to vote
        contractInstance.giveRightToVote(voterAddress1, {from: web3.eth.defaultAccount})
        // Cast the vote 
        contractInstance.vote(votedProposal, {from: voterAddress1}) // Change to real candidate
        try {
          $("#msg").html("Vote has been submitted. The vote count will increment as soon as the vote is recorded on the blockchain. Please wait.")
          $("#candidate").val("");
      
          /* Voting.deployed() returns an instance of the contract. Every call
          * in Truffle returns a promise which is why we have used then()
          * everywhere we have a transaction call
          */
      
        } catch (err) {
          console.log(err);
        }
    });

  });

  // When result is collected 
  $( "#results" ).click(function(){
    Ballot.deployed().then(function(contractInstance){
      contractInstance.winnerName.call({from: web3.eth.defaultAccount}).then(function(winnerTitle){
        window.alert(winnerTitle);
      })
    });
  });

});