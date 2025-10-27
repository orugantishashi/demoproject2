let cartCount=0;
const cartCountElement = document.getElementById("cart-count");
const addToCartButtons = document.getElementsByClassName("buynow");

for(let i = 0; i < addToCartButtons.length; i++) {
    addToCartButtons[i].addEventListener("click", function () {
        cartCount++;
        cartCountElement.textContent = cartCount;
    });
}

//--------toogle button-----//
const bgchange = document.querySelector(".toogle");
bgchange.addEventListener("click",()=>{
    document.body.classList.toggle("dark-mode");
})
