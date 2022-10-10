let priceDialog = new Dialog({
  title: "Calculate Magic Item Prices",
  content: `
  <script>
    var priceDialogData = {
                itemname: "ITEM NAME LEFT EMPTY",
                rarity: "Common",
                type: "not-wonderous",
              };
  </script>
  <h2>Prices for Magic Items</h2>
  <p>
    <label for="itemname">Which Item? </label>
    <input name="itemname" type="text" oninput="priceDialogData.itemname = this.value;" />
  </p>
  <p>
    <label for="itemrarity">Which is of the rarity? </label>
    <select name="itemrarity" oninput="priceDialogData.rarity = this.value">
      <option value="Common">Common</option>
      <option value="Uncommon">Uncommon</option>
      <option value="Rare">Rare</option>
      <option value="Very Rare">Very Rare</option>
    </select>
  </p>
  <p>
    <label for="itemtype">Is it a Wondrous item? </label>
    <select name="itemtype" oninput="priceDialogData.type = this.value">
      <option value="not-wonderous">Armor/Weapon/Shield</option>
      <option value="not-wonderous">Ring/Rod/Staff/DMG Wand</option>
      <option value="wonderous">Wonderous/Clothing</option>
      <option value="wonderous">Tasha's Tattoo/Ebberon Wand</option>
      <option value="scroll">Scroll</option>
      <option value="potion">Potion</option>
      <option value="consumable">Other Consumable</option>
    </select>
  </p>`
  ,
  buttons: {
    rollBuy: {
      icon: '<i class="fas fa-cash-register"></i>',
      label: "Price for Buying",
      callback: () => calculateBuy(priceDialogData.itemname, priceDialogData.rarity, priceDialogData.type)
    },
    rollCraft: {
      icon: '<i class="fas fa-tools"></i>',
      label: "Price for Crafting",
      callback: () => calculateCraft(priceDialogData.itemname, priceDialogData.rarity, priceDialogData.type)
    },
    rollNPCCraft: {
      icon: '<i class="fas fa-hands-helping"></i></i>',
      label: "Hire an NPC Crafter",
      callback: () => calculateNPCCraft(priceDialogData.itemname, priceDialogData.rarity, priceDialogData.type)
    },
    rollSell: {
      icon: '<i class="fas fa-comments-dollar"></i>',
      label: "Price for Selling",
      callback: () => calculateSell(priceDialogData.itemname, priceDialogData.rarity, priceDialogData.type)
    }
  },
  default: "rollBuy",
  render: html => console.log("Register interactivity in the rendered dialog"),
  close: html => console.log("End of Item Price Macro")
});

function calculateItemPrice(itemname, rarity, type) {
  let priceRollFormula = "0d0";
  switch (rarity) {
    case "Common":
      priceRollFormula = "(1d8+2)*10";
      break;
    case "Uncommon":
      priceRollFormula = "(1d10+2)*50";
      break;
    case "Rare":
      priceRollFormula = "(2d10+2)*250";
      break;
    case "Very Rare":
      priceRollFormula = "(2d10+2)*2500";
      break;
  }

  switch (type) {
    case "not-wonderous":
      break;
    case "wonderous":
      priceRollFormula = "(" + priceRollFormula + ") * 1.5";
      break;
    case "scroll":
    case "potion":
    case "consumable":
      priceRollFormula = "(" + priceRollFormula + ") * 0.5";
      break;
  }
  return priceRollFormula;
}

async function calculateBuy(itemname, rarity, type) {
  let priceRoll = calculateItemPrice(itemname, rarity, type);
  let r = new Roll(priceRoll, {});
  const rollResult = await r.evaluate({async: true});
  let messageFlavor = "Currently Season 2 has no way to buy items ";
  r.toMessage({flavor: messageFlavor, rollMode: 'roll', speaker: {alias: 'Buy Item'} });
}

