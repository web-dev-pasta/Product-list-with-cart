let mainCont = document.querySelector(".card .box-desserts .grid");
let cartItems = JSON.parse(localStorage.getItem("cart")) || [];
updateCart();
let req = new XMLHttpRequest();
req.open("GET", "./data.json");
req.send();
req.onreadystatechange = function () {
  if (req.readyState == 4 && req.status == 200) {
    let jsObject = JSON.parse(req.responseText);

    for (let i = 0; i < jsObject.length; i++) {
      let data = jsObject[i];
      let existingItem = cartItems.find(
        (item) => item.name == data.name && item.price == data.price
      );

      mainCont.innerHTML += `
      <div class="box">
            <div class="image">
              <img class = "source-images" src="${data.image["desktop"]}" alt="" />
              <img class = "source-images" src="${data.image["thumbnail"]}" style="display:none;" />
              <img class = "source-images" src="${data.image["tablet"]}" style="display:none;" />
              <img class = "source-images" src="${data.image["mobile"]}" style="display:none;" />

              <div class="add-to-cart ${existingItem ? "none" : ""}" id="add">
                <img src="assets/images/icon-add-to-cart.svg" alt="" />
                <p class="small" >Add to Cart</p>
              </div>
              <div class="added ${existingItem ? "" : "none"}" id = ${toId(
        data.name
      )}>
      <img src="assets/images/icon-decrement-quantity.svg" id="decrement" alt="" />
      <p class="quantity">${existingItem ? existingItem.quantity : ""}</p>
      <img src="assets/images/icon-increment-quantity.svg" id="increment" alt="" />
    </div>
            </div>
            <div class="text">
              <p class="xsmall" >${data.category}</p>
              <p class="medium" id="name">${data.name}</p>
              <p class="small price" id="price">$${data.price.toFixed(2)}</p>
            </div>
          </div>
      `;
    }
    addToCart();
    emptyCart();
    completeOrder();
    handleIncrementDecrement();
    newOrder();
  }
};
function addToCart() {
  let addBtns = document.querySelectorAll("#add");
  addBtns.forEach((e) => {
    e.addEventListener("click", () => {
      let parent = e.closest(".box");
      let name = parent.querySelector(".text #name").innerHTML;
      let price = parent.querySelector(".text #price").innerHTML.slice(1);
      let pQuantity = parent.querySelector(".image .added p.quantity");
      pQuantity.innerHTML = "1";
      let image = parent
        .querySelector(".image img:nth-child(2)")
        .getAttribute("src");
      parent.querySelector(".image .added").classList.remove("none");
      parent.querySelector(".image .add-to-cart").classList.add("none");
      let q = 1;
      let obj = {
        name: name,
        price: price,
        quantity: q,
        thumbnail: image,
      };

      cartItems.push(obj);
      updateCart();
      calcTotal();
    });
  });
}
function updateCart() {
  let cart = document.querySelector(".card .box-cart .items");
  cart.innerHTML = "";

  cartItems.forEach((e) => {
    cart.innerHTML += `
    <div class="item">
          <div class="text">
            <p class="medium">${e.name}</p>
            <div class="inner-text">
              <p class="small price">${e.quantity}x</p>
              <p class="xsmall" id="cart-price">@ ${e.price}</p>
              <p class="small">$${(+e.price * e.quantity).toFixed(2)}</p>
            </div>
          </div>
          <div class="delete" >
            <img src="assets/images/icon-remove-item.svg" alt="" />
          </div>
        </div>
    `;
  });
  emptyCart();
  deleteFromCart();
  calcTotal();
  calcQuantity();
  handleClicks();
  handleLocalStorage();
}

