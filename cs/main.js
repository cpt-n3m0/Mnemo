console.log("hereee");
var mouseX, mouseY;
function trackMouse(event){
	mouseX = event.clientX;
	mouseY = event.clientY;

}
document.onmousemove = trackMouse;
document.onmouseup = openHoverMenu;
document.onmousedown = closeHoverMenu;

loadHighlights();
document.body.style.border= "5px solid green";
