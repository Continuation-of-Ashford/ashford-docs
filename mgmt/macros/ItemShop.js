const Your_Generator_URLS = [`https://perchance-rss-feeds.glitch.me/y0cyyn5jrg`,`https://perchance-rss-feeds.glitch.me/c22ssllj80`,`https://perchance-rss-feeds.glitch.me/f5nfxbbc0g`];
const Hours_Between_Refreshes = 1;

let html = "";
let allThreeDone = [false, false, false];

function fetchRSS(rssURL, index){
  fetch(rssURL + "?frequency=" + 24 / Hours_Between_Refreshes)
  .then((response) => response.text())
  .then((str) => new window.DOMParser().parseFromString(str, "text/xml"))
  .then((data) => {
    const items = data.querySelectorAll("item");
  
    items.forEach((el) => {
      el.querySelectorAll("description").forEach((description) => {
        html += description.firstChild.data;
        checkReadyForPostingYet(index);
      });
    });
  });
}

function checkReadyForPostingYet(finishedIndex){
  allThreeDone[finishedIndex] = true;

  if( !allThreeDone.includes(false) ){
    let chatDataData = {
      user: game.user._id,
      speaker: ChatMessage.getSpeaker(),
      content:
        html +
        "<br/><h3>Come back in " +
        Hours_Between_Refreshes +
        " " +
        (Hours_Between_Refreshes > 1 ? "hours" : "hour") +
        " for a new list of items.</h3>"
    };

    ChatMessage.create(chatDataData);
  }
}

Your_Generator_URLS.forEach(fetchRSS);