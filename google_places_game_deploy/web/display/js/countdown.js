var g_iCount = new Number();

// CHANGE THE COUNTDOWN NUMBER HERE - ADD ONE TO IT //
var g_iCount = 6;
function startCountdown(){
   if((g_iCount - 1) >= 0){
       g_iCount = g_iCount - 1;
       numberCountdown.innerText = g_iCount;
       setTimeout('startCountdown()',1000);
   }
}