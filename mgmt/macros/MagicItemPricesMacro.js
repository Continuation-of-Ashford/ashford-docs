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
  let pickACrafter = "<p>Once you've given your materials to a crafter, you must spend your downtime at that settlement to get the crafter to prioritize working on your item (over all the other requests they have) by sitting in meetings, testing prototypes and giving feedback on the work.</p>";
  let preamble = "Each such downtime you spend, you pay the Crafter's Cost for their roll.</p><p>Once those rolls achieve a combined ";
  let deliveryLine = "the crafter finishes the item. You don't have to pay extra if their final roll exceeds the required total, limiting the labour cost over all rolls to what the Max Wages column shows.";
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
      requiredAbilityCheckTotal = preamble + " <b>" + requiredAbilityCheckNumber + " total</b> " + deliveryLine;
      break;
    case "Rare":
      requiredAbilityCheckNumber = Math.ceil(r.total / 50);
      requiredAbilityCheckTotal = preamble + " <b>" + requiredAbilityCheckNumber + " total</b> " + deliveryLine;
      requiredComponent = "and a Rare Component ";
      break;
    case "Very Rare":
      requiredAbilityCheckNumber = Math.ceil(r.total / 200);
      requiredAbilityCheckTotal = preamble + " <b>" + requiredAbilityCheckNumber + " total</b> " + deliveryLine;
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


  let craftingRequirements = "You need <b>" + Math.ceil(r.total / 2) + "gp in materials " + requiredComponent + "</b>, before hiring a crafter to start making <b>" + itemAorAn + " " + itemname + "</b>. ";
  let messageFlavor = `
  <p>${craftingRequirements}</p>
  <p>NPC crafters are available in certain settlements, such crafters can come from an Establishment's Demesne Effect or from a settlement feat, or a named NPCs that was convinced to move in.</p>
  <table>
    <tbody>
      <tr>
        <th>Place</th>
        <th>Crafter's Roll</th>
        <th>Crafter's Cost</th>
        <th>Max Wages</th>
      </tr>
      <tr>
        <td>Port Red Key</td>
        <td><a class="inline-roll roll" title=" 1d20+5" data-mode="roll" data-flavor="" data-formula=" 1d20+5"><i class="fas fa-dice-d20"></i> 1d20+5</a></td>
        <td>× ${apprenticeCrafterWage}gp</td>
        <td>${apprenticeCrafterCost}gp</td>
      </tr>
      <tr>
        <td>???</td>
        <td><a class="inline-roll roll" title=" 1d20+10" data-mode="roll" data-flavor="" data-formula=" 1d20+10"><i class="fas fa-dice-d20"></i> 1d20+10</a></td>
        <td>× ${journeymanCrafterWage}gp</td>
        <td>${journeymanCrafterCost}gp</td>
      </tr>
      <tr>
        <td>???</td>
        <td><a class="inline-roll roll" title=" 1d20+20" data-mode="roll" data-flavor="" data-formula=" 1d20+20"><i class="fas fa-dice-d20"></i> 1d20+20</a></td>
        <td>× ${masterCrafterWage}gp</td>
        <td>${masterCrafterCost}gp</td>
      </tr>
    </tbody>
  </table>
  ${pickACrafter}
  <p>${requiredAbilityCheckTotal}</p>
  <p>If you already have an NPC working on an item for you, you can't order another until the first one finishes.</p>
  <p>You could also choose to cancel the unfinished item to get the components and material costs back (but not the crafter's wages). Then start a different item, during this downtime instead.</p>`;
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