// Turn Around
for ( let token of canvas.tokens.controlled ) 
{
    token.document.texture.scaleX *= -1;
    // Bright Eyes
    token.refresh();
};
// Every now and then I fall apart!