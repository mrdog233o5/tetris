console.log("ADOG-blocker activated");


// injected codes here
function tick() {
    var adsByGoogle = Array.from(document.getElementsByClassName("adsbygoogle"));
    if (adsByGoogle.length > 0) {
        adsByGoogle.forEach(ad => {
            ad.parentElement.parentElement.remove();
        });
    }
    
    requestAnimationFrame(tick);
}

tick();