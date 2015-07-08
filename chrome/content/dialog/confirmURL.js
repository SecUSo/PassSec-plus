// Called once if and only if the user clicks OK
function pressedOK()
{
  window.arguments[0].out.accept = true;
  return true;
}

function onLoad() {
  // Use the arguments passed to us by the caller
  document.getElementById("question").innerHTML = window.arguments[0].inn.question;
}
