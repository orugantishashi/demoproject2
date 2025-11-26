const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const products = [
    { id: 101, name: "Nike Air Max", desc: "Men's Running Shoes", price: "₹4,999", img: "./images/products/shoes/shoe 1.jpg" },
    { id: 102, name: "Adidas Ultraboost", desc: "Women's Sports Shoes", price: "₹5,499", img: "./images/products/shoes/shoe 2.jpg" },
    { id: 103, name: "Puma Classic", desc: "Unisex Sneakers", price: "₹3,299", img: "./images/products/shoes/shoe 3.jpg" },
    { id: 104, name: "Reebok Flex", desc: "Kids Shoes", price: "₹2,199", img: "./images/products/shoes/shoe 4.jpg" },
    { id: 105, name: "Skechers GoWalk", desc: "Comfort Walking Shoes", price: "₹3,799", img: "./images/products/shoes/shoe 5.jpg" },
    { id: 106, name: "RedTap Shoe", desc: "Casual Shoes", price: "₹2,999", img: "./images/products/shoes/shoe 6.jpg" },

    { id: 107, name: "Adidas", desc: "Casual Slippers", price: "₹999", img: "./images/products/slippers/men img 1.webp" },
    { id: 108, name: "WoodLand", desc: "Triple-Strap Sandals", price: "₹2,599", img: "./images/products/slippers/men img 2.webp" },
    { id: 109, name: "Bata", desc: "Casuals", price: "₹1,299", img: "./images/products/slippers/men img 4.webp" },
    { id: 110, name: "Walkaroo", desc: "Comfort Slippers", price: "₹999", img: "./images/products/slippers/men img 5.webp" },
    { id: 111, name: "Adidas", desc: "Comfort Sandals", price: "₹999", img: "./images/products/slippers/men img 6.webp" },
    { id: 112, name: "Walkaroo", desc: "Reliable Slippers", price: "₹799", img: "./images/products/slippers/men img 7.webp" },
    { id: 113, name: "Adidas", desc: "Comfort Slippers", price: "₹1,399", img: "./images/products/slippers/men img 9.webp" },
    { id: 114, name: "Paragon", desc: "Reliable Slippers", price: "₹699", img: "./images/products/slippers/men img 10.webp" },
    { id: 115, name: "Bata", desc: "DayLite Sandals", price: "₹999", img: "./images/products/slippers/men img 11.webp" },
];

const productPromise = resolveProduct(id);

productPromise.then(product => {
    if (product) {
        document.getElementById("product-img").src = product.img;
        document.getElementById("product-name").textContent = product.name;
        document.getElementById("product-desc").textContent = product.desc || product.category + "'s Footwear";
        document.getElementById("product-price").textContent = product.price;

        const metaList = document.getElementById("product-meta");
        if (product.meta && product.meta.length) {
            metaList.innerHTML = product.meta.map(m => `<li><strong>${m.label}:</strong> ${m.value}</li>`).join("");
        } else {
            metaList.style.display = "none";
        }
    } else {
        document.querySelector(".product-info").innerHTML = "<h2>Product not found</h2>";
    }
});

async function resolveProduct(productId) {
    // 1. Check static list first
    const staticMatch = products.find(p => String(p.id) === String(productId));
    if (staticMatch) {
        return { ...staticMatch, meta: [] };
    }

    // 2. Check data.json
    try {
        const response = await fetch('data.json');
        if (response.ok) {
            const data = await response.json();
            const jsonMatch = data.find(p => String(p.id) === String(productId));
            if (jsonMatch) {
                return {
                    id: jsonMatch.id,
                    name: jsonMatch.name,
                    desc: jsonMatch.category + "'s Footwear",
                    price: jsonMatch.price,
                    img: `./images/${jsonMatch.image}`, // Construct path as in operation.js
                    meta: []
                };
            }
        }
    } catch (e) {
        console.error("Failed to fetch data.json", e);
    }

    // 3. Check localStorage cache (fallback)
    try {
        const cache = JSON.parse(localStorage.getItem("nikeSneakerProducts") || "{}");
        const items = cache.items || [];
        return items.find(p => p.id === productId) || null;
    } catch {
        return null;
    }
}

// Size selection
document.querySelectorAll(".size-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".size-btn").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
    });
});
