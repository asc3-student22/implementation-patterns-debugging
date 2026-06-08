const API = "";

const CUSTOMIZATION_PRICES = {
    extra_shot: 0.75,
    milk_alternative: 0.6,
    whipped_cream: 0.5,
};

const DEFAULT_CUSTOMIZATIONS = {
    extra_shot: false,
    milk_alternative: "none",
    whipped_cream: false,
};

const menuSelections = {};

function getDefaultCustomizations() {
    return { ...DEFAULT_CUSTOMIZATIONS };
}

function normalizeCustomizations(customizations = {}) {
    const milk = String(customizations.milk_alternative || "none").toLowerCase();
    const validMilk = ["none", "oat", "almond", "soy"];
    return {
        extra_shot: Boolean(customizations.extra_shot),
        milk_alternative: validMilk.includes(milk) ? milk : "none",
        whipped_cream: Boolean(customizations.whipped_cream),
    };
}

function calculateCustomizationTotal(customizations) {
    let total = 0;
    if (customizations.extra_shot) {
        total += CUSTOMIZATION_PRICES.extra_shot;
    }
    if (customizations.milk_alternative !== "none") {
        total += CUSTOMIZATION_PRICES.milk_alternative;
    }
    if (customizations.whipped_cream) {
        total += CUSTOMIZATION_PRICES.whipped_cream;
    }
    return total;
}

function updateMenuCardTotal(item) {
    const selection = menuSelections[item.id];
    if (!selection) return;

    const sizeInfo = item.sizes[selection.size] || Object.values(item.sizes)[0];
    const basePrice = Number(sizeInfo.price) || 0;
    const total = basePrice + calculateCustomizationTotal(selection.customizations);
    const priceSpan = document.getElementById(`price-${item.id}`);
    if (priceSpan) {
        priceSpan.textContent = total.toFixed(2);
    }
}

function formatCustomizationSummary(customizations) {
    const selected = normalizeCustomizations(customizations);
    const parts = [];

    if (selected.extra_shot) {
        parts.push("Extra shot");
    }
    if (selected.milk_alternative !== "none") {
        const milkName = selected.milk_alternative.charAt(0).toUpperCase() + selected.milk_alternative.slice(1);
        parts.push(`${milkName} milk`);
    }
    if (selected.whipped_cream) {
        parts.push("Whipped cream");
    }

    return parts.join(" + ");
}

async function loadMenu() {
    const container = document.getElementById("menu-list");
    try {
        const res = await fetch(`${API}/api/menu`);
        const data = await res.json();
        container.innerHTML = "";

        data.items.forEach((item) => {
            const fallbackSize = Object.keys(item.sizes)[0];
            const defaultSize = item.sizes.medium ? "medium" : fallbackSize;
            menuSelections[item.id] = {
                size: defaultSize,
                customizations: getDefaultCustomizations(),
            };

            const card = document.createElement("div");
            card.className = "menu-card";

            const sizesHtml = Object.entries(item.sizes)
                .map(
                    ([size, info]) =>
                        `<label class="size-option">
                            <input type="radio" name="size-${item.id}" value="${size}"
                                data-price="${info.price}"
                                ${size === defaultSize ? "checked" : ""}>
                            <span class="size-label">${size.charAt(0).toUpperCase() + size.slice(1)}</span>
                            <span class="size-price">$${info.price.toFixed(2)}</span>
                        </label>`
                )
                .join("");

            const defaultPrice = item.sizes[defaultSize].price.toFixed(2);

            card.innerHTML = `
                <h3>${item.name}</h3>
                <p class="description">${item.description}</p>
                <div class="size-selector">
                    ${sizesHtml}
                </div>
                <div class="customization-controls">
                    <p class="customization-title">Customize</p>
                    <label class="customization-toggle">
                        <input type="checkbox" data-role="extra-shot">
                        Extra shot <span class="addon-price">+$0.75</span>
                    </label>
                    <label class="customization-row">
                        Milk alternative
                        <select class="milk-select" data-role="milk-alternative">
                            <option value="none">None</option>
                            <option value="oat">Oat</option>
                            <option value="almond">Almond</option>
                            <option value="soy">Soy</option>
                        </select>
                        <span class="addon-price">+$0.60</span>
                    </label>
                    <label class="customization-toggle">
                        <input type="checkbox" data-role="whipped-cream">
                        Whipped cream <span class="addon-price">+$0.50</span>
                    </label>
                </div>
                <button class="order-btn" data-item-id="${item.id}">
                    Order — $<span id="price-${item.id}">${defaultPrice}</span>
                </button>
            `;
            container.appendChild(card);

            card.querySelector(".order-btn").addEventListener("click", () => placeOrder(item.id));

            card.querySelectorAll(`input[name="size-${item.id}"]`).forEach(
                (radio) => {
                    radio.addEventListener("change", () => {
                        menuSelections[item.id].size = radio.value;
                        updateMenuCardTotal(item);
                    });
                }
            );

            const extraShotCheckbox = card.querySelector('[data-role="extra-shot"]');
            extraShotCheckbox.addEventListener("change", (event) => {
                menuSelections[item.id].customizations.extra_shot = event.target.checked;
                updateMenuCardTotal(item);
            });

            const milkSelect = card.querySelector('[data-role="milk-alternative"]');
            milkSelect.addEventListener("change", (event) => {
                menuSelections[item.id].customizations.milk_alternative = event.target.value;
                updateMenuCardTotal(item);
            });

            const whippedCheckbox = card.querySelector('[data-role="whipped-cream"]');
            whippedCheckbox.addEventListener("change", (event) => {
                menuSelections[item.id].customizations.whipped_cream = event.target.checked;
                updateMenuCardTotal(item);
            });

            updateMenuCardTotal(item);
        });
    } catch (err) {
        container.innerHTML = `<p class="empty-state">Failed to load menu.</p>`;
    }
}