async function calculateNPCCraft(itemname, rarity, type) {
  let priceRoll = calculateItemPrice(itemname, rarity, type);
  let r = new Roll(priceRoll, {});

  if (type === "scroll") {
    r.toMessage({ flavor: "WARNING: You should instead be using the 'Scribing a Spell Scroll' downtime to craft scrolls." });
    return;
  }

  const rollResult = await r.evaluate({async: true});

  let itemAorAn = prependArticle(itemname);

  let requiredAbilityCheckNumber = 1;
  let requiredAbilityCheckTotal = "";
  let requiredComponent = "";
  let pickACrafter = "<p>Pick any crafter who's time you meet the level requirement for.</p>";
  let preamble = "Once you've given your materials to the crafter of your choice, during each of your downtimes, you can pay the Crafter's Cost to have your chosen crafter make 1 roll. Once they achieve a combined";
  let deliveryLine = "They'll have finished the item, at the end of the downtime that happens in they'll deliver it to you.";
  switch (rarity) {
    case "Common":
      requiredAbilityCheckTotal = "Which can be completed in a single downtime without requiring a roll from whichever crafter you hired.";
      switch (type) {
        case "consumable":
        case "potion":
          itemname = itemname.replace("potion", "potions");
          itemname = itemname.replace("Potion", "Potions");
          itemAorAn = "2";
          pickACrafter = "";
          break;
      }
      break;
    case "Uncommon":
      requiredAbilityCheckNumber = Math.ceil(r.total / 25);
      requiredAbilityCheckTotal = preamble + " <b>" + requiredAbilityCheckNumber + " total</b>. " + deliveryLine;
      break;
    case "Rare":
      requiredAbilityCheckNumber = Math.ceil(r.total / 50);
      requiredAbilityCheckTotal = preamble + " <b>" + requiredAbilityCheckNumber + " total</b>. " + deliveryLine;
      requiredComponent = "and a Rare Component ";
      break;
    case "Very Rare":
      requiredAbilityCheckNumber = Math.ceil(r.total / 200);
      requiredAbilityCheckTotal = preamble + " <b>" + requiredAbilityCheckNumber + " total</b>. " + deliveryLine;
      requiredComponent = "and a Very Rare Component ";
      break;
  }

  var noviceCrafterCost = Math.ceil(r.total * 0.5);
  var apprenticeCrafterCost = Math.ceil(r.total * 0.6);
  var journeymanCrafterCost = Math.ceil(r.total * 0.7);
  var masterCrafterCost = Math.ceil(r.total * 0.8);
  var noviceCrafterWage = Math.floor(noviceCrafterCost / requiredAbilityCheckNumber);
  var apprenticeCrafterWage = Math.floor(apprenticeCrafterCost / requiredAbilityCheckNumber);
  var journeymanCrafterWage = Math.floor(journeymanCrafterCost / requiredAbilityCheckNumber);
  var masterCrafterWage = Math.floor(masterCrafterCost / requiredAbilityCheckNumber);


  let craftingRequirements = "You need " + Math.ceil(r.total / 2) + "gp in materials " + requiredComponent + ", before hiring a crafter to start making " + itemAorAn + " " + itemname + ". ";
  let messageFlavor = `
  <p>${craftingRequirements}</p>
  <table>
    <tbody>
      <tr>
        <th>LVL</th>
        <th>Crafter Skill</th>
        <th>Crafter's Roll</th>
        <th>Crafter's Cost</th>
        <th>Max Wages</th>
      </tr>
      <tr>
        <td>3+</td>
        <td>Novice</td>
        <td><a class="inline-roll roll" title=" 1d20+1" data-mode="roll" data-flavor="" data-formula=" 1d20+1"><i class="fas fa-dice-d20"></i> 1d20+1</a></td>
        <td>× ${noviceCrafterWage}gp</td>
        <td>${noviceCrafterCost}gp</td>
      </tr>
      <tr>
        <td>8+</td>
        <td>Apprentice </td>
        <td><a class="inline-roll roll" title=" 1d20+5" data-mode="roll" data-flavor="" data-formula=" 1d20+5"><i class="fas fa-dice-d20"></i> 1d20+5</a></td>
        <td>× ${apprenticeCrafterWage}gp</td>
        <td>${apprenticeCrafterCost}gp</td>
      </tr>
      <tr>
        <td>13+</td>
        <td>Journeyman</td>
        <td><a class="inline-roll roll" title=" 1d20+10" data-mode="roll" data-flavor="" data-formula=" 1d20+10"><i class="fas fa-dice-d20"></i> 1d20+10</a></td>
        <td>× ${journeymanCrafterWage}gp</td>
        <td>${journeymanCrafterCost}gp</td>
      </tr>
      <tr>
        <td>17+</td>
        <td>Master </td>
        <td><a class="inline-roll roll" title=" 1d20+20" data-mode="roll" data-flavor="" data-formula=" 1d20+20"><i class="fas fa-dice-d20"></i> 1d20+20</a></td>
        <td>× ${masterCrafterWage}gp</td>
        <td>${masterCrafterCost}gp</td>
      </tr>
      <tr>
        <th></th>
        <th></th>
        <th></th>
        <th></th>
        <th>Over all rolls</th>
      </tr>
    </tbody>
  </table>
  ${pickACrafter}
  <p>${requiredAbilityCheckTotal}</p>
  <p>If you already have an NPC working on an item for you, you can't order another until the first one finishes.</p>
  <p>You could also cancel an unfinished item to get the components and material cost back, but not the crafter's wages.</p>`;
  messageFlavor = `Currently Season 2 has no NPC crafters you can hire.`;
  r.toMessage({ flavor: messageFlavor });
}