function deleteFromCart() {
  let delBtns = document.querySelectorAll(".item .delete");
  delBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      let parent = btn.closest(".item");
      let name = parent.querySelector(".text p:first-child").innerHTML;
      let price = parent
        .querySelector("#cart-price")
        .innerHTML.split("@")[1]
        .trim();

      cartItems = cartItems.filter(
        (e) => !(e.name === name && e.price === price)
      );

      let elementId = toId(name);
      document.querySelector(`#${elementId}`).classList.add("none");
      document
        .querySelector(`#${elementId}`)
        .previousElementSibling.classList.remove("none");
      updateCart();
    });
  });
}
function calcTotal() {
  let total = document.querySelector("#total-price");
  let totalPrice = 0;
  cartItems.forEach((e) => {
    totalPrice += e.quantity * e.price;
  });
  total.innerHTML = `$${totalPrice.toFixed(2)}`;
}
function calcQuantity() {
  let quantity = document.querySelector("#quantity");
  let totalQuantity = 0;
  cartItems.forEach((e) => {
    totalQuantity += e.quantity;
  });
  quantity.innerHTML = totalQuantity;
}
function emptyCart() {
  let items = document.querySelector(".box-cart .items");
  let empty = document.querySelector(".empty");
  let confirm = document.querySelector(".confirm");
  let carbon = document.querySelector(".carbon");
  let total = document.querySelector(".box-cart .total");
  if (items.innerHTML.length > 0) {
    empty.classList.add("none");
    confirm.classList.remove("none");
    carbon.classList.remove("none");
    total.classList.remove("none");
  } else {
    empty.classList.remove("none");
    confirm.classList.add("none");
    carbon.classList.add("none");
    total.classList.add("none");
  }
}
let order = document.querySelector(".order-complete");
let layer = document.querySelector("span.layer");
let items = document.querySelector(".order-complete .items");
function completeOrder() {
  let confirm = document.querySelector(".box-cart .confirm");
  confirm.addEventListener("click", () => {
    order.classList.remove("none");
    layer.classList.remove("none");

    cartItems.forEach((e) => {
      items.innerHTML += `
      <div class="item">
            <div class="image">
              <img src="${e.thumbnail}" alt="" />
              <div class="text">
                <p class="medium">${e.name}</p>
                <div class="inner-text">
                  <p class="small price">${e.quantity}x</p>
                  <p class="xsmall">@ $${e.price}</p>
                </div>
              </div>
            </div>
            <div class="price"><p class="small">$${(
              e.quantity * e.price
            ).toFixed(2)}</p></div>
          </div>
      `;
    });
    let totalPrice = 0;
    cartItems.forEach((e) => {
      totalPrice += e.quantity * e.price;
    });
    items.innerHTML += `
    <div class="total">
          <p class="xsmall">Order Total</p>
          <p class="cart-heading">$${totalPrice.toFixed(2)}</p>
        </div>
    `;
  });
}
function newOrder() {
  let newBtn = document.querySelector(".order-complete .new");
  newBtn.addEventListener("click", () => {
    cartItems = cartItems.slice(0, 0);
    items.innerHTML = "";
    order.classList.add("none");
    layer.classList.add("none");
    let addToCart = document.querySelectorAll(".add-to-cart");
    let added = document.querySelectorAll(".added");
    added.forEach((e) => e.classList.add("none"));
    addToCart.forEach((e) => e.classList.remove("none"));
    updateCart();
  });
}

function handleClicks() {
  document.addEventListener("click", (e) => {
    let confirmBtn = document.querySelector(".box-cart .confirm");
    if (!order.contains(e.target) && !confirmBtn.contains(e.target)) {
      order.classList.add("none");
      layer.classList.add("none");
      items.innerHTML = "";
    }
  });
}
function handleLocalStorage() {
  localStorage.setItem("cart", JSON.stringify(cartItems));
}
function handleIncrementDecrement() {
  let increment = document.querySelectorAll("#increment");
  let decrement = document.querySelectorAll("#decrement");
  increment.forEach((e) => {
    e.addEventListener("click", () => {
      let parent = e.closest(".box");
      let name = parent.querySelector(".text #name").innerHTML;
      let price = parent.querySelector(".text #price").innerHTML.slice(1);
      let existingItem = cartItems.find((item) => {
        return item.name == name && item.price == price;
      });
      existingItem.quantity += 1;
      e.previousElementSibling.innerHTML = existingItem.quantity;
      updateCart();
    });
  });
  decrement.forEach((e) => {
    e.addEventListener("click", () => {
      let parent = e.closest(".box");
      let name = parent.querySelector(".text #name").innerHTML;
      let price = parent.querySelector(".text #price").innerHTML.slice(1);
      let existingItem = cartItems.find((item) => {
        return item.name == name && item.price == price;
      });
      existingItem.quantity -= 1;
      if (existingItem.quantity == 0) {
        cartItems = cartItems.filter((e) => e != existingItem);
        parent.querySelector(".image .add-to-cart").classList.remove("none");
        parent.querySelector(".image .added").classList.add("none");
      }
      e.nextElementSibling.innerHTML = existingItem.quantity;

      updateCart();
    });
  });
}
function toId(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}
