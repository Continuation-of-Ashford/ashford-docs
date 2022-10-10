if (canvas.tokens.controlled.length === 0)
    return ui.notifications.error("Choose tokens to roll for");

const tokens = canvas.tokens.controlled;

if (tokens.length > 0) {
    rollGroupInitiative();
    new Dialog({
        title: "Randomize Hit Points",
        content: "Also Roll for Random HP for each creature that has a hit die formula.",
        buttons: {
            button1: {
                label: "Yes",
                callback: () => { tokens.forEach(RollRandomHP); },
                icon: `<i class="fas fa-check"></i>`
            },
            button2: {
                label: "No",
                callback: () => { },
                icon: `<i class="fas fa-times"></i>`
            }
        }
    }).render(true);
} else {
    ui.notifications.warn("No Tokens were selected");
}

async function rollGroupInitiative() {
    const combatants = await canvas.tokens.toggleCombat();

    const groups = combatants.reduce((grps, { _id, actorId, actor }) => {
        if (!grps[actorId]) {
            grps[actorId] = [];
        }
        grps[actorId].push(_id);

        return grps;
    }, {});

    const ids = Object.keys(groups).map(key => groups[key][0]);

    const initiatives = await game.combat.rollInitiative(ids);

    const groupedInititive = initiatives.turns.reduce((initiativeGroups, { actorId, initiative }) => {
        if (!initiativeGroups[actorId])
            initiativeGroups[actorId] = [];
        if (initiative != undefined)
            initiativeGroups[actorId].push(initiative);
        return initiativeGroups;
    }, {});

    for (const [actorId, combatantIds] of Object.entries(groups)) {
        let relevantInitiative = groupedInititive[actorId];
        for (const combatantId of combatantIds) {
            await game.combat.setInitiative(combatantId, relevantInitiative);
        }
    }
}

async function RollRandomHP(token, index) {
    let actor = token.actor;

    let actorData = actor.system.attributes;

    const formula = actorData.hp.formula;
    if (!formula) return;

    // only if the creature is at it's default HP
    if (actorData.hp.value != actorData.hp.max) return;

    let hpRoll = new Roll(formula);
    const result = await hpRoll.evaluate({ async: true });
    let hp = hpRoll.total

    await token.actor.update({
        "system.attributes.hp": {
            value: hp,
            max: hp
        }
    });

    await token.document.update({
        displayName: CONST.TOKEN_DISPLAY_MODES.OWNER_HOVER,
        displayBars: CONST.TOKEN_DISPLAY_MODES.HOVER
    });
}