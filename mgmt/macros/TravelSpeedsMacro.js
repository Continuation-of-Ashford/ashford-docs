let priceDialog = new Dialog({
  title: "What are my Travel Speeds?",
  content: 
  `<script>
	var travelDialogData = {
		speed: "ENTER A SPEED",
		type: "not-mounted"
	};
</script>
<h2>What is the movement speed you are using for this travel?</h2>
<p>
	<input name="movementspeed" type="number" onkeypress='return event.charCode >= 48 && event.charCode <= 57' oninput="travelDialogData.speed = this.value;" />
</p>
<p>
	<label for="movementType">What type of movement?  </label>
	<select name="movementType" oninput="travelDialogData.type = this.value">
		<option value="not-mounted">Overland Walking</option>
		<option value="mounted">Overland Mounted</option>
		<option value="sailing">Sailing</option>
		<option value="flying-not-mounted">Flying</option>
		<option value="flying-mounted">Flying Mount</option>
		<option value="flying-ship">Airship</option>
	</select>
</p>`
  ,
  buttons: {
    fastPace: {
      icon: '<i class="fas fa-running"></i>',
      label: "Travel at a Fast Pace",
      callback: () => calculateFast(sanitizeNumericString(travelDialogData.speed), travelDialogData.type)
    },
    normPace: {
      icon: '<i class="fas fa-hiking"></i>',
      label: "Travel at a Normal Pace",
      callback: () => calculateNorm(sanitizeNumericString(travelDialogData.speed), travelDialogData.type)
    },
    slowPace: {
      icon: '<i class="fas fa-shoe-prints"></i>',
      label: "Travel at a Stealthy Pace",
      callback: () => calculateSlow(sanitizeNumericString(travelDialogData.speed), travelDialogData.type)
    }
  },
  default: "normPace",
  render: html => console.log("Register interactivity in the rendered dialog"),
  close: html => console.log("End of Travel Pace Macro")
});

function calculateFast(speed, type) {
  let speedInMiles = Math.round((speed / 10) * 1.33);
  printSpeedMessage(speedInMiles, speed, type, "fast", "Traveling at a Fast Pace");
}

function calculateNorm(speed, type) {
  let speedInMiles = Math.round(speed / 10);
  printSpeedMessage(speedInMiles, speed, type, "base", "Traveling at a Normal Pace");
}

function calculateSlow(speed, type) {
  let speedInMiles = Math.round((speed / 10) * 0.66);
  printSpeedMessage(speedInMiles, speed, type, "stealthy", "Traveling at a Slow Pace");
}

function printSpeedMessage(speedInMiles, speed, type, shortSpeed, speedHeader) {
  let travelTypeAddition = "";
  let mountedForm = "movement";
  let hoursOfTravel = 8;

  switch (type) {
    case "not-mounted":
      travelTypeAddition += "<br/><i>Your overland travel speed is halved while going through forests, swamps or mountains.</i>";
      travelTypeAddition += "<br/><br/>This is assuming 4 hours of travel, a short rest, another 4 hours of traveling, then making camp and resting.<br/>You can go further with a Forced March.";
      travelTypeAddition += "<br/>A Forced March adds " + speedInMiles + " extra miles, for each extra hour of marching. " +
        "After each hour of Forced March a DC11 Constitution check versus Exhaustion must be made. The DC goes up by 1 each time you roll this check.";
      break;
    case "mounted":
      travelTypeAddition += "<br/><i>Your overland travel speed is halved while going through forests, swamps or mountains.</i>";
      travelTypeAddition += "<br/><br/>This is assuming 4 hours of travel, a short rest, another 4 hours of traveling, then making camp and resting. A mount can Gallop during any hour of those.";
      if (speed === 100) {
        travelTypeAddition += "<br/>The Phantom Steed created by the spell/ritual, is already always galloping.";
      }
      else {
        travelTypeAddition += "<br/>Your mount can Gallop for an hour to travel " + (Math.round((speed / 10) * 1.33) * 2) + " extra miles, but this automatically makes your mount exhausted.";
      }
      mountedForm = "mounted";
      break;
    case "sailing":
      travelTypeAddition += "<br/><i>Your waterborne travel speed is halved while going through storms, reefs and unfavorable currents.</i>";
      travelTypeAddition += "<br/><br/>A waterborne vessel doesn't need to stop to rest, it continues traveling 24 hours per day. (Already in the value)";
      hoursOfTravel = 24;
      mountedForm = "sailing";
      break;
    case "flying-not-mounted":
      travelTypeAddition += "<br/><i>Your flying travel speed is halved only while going through storms.</i>";
      travelTypeAddition += "<br/><br/>This is assuming 4 hours of travel, a short rest, another 4 hours of traveling, then making camp and resting.<br/>You can go further with a Forced March.";
      travelTypeAddition += "<br/>A Forced March adds " + speedInMiles + " extra miles, for each extra hour of marching. " +
        "After each hour of Forced March a DC11 Constitution check versus Exhaustion must be made. The DC goes up by 1 each time you roll this check.";
      break;
    case "flying-mounted":
      travelTypeAddition += "<br/><i>Your flying travel speed is halved only while going through storms.</i>";
      travelTypeAddition += "<br/><br/>This is assuming 4 hours of travel, a short rest, another 4 hours of traveling, then making camp and resting. A mount can exert itself during any hour of those.";
      travelTypeAddition += "<br/>Your flying mount can exert itself for an hour to travel " + (Math.round((speed / 10) * 1.33) * 2) + " extra miles, but this automatically makes your mount exhausted.";
      mountedForm = "mounted";
      break;
    case "flying-ship":
      travelTypeAddition += "<br/><i>Your flying travel speed is halved only while going through storms.</i>";
      travelTypeAddition += "<br/><br/>A vessel doesn't need to stop to rest, it continues traveling 24 hours per day. (Already in the value)";
      hoursOfTravel = 24;
      mountedForm = "cruising";
      break;
  }

  let messageFlavor = "With a " + mountedForm + " speed of " + speed + "ft.<br/>" +
    "<b>Your " + shortSpeed + " travel speed is " + (speedInMiles * hoursOfTravel) + " miles/day.</b>" + travelTypeAddition;

  let chatData = {
    user: game.user._id,
    speaker: ChatMessage.getSpeaker(),
    content: "<h2>" + speedHeader + "</h2>" + messageFlavor,
  };

  ChatMessage.create(chatData, {});
}

function sanitizeNumericString(dirtyString) {
  let asArray = dirtyString.split("");
  for (let i = 0; i < asArray.length; i++)
    if (!parseInt(asArray[i]) && asArray[i] != "0")
      asArray[i] = '';
  return parseInt(asArray.join("")) || 0;
}

priceDialog.render(true);