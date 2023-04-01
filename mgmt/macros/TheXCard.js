const gmIds = game.users.filter(u => u.isGM).map(u => u._id);
ChatMessage.create({
    user: game.user.id,
    speaker: { alias: "The X Card" },
    content: "Someone anonymously played the X card, asking the DM to fade to black. To avoid whatever uncomfortable or problematic topic is currently being discussed.",
    whisper: gmIds,
});