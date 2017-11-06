var firstParty = '';
var firstCandidate = '';
var items;

$.getJSON("candidates.json", function( data ) {
  items = [data];
  console.log(items);
});
function generatePartyCards(election) {
  var electionCards;
  for (var i=0;i<items[0][election].party;i++) {
    //
  }
}
function generateCandidateTable() {
  var candidateTable = "<div class='table-responsive'><table class='table table-bordered'><thead><tr><th>"+ items[0][0].party+"</th></tr></thead><tbody>";
  for (var i=0; i<items[0][0].candidates.length; i++) {
    candidateTable += "<tr><td>" + items[0][0].candidates[i] + "<input type='checkbox' class='styled' id='cb-cand-1-" + i + "'/></td></tr>";
  }
  candidateTable += "</tbody></table></div>";
  return candidateTable;
}
//Göra:
//Funktionalitet för att ändra sin röst
//Producera lista med kandidater
//sliders?

//Onload
$(function() {
  function selectCard() {
      var $this = $(this);
      if ($(".selected-card")[0]) {
        $(".selected-card").removeClass("selected-card");
      };
      //Använd denna senare för att skicka vidare till backend
      //Kan vara id, eller hämta titeln inuti kortet
      //firstparty = this.attr(id);
      //$this.css({"width":"100%","height":"800px"});
      if ( !($this.hasClass("selected-card")) ) {
        $this.addClass("selected-card");
        $( "#candidate-list-1" ).html(generateCandidateTable());
      };  
  };
  function storeVote(){
    if (firstParty == '') {
      alert('Blankt: du har valt att inte lägga din röst på något parti.');
    }
    else {
      alert('Du har lagt din röst på parti ' + firstParty + ' och kandidat ' + firstCandidate);
    }
    $('#checkbox-1').removeClass("hidden");
  };

//Assigning events
  $(".election-card").click(selectCard);
  $("#vote-1").click(storeVote);
});