async function placeOrder(itemId) {
    const selection = menuSelections[itemId];
    const selectedRadio = document.querySelector(`input[name="size-${itemId}"]:checked`);
    const size = selectedRadio ? selectedRadio.value : selection?.size || "medium";
    const customizations = normalizeCustomizations(selection?.customizations || getDefaultCustomizations());

    try {
        const res = await fetch(`${API}/api/orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ item_id: itemId, size: size, customizations }),
        });
        if (!res.ok) throw new Error("Order failed");
        await loadOrders();
    } catch (err) {
        alert("Failed to place order: " + err.message);
    }
}

async function advanceOrder(orderId, nextStatus) {
    try {
        const res = await fetch(`${API}/api/orders/${orderId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: nextStatus }),
        });
        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.detail || "Update failed");
        }
        await loadOrders();
    } catch (err) {
        alert("Failed to update order: " + err.message);
    }
}

async function cancelOrder(orderId) {
    try {
        const res = await fetch(`${API}/api/orders/${orderId}`, {
            method: "DELETE",
        });
        if (!res.ok) throw new Error("Cancel failed");
        await loadOrders();
    } catch (err) {
        alert("Failed to cancel order: " + err.message);
    }
}

function getAdvanceButton(order) {
    const nextMap = {
        pending: { status: "preparing", label: "Start Preparing" },
        preparing: { status: "ready", label: "Mark Ready" },
        ready: { status: "completed", label: "Complete" },
    };
    const next = nextMap[order.status];
    if (!next) return "";
    return `<button class="advance-btn" onclick="advanceOrder(${order.order_id}, '${next.status}')">${next.label}</button>`;
}

function renderOrder(order) {
    const div = document.createElement("div");
    div.className = "order-item";
    const customizationSummary = formatCustomizationSummary(order.customizations);
    const customizationHtml = customizationSummary
        ? `<div class="order-customizations">${customizationSummary}</div>`
        : "";
    const cancelBtn =
        order.status === "pending"
            ? `<button class="cancel-btn" onclick="cancelOrder(${order.order_id})">Cancel</button>`
            : "";
    div.innerHTML = `
        <div class="order-info">
            <span class="order-id">#${order.order_id}</span>
            <span class="order-items">${order.items.join(", ")}</span>
            ${customizationHtml}
            <span class="order-price">$${order.total_price.toFixed(2)}</span>
        </div>
        <span class="order-status status-${order.status}">${order.status}</span>
        ${getAdvanceButton(order)}
        ${cancelBtn}
    `;
    return div;
}

async function loadOrders() {
    const container = document.getElementById("orders-list");
    try {
        const res = await fetch(`${API}/api/orders`);
        const data = await res.json();

        if (data.orders.length === 0) {
            container.innerHTML = `<p class="empty-state">No orders yet. Pick a drink from the menu!</p>`;
            return;
        }

        const active = data.orders.filter(
            (o) => o.status === "pending" || o.status === "preparing" || o.status === "ready"
        );
        const completed = data.orders.filter((o) => o.status === "completed");

        container.innerHTML = "";

        if (active.length > 0) {
            const heading = document.createElement("p");
            heading.className = "order-group-heading";
            heading.textContent = "Active Orders";
            container.appendChild(heading);
            active.forEach((order) => container.appendChild(renderOrder(order)));
        }

        if (completed.length > 0) {
            const heading = document.createElement("p");
            heading.className = "order-group-heading";
            heading.textContent = "Completed";
            container.appendChild(heading);
            completed.forEach((order) => container.appendChild(renderOrder(order)));
        }
    } catch (err) {
        container.innerHTML = `<p class="empty-state">Failed to load orders.</p>`;
    }
}

// Load on page ready
document.addEventListener("DOMContentLoaded", () => {
    loadMenu();
    loadOrders();
});
