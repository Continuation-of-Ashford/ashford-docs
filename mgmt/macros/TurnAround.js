const foundLastRun = new Date(sessionStorage.getItem('lastRunOfTurnAroundMacro'));
var shouldAnimate = true;
if( foundLastRun ){
    shouldAnimate = (Date.now() - foundLastRun) > 500;
}

for (let token of canvas.tokens.controlled) {
    if (!token.isOwner) {
        continue;
    }

    (async () => {
        let wasAnimating = token._animation != null;
        // NOTE: Guard token flipping with an await on any currently running animations.
        await token._animation;
        const flipMirror = -(token.document.texture.scaleX);
        
        sessionStorage.setItem('lastRunOfTurnAroundMacro',Date.now());
        await token.document.update(
            {
                [`texture.scaleX`]: flipMirror,
            },
            {
                animate: !wasAnimating && shouldAnimate,
                animation: {
                    duration: 500
                }
            }
        );
    })();
};