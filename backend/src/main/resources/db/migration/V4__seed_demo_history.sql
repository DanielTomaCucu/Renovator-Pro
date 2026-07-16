-- V4 — istoric demo de renovare (5 camere + 26 elemente), distribuit pe ultimele 6 luni.
-- De ce: cerut explicit ca „Evoluția Cheltuielilor" din /analiza să aibă o curbă reală de arătat,
-- nu un empty-state — util pentru a vedea graficele/agregările funcționând pe date realiste.
-- NU atinge tabela `projects` (titlu/buget rămân neschimbate, oricare ar fi ele în mediul curent) —
-- doar ADAUGĂ camere + elemente noi, cu ID-uri fixe, sub proiectul implicit seedat în V2.
-- Elementele „Cumpărat" au purchased_at real (Ian–Iun 2026); cele „Planificat"/„În așteptare" (ultima
-- lună) nu au purchased_at — apar doar în „Total estimat", nu în curba de cheltuit.

INSERT INTO rooms (id, project_id, type, name, allocated_budget) VALUES
    ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000010', 'Dormitor', 'Dormitor Mare', 3500),
    ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000010', 'Baie', 'Baie Principală', 2500),
    ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000010', 'Living', 'Living & Dining', 4500),
    ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000010', 'Bucătărie', 'Bucătărie', 3500),
    ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000010', 'Balcon', 'Balcon', 800);

