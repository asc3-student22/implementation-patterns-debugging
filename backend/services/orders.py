"""
Order Service

Manages the BeanBotics order queue — placing, listing, and cancelling orders.
"""

from typing import Dict, List, Optional

from backend.models import Order, OrderCustomizations, OrderStatus, VALID_TRANSITIONS
from backend.services.menu import MenuService


EXTRA_SHOT_PRICE = 0.75
MILK_ALTERNATIVE_PRICE = 0.60
WHIPPED_CREAM_PRICE = 0.50

VALID_MILK_ALTERNATIVES = {"none", "oat", "almond", "soy"}


class OrderService:
    def __init__(self, menu_service: MenuService):
        self.menu_service = menu_service
        self.orders: List[Order] = []
        self._next_id = 1

    def _normalize_customizations(
        self, customizations: Optional[Dict[str, object]]
    ) -> OrderCustomizations:
        raw = customizations or {}
        milk_alternative = str(raw.get("milk_alternative", "none")).lower()
        if milk_alternative not in VALID_MILK_ALTERNATIVES:
            milk_alternative = "none"

        return OrderCustomizations(
            extra_shot=bool(raw.get("extra_shot", False)),
            milk_alternative=milk_alternative,
            whipped_cream=bool(raw.get("whipped_cream", False)),
        )

    def _customization_total(self, customizations: OrderCustomizations) -> float:
        total = 0.0
        if customizations.extra_shot:
            total += EXTRA_SHOT_PRICE
        if customizations.milk_alternative != "none":
            total += MILK_ALTERNATIVE_PRICE
        if customizations.whipped_cream:
            total += WHIPPED_CREAM_PRICE
        return total

    def place_order(
        self, item_id: str, size: str, customizations: Optional[Dict[str, object]] = None
    ) -> Optional[Order]:
        item = self.menu_service.get_item_by_id(item_id)
        if not item:
            return None
        if size not in item.sizes:
            return None

        selected_customizations = self._normalize_customizations(customizations)
        price = item.sizes[size]["price"] + self._customization_total(selected_customizations)
        display_name = f"{size.capitalize()} {item.name}"

        order = Order(
            order_id=self._next_id,
            items=[display_name],
            total_price=price,
            customizations=selected_customizations,
        )
        self.orders.append(order)
        self._next_id += 1
        return order

    def get_all_orders(self) -> List[Order]:
        return [o for o in self.orders if o.status != OrderStatus.CANCELLED]

    def get_order_by_id(self, order_id: int) -> Optional[Order]:
        for order in self.orders:
            if order.order_id == order_id:
                return order
        return None

    def update_order_status(self, order_id: int, new_status: OrderStatus | str) -> Order:
        if isinstance(new_status, str):
            try:
                new_status = OrderStatus(new_status)
            except ValueError as exc:
                raise ValueError(f"Unknown status '{new_status}'") from exc

        order = self.get_order_by_id(order_id)
        if not order:
            raise ValueError("Order not found")
        allowed = VALID_TRANSITIONS.get(order.status, [])
        if new_status not in allowed:
            raise ValueError(
                f"Cannot transition from '{order.status.value}' to '{new_status.value}'"
            )
        order.status = new_status
        return order

    def cancel_order(self, order_id: int) -> bool:
        try:
            self.update_order_status(order_id, OrderStatus.CANCELLED)
            return True
        except ValueError:
            return False