async function calculateCraft(itemname, rarity, type) {
  let priceRoll = calculateItemPrice(itemname, rarity, type);
  let r = new Roll(priceRoll, {});

  if (type === "scroll") {
    r.toMessage({ flavor: "WARNING: You should instead be using the 'Scribing a Spell Scroll' downtime to craft scrolls." });
    return;
  }

  const rollResult = await r.evaluate({async: true});

  let itemAorAn = prependArticle(itemname);

  let requiredAbilityCheckTotal = "";
  let requiredComponent = "";
  switch (rarity) {
    case "Common":
      requiredAbilityCheckTotal = "Which can be completed in a single downtime without requiring a check. Though they still require proficiency in Arcana or a relevant tool.";
      switch (type) {
        case "consumable":
        case "potion":
          itemname = itemname.replace("potion", "potions");
          itemname = itemname.replace("Potion", "Potions");
          itemAorAn = "2";
          break;
      }
      break;
    case "Uncommon":
      requiredAbilityCheckTotal = "And a combined " + Math.ceil(r.total / 25) + " ability check must be rolled using Arcana or a relevant artisan's tool, in order to finish crafting it.";
      break;
    case "Rare":
      requiredAbilityCheckTotal = "And a combined " + Math.ceil(r.total / 50) + " ability check must be rolled using Arcana or a relevant artisan's tool, in order to finish crafting it.";
      requiredComponent = "and a Rare Component ";
      break;
    case "Very Rare":
      requiredAbilityCheckTotal = "And a combined " + Math.ceil(r.total / 200) + " ability check must be rolled using Arcana or a relevant artisan's tool, in order to finish crafting it.";
      requiredComponent = "and a Very Rare Component ";
      break;
  }

  let messageFlavor = "It will cost " + Math.ceil(r.total / 2) + "gp " + requiredComponent + "to start crafting " + itemAorAn + " " + itemname + ". " + requiredAbilityCheckTotal;
  r.toMessage({ flavor: messageFlavor });
}

function calculateSell(itemname, rarity, type) {
  let priceRoll = calculateItemPrice(itemname, rarity, type);
  let r = new Roll(priceRoll, {});

  r.toMessage({ flavor: "WARNING: selling items works differently per DM, I plan to stick my version of it here at a later point. In the meantime consider the #item-selling channel on the discord" });
}

function prependArticle(word) {
  var vowels = 'aeiou';
  var firstLetter = word[0].toLowerCase();
  if (vowels.indexOf(firstLetter) > -1)
    return 'an';
  else
    return 'a ';
}

priceDialog.render(true);