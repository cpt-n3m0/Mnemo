 var mouseX, mouseY;
console.log("here333");
function trackMouse(event){
	mouseX = event.clientX;
	mouseY = event.clientY;

}

loadHighlights();
document.onmousemove = trackMouse;
document.onmouseup = openHoverMenu;
document.onmousedown = closeHoverMenu;


console.log("here333");
document.body.style.border= "5px solid green";