INSERT INTO items (id, room_id, name, material_type, source, status, quantity, unit_price, origin, created_at, purchased_at) VALUES
    ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'Gresie baie', 'Gresie', 'Dedeman', 'Cumpărat', 22, 18.5, 'Manual', '2026-01-20T09:00:00Z', '2026-01-20T14:30:00Z'),
    ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Faianță baie', 'Faianță', 'Leroy Merlin', 'Cumpărat', 35, 15.0, 'Manual', '2026-01-25T09:00:00Z', '2026-01-25T14:30:00Z'),
    ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'Cabină duș', 'Sanitare', 'Dedeman', 'Cumpărat', 1, 650, 'Manual', '2026-02-02T09:00:00Z', '2026-02-02T14:30:00Z'),
    ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', 'Vas WC + lavoar', 'Sanitare', 'Leroy Merlin', 'Cumpărat', 2, 320, 'Manual', '2026-02-05T09:00:00Z', '2026-02-05T14:30:00Z'),
    ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', 'Baterii chiuvetă + duș', 'Sanitare', 'Elmob', 'Cumpărat', 2, 180, 'Manual', '2026-02-08T09:00:00Z', '2026-02-08T14:30:00Z'),

    ('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000004', 'Mobilier bucătărie la comandă', 'Mobilă', 'IKEA', 'Cumpărat', 1, 3200, 'Manual', '2026-02-20T09:00:00Z', '2026-02-20T14:30:00Z'),
    ('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000004', 'Corpuri iluminat LED', 'Corpuri de iluminat', 'Dedeman', 'Cumpărat', 6, 45, 'Manual', '2026-02-25T09:00:00Z', '2026-02-25T14:30:00Z'),
    ('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000004', 'Hotă + plită inducție', 'Electrocasnice', 'Media Galaxy', 'Cumpărat', 2, 850, 'Manual', '2026-03-01T09:00:00Z', '2026-03-01T14:30:00Z'),
    ('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000004', 'Frigider', 'Electrocasnice', 'Media Galaxy', 'Cumpărat', 1, 1450, 'Manual', '2026-03-05T09:00:00Z', '2026-03-05T14:30:00Z'),

    ('20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000001', 'Parchet stejar', 'Parchet', 'Dedeman', 'Cumpărat', 20, 42, 'Manual', '2026-03-15T09:00:00Z', '2026-03-15T14:30:00Z'),
    ('20000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000001', 'Plintă parchet', 'Plintă', 'Dedeman', 'Cumpărat', 18, 6.5, 'Manual', '2026-03-18T09:00:00Z', '2026-03-18T14:30:00Z'),
    ('20000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000001', 'Vopsea lavabilă', 'Vopsea', 'Leroy Merlin', 'Cumpărat', 4, 38, 'Manual', '2026-03-22T09:00:00Z', '2026-03-22T14:30:00Z'),
    ('20000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000001', 'Dulap dressing', 'Mobilă', 'IKEA', 'Cumpărat', 1, 980, 'Manual', '2026-04-02T09:00:00Z', '2026-04-02T14:30:00Z'),

    ('20000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000003', 'Parchet living', 'Parchet', 'Dedeman', 'Cumpărat', 32, 42, 'Manual', '2026-04-10T09:00:00Z', '2026-04-10T14:30:00Z'),
    ('20000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000003', 'Vopsea living', 'Vopsea', 'Leroy Merlin', 'Cumpărat', 6, 38, 'Manual', '2026-04-15T09:00:00Z', '2026-04-15T14:30:00Z'),
    ('20000000-0000-0000-0000-000000000016', '10000000-0000-0000-0000-000000000003', 'Canapea extensibilă', 'Mobilă', 'JYSK', 'Cumpărat', 1, 1650, 'Manual', '2026-04-25T09:00:00Z', '2026-04-25T14:30:00Z'),
    ('20000000-0000-0000-0000-000000000017', '10000000-0000-0000-0000-000000000003', 'Masă + scaune dining', 'Mobilă', 'IKEA', 'Cumpărat', 1, 720, 'Manual', '2026-05-02T09:00:00Z', '2026-05-02T14:30:00Z'),
    ('20000000-0000-0000-0000-000000000018', '10000000-0000-0000-0000-000000000003', 'Televizor + suport', 'Electrocasnice', 'Media Galaxy', 'Cumpărat', 1, 1100, 'Manual', '2026-05-08T09:00:00Z', '2026-05-08T14:30:00Z'),

    ('20000000-0000-0000-0000-000000000019', '10000000-0000-0000-0000-000000000005', 'Gresie balcon exterior', 'Gresie', 'Dedeman', 'Cumpărat', 8, 22, 'Manual', '2026-05-20T09:00:00Z', '2026-05-20T14:30:00Z'),
    ('20000000-0000-0000-0000-000000000020', '10000000-0000-0000-0000-000000000005', 'Plintă balcon', 'Plintă', 'Dedeman', 'Cumpărat', 6, 6.5, 'Manual', '2026-05-22T09:00:00Z', '2026-05-22T14:30:00Z'),
    ('20000000-0000-0000-0000-000000000021', '10000000-0000-0000-0000-000000000005', 'Mobilier exterior', 'Mobilă', 'JYSK', 'Cumpărat', 1, 450, 'Manual', '2026-06-01T09:00:00Z', '2026-06-01T14:30:00Z'),

    ('20000000-0000-0000-0000-000000000022', '10000000-0000-0000-0000-000000000003', 'Corpuri iluminat living', 'Corpuri de iluminat', 'Dedeman', 'Cumpărat', 4, 65, 'Manual', '2026-06-10T09:00:00Z', '2026-06-10T14:30:00Z'),
    ('20000000-0000-0000-0000-000000000023', '10000000-0000-0000-0000-000000000001', 'Tapet accent', 'Tapet', 'Leroy Merlin', 'Planificat', 3, 55, 'Manual', '2026-06-25T09:00:00Z', NULL),
    ('20000000-0000-0000-0000-000000000024', '10000000-0000-0000-0000-000000000003', 'Glaf ferestre', 'Glaf Fereastră', 'Dedeman', 'Planificat', 5, 25, 'Manual', '2026-07-01T09:00:00Z', NULL),
    ('20000000-0000-0000-0000-000000000025', '10000000-0000-0000-0000-000000000001', 'Storuri', 'Altele', 'Leroy Merlin', 'În așteptare', 2, 90, 'Manual', '2026-07-10T09:00:00Z', NULL),
    ('20000000-0000-0000-0000-000000000026', '10000000-0000-0000-0000-000000000003', 'Covor living', 'Altele', 'JYSK', 'În așteptare', 1, 240, 'Manual', '2026-07-14T09:00:00Z', NULL);
