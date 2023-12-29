function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function findTournaments() {
  const tourneys = Array.from(document.querySelectorAll(".styles__draftPoolTournamentCell__t5vYo"));
  return tourneys;
}

function clickBack() {
  const back = document.querySelector(".styles__backRow__anE4_")
  return back;
}

function exportToCSV(filename, csvData) {
  const csvBlob = new Blob([csvData], { type: "text/csv" });
  const csvURL = URL.createObjectURL(csvBlob);

  const a = document.createElement("a");
  a.href = csvURL;
  a.download = filename;

  a.style.display = "none";
  document.body.appendChild(a);
  a.click();

  // Cleanup
  document.body.removeChild(a);
  URL.revokeObjectURL(csvURL);
}

async function findDivs(startMarker, stopMarker) {
  const divs = Array.from(document.querySelectorAll(".styles__slateRow__aPpfu "));
  let foundStart = false; // Variable to track whether start is found
  let foundStop = false; // Variable to track whether stop is found
  var tournament_info = [['Entry Number', 'Winnings', 'Place', 'Tournament Name', 'Entry Value', 'Sport',
    'Entrants', 'Fill %', 'Slate', 'Max Entries', 'Draft Size', 'Draft Rounds',
    'Rake', 'Start Time', 'Games']];

  if (divs.length > 0) {
    for (let outerIndex = 0; outerIndex < divs.length; outerIndex++) {
      const div = divs[outerIndex];
      const text = div.textContent.trim();
      console.log(text);

      if (text.includes(startMarker)) {
        console.log('Start marker found. Continuing with the loop.');
        foundStart = true; // Set the variable to true
      }

      // Skip to the next iteration if the start marker hasn't been found
      if (!foundStart) {
        console.log('Start marker not found. Skipping the loop iteration.');
        continue;
      }

      // Click the div
      div.click();
      var games = div.querySelector(".styles__slateInfoLabel__hL16h").textContent.trim();
      console.log(games);
      console.log(`Clicked div ${outerIndex}`);

      // Optionally, you can add a delay using the sleep function
      // to give time for any events triggered by the click to settle
      await sleep(1000); // Adjust the delay time as needed

      // Gather all tournament divs after the click
      var tourneys = findTournaments();

      // Begin loop to gather specific tournament information
      for (let innerIndex = 0; innerIndex < tourneys.length; innerIndex++) {
        var tourneys = findTournaments();
        
        const tourney = tourneys[innerIndex];
        const tourneyText = tourney.textContent.trim();
        console.log(tourneyText);
        await sleep(1000);

        // Try to click the tournament
        tourney.click();
        console.log(`Clicked tournament ${innerIndex}`);
        await sleep(1000);

        // Gather tournament information
        document.querySelector(".styles__infoIcon__i2XtS").click();
        await sleep(1000);
        var tourney_info = [];

        var tourney_name = document.querySelector(".styles__title__ZrO6C").textContent.trim();
        tourney_info.push(tourney_name);
		
		    var entry_value = document.querySelector(".styles__entryInfoValue__qx_JF").textContent.trim();
        tourney_info.push(entry_value);
        
        var raw_tourney_info = document.querySelectorAll(".styles__infoValue__F0R73")

        var sport = raw_tourney_info[0].textContent.trim();
        tourney_info.push(sport);
        var entrants = raw_tourney_info[1].textContent.trim().replace(',','');
        tourney_info.push(entrants);
        var fill = raw_tourney_info[2].textContent.trim();
        tourney_info.push(fill);
        var slate = raw_tourney_info[3].textContent.trim();
        tourney_info.push(slate);
        var max_entries = raw_tourney_info[5].textContent.trim();
        tourney_info.push(max_entries);
        var draft_size = raw_tourney_info[6].textContent.trim();
        tourney_info.push(draft_size);
        var draft_rounds = raw_tourney_info[7].textContent.trim();
        tourney_info.push(draft_rounds);
        var rake = raw_tourney_info[8].textContent.trim();
        tourney_info.push(rake);
        var start_time = raw_tourney_info[9].textContent.trim();
        tourney_info.push(start_time);

        tourney_info.push(games);

        document.querySelector(".styles__closeButton__ZYuEF").click();
        await sleep(1000);

        // Gather individual lineup information
        var lineups = Array.from(document.querySelectorAll(".styles__draftPoolTeamCell__Qapze"));

        if (lineups.length > 0) {
          for (let LineupIndex = 0; LineupIndex < lineups.length; LineupIndex++) {
            var lineup_info = lineups[LineupIndex].querySelector(".styles__colorBar__aqn_e");
            var finish_pos = lineup_info.getElementsByTagName('p')[0].textContent.trim();
            var winnings = Array.from(lineup_info.childNodes)
              .filter(node => node.nodeType === 3) // Filter out non-text nodes
              .map(node => node.textContent.trim())
              .join(' ').replace(',','');
            var lineup_index = LineupIndex + 1;

            var lineup_temp = [];
            lineup_temp.push(lineup_index, winnings, finish_pos);
            var lineup_temp = lineup_temp.concat(tourney_info)
            tournament_info.push(lineup_temp);
          };
        }

        // Update this selector based on your HTML structure
        clickBack().click();
        console.log(`Clicked back after tournament ${innerIndex}`);

        await sleep(1000); // Add an extra sleep after clicking back
      }
      console.log(tournament_info);
      // Check if the text contains the stop marker
      if (text.includes(stopMarker)) {
        console.log('Stop marker found. Exiting the loop.');
        foundStop = true; // Set the variable to true
        break; // Use break to exit the outer loop
      }
    }

    if (foundStop) {
      console.log('Stop marker found. Exiting the entire function.');
      exportToCSV("Results", tournament_info.join("\n"));
      return; // Use return to exit the findDivs function
    }
  } else {
    console.log("No div elements with the class 'styles__slateRow__aPpfu' found.");
  }
}

chrome.storage.sync.get(['startdate', 'stopdate'], async function (data) {
  const start = data.startdate;
  const stop = data.stopdate;
  console.log(`Start Date: ${start}, Stop Date: ${stop}`);
  await findDivs(start, stop);
});
