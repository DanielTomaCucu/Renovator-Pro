package ro.renovatorpro.domain.service;

import ro.renovatorpro.domain.model.Item;
import ro.renovatorpro.domain.model.ItemStatus;
import ro.renovatorpro.domain.model.MaterialType;
import ro.renovatorpro.domain.model.Money;
import ro.renovatorpro.domain.model.Room;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Reguli de calcul al bugetului — port 1:1 din {@code frontend/src/shared/functions/items.ts},
 * {@code budget.ts} și agregările din {@code charts.ts} (fără {@code donutSegments}: geometrie
 * SVG de prezentare, nu regulă de business — rămâne concern de frontend).
 *
 * <p>REGULA CEA MAI IMPORTANTĂ: doar {@link ItemStatus#CUMPARAT} contează la totalul cheltuit.
 */
public final class BudgetCalculator {

    private BudgetCalculator() {
    }

    /** Totalul unui element: cantitate × preț unitar. */
    public static Money itemTotal(Item item) {
        return item.unitPrice().multiply(item.quantity());
    }

    /** Suma totală estimată a unei liste de elemente, indiferent de status. */
    public static Money totalEstimated(List<Item> items) {
        Money sum = Money.zero();
        for (Item item : items) {
            sum = sum.add(itemTotal(item));
        }
        return sum;
    }

    /** Suma efectiv cheltuită: DOAR elementele cu status Cumparat. */
    public static Money totalSpent(List<Item> items) {
        return totalEstimated(items.stream().filter(i -> i.status() == ItemStatus.CUMPARAT).toList());
    }

    /** Numărul de elemente achiziționate (status Cumparat). */
    public static long boughtCount(List<Item> items) {
        return items.stream().filter(i -> i.status() == ItemStatus.CUMPARAT).count();
    }

    /** Progresul achizițiilor în procente întregi (0–100). 0 dacă lista e goală. */
    public static int purchaseProgress(List<Item> items) {
        if (items.isEmpty()) return 0;
        return Math.round(100f * boughtCount(items) / items.size());
    }

    /** Elementele care aparțin unei camere. */
    public static List<Item> itemsForRoom(List<Item> items, String roomId) {
        return items.stream().filter(i -> i.roomId().equals(roomId)).toList();
    }

    /** Subtotalul estimat al unei camere (toate elementele ei). */
    public static Money roomSubtotal(List<Item> items, String roomId) {
        return totalEstimated(itemsForRoom(items, roomId));
    }

    /** Cât s-a cheltuit efectiv într-o cameră (doar Cumparat). */
    public static Money roomSpent(List<Item> items, String roomId) {
        return totalSpent(itemsForRoom(items, roomId));
    }

    /**
     * Bugetul rămas din bugetul total; poate fi NEGATIV la depășire de buget (afișat cu accent tertiary/orange
     * în UI) — de-asta rezultatul e {@link BigDecimal}, nu {@link Money} (care interzice valori negative).
     */
    public static BigDecimal budgetRemaining(Money totalBudget, List<Item> items) {
        return totalBudget.amount().subtract(totalSpent(items).amount());
    }

    /**
     * Eficiență bugetară: cât din totalul estimat s-a cheltuit efectiv, în procente (0 dacă nu există
     * estimat). BIZ-4 (docs/tickete-audit-calcule-securitate.md): împărțire {@code BigDecimal}, nu
     * {@code float} — convenția proiectului e ca toate sumele să rămână {@code BigDecimal} de la un
     * capăt la altul, fără conversii cu pierdere de precizie prin tipuri primitive.
     */
    public static int budgetEfficiency(Money estimated, Money spent) {
        if (estimated.amount().signum() == 0) return 0;
        BigDecimal ratio = spent.amount()
                .multiply(BigDecimal.valueOf(100))
                .divide(estimated.amount(), 0, RoundingMode.HALF_UP);
        return ratio.intValue();
    }

    /** O intrare din distribuția cost-per-cameră ({@link #costPerRoom}). */
    public record RoomCost(String name, Money total) {
    }

    /**
     * Distribuția costurilor pe camere, sortată descrescător, fără camerele goale.
     * Folosită de donut chart-ul din /analiza (formula rămâne aici — doar randarea SVG e client-side).
     */
    public static List<RoomCost> costPerRoom(List<Room> rooms, List<Item> items) {
        return rooms.stream()
                .map(r -> new RoomCost(r.name(), roomSubtotal(items, r.id())))
                .filter(rc -> rc.total().amount().signum() > 0)
                .sorted((a, b) -> b.total().compareTo(a.total()))
                .toList();
    }

    /** Agregare {total, spent} pentru o categorie de material ({@link #costPerCategory}). */
    public record CategoryCost(Money total, Money spent) {
    }

    /**
     * Agregare pe categorii de materiale: total estimat + cheltuit per categorie, sortat descrescător
     * după total. Folosită de progress bars din /analiza. {@link LinkedHashMap} păstrează ordinea de sortare.
     */
    public static Map<MaterialType, CategoryCost> costPerCategory(List<Item> items) {
        Map<MaterialType, Money> totals = new LinkedHashMap<>();
        Map<MaterialType, Money> spents = new LinkedHashMap<>();
        for (Item item : items) {
            MaterialType type = item.materialType();
            totals.merge(type, itemTotal(item), Money::add);
            if (item.status() == ItemStatus.CUMPARAT) {
                spents.merge(type, itemTotal(item), Money::add);
            }
        }
        Map<MaterialType, CategoryCost> result = new LinkedHashMap<>();
        totals.entrySet().stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .forEach(e -> result.put(e.getKey(), new CategoryCost(e.getValue(), spents.getOrDefault(e.getKey(), Money.zero()))));
        return result;
    }
}
