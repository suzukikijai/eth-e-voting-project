pragma solidity ^0.4.11;

/// @title Voting with delegation.
contract Ballot {
    // This declares a new complex type which will
    // be used for variables later.
    // It will represent a single voter.
    struct Voter {
        uint weight; // weight is accumulated by delegation
        bool voted;  // if true, that person already voted
        uint vote;   // index of the voted proposal
    }

    // This is a type for a single proposal.
    struct Proposal {
        bytes32 party;   // short name (up to 32 bytes)
        uint voteCount; // number of accumulated votes
        bytes32 candidateName;
    }

    address public chairperson;
    uint electionEndTime = 0;
    bool electionHasStarted = false;

    uint blockNo;
    // This declares a state variable that
    // stores a `Voter` struct for each possible address.
    mapping(address => Voter) public voters;

    // A dynamically-sized array of `Proposal` structs.
    Proposal[] public proposals;

    /// Create a new ballot to choose one of `proposalNames`.
    function Ballot(bytes32[] proposalNames) {
        chairperson = msg.sender;
        voters[chairperson].weight = 1;

        // For each of the provided proposal names,
        // create a new proposal object and add it
        // to the end of the array.
        for (uint i = 0; i < proposalNames.length; i++) {
            // `Proposal({...})` creates a temporary
            // Proposal object and `proposals.push(...)`
            // appends it to the end of `proposals`.
            proposals.push(Proposal({
                candidateName: proposalNames[i],
                voteCount: 0,
                party: "sossarna" // FIX PARTY 
            }));
        }
    }
    // Function to start an election by setting end time in epoch-seconds
    function startElection(uint duration) {
        require(msg.sender == chairperson);
        electionEndTime = block.timestamp + duration;
        electionHasStarted = true;
    }

    // This function returns the total votes a candidate has received so far
    function totalVotesFor(uint proposal) returns (uint numberOfVotes) {
        require(electionHasStarted);
        require(now > electionEndTime);
        numberOfVotes = proposals[proposal].voteCount;
    }

    // Give `voter` the right to vote on this ballot.
    // Hardcode addresses before election 
    function giveRightToVote(address voter) {
        require((msg.sender == chairperson) && !voters[voter].voted && (voters[voter].weight == 0));
        voters[voter].weight = 1;
    }

    /// Give your vote (including votes delegated to you)
    /// to proposal `proposals[proposal].name`.
    function vote(uint proposal) {
        // Check if election is still active 
        require(electionHasStarted);
        require(now < electionEndTime);

            Voter storage sender = voters[msg.sender];
            require(!sender.voted);
        
            sender.voted = true;
            sender.vote = proposal;

            // If `proposal` is out of the range of the array,
            // this will throw automatically and revert all
            // changes.
            proposals[proposal].voteCount += sender.weight;
    }

    // Return the vote  -- should only be called by voter
    function getVotersVote(address voterAddress) constant // constant == read-only 
            returns (bytes32 proposalTitle)
    {   
        // require(msg.sender = voteraddress);
        uint votedVote = voters[voterAddress].vote;
        proposalTitle = proposals[votedVote].candidateName;
    }


    /// @dev Computes the winning proposal taking all
    /// previous votes into account.
    function winningProposal() constant
            returns (uint winner)
    {
        uint winningVoteCount = 0;
        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winner = p;
            }
        }
    }

    // Calls winningProposal() function to get the index
    // of the winner contained in the proposals array and then
    // returns the name of the winner
    function winnerName()
            returns (bytes32 winnerTitle)
    {   
        require(electionHasStarted);
        require(now > electionEndTime);
        winnerTitle = proposals[winningProposal()].candidateName;
    }

    // Function to change a vote already casted 
    function changeVotersVote(uint proposal) {
        
        require(electionHasStarted);
        require(now < electionEndTime);
        Voter storage sender = voters[msg.sender];
        // Check that a vote already exists 
        require(sender.voted);
        // Deduct the old vote 
        proposals[sender.vote].voteCount -= 1;
        // Add the new vote 
        sender.vote = proposal;
        proposals[proposal].voteCount += 1; 
    }

    // Function removes vote to be called when they casted it live instead  
    // NOT TESTED! 
    function removeVotersVote(address voter) {
        Voter storage sender = voters[voter];
        proposals[sender.vote].voteCount -= 1;
        delete voters[voter];
    }
    // Dummy function just to get a new block for correct timestamp 
    // REMOVE - when launched on testnet
    function updateBlockNo(uint no) {
        blockNo = no;
    }
}